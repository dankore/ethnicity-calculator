const ADSENSE_CLIENT = 'ca-pub-7174503033473057';
const GA_ID = 'G-YDGB4Z1HWK';

bindThemeToggleButtons();
loadThirdPartyOnInteraction();
bindNavbarAutoHide();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

const form = document.getElementById('ethnicityForm');
if (form) {
  form.addEventListener('click', event => {
    if (event.target.classList.contains('btn-add')) {
      addEthnicityEntry(event.target.closest('.parent'));
    } else if (event.target.classList.contains('btn-remove')) {
      event.target.closest('.ethnicity-entry').remove();
    }
  });
  form.addEventListener('submit', calculateEthnicity);
}

function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Ads and analytics wait for the first interaction so they never delay the first paint.
function loadThirdPartyOnInteraction() {
  const events = ['scroll', 'pointerdown', 'pointermove', 'keydown', 'touchstart'];
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    events.forEach(name => window.removeEventListener(name, load));
    loadAds();
    loadAnalytics();
  };
  events.forEach(name => window.addEventListener(name, load, { passive: true }));
}

function loadAds() {
  window.adsbygoogle = window.adsbygoogle || [];
  loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`, {
    crossorigin: 'anonymous',
  }).catch(() => {});
  document.querySelectorAll('ins.adsbygoogle').forEach(() => window.adsbygoogle.push({}));
}

function loadAnalytics() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`).catch(() => {});
  loadScript('https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js')
    .then(() => {
      const send = ({ name, delta, id }) =>
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          event_label: id,
          value: Math.round(name === 'CLS' ? delta * 1000 : delta),
          non_interaction: true,
        });
      window.webVitals.onCLS(send);
      window.webVitals.onINP(send);
      window.webVitals.onLCP(send);
    })
    .catch(() => {});
}

function bindNavbarAutoHide() {
  const navbar = document.querySelector('.navbar');
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        navbar.classList.toggle('navbar-hidden', window.scrollY > 70);
        ticking = false;
      });
    },
    { passive: true },
  );
}

function bindThemeToggleButtons() {
  const buttons = document.querySelectorAll('.toggle-btn');
  const sync = () => {
    const current = document.documentElement.dataset.theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === current)));
  };
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      document.documentElement.dataset.theme = button.dataset.theme;
      localStorage.setItem('theme', button.dataset.theme);
      sync();
    });
  });
  sync();
}

function addEthnicityEntry(parent) {
  const index = parent.querySelectorAll('.ethnicity-entry').length + 1;
  const prefix = `${parent.id}_extra${index}`;
  const entry = document.createElement('div');
  entry.className = 'ethnicity-entry';
  entry.innerHTML = `
    <div class="input-group">
      <label for="${prefix}_name">Ethnicity ${index}</label>
      <input type="text" id="${prefix}_name" autocomplete="off">
      <div class="error-message" aria-live="polite"></div>
    </div>
    <div class="input-group">
      <label for="${prefix}_percent">Percent</label>
      <input type="number" id="${prefix}_percent" min="0" max="100" step="any" inputmode="decimal">
      <div class="error-message" aria-live="polite"></div>
    </div>
    <button type="button" class="btn-remove">Remove</button>
  `;
  parent.insertBefore(entry, parent.querySelector('.btn-add'));
  entry.querySelector('input').focus();
}

function calculateEthnicity(event) {
  event.preventDefault();

  document.querySelectorAll('.error-message').forEach(element => {
    element.textContent = '';
    element.classList.remove('visible');
  });

  const motherValid = validateParentEntries(document.querySelectorAll('#mother .ethnicity-entry'));
  const fatherValid = validateParentEntries(document.querySelectorAll('#father .ethnicity-entry'));

  if (motherValid && fatherValid) {
    const ethnicities = {};
    gatherEthnicities('mother', ethnicities);
    gatherEthnicities('father', ethnicities);
    displayResults(ethnicities);
  }
}

function showError(element, message) {
  element.textContent = message;
  element.classList.add('visible');
}

function validateParentEntries(entries) {
  let isValid = true;
  let totalPercentage = 0;
  entries.forEach(entry => {
    const nameInput = entry.querySelector('input[type="text"]');
    const percentInput = entry.querySelector('input[type="number"]');
    const percent = parseFloat(percentInput.value) || 0;

    if (percent > 0 && !nameInput.value.trim()) {
      showError(nameInput.nextElementSibling, 'Ethnicity name is required');
      isValid = false;
    }

    if (percentInput.value && (percent <= 0 || percent > 100)) {
      showError(percentInput.nextElementSibling, 'Invalid percentage');
      isValid = false;
    }

    totalPercentage += percent;
  });

  if (Math.abs(totalPercentage - 100) > 0.001) {
    showError(entries[entries.length - 1].querySelector('input[type="number"]').nextElementSibling, 'Percentages must total 100');
    isValid = false;
  }
  return isValid;
}

function gatherEthnicities(parentId, ethnicities) {
  document.querySelectorAll(`#${parentId} .ethnicity-entry`).forEach(entry => {
    const ethnicity = entry.querySelector('input[type="text"]').value.trim();
    const percent = (parseFloat(entry.querySelector('input[type="number"]').value) || 0) / 2;
    if (ethnicity && percent > 0) {
      ethnicities[ethnicity] = (ethnicities[ethnicity] || 0) + percent;
    }
  });
}

function displayResults(ethnicities) {
  const result = document.getElementById('result');
  const list = document.getElementById('result-list');
  list.replaceChildren(
    ...Object.entries(ethnicities)
      .sort((a, b) => b[1] - a[1])
      .map(([name, percent]) => {
        const item = document.createElement('li');
        item.textContent = `${name}: ${Number(percent.toFixed(2))}%`;
        return item;
      }),
  );
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  launchConfetti();
}

let confettiReady;
function launchConfetti() {
  confettiReady = confettiReady || loadScript('/vendor/confetti.min.js');
  confettiReady
    .then(() => window.confetti({ spread: 70, particleCount: 100, startVelocity: 30, origin: { y: 0.6 } }))
    .catch(() => {});
}
