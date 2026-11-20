'use strict';

const examContent = {
  sat: {
    score: '1400',
    description: 'баллов SAT. Начнём с вашего уровня.',
    skills: ['Reading & Writing', 'Math'],
    steps: ['Диагностика, база и стратегия', 'Задания, тайминг и пробные тесты', 'Повторение и полная репетиция']
  },
  ielts: {
    score: '7.0',
    description: 'IELTS Academic. Построим путь к вашей цели.',
    skills: ['Listening', 'Reading', 'Writing', 'Speaking'],
    steps: ['Проверка четырёх навыков и план', 'Эссе, разговорная практика и тесты', 'Пробный экзамен и разбор ошибок']
  }
};

const tabs = [...document.querySelectorAll('.exam-tab')];
function selectExam(exam, focusTab = false) {
  const content = examContent[exam];
  if (!content) return;
  for (const tab of tabs) {
    const active = tab.dataset.exam === exam;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) tab.focus();
  }
  document.querySelector('#route-panel').setAttribute('aria-labelledby', `tab-${exam}`);
  document.querySelector('#target-value').textContent = content.score;
  document.querySelector('#target-description').textContent = content.description;
  const skillElements = content.skills.map(skill => {
    const element = document.createElement('span');
    element.textContent = skill;
    return element;
  });
  document.querySelector('#route-skills').replaceChildren(...skillElements);
  ['one', 'two', 'three'].forEach((key, index) => {
    document.querySelector(`#route-step-${key}`).textContent = content.steps[index];
  });
  document.querySelector('#route-cta').dataset.selectProgram = exam;
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectExam(tab.dataset.exam));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectExam(tabs[next].dataset.exam, true);
  });
});

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
function setMenu(open) {
  header.classList.toggle('menu-expanded', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
document.querySelectorAll('.main-nav a, .header-cta, .wordmark').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) setMenu(false);
});
window.matchMedia('(min-width: 741px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

const form = document.querySelector('#application-form');
const fields = {
  name: form.elements.name,
  contact: form.elements.contact,
  program: form.elements.program,
  consent: form.elements.consent
};
const programNames = { sat: 'SAT', ielts: 'IELTS Academic', both: 'SAT + IELTS', unsure: 'Помощь с выбором' };
function errorMessage(key) {
  const value = fields[key].value.trim();
  if (key === 'name' && (value.length < 2 || value.length > 80)) return 'Введите имя: от 2 до 80 символов.';
  if (key === 'contact' && (value.length > 150 || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^@[a-zA-Z0-9_]{3,32}$/.test(value)))) return 'Укажите email или Telegram в формате @username.';
  if (key === 'program' && !Object.hasOwn(programNames, value)) return 'Выберите направление или помощь с выбором.';
  if (key === 'consent' && !fields.consent.checked) return 'Подтвердите, что с вами можно связаться.';
  return '';
}
function validateField(key) {
  const error = errorMessage(key);
  document.querySelector(`#${key}-error`).textContent = error;
  if (error) fields[key].setAttribute('aria-invalid', 'true');
  else fields[key].removeAttribute('aria-invalid');
  return !error;
}
Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) validateField(key);
  });
  input.addEventListener('change', () => {
    if (input.hasAttribute('aria-invalid')) validateField(key);
  });
});

document.querySelectorAll('[data-select-program]').forEach(link => {
  link.addEventListener('click', () => {
    fields.program.value = link.dataset.selectProgram;
    if (fields.program.hasAttribute('aria-invalid')) validateField('program');
  });
});

async function saveApplication(payload) {
  // Direct file opening remains usable. The Node server writes submissions to disk.
  if (location.protocol === 'file:') {
    const key = 'next-local-applications';
    let existing;
    try { existing = JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { existing = []; }
    if (!Array.isArray(existing)) existing = [];
    const id = globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`;
    localStorage.setItem(key, JSON.stringify([...existing, { id, ...payload, createdAt: new Date().toISOString() }]));
    return { id, local: true };
  }
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000)
  });
  let result;
  try { result = await response.json(); } catch { throw new Error('Не удалось сохранить заявку. Попробуйте ещё раз чуть позже.'); }
  if (!response.ok) throw new Error(result.error || 'Не удалось сохранить заявку. Попробуйте ещё раз.');
  if (!result.id) throw new Error('Не удалось подтвердить сохранение. Попробуйте ещё раз.');
  return result;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const valid = Object.keys(fields).map(validateField).every(Boolean);
  const status = document.querySelector('#form-status');
  status.textContent = '';
  if (!valid) {
    Object.values(fields).find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  button.textContent = 'Сохраняем заявку…';
  form.setAttribute('aria-busy', 'true');
  const payload = {
    name: fields.name.value.trim(),
    contact: fields.contact.value.trim(),
    program: fields.program.value,
    consent: fields.consent.checked,
    company: form.elements.company.value
  };
  try {
    const result = await saveApplication(payload);
    document.querySelector('#success-copy').textContent = `${payload.name}, ваше направление — ${programNames[payload.program]}. Контакт для связи: ${payload.contact}.${result.local ? ' Заявка сохранена в этом браузере на вашем устройстве.' : ''}`;
    document.querySelector('#application-reference').textContent = `Заявка #${result.id.slice(0, 8).toUpperCase()}`;
    document.querySelector('#form-content').hidden = true;
    const success = document.querySelector('#form-success');
    success.hidden = false;
    success.focus({ preventScroll: true });
    form.reset();
  } catch (error) {
    status.textContent = error.name === 'TimeoutError' ? 'Ответ занял слишком много времени. Попробуйте ещё раз.' : error.message || 'Проверьте соединение и попробуйте ещё раз.';
  } finally {
    button.disabled = false;
    button.textContent = 'Получить бесплатный план';
    form.removeAttribute('aria-busy');
  }
});
document.querySelector('#another-application').addEventListener('click', () => {
  document.querySelector('#form-success').hidden = true;
  document.querySelector('#form-content').hidden = false;
  fields.name.focus({ preventScroll: true });
});
document.querySelector('#year').textContent = new Date().getFullYear();
