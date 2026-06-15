import { animateSlotText, buildSlotText, clearSlotText } from '../vendor/slot-text/slotText.js';

const EN = 'en';
const PT_BR = 'pt-br';
const LANGUAGES = new Set([EN, PT_BR]);

const LANGUAGE_CONFIG = {
  [EN]: {
    htmlLang: 'en',
    toggleLabel: 'PT-BR',
    toggleAriaLabel: 'Switch language to Portuguese (Brazil)',
    ariaPressed: 'false',
  },
  [PT_BR]: {
    htmlLang: 'pt-BR',
    toggleLabel: 'EN-US',
    toggleAriaLabel: 'Switch language to English (US)',
    ariaPressed: 'true',
  },
};

const META_ANIMATION = {
  direction: 'down',
  stagger: 14,
  duration: 210,
  exitOffset: 21,
  bounce: 0.35,
  interrupt: true,
};

const BODY_ANIMATION = {
  direction: 'down',
  stagger: 2.7,
  duration: 270,
  exitOffset: 27,
  bounce: 0.22,
  interrupt: true,
};

const BODY_BLOCK_MAX_DURATION = 1013;
const BODY_MIN_STAGGER = 0.25;

const BODY_BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6';
const BODY_ANIMATION_LOOKAHEAD_BLOCKS = 4;
const BODY_NEXT_BLOCK_START_RATIO = 0.9;
const VIEWPORT_READING_ANCHOR_RATIO = 0.35;

const SKIP_TEXT_SELECTOR = 'script, style, noscript, pre, code, textarea, input, select, option, svg';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

function normalizeLanguage(lang) {
  return LANGUAGES.has(lang) ? lang : EN;
}

function languageFromHash() {
  return window.location.hash.toLowerCase() === '#pt-br' ? PT_BR : EN;
}

function dataValue(element, lang) {
  return element.getAttribute(lang === PT_BR ? 'data-i18n-pt-br' : 'data-i18n-en');
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function estimateSlotDuration(fromText, toText, options) {
  if (options.totalDuration) {
    return options.totalDuration;
  }

  const length = Math.max(fromText.length, toText.length);
  return Math.round(length * options.stagger + options.exitOffset + options.duration);
}

function setUrlForLanguage(lang) {
  const hash = lang === PT_BR ? '#pt-br' : '';
  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;

  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
    window.history.replaceState(null, '', nextUrl);
  }
}

function setElementText(element, text) {
  clearSlotText(element, text);
}

function animateElementText(element, text, options) {
  const fromText = element.textContent || '';

  if (fromText === text) {
    return Promise.resolve();
  }

  if (!element.querySelector('.char-slot')) {
    buildSlotText(element, fromText);
  }

  animateSlotText(element, text, options);
  return wait(estimateSlotDuration(fromText, text, options)).then(() => {
    if (options.settle !== false) {
      setElementText(element, text);
    }
  });
}

function textLength(text) {
  return Array.from(text || '').length;
}

function collectTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || node.nodeValue.trim() === '') {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent || parent.closest(SKIP_TEXT_SELECTOR)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  return nodes;
}

function wrapTextNode(node) {
  const wrapper = document.createElement('span');
  wrapper.className = 'i18n-slot';
  wrapper.textContent = node.nodeValue;
  node.parentNode.replaceChild(wrapper, node);
  return wrapper;
}

function containsNestedTextBlock(element) {
  return Array.from(element.children).some((child) => (
    child.matches(BODY_BLOCK_SELECTOR) || child.querySelector(BODY_BLOCK_SELECTOR)
  ));
}

function collectTextBlocks(section) {
  return Array.from(section.querySelectorAll(BODY_BLOCK_SELECTOR)).filter((element) => (
    !element.closest(SKIP_TEXT_SELECTOR)
    && !containsNestedTextBlock(element)
    && collectTextNodes(element).length > 0
  ));
}

function currentVisibleBlockIndex(blocks) {
  if (blocks.length === 0) {
    return 0;
  }

  const anchorY = Math.min(
    window.innerHeight * VIEWPORT_READING_ANCHOR_RATIO,
    window.innerHeight - 1,
  );
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  for (let index = 0; index < blocks.length; index += 1) {
    const rect = blocks[index].getBoundingClientRect();

    if (rect.bottom >= 0 && rect.top <= window.innerHeight && rect.bottom >= anchorY) {
      return index;
    }

    const distance = Math.min(
      Math.abs(rect.top - anchorY),
      Math.abs(rect.bottom - anchorY),
    );

    if (distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  }

  return nearestIndex;
}

function syncBlockInstant(fromBlock, toBlock) {
  if (!fromBlock) {
    return;
  }

  if (toBlock) {
    fromBlock.innerHTML = toBlock.innerHTML;
  } else {
    fromBlock.textContent = '';
  }
}

function syncBlocksBefore(fromBlocks, toBlocks, startIndex) {
  for (let index = 0; index < startIndex; index += 1) {
    syncBlockInstant(fromBlocks[index], toBlocks[index]);
  }
}

function preserveViewportAnchor(anchorBlock, callback) {
  if (!anchorBlock) {
    callback();
    return;
  }

  const anchorTop = anchorBlock.getBoundingClientRect().top;
  callback();
  const anchorShift = anchorBlock.getBoundingClientRect().top - anchorTop;

  if (Math.abs(anchorShift) > 0.5) {
    window.scrollBy(0, anchorShift);
  }
}

function preserveVisibleBlockDuringSwap(fromSection, toSection, callback) {
  const fromBlocks = collectTextBlocks(fromSection);
  const anchorIndex = currentVisibleBlockIndex(fromBlocks);
  const anchorBlock = fromBlocks[anchorIndex];

  if (!anchorBlock) {
    callback();
    return;
  }

  const anchorTop = anchorBlock.getBoundingClientRect().top;
  callback();

  const toBlocks = collectTextBlocks(toSection);
  const nextAnchorBlock = toBlocks[anchorIndex];
  if (!nextAnchorBlock) {
    return;
  }

  const anchorShift = nextAnchorBlock.getBoundingClientRect().top - anchorTop;
  if (Math.abs(anchorShift) > 0.5) {
    window.scrollBy(0, anchorShift);
  }
}

function bodyAnimationOptionsForBlock(fromBlock, toBlock) {
  const blockLength = Math.max(
    1,
    textLength(fromBlock?.textContent),
    textLength(toBlock?.textContent),
  );
  const naturalDuration = Math.round(
    blockLength * BODY_ANIMATION.stagger + BODY_ANIMATION.exitOffset + BODY_ANIMATION.duration,
  );

  if (naturalDuration <= BODY_BLOCK_MAX_DURATION) {
    return {
      ...BODY_ANIMATION,
      settle: false,
    };
  }

  const maxCharacterDuration = BODY_ANIMATION.duration * (1 + BODY_ANIMATION.bounce * 0.45);
  const availableStaggerTime = Math.max(
    BODY_MIN_STAGGER,
    BODY_BLOCK_MAX_DURATION - BODY_ANIMATION.exitOffset - maxCharacterDuration,
  );

  return {
    ...BODY_ANIMATION,
    stagger: Math.max(BODY_MIN_STAGGER, availableStaggerTime / blockLength),
    totalDuration: BODY_BLOCK_MAX_DURATION,
    settle: false,
  };
}

function animateBlock(fromBlock, toBlock) {
  if (!fromBlock) {
    return Promise.resolve();
  }

  const fromNodes = collectTextNodes(fromBlock);
  const toNodes = toBlock ? collectTextNodes(toBlock) : [];
  const count = Math.max(fromNodes.length, toNodes.length);
  const animations = [];
  const bodyOptions = bodyAnimationOptionsForBlock(fromBlock, toBlock);

  for (let index = 0; index < count; index += 1) {
    const fromNode = fromNodes[index];
    if (!fromNode) continue;

    const toNode = toNodes[index];
    const nextText = toNode ? toNode.nodeValue : '';
    const wrapper = wrapTextNode(fromNode);
    animations.push(animateElementText(wrapper, nextText, bodyOptions));
  }

  return Promise.all(animations);
}

function blockAnimationDuration(fromBlock, toBlock) {
  const options = bodyAnimationOptionsForBlock(fromBlock, toBlock);
  return estimateSlotDuration(
    fromBlock?.textContent || '',
    toBlock?.textContent || '',
    options,
  );
}

async function animateBlocksFromCurrentPosition(fromBlocks, toBlocks, startIndex) {
  const endIndex = Math.min(
    fromBlocks.length,
    startIndex + BODY_ANIMATION_LOOKAHEAD_BLOCKS,
  );
  const activeAnimations = [];

  for (let blockIndex = startIndex; blockIndex < endIndex; blockIndex += 1) {
    const fromBlock = fromBlocks[blockIndex];
    const toBlock = toBlocks[blockIndex];
    const animation = animateBlock(fromBlock, toBlock);
    activeAnimations.push(animation);

    if (blockIndex < endIndex - 1) {
      await wait(Math.round(blockAnimationDuration(fromBlock, toBlock) * BODY_NEXT_BLOCK_START_RATIO));
    }
  }

  await Promise.all(activeAnimations);
}

ready(function initLanguageToggle() {
  const post = document.querySelector('[data-i18n-post]');
  const contentRoot = document.querySelector('[data-i18n-content-root]');

  if (!post || !contentRoot) {
    return;
  }

  const sections = new Map(
    Array.from(contentRoot.querySelectorAll('[data-i18n-content]')).map((section) => [
      section.getAttribute('data-i18n-content'),
      section,
    ]),
  );

  if (!sections.has(EN) || !sections.has(PT_BR)) {
    return;
  }

  const originalSectionHtml = new Map(
    Array.from(sections.entries()).map(([lang, section]) => [lang, section.innerHTML]),
  );

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentLang = languageFromHash();
  let isSwitching = false;

  function prefersReducedMotion() {
    return reducedMotion.matches;
  }

  function resetSection(lang) {
    const section = sections.get(lang);
    if (!section) return;

    section.innerHTML = originalSectionHtml.get(lang);
  }

  function updateDocumentLanguage(lang) {
    document.documentElement.lang = LANGUAGE_CONFIG[lang].htmlLang;
    post.setAttribute('data-i18n-active-lang', lang);
  }

  function updateToggleState(lang, { animate = false, disabled = false } = {}) {
    const config = LANGUAGE_CONFIG[lang];
    const toggles = document.querySelectorAll('[data-i18n-toggle]');
    const labelAnimations = [];

    toggles.forEach((toggle) => {
      toggle.setAttribute('aria-label', config.toggleAriaLabel);
      toggle.setAttribute('aria-pressed', config.ariaPressed);
      toggle.disabled = disabled;
      toggle.classList.toggle('is-switching', disabled);

      const label = toggle.querySelector('[data-i18n-toggle-label]');
      if (!label) return;

      if (animate && !prefersReducedMotion()) {
        labelAnimations.push(animateElementText(label, config.toggleLabel, META_ANIMATION));
      } else {
        setElementText(label, config.toggleLabel);
      }
    });

    return Promise.all(labelAnimations);
  }

  function setStaticText(lang, { animate = false } = {}) {
    const textElements = document.querySelectorAll('[data-i18n-text]');
    const animations = [];

    textElements.forEach((element) => {
      const nextText = dataValue(element, lang);
      if (nextText === null) return;

      if (animate && !prefersReducedMotion()) {
        animations.push(animateElementText(element, nextText, META_ANIMATION));
      } else {
        setElementText(element, nextText);
      }
    });

    return Promise.all(animations);
  }

  function setContentInstant(lang) {
    sections.forEach((section, sectionLang) => {
      resetSection(sectionLang);
      section.hidden = sectionLang !== lang;
    });
  }

  function animateContent(fromLang, toLang) {
    const fromSection = sections.get(fromLang);
    const toSection = sections.get(toLang);

    resetSection(toLang);
    toSection.hidden = true;
    fromSection.hidden = false;

    const fromBlocks = collectTextBlocks(fromSection);
    const toBlocks = collectTextBlocks(toSection);
    const startIndex = currentVisibleBlockIndex(fromBlocks);
    const anchorBlock = fromBlocks[startIndex];

    preserveViewportAnchor(anchorBlock, () => {
      syncBlocksBefore(fromBlocks, toBlocks, startIndex);
    });

    return animateBlocksFromCurrentPosition(fromBlocks, toBlocks, startIndex);
  }

  async function setLanguage(lang, { animate = false, updateUrl = false } = {}) {
    const nextLang = normalizeLanguage(lang);
    const shouldAnimate = animate && !prefersReducedMotion();

    if (updateUrl) {
      setUrlForLanguage(nextLang);
    }

    if (nextLang === currentLang) {
      updateDocumentLanguage(nextLang);
      await updateToggleState(nextLang, { animate: false, disabled: isSwitching });
      return;
    }

    if (isSwitching) {
      return;
    }

    const previousLang = currentLang;
    isSwitching = true;
    post.setAttribute('data-i18n-switching', 'true');

    const toggleState = updateToggleState(nextLang, { animate: shouldAnimate, disabled: true });

    if (shouldAnimate) {
      await Promise.all([
        toggleState,
        setStaticText(nextLang, { animate: true }),
        animateContent(previousLang, nextLang),
      ]);
    } else {
      await toggleState;
      await setStaticText(nextLang, { animate: false });
      setContentInstant(nextLang);
    }

    const previousSection = sections.get(previousLang);
    const nextSection = sections.get(nextLang);
    const revealNextSection = () => {
      previousSection.hidden = true;
      resetSection(previousLang);
      nextSection.hidden = false;
    };

    if (shouldAnimate) {
      preserveVisibleBlockDuringSwap(previousSection, nextSection, revealNextSection);
    } else {
      revealNextSection();
    }

    currentLang = nextLang;
    updateDocumentLanguage(nextLang);

    isSwitching = false;
    post.removeAttribute('data-i18n-switching');
    await updateToggleState(nextLang, { animate: false, disabled: false });
  }

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-i18n-toggle]');
    if (!toggle) return;

    event.preventDefault();

    if (isSwitching) {
      return;
    }

    const nextLang = currentLang === PT_BR ? EN : PT_BR;
    setLanguage(nextLang, { animate: true, updateUrl: true });
  });

  window.addEventListener('hashchange', () => {
    setLanguage(languageFromHash(), { animate: false, updateUrl: false });
  });

  setStaticText(currentLang, { animate: false });
  setContentInstant(currentLang);
  updateDocumentLanguage(currentLang);
  updateToggleState(currentLang, { animate: false, disabled: false });
});
