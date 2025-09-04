const planner = document.getElementById('planner');
const dateInput = document.getElementById('planner-date');
const importInput = document.getElementById('import-input');
const exportBtn = document.getElementById('export-btn');
const startHour = 9;
const endHour = 17;

// Notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Set date picker to today
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

// Load planner for selected date
dateInput.addEventListener('change', () => {
  renderPlanner(dateInput.value);
});
renderPlanner(today);

// 🔄 Render planner for selected date
function renderPlanner(selectedDate) {
  planner.innerHTML = '';
  const now = new Date();
  const currentHour = now.getHours();
  const savedData = JSON.parse(localStorage.getItem(`tasks-${selectedDate}`)) || {};

  for (let hour = startHour; hour <= endHour; hour++) {
    const block = document.createElement('div');
    block.className = 'time-block';

    const hourLabel = document.createElement('div');
    hourLabel.className = 'hour';
    hourLabel.textContent = formatHour(hour);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.dataset.hour = hour;

    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.className = `task ${getTimeClass(hour, selectedDate)}`;
    taskInput.dataset.hour = hour;
    taskInput.value = savedData[hour]?.text || '';

    if (savedData[hour]?.completed) {
      checkbox.checked = true;
      taskInput.classList.add('completed');
    }

    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      taskInput.classList.toggle('completed', isChecked);
      if (!savedData[hour]) savedData[hour] = {};
      savedData[hour].completed = isChecked;
      saveTasks(selectedDate, savedData);
    });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'saveBtn';
    saveBtn.textContent = '💾';

    saveBtn.addEventListener('click', () => {
      const taskText = taskInput.value;
      const isChecked = checkbox.checked;
      if (!savedData[hour]) savedData[hour] = {};
      savedData[hour].text = taskText;
      savedData[hour].completed = isChecked;
      saveTasks(selectedDate, savedData);
      if (taskText && Notification.permission === "granted") {
        scheduleNotification(selectedDate, hour, taskText);
      }
    });

    block.appendChild(hourLabel);
    block.appendChild(checkbox);
    block.appendChild(taskInput);
    block.appendChild(saveBtn);
    planner.appendChild(block);
  }
}

function saveTasks(dateKey, data) {
  localStorage.setItem(`tasks-${dateKey}`, JSON.stringify(data));
}

function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${ampm}`;
}

function getTimeClass(hour, selectedDate) {
  const now = new Date();
  const selected = new Date(selectedDate);
  const selectedIsToday = now.toDateString() === selected.toDateString();
  const currentHour = now.getHours();

  if (!selectedIsToday) return 'future';
  if (hour < currentHour) return 'past';
  if (hour === currentHour) return 'present';
  return 'future';
}

function scheduleNotification(dateString, hour, taskText) {
  const now = new Date();
  const taskTime = new Date(`${dateString}T${String(hour).padStart(2, '0')}:00:00`);
  const delay = taskTime - now;

  if (delay > 0) {
    setTimeout(() => {
      new Notification("🕒 Task Reminder", {
        body: `Task at ${formatHour(hour)}: "${taskText}"`,
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
      });
    }, delay);
  }
}

//// ------------------------------
/// 🔄 EXPORT TASKS
exportBtn.addEventListener('click', () => {
  const allTasks = {};
  for (let key in localStorage) {
    if (key.startsWith('tasks-')) {
      allTasks[key] = JSON.parse(localStorage.getItem(key));
    }
  }

  const blob = new Blob([JSON.stringify(allTasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

/// 🔄 IMPORT TASKS
importInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      for (let key in importedData) {
        if (key.startsWith('tasks-')) {
          const existing = JSON.parse(localStorage.getItem(key)) || {};
          const merged = { ...existing, ...importedData[key] };
          localStorage.setItem(key, JSON.stringify(merged));
        }
      }
      alert("✅ Tasks imported successfully!");
      renderPlanner(dateInput.value); // reload current day
    } catch (err) {
      alert("⚠️ Failed to import. Invalid file format.");
    }
  };
  reader.readAsText(file);
});
