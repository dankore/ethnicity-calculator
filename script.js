document.addEventListener('DOMContentLoaded', function() {
  
  function addTribeEntry(parentId) {
    const parentDiv = document.getElementById(parentId);
    const newEntry = document.createElement('div');
    newEntry.classList.add('tribe-entry');
    newEntry.innerHTML = `
      <input type="text" placeholder="Tribe Name">
      <input type="number" placeholder="Percent" min="0" max="100">
      <button type="button" class="btn-remove">Remove</button>
    `;

    // Add event listener to the remove button of this new entry
    newEntry.querySelector('.btn-remove').addEventListener('click', function() {
      this.parentElement.remove();
    });

    // Insert the new entry before the add button
    const addButton = parentDiv.querySelector('.btn-add');
    parentDiv.insertBefore(newEntry, addButton);
  }

  function removeTribeEntry(event) {
    event.target.parentElement.remove();
  }

  function calculateEthnicity(event) {
    event.preventDefault(); // Prevent form submission
  
    // Gather all the tribes and percentages
    let tribes = {};
    gatherTribes('mother', tribes);
    gatherTribes('father', tribes);
  
    // Normalize and prepare results if total percentage exceeds 100%
    let totalPercent = Object.values(tribes).reduce((sum, percent) => sum + percent, 0);
    if (totalPercent !== 100) {
      for (let tribe in tribes) {
        tribes[tribe] = (tribes[tribe] / totalPercent) * 100;
      }
    }
  
    displayResults(tribes);
  }
  
  function gatherTribes(parentId, tribes) {
    const entries = document.querySelectorAll(`#${parentId} .tribe-entry`);
    entries.forEach(entry => {
      const tribe = entry.querySelector('input[type="text"]').value.trim();
      let percent = parseFloat(entry.querySelector('input[type="number"]').value);
      percent = isNaN(percent) ? 0 : percent / 2; // Divide by 2 to get the child's inheritance
      if (tribe && percent > 0) {
        if (tribes[tribe]) {
          tribes[tribe] += percent; // If the tribe already exists, add the percentage
        } else {
          tribes[tribe] = percent; // If it's a new tribe, set the percentage
        }
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
  

  function validatePercentages(percentageInputs) {
    let total = 0;
    percentageInputs.forEach(input => {
      total += parseFloat(input.value) || 0;
    });
    return total === 100;
  }

  // Event delegation for dynamic elements
  document.getElementById('ethnicityForm').addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-add')) {
      const parentId = event.target.closest('.parent').id;
      addTribeEntry(parentId);
    } else if (event.target.classList.contains('btn-remove')) {
      removeTribeEntry(event);
    } else if (event.target.id === 'calculate') {
      calculateEthnicity(event);
    }
  });

});
