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

    const motherValid = validateParentEntries(document.querySelectorAll('#mother .tribe-entry'));
    const fatherValid = validateParentEntries(document.querySelectorAll('#father .tribe-entry'));

    if (!motherValid || !fatherValid) {
      alert("Please ensure each tribe has a name and its percentage totals 100% for each parent.");
      return; // Stop the function if validation fails
    }

    let tribes = {};
    gatherTribes('mother', tribes);
    gatherTribes('father', tribes);

    displayResults(tribes);
  }

  function validateParentEntries(entries) {
    let totalPercentage = 0;
    for (let entry of entries) {
      const tribeInput = entry.querySelector('input[type="text"]');
      const percentInput = entry.querySelector('input[type="number"]');
      const percent = parseFloat(percentInput.value) || 0;
      if (percent > 0 && !tribeInput.value.trim()) {
        return false;
      }
      totalPercentage += percent;
    }
    return totalPercentage === 100;
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

});
