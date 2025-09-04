const planner = document.getElementById('planner');
const dateInput = document.getElementById('planner-date');
const startHour = 9;
const endHour = 17;

// Notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Set date picker to today by default
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

// Load planner for selected date
dateInput.addEventListener('change', () => {
  renderPlanner(dateInput.value);
});

// Initial render
renderPlanner(today);

// 🔄 Render planner for a specific date
function renderPlanner(selectedDate) {
  planner.innerHTML = '';
  const currentHour = new Date().getHours();
  const savedData = JSON.parse(localStorage.getItem(`tasks-${selectedDate}`)) || {};

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

      saveTasks(selectedDate, savedData);

      // Schedule notification if today or future
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

// 🧠 Save tasks to localStorage
function saveTasks(dateKey, data) {
  localStorage.setItem(`tasks-${dateKey}`, JSON.stringify(data));
}

// 🕐 Format hour
function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${ampm}`;
}

// 📊 Determine time class
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

// 🔔 Schedule notification
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
    console.log(`Scheduled notification for ${dateString} ${formatHour(hour)}`);
  }
}
