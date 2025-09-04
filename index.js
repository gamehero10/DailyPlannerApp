const planner = document.getElementById('planner');
const startHour = 9; // 9 AM
const endHour = 17;  // 5 PM
const currentHour = new Date().getHours();

// Load saved tasks from localStorage
const savedTasks = JSON.parse(localStorage.getItem("dailyTasks")) || {};

for (let hour = startHour; hour <= endHour; hour++) {
  const block = document.createElement('div');
  block.className = 'time-block';

  // Hour label
  const hourLabel = document.createElement('div');
  hourLabel.className = 'hour';
  hourLabel.textContent = formatHour(hour);

  // Task input
  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.className = `task ${getTimeClass(hour)}`;
  taskInput.value = savedTasks[hour] || '';
  taskInput.dataset.hour = hour;

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.className = 'saveBtn';
  saveBtn.textContent = '💾';
  saveBtn.addEventListener('click', () => {
    savedTasks[hour] = taskInput.value;
    localStorage.setItem("dailyTasks", JSON.stringify(savedTasks));
  });

  block.appendChild(hourLabel);
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
