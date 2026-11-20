'use strict';

// No build step or third-party packages. Run: node server.js
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');

const root = __dirname;
const installation = createHash('sha256').update(root).digest('hex').slice(0, 16);
const port = Number(process.env.PORT || 4173);
const host = '127.0.0.1';
const dataDirectory = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'data');
const applicationsFile = path.join(dataDirectory, 'applications.jsonl');
const allowedPrograms = new Set(['sat', 'ielts', 'both', 'unsure']);
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };

function sendJson(response, code, value) {
  response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}
function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > 8192) { tooLarge = true; chunks.length = 0; }
      else if (!tooLarge) chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) return reject(Object.assign(new Error('Слишком большой запрос.'), { status: 413 }));
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Не удалось прочитать заявку.'), { status: 400 })); }
    });
    request.on('error', reject);
  });
}
function validateApplication(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const contact = typeof value.contact === 'string' ? value.contact.trim() : '';
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001f]/.test(name)) return null;
  if (contact.length > 150 || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || /^@[a-zA-Z0-9_]{3,32}$/.test(contact))) return null;
  if (!allowedPrograms.has(value.program) || value.consent !== true) return null;
  if (value.company !== undefined && value.company !== '') return null;
  return { name, contact, program: value.program, consent: true };
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return sendJson(response, 200, { service: 'next-exam-prep', installation });
    }
    if (url.pathname === '/api/applications') {
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return sendJson(response, 405, { error: 'Используйте форму заявки.' });
      }
      const origin = request.headers.origin;
      if (origin && origin !== `http://${request.headers.host}`) return sendJson(response, 403, { error: 'Обновите страницу и попробуйте ещё раз.' });
      if (!request.headers['content-type']?.startsWith('application/json')) return sendJson(response, 415, { error: 'Неподдерживаемый формат заявки.' });
      const application = validateApplication(await readJson(request));
      if (!application) return sendJson(response, 400, { error: 'Проверьте имя, контакт, направление и согласие на связь.' });
      const record = { id: randomUUID(), ...application, createdAt: new Date().toISOString() };
      await fs.mkdir(dataDirectory, { recursive: true });
      await fs.appendFile(applicationsFile, JSON.stringify(record) + '\n', { encoding: 'utf8', mode: 0o600 });
      return sendJson(response, 201, { id: record.id });
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD');
      return sendJson(response, 405, { error: 'Метод не поддерживается.' });
    }
    const pathname = decodeURIComponent(url.pathname);
    const assetPath = pathname === '/' || pathname === '/index.html' ? 'index.html' : pathname.slice(1);
    // Explicit public allowlist keeps application data and source files private.
    if (!['index.html', 'styles.css', 'script.js'].includes(assetPath) && !/^assets\/[a-zA-Z0-9_-]+\.(?:ttf|svg)$/.test(assetPath)) {
      return sendJson(response, 404, { error: 'Страница не найдена.' });
    }
    let file;
    try { file = await fs.readFile(path.join(root, assetPath)); }
    catch (error) {
      if (error.code === 'ENOENT') return sendJson(response, 404, { error: 'Файл не найден.' });
      throw error;
    }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(assetPath)], 'Cache-Control': 'no-cache', 'Content-Length': file.length });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch (error) {
    if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : 'Не удалось сохранить данные. Попробуйте ещё раз.' });
    else response.end();
  }
});
server.requestTimeout = 20000;
server.headersTimeout = 15000;
server.on('error', error => {
  if (process.send) process.send({ type: 'error', message: error.code === 'EADDRINUSE' ? `Port ${port} is busy.` : error.message });
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is busy. Set PORT to another number.` : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(`Local: http://${host}:${server.address().port}`);
  if (process.send) process.send({ type: 'ready', port: server.address().port });
});
process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
