'use strict';

// Starts a persistent local server, reuses it on subsequent launches, then opens the site.
const { fork, spawn } = require('node:child_process');
const { createHash } = require('node:crypto');
const path = require('node:path');
const port = Number(process.env.PORT || 4173);
const url = `http://127.0.0.1:${port}`;
const installation = createHash('sha256').update(__dirname).digest('hex').slice(0, 16);

async function isRunning() {
  try {
    const response = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(1000) });
    const health = await response.json();
    return response.ok && health.service === 'next-exam-prep' && health.installation === installation;
  } catch { return false; }
}
function startServer() {
  return new Promise((resolve, reject) => {
    const child = fork(path.join(__dirname, 'server.js'), [], {
      cwd: __dirname,
      detached: true,
      windowsHide: true,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      env: { ...process.env, PORT: String(port) }
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('The website did not start in time. Please try again.'));
    }, 10000);
    const fail = error => { clearTimeout(timer); reject(error); };
    child.once('error', fail);
    child.once('exit', code => fail(new Error(`The website server stopped (${code}). Port ${port} may be in use.`)));
    child.on('message', message => {
      if (message.type === 'error') { clearTimeout(timer); reject(new Error(message.message)); }
      if (message.type !== 'ready') return;
      clearTimeout(timer);
      child.removeAllListeners('exit');
      child.disconnect();
      child.unref();
      resolve();
    });
  });
}
(async () => {
  if (!(await isRunning())) await startServer();
  if (!(await isRunning())) throw new Error('Unable to verify the website server.');
  console.log(`Website is running: ${url}`);
  if (!process.argv.includes('--no-open')) {
    const browser = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { detached: true, windowsHide: true, stdio: 'ignore' });
    browser.on('error', error => { console.error(`Open ${url} in your browser. ${error.message}`); process.exitCode = 1; });
    browser.unref();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
