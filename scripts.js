document.querySelectorAll('.add-ethnicity').forEach(button =>
  button.addEventListener('click', function () {
    const newRow = this.parentNode.cloneNode(true);
    newRow.querySelector('.ethnicity').value = '';
    newRow.querySelector('.percentage').value = '';
    newRow.querySelector('.add-ethnicity').textContent = '-';
    newRow.querySelector('.add-ethnicity').classList.add('remove-ethnicity');
    newRow.querySelector('.add-ethnicity').classList.remove('add-ethnicity');
    newRow.querySelector('.remove-ethnicity').addEventListener('click', function () {
      this.parentNode.remove();
    });
    this.parentNode.parentNode.appendChild(newRow);
  })
);

document.getElementById('ethnicity-form').addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validatePercentageTotal('#father-ethnicities .percentage')) {
    alert("Father's ethnicity percentages must add up to 100%.");
    return;
  }

  if (!validatePercentageTotal('#mother-ethnicities .percentage')) {
    alert("Mother's ethnicity percentages must add up to 100%.");
    return;
  }

  const ethnicities = [];

  document.querySelectorAll('#father-ethnicities .ethnicity-row').forEach(row => {
    ethnicities.push({
      name: row.querySelector('.ethnicity').value.toLowerCase(),
      percentage: parseFloat(row.querySelector('.percentage').value),
    });
  });

  document.querySelectorAll('#mother-ethnicities .ethnicity-row').forEach(row => {
    ethnicities.push({
      name: row.querySelector('.ethnicity').value.toLowerCase(),
      percentage: parseFloat(row.querySelector('.percentage').value),
    });
  });

  const aggregatedEthnicities = aggregateEthnicities(ethnicities);
  const normalizedPercentages = normalizePercentages(aggregatedEthnicities);
  displayEthnicityResults(normalizedPercentages);
});

function createEthnicityRow() {
  const newRow = document.createElement("div");
  newRow.classList.add("ethnicity-row");

  newRow.innerHTML = `
    <label>
      Ethnicity:
      <input type="text" class="ethnicity" required>
    </label>
    <label>
      Percentage:
      <input type="number" class="percentage" min="0" max="100" required>
    </label>
    <button type="button" class="remove-ethnicity">-</button>
  `;

  newRow.querySelector(".remove-ethnicity").addEventListener("click", function () {
    this.parentNode.remove();
  });

  return newRow;
}


document.querySelectorAll('.add-ethnicity').forEach(button =>
  button.addEventListener('click', function () {
    const parent = document.getElementById(this.dataset.parent);
    const newRow = createEthnicityRow();
    parent.querySelector('.ethnicity-container').appendChild(newRow);
  })
);

// Add initial ethnicity rows
document.getElementById("father-ethnicities").querySelector(".ethnicity-container").appendChild(createEthnicityRow());
document.getElementById("mother-ethnicities").querySelector(".ethnicity-container").appendChild(createEthnicityRow());


function normalizePercentages(aggregatedEthnicities) {
  const totalPercentage = Object.values(aggregatedEthnicities).reduce((sum, percentage) => sum + percentage, 0);

  const normalizedPercentages = {};

  for (const [ethnicity, percentage] of Object.entries(aggregatedEthnicities)) {
    normalizedPercentages[ethnicity] = (percentage / totalPercentage) * 100;
  }

  return normalizedPercentages;
}

function validatePercentageTotal(selector) {
  const percentages = document.querySelectorAll(selector);
  let totalPercentage = 0;

  percentages.forEach(percentage => {
    totalPercentage += parseFloat(percentage.value);
  });

  return totalPercentage === 100;
}

function aggregateEthnicities(ethnicities) {
  const aggregatedEthnicities = {};

  ethnicities.forEach(ethnicity => {
    if (aggregatedEthnicities[ethnicity.name]) {
      aggregatedEthnicities[ethnicity.name] += ethnicity.percentage;
    } else {
      aggregatedEthnicities[ethnicity.name] = ethnicity.percentage;
    }
  });

  return aggregatedEthnicities;
}

function displayEthnicityResults(aggregatedEthnicities) {
  const list = document.getElementById('ethnicity-list');
  list.innerHTML = '';

  Object.entries(aggregatedEthnicities).forEach(([name, percentage]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${name}\t${percentage.toFixed(2)}%`;
    list.appendChild(listItem);
  });

  document.getElementById('results').style.display = 'block';
}
