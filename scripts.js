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

    const label = document.createElement('label');
    label.textContent = 'Ethnicity: ';
    inputGroup.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ethnicity';
    label.appendChild(input);

    const percentage = document.createElement('input');
    percentage.type = 'number';
    percentage.min = 0;
    percentage.max = 100;
    percentage.placeholder = 'Percentage';
    inputGroup.appendChild(percentage);

    parentElement.appendChild(inputGroup);
  }

  for (let i = 0; i < 5; i++) {
    createInputGroup(fatherEthnicities.querySelector('.ethnicity-container'));
    createInputGroup(motherEthnicities.querySelector('.ethnicity-container'));
  }

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
        const ethnicity = ethnicityInput.value.trim();
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
        const ethnicity = ethnicityInput.value.trim();
        const percentage = parseFloat(percentageInput.value);

        if (ethnicity && !isNaN(percentage)) {
          ethnicities[ethnicity] = (ethnicities[ethnicity] || 0) + percentage / 2;
        }
      }
    });

    resultsList.innerHTML = '';
    for (const ethnicity in ethnicities) {
      const li = document.createElement('li');
      li.textContent = `${ethnicity}: ${ethnicities[ethnicity].toFixed(1)}%`;
      resultsList.appendChild(li);
    }
  });

});
