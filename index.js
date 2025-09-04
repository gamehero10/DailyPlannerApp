const planner = document.getElementById('planner');
const dateInput = document.getElementById('planner-date');
const importInput = document.getElementById('import-input');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const startTimeSelect = document.getElementById('start-time');
const endTimeSelect = document.getElementById('end-time');

let startHour = parseInt(localStorage.getItem('startHour')) || 9;
let endHour = parseInt(localStorage.getItem('endHour')) || 17;

// Populate time dropdowns
for (let h = 0; h < 24; h++) {
  const optionStart = document.createElement('option');
  const optionEnd = document.createElement('option');
  optionStart.value = h;
  optionEnd.value = h;
  optionStart.textContent = formatHour(h);
  optionEnd.textContent = formatHour(h);
  startTimeSelect.appendChild(optionStart);
  endTimeSelect.appendChild(optionEnd);
}
startTimeSelect.value = startHour;
endTimeSelect.value = endHour;

// Update planner when time range changes
[startTimeSelect, endTimeSelect].forEach(select => {
  select.addEventListener('change', () => {
    startHour = parseInt(startTimeSelect.value);
    endHour = parseInt(endTimeSelect.value);
    if (startHour >= endHour) {
      alert("⚠️ Start time must be before end time.");
      return;
    }
    localStorage.setItem('startHour', startHour);
    localStorage.setItem('endHour', endHour);
    renderPlanner(dateInput.value);
  });
});

// Notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Set default date to today
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

dateInput.addEventListener('change', () => {
  renderPlanner(dateInput.value);
});
renderPlanner(today);

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

// EXPORT
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
  a.download = `daily-planner-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// IMPORT
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
      renderPlanner(dateInput.value);
    } catch {
      alert("⚠️ Failed to import. Invalid file.");
    }
  };
  reader.readAsText(file);
});

// CLEAR
clearBtn.addEventListener('click', () => {
  if (confirm("⚠️ Clear ALL tasks? This cannot be undone.")) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('tasks-'));
    keys.forEach(k => localStorage.removeItem(k));
    alert("🗑️ All tasks cleared.");
    renderPlanner(dateInput.value);
  }
});
