'use strict';

// Run with: node --experimental-vm-modules --test test/language-toggle.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../assets/js/language-toggle.js'), 'utf8');

async function fixture({ hash = '', reducedMotion = false } = {}) {
  const documentEvents = new Map();
  const windowEvents = new Map();
  const timers = [];
  function element(attributes = {}) {
    return {
      attributes: { ...attributes },
      hidden: false,
      disabled: false,
      innerHTML: '',
      textContent: '',
      classList: { toggle() {} },
      getAttribute(name) { return this.attributes[name] ?? null; },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
    };
  }
  const post = element();
  const english = element({ 'data-i18n-content': 'en' });
  const portuguese = element({ 'data-i18n-content': 'pt-br' });
  english.innerHTML = '<p>English article</p>';
  portuguese.innerHTML = '<p>Artigo em português</p>';
  const content = element();
  content.querySelectorAll = () => [english, portuguese];
  const toggle = element();
  const label = element();
  toggle.querySelector = () => label;
  const title = element({ 'data-i18n-en': 'English title', 'data-i18n-pt-br': 'Título em português' });
  const document = {
    readyState: 'complete',
    documentElement: { lang: 'en' },
    querySelector(selector) {
      return selector === '[data-i18n-post]' ? post : content;
    },
    querySelectorAll(selector) {
      if (selector === '[data-i18n-toggle]') return [toggle];
      if (selector === '[data-i18n-text]') return [title];
      return [];
    },
    addEventListener(name, callback) { documentEvents.set(name, callback); },
  };
  const window = {
    location: { pathname: '/article/', search: '?preview=1', hash },
    innerHeight: 800,
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout(callback) { timers.push(callback); },
    addEventListener(name, callback) { windowEvents.set(name, callback); },
  };
  window.history = {
    replaceState(_state, _title, url) {
      window.location = new URL(url, 'https://example.test');
    },
  };
  const context = vm.createContext({ document, window });
  // Stub only slot rendering and the browser clock. The source state machine,
  // event handlers and animation promises run unchanged; body layout is not modeled.
  const vendor = new vm.SyntheticModule(
    ['animateSlotText', 'buildSlotText', 'clearSlotText'],
    function initialize() {
      for (const name of ['animateSlotText', 'buildSlotText', 'clearSlotText']) {
        this.setExport(name, (target, text) => { target.textContent = text; });
      }
    }, { context },
  );
  const module = new vm.SourceTextModule(source, { context });
  await module.link(() => vendor);
  await module.evaluate();
  return {
    snapshot: () => ({
      hash: window.location.hash,
      search: window.location.search,
      language: document.documentElement.lang,
      active: post.getAttribute('data-i18n-active-lang'),
      switching: post.getAttribute('data-i18n-switching'),
      englishHidden: english.hidden,
      portugueseHidden: portuguese.hidden,
      englishHtml: english.innerHTML,
      portugueseHtml: portuguese.innerHTML,
      disabled: toggle.disabled,
      label: label.textContent,
      ariaLabel: toggle.getAttribute('aria-label'),
      ariaPressed: toggle.getAttribute('aria-pressed'),
      title: title.textContent,
    }),
    pendingTimers: () => timers.length,
    click() {
      // Dispatch even when disabled to exercise the delegated click guard.
      documentEvents.get('click')({ target: { closest: () => toggle }, preventDefault() {} });
    },
    changeHash(nextHash) {
      window.location.hash = nextHash;
      windowEvents.get('hashchange')();
    },
    async finish() {
      for (let turn = 0; turn < 20; turn += 1) {
        for (const callback of timers.splice(0)) callback();
        await new Promise(setImmediate);
        if (!timers.length && !toggle.disabled) return;
      }
      assert.fail('Language switch did not settle');
    },
  };
}

function assertLanguage(page, lang, hash = lang === 'pt-br' ? '#pt-br' : '') {
  const portuguese = lang === 'pt-br';
  assert.deepEqual(page.snapshot(), {
    hash,
    search: '?preview=1',
    language: portuguese ? 'pt-BR' : 'en',
    active: lang,
    switching: null,
    englishHidden: portuguese,
    portugueseHidden: !portuguese,
    englishHtml: '<p>English article</p>',
    portugueseHtml: '<p>Artigo em português</p>',
    disabled: false,
    label: portuguese ? 'EN-US' : 'PT-BR',
    ariaLabel: portuguese ? 'Switch language to English (US)' : 'Switch language to Portuguese (Brazil)',
    ariaPressed: String(portuguese),
    title: portuguese ? 'Título em português' : 'English title',
  });
}

for (const hash of ['', '#pt-br']) {
  const initialLang = hash ? 'pt-br' : 'en';
  const otherLang = hash ? 'en' : 'pt-br';
  const otherHash = hash ? '' : '#pt-br';

  test(`ordinary animated toggle from ${initialLang} ignores extra clicks while disabled`, async () => {
    const page = await fixture({ hash });
    assertLanguage(page, initialLang);
    page.click();
    assert.equal(page.snapshot().disabled, true);
    assert.ok(page.pendingTimers() > 0, 'ordinary toggles retain their animation wait');
    page.click();
    await page.finish();
    assertLanguage(page, otherLang);
  });

  test(`hash navigation back to ${initialLang} wins during an animated switch`, async () => {
    const page = await fixture({ hash });
    page.click();
    page.changeHash(hash);
    assert.equal(page.snapshot().disabled, true);
    await page.finish();
    assertLanguage(page, initialLang);
    page.click();
    await page.finish();
    assertLanguage(page, otherLang);
  });

  test(`only the latest hash wins during a switch from ${initialLang}`, async () => {
    const page = await fixture({ hash });
    page.click();
    page.changeHash(hash);
    page.changeHash(otherHash);
    page.click();
    await page.finish();
    assertLanguage(page, otherLang);
  });

  test(`settled hash navigation from ${initialLang} is instant and preserves English anchors`, async () => {
    const page = await fixture({ hash });
    page.changeHash(otherHash);
    await page.finish();
    assertLanguage(page, otherLang);
    assert.equal(page.pendingTimers(), 0);
    page.changeHash('#section-heading');
    await page.finish();
    assertLanguage(page, 'en', '#section-heading');
  });

  test(`reduced-motion toggles and immediate hash navigation from ${initialLang} settle without timers`, async () => {
    const page = await fixture({ hash, reducedMotion: true });
    page.click();
    await page.finish();
    assertLanguage(page, otherLang);
    assert.equal(page.pendingTimers(), 0);
    page.click();
    page.changeHash(otherHash);
    await page.finish();
    assertLanguage(page, otherLang);
    assert.equal(page.pendingTimers(), 0);
  });
}
