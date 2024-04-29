document.addEventListener('DOMContentLoaded', function() {
  
  function addTribeEntry(parentId) {
    const parentDiv = document.getElementById(parentId);
    const newEntry = document.createElement('div');
    newEntry.classList.add('tribe-entry');
    newEntry.innerHTML = `
      <div class="input-group">
        <input type="text" placeholder="Tribe Name">
        <div class="error-message"></div>
      </div>
      <div class="input-group">
        <input type="number" placeholder="Percent" min="0" max="100%">
        <div class="error-message"></div>
      </div>
      <button type="button" class="btn-remove">Remove</button>
    `;

    // Attach event listener to the remove button in the new entry
    newEntry.querySelector('.btn-remove').addEventListener('click', function() {
      this.parentElement.remove();
    });

    const addButton = parentDiv.querySelector('.btn-add');
    parentDiv.insertBefore(newEntry, addButton);
  }

  document.getElementById('ethnicityForm').addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-add')) {
      const parentId = event.target.closest('.parent').id;
      addTribeEntry(parentId);
    } else if (event.target.id === 'calculate') {
      calculateEthnicity(event);
    }
  });

  function calculateEthnicity(event) {
    event.preventDefault(); // Prevent form submission

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(function(element) {
      element.textContent = '';
      element.style.visibility = 'hidden';
    });

    const motherValid = validateParentEntries(document.querySelectorAll('#mother .tribe-entry'));
    const fatherValid = validateParentEntries(document.querySelectorAll('#father .tribe-entry'));

    if (motherValid && fatherValid) {
      let tribes = {};
      gatherTribes('mother', tribes);
      gatherTribes('father', tribes);
      displayResults(tribes);
    }
  }

  function validateParentEntries(entries) {
    let isValid = true;
    let totalPercentage = 0;
    entries.forEach(entry => {
      const tribeInput = entry.querySelector('input[type="text"]');
      const percentInput = entry.querySelector('input[type="number"]');
      const tribeErrorDiv = tribeInput.nextElementSibling;
      const percentErrorDiv = percentInput.nextElementSibling;
      const percent = parseFloat(percentInput.value) || 0;
      
      if (percent > 0 && !tribeInput.value.trim()) {
        tribeErrorDiv.textContent = 'Tribe name is required';
        tribeErrorDiv.style.visibility = 'visible';
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

  function gatherTribes(parentId, tribes) {
    const entries = document.querySelectorAll(`#${parentId} .tribe-entry`);
    entries.forEach(entry => {
      const tribe = entry.querySelector('input[type="text"]').value.trim();
      let percent = parseFloat(entry.querySelector('input[type="number"]').value);
      percent = isNaN(percent) ? 0 : percent / 2; // Child inherits half
      if (tribe && percent > 0) {
        tribes[tribe] = tribes[tribe] ? tribes[tribe] + percent : percent;
      }
    });
  }
  
  function displayResults(tribes) {
    const resultDiv = document.getElementById('result');
    let resultHTML = '<h2>Me</h2>';
    for (let tribe in tribes) {
      resultHTML += `<p>${tribe}: ${tribes[tribe].toFixed(2)}%</p>`;
    }
    resultDiv.innerHTML = resultHTML;
    resultDiv.style.display = 'block';
  }

  window.onscroll = function() {
    scrollFunction();
  };
  
  function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      document.querySelector('.advertisement').style.top = "-45px";
    } else {
      document.querySelector('.advertisement').style.top = "0";
    }
  }

});



