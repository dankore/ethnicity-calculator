document.addEventListener('DOMContentLoaded', function () {
  setInitialTheme();
  bindThemeToggleButtons();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registered:', registration);
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
  });
}


  // Google Analytics setup
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-YDGB4Z1HWK');

  // Web Vitals setup
  let script = document.createElement('script');
  script.src = 'https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js';
  script.onload = function () {
    webVitals.onCLS(sendToGoogleAnalytics);
    webVitals.onINP(sendToGoogleAnalytics);
    webVitals.onLCP(sendToGoogleAnalytics);
  };
  document.head.appendChild(script);

 // sendToGoogleAnalytics function
 function sendToGoogleAnalytics({ name, delta, id }) {
  console.log(`Metric: ${name}, Delta: ${delta}, ID: ${id}`); // Debugging line
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id, // ID of the metric (e.g., CLS, INP, etc.)
    value: Math.round(name === 'CLS' ? delta * 1000 : delta), // Values must be integers
    non_interaction: true, // Prevents affecting bounce rate
  });
}

  function addEthnicityEntry(parentId) {
    const parentDiv = document.getElementById(parentId);
    const newEntry = document.createElement('div');
    newEntry.classList.add('ethnicity-entry');
    newEntry.innerHTML = `
      <div class="input-group">
        <input type="text" placeholder="Ethnicity Name">
        <div class="error-message"></div>
      </div>
      <div class="input-group">
        <input type="number" placeholder="Percent" min="0" max="100%">
        <div class="error-message"></div>
      </div>
      <button type="button" class="btn-remove">Remove</button>
    `;

    // Attach event listener to the remove button in the new entry
    newEntry.querySelector('.btn-remove').addEventListener('click', function () {
      this.parentElement.remove();
    });

    const addButton = parentDiv.querySelector('.btn-add');
    parentDiv.insertBefore(newEntry, addButton);
  }

  if (window.location.pathname === '/') {
    document.getElementById('ethnicityForm').addEventListener('click', function (event) {
      if (event.target.classList.contains('btn-add')) {
        const parentId = event.target.closest('.parent').id;
        addEthnicityEntry(parentId);
      } else if (event.target.id === 'calculate') {
        calculateEthnicity(event);
      }
    });
  }

  function calculateEthnicity(event) {
    event.preventDefault(); // Prevent form submission

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(function (element) {
      element.textContent = '';
      element.style.visibility = 'hidden';
    });

    const motherValid = validateParentEntries(document.querySelectorAll('#mother .ethnicity-entry'));
    const fatherValid = validateParentEntries(document.querySelectorAll('#father .ethnicity-entry'));

    if (motherValid && fatherValid) {
      let ethnicities = {};
      gatherEthnicities('mother', ethnicities);
      gatherEthnicities('father', ethnicities);
      displayResults(ethnicities);
    }
  }

  function validateParentEntries(entries) {
    let isValid = true;
    let totalPercentage = 0;
    entries.forEach(entry => {
      const ethnicitiesInput = entry.querySelector('input[type="text"]');
      const percentInput = entry.querySelector('input[type="number"]');
      const ethnicitiesErrorDiv = ethnicitiesInput.nextElementSibling;
      const percentErrorDiv = percentInput.nextElementSibling;
      const percent = parseFloat(percentInput.value) || 0;

      if (percent > 0 && !ethnicitiesInput.value.trim()) {
        ethnicitiesErrorDiv.textContent = 'Ethnicity name is required';
        ethnicitiesErrorDiv.style.visibility = 'visible';
        isValid = false;
      }

      if (percentInput.value && percent === 0) {
        percentErrorDiv.textContent = 'Invalid percentage';
        percentErrorDiv.style.visibility = 'visible';
        isValid = false;
      }

      totalPercentage += percent;
    });

    if (totalPercentage !== 100) {
      entries[entries.length - 1].querySelector('.error-message').textContent = 'Percentages must total 100';
      entries[entries.length - 1].querySelector('.error-message').style.visibility = 'visible';
      isValid = false;
    }
    return isValid;
  }

  function gatherEthnicities(parentId, ethnicities) {
    const entries = document.querySelectorAll(`#${parentId} .ethnicity-entry`);
    entries.forEach(entry => {
      const ethnicity = entry.querySelector('input[type="text"]').value.trim();
      let percent = parseFloat(entry.querySelector('input[type="number"]').value);
      percent = isNaN(percent) ? 0 : percent / 2; // Child inherits half
      if (ethnicity && percent > 0) {
        ethnicities[ethnicity] = ethnicities[ethnicity] ? ethnicities[ethnicity] + percent : percent;
      }
    });
  }

  function displayResults(ethnicities) {
    const resultDiv = document.getElementById('result');
    let resultHTML = '<h2>Me</h2>';
    for (let ethnicity in ethnicities) {
      resultHTML += `<p>${ethnicity}: ${ethnicities[ethnicity].toFixed(2)}%</p>`;
    }
    resultDiv.innerHTML = resultHTML;
    resultDiv.style.display = 'block';

    launchConfetti();
  }

  function launchConfetti() {
    confetti({
      spread: 70,
      particleCount: 100,
      startVelocity: 30,
      origin: { y: 0.6 },
    });
  }

  window.onscroll = function () {
    scrollFunction();
  };

  function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 70) {
      document.querySelector('.navbar').style.top = '-65px';
    } else {
      document.querySelector('.navbar').style.top = '0';
    }
  }
});

function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme') || 'system'; // Use 'system' if nothing is saved
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (theme === 'system') {
    handleSystemThemeChange();
  }
}

function handleSystemThemeChange() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  document.documentElement.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');
  prefersDarkScheme.addEventListener('change', event => {
    document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
  });
}

function bindThemeToggleButtons() {
  const buttons = document.querySelectorAll('.toggle-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      const theme = this.dataset.theme;
      setTheme(theme);
    });
  });
}
