const planner = document.getElementById('planner');
const startHour = 9; // 9 AM
const endHour = 17;  // 5 PM
const currentHour = new Date().getHours();

// Request Notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

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
    const taskText = taskInput.value;
    const isChecked = checkbox.checked;

    if (!savedData[hour]) savedData[hour] = {};
    savedData[hour].text = taskText;
    savedData[hour].completed = isChecked;

    localStorage.setItem("dailyTasks", JSON.stringify(savedData));

    if (taskText && Notification.permission === "granted") {
      scheduleNotification(hour, taskText);
    }
  });

  block.appendChild(hourLabel);
  block.appendChild(checkbox);
  block.appendChild(taskInput);
  block.appendChild(saveBtn);
  planner.appendChild(block);
}

// Utils
function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${ampm}`;
}

function getTimeClass(hour) {
  if (hour < currentHour) return 'past';
  if (hour === currentHour) return 'present';
  return 'future';
}

// 🕒 Notification scheduler
function scheduleNotification(hour, text) {
  const now = new Date();
  const taskTime = new Date();
  taskTime.setHours(hour);
  taskTime.setMinutes(0);
  taskTime.setSeconds(0);
  taskTime.setMilliseconds(0);

  const delay = taskTime - now;

  if (delay > 0) {
    setTimeout(() => {
      new Notification("🕒 Task Reminder", {
        body: `It's time for: "${text}"`,
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png", // optional
      });
    }, delay);
    console.log(`Notification scheduled in ${Math.round(delay / 1000)}s for hour ${hour}`);
  } else {
    console.log(`Skipped notification for past time (hour: ${hour})`);
  }
}
