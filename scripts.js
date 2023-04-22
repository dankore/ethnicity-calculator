document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('ethnicity-form');
  const fatherEthnicities = document.getElementById('father-ethnicities');
  const motherEthnicities = document.getElementById('mother-ethnicities');
  const resultsList = document.getElementById('ethnicity-list');
  const errorMessage = document.createElement('p');
  errorMessage.style.color = 'red';

 function createInputGroup(parentElement) {
  const inputGroup = document.createElement('div');
  inputGroup.classList.add('input-group');

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ethnicity';
  inputGroup.appendChild(input);

  const percentage = document.createElement('input');
  percentage.type = 'number';
  percentage.min = 0;
  percentage.max = 100;
  percentage.placeholder = 'Percentage';
  inputGroup.appendChild(percentage);

  parentElement.appendChild(inputGroup);
}


  // Add "Add Ethnicity" buttons
  const addFatherEthnicityBtn = document.createElement('button');
  const addMotherEthnicityBtn = document.createElement('button');

  addFatherEthnicityBtn.textContent = 'Add More Father Ethnicity';
  addFatherEthnicityBtn.type = 'button';
  addFatherEthnicityBtn.classList.add('add-ethnicity');
  addMotherEthnicityBtn.textContent = 'Add More Mother Ethnicity';
  addMotherEthnicityBtn.type = 'button';
  addMotherEthnicityBtn.classList.add('add-ethnicity');

  // Initialize the page with one ethnicity input box for each parent
  createInputGroup(fatherEthnicities.querySelector('.ethnicity-container'));
  createInputGroup(motherEthnicities.querySelector('.ethnicity-container'));

  fatherEthnicities.appendChild(addFatherEthnicityBtn);
  motherEthnicities.appendChild(addMotherEthnicityBtn);

  addFatherEthnicityBtn.addEventListener('click', () => {
    createInputGroup(fatherEthnicities.querySelector('.ethnicity-container'));
  });

  addMotherEthnicityBtn.addEventListener('click', () => {
    createInputGroup(motherEthnicities.querySelector('.ethnicity-container'));
  });

  function getTotalPercentage(inputGroups) {
    return inputGroups.reduce((total, inputGroup) => {
      const percentageInput = inputGroup.querySelector('input[type=number]');
      if (percentageInput) {
        const percentage = parseFloat(percentageInput.value);
        return total + (isNaN(percentage) ? 0 : percentage);
      }
      return total;
    }, 0);
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const fatherInputs = Array.from(fatherEthnicities.querySelectorAll('.input-group'));
    const motherInputs = Array.from(motherEthnicities.querySelectorAll('.input-group'));

    const fatherTotalPercentage = getTotalPercentage(fatherInputs);
    const motherTotalPercentage = getTotalPercentage(motherInputs);

    if (Math.abs(fatherTotalPercentage - 100) > 1e-5 || Math.abs(motherTotalPercentage - 100) > 1e-5) {
      errorMessage.textContent = "Error: Each parent's total percentage must equal 100%.";
      form.appendChild(errorMessage);
      return;
    } else {
      errorMessage.textContent = '';
    }

    let ethnicities = {};

    fatherInputs.forEach(inputGroup => {
      const ethnicityInput = inputGroup.querySelector('input[type=text]');
      const percentageInput = inputGroup.querySelector('input[type=number]');

      if (ethnicityInput && percentageInput) {
        const ethnicity = ethnicityInput.value.trim().toLowerCase();
        const percentage = parseFloat(percentageInput.value);

        if (ethnicity && !isNaN(percentage)) {
          ethnicities[ethnicity] = (ethnicities[ethnicity] || 0) + percentage / 2;
        }
      }
    });

    motherInputs.forEach(inputGroup => {
      const ethnicityInput = inputGroup.querySelector('input[type=text]');
      const percentageInput = inputGroup.querySelector('input[type=number]');

      if (ethnicityInput && percentageInput) {
        const ethnicity = ethnicityInput.value.trim().toLowerCase();
        const percentage = parseFloat(percentageInput.value);

        if (ethnicity && !isNaN(percentage)) {
          ethnicities[ethnicity] = (ethnicities[ethnicity] || 0) + percentage / 2;
        }
      }
    });

    resultsList.innerHTML = '';

    // Convert the ethnicities object to an array and sort it by percentage (descending)
    const sortedEthnicities = Object.entries(ethnicities).sort((a, b) => b[1] - a[1]);

    // Create a table to display the results
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    const header1 = document.createElement('th');
    const header2 = document.createElement('th');

    header1.textContent = 'Ethnicity';
    header2.textContent = 'Percentage';
    headerRow.appendChild(header1);
    headerRow.appendChild(header2);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);
    resultsList.appendChild(table);

    // Add the sorted results to the table
    sortedEthnicities.forEach(([ethnicity, percentage]) => {
      const row = document.createElement('tr');
      const cell1 = document.createElement('td');
      const cell2 = document.createElement('td');

      cell1.textContent = capitalizeFirstLetter(ethnicity);
      cell2.textContent = `${percentage.toFixed(1)}%`;

      row.appendChild(cell1);
      row.appendChild(cell2);
      tbody.appendChild(row);
    });

  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker Registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker Registration Failed:', error);
      });
  } else {
    console.log('Service Workers are not supported by this browser.');
  }

});
