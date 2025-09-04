const planner = document.getElementById('planner');
const startHour = 9; // 9 AM
const endHour = 17;  // 5 PM
const currentHour = new Date().getHours();

// Load saved data from localStorage
const savedData = JSON.parse(localStorage.getItem("dailyTasks")) || {};

for (let hour = startHour; hour <= endHour; hour++) {
  const block = document.createElement('div');
  block.className = 'time-block';

  // Hour label
  const hourLabel = document.createElement('div');
  hourLabel.className = 'hour';
  hourLabel.textContent = formatHour(hour);

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox';
  checkbox.dataset.hour = hour;

  // Task input
  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.className = `task ${getTimeClass(hour)}`;
  taskInput.dataset.hour = hour;
  taskInput.value = savedData[hour]?.text || '';

  // If completed, mark it visually
  if (savedData[hour]?.completed) {
    checkbox.checked = true;
    taskInput.classList.add('completed');
  }

  // Toggle completed state
  checkbox.addEventListener('change', () => {
    const isChecked = checkbox.checked;
    taskInput.classList.toggle('completed', isChecked);

    if (!savedData[hour]) savedData[hour] = {};
    savedData[hour].completed = isChecked;
    localStorage.setItem("dailyTasks", JSON.stringify(savedData));
  });

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.className = 'saveBtn';
  saveBtn.textContent = '💾';

  saveBtn.addEventListener('click', () => {
    if (!savedData[hour]) savedData[hour] = {};
    savedData[hour].text = taskInput.value;
    savedData[hour].completed = checkbox.checked;

    localStorage.setItem("dailyTasks", JSON.stringify(savedData));
  });

  block.appendChild(hourLabel);
  block.appendChild(checkbox);
  block.appendChild(taskInput);
  block.appendChild(saveBtn);
  planner.appendChild(block);
}

// Utility: Format hour (24h to 12h with AM/PM)
function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${ampm}`;
}

// Utility: Return class based on current time
function getTimeClass(hour) {
  if (hour < currentHour) return 'past';
  if (hour === currentHour) return 'present';
  return 'future';
}
