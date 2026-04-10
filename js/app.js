/* Life Dashboard — js/app.js */

/* =========================================================
   Storage Utility
   Wraps localStorage with try/catch; falls back to in-memory
   object when localStorage is unavailable.
   Requirements: 1.4
   ========================================================= */
const _memoryStore = {};

const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return key in _memoryStore ? _memoryStore[key] : null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      _memoryStore[key] = value;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      delete _memoryStore[key];
    }
  },
};

/* =========================================================
   ThemeManager
   apply() runs synchronously before DOMContentLoaded to
   prevent flash of unstyled content (FOUC).
   Requirements: 8.1, 8.2, 8.3, 8.5, 8.6
   ========================================================= */
const ThemeManager = {
  apply() {
    const saved = Storage.get('ld_theme');
    const theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.set('ld_theme', next);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = next === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
  },

  bindToggle() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => ThemeManager.toggle());
    }
  },
};

// Apply theme immediately (before first paint) to prevent FOUC
ThemeManager.apply();

/* =========================================================
   GreetingWidget
   Displays current time, date, and a time-of-day greeting.
   Supports a personalized name saved to localStorage.
   Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10
   ========================================================= */
const GreetingWidget = {
  _name: '',
  _intervalId: null,

  getGreeting(h) {
    if (h >= 5 && h <= 11) return 'Good Morning';
    if (h >= 12 && h <= 17) return 'Good Afternoon';
    if (h >= 18 && h <= 21) return 'Good Evening';
    return 'Good Night';
  },

  renderGreeting() {
    const h = new Date().getHours();
    const phrase = this.getGreeting(h);
    const text = this._name ? `${phrase}, ${this._name}` : phrase;
    const el = document.getElementById('greeting-text');
    if (el) el.textContent = text;
  },

  tick() {
    const now = new Date();

    const timeEl = document.getElementById('greeting-time');
    if (timeEl) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}:${ss}`;
    }

    const dateEl = document.getElementById('greeting-date');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    this.renderGreeting();
  },

  saveName(name) {
    const trimmed = name.trim();
    Storage.set('ld_name', trimmed);
    this._name = trimmed;
    this.renderGreeting();
  },

  init() {
    const saved = Storage.get('ld_name');
    this._name = saved || '';

    this.tick();
    this._intervalId = setInterval(() => this.tick(), 1000);

    const form = document.getElementById('greeting-name-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('greeting-name-input');
        if (input) {
          this.saveName(input.value);
          input.value = '';
        }
      });
    }
  },
};

/* =========================================================
   PomodoroWidget
   Configurable countdown timer using the Pomodoro technique.
   Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
   ========================================================= */
const PomodoroWidget = {
  _remaining: 1500,
  _configuredDuration: 1500,
  _intervalId: null,

  formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  showEndNotification() {
    const el = document.getElementById('pomodoro-notification');
    if (el) {
      el.removeAttribute('hidden');
      setTimeout(() => el.setAttribute('hidden', ''), 5000);
    }
  },

  start() {
    if (this._intervalId) return;
    this._intervalId = setInterval(() => this.tick(), 1000);
    const startBtn = document.getElementById('pomodoro-start');
    const stopBtn = document.getElementById('pomodoro-stop');
    if (startBtn) startBtn.setAttribute('hidden', '');
    if (stopBtn) stopBtn.removeAttribute('hidden');
    const notification = document.getElementById('pomodoro-notification');
    if (notification) notification.setAttribute('hidden', '');
  },

  stop() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    const startBtn = document.getElementById('pomodoro-start');
    const stopBtn = document.getElementById('pomodoro-stop');
    if (startBtn) startBtn.removeAttribute('hidden');
    if (stopBtn) stopBtn.setAttribute('hidden', '');
  },

  reset() {
    this.stop();
    this._remaining = this._configuredDuration;
    const display = document.getElementById('pomodoro-display');
    if (display) display.textContent = this.formatTime(this._remaining);
    const notification = document.getElementById('pomodoro-notification');
    if (notification) notification.setAttribute('hidden', '');
  },

  tick() {
    this._remaining -= 1;
    const display = document.getElementById('pomodoro-display');
    if (display) display.textContent = this.formatTime(this._remaining);
    if (this._remaining <= 0) {
      this.stop();
      this.showEndNotification();
    }
  },

  saveDuration(mins) {
    if (!Number.isInteger(mins) || mins <= 0) return;
    this._configuredDuration = mins * 60;
    Storage.set('ld_pomodoro_duration', mins);
    this.reset();
  },

  init() {
    const saved = Storage.get('ld_pomodoro_duration');
    if (saved !== null) {
      this._configuredDuration = saved * 60;
    }
    this._remaining = this._configuredDuration;

    const display = document.getElementById('pomodoro-display');
    if (display) display.textContent = this.formatTime(this._remaining);

    const startBtn = document.getElementById('pomodoro-start');
    const stopBtn = document.getElementById('pomodoro-stop');
    const resetBtn = document.getElementById('pomodoro-reset');
    const form = document.getElementById('pomodoro-duration-form');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('pomodoro-duration-input');
        if (input) {
          const mins = parseInt(input.value, 10);
          this.saveDuration(mins);
          input.value = '';
        }
      });
    }
  },
};

/* =========================================================
   TodoWidget
   Smart To-Do List with add, edit, toggle, delete, and sort.
   Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12
   ========================================================= */
const TodoWidget = {
  _tasks: [],

  save() {
    Storage.set('ld_tasks', this._tasks);
  },

  addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      this._showError('Task cannot be empty.');
      return;
    }

    const lower = trimmed.toLowerCase();
    const duplicate = this._tasks.some(t => t.text.toLowerCase() === lower);
    if (duplicate) {
      this._showError('A task with that text already exists.');
      return;
    }

    const task = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    };

    this._tasks.push(task);
    this.save();
    this.render();
    this._hideError();
  },

  editTask(id, newText) {
    const task = this._tasks.find(t => t.id === id);
    if (task) {
      task.text = newText;
      this.save();
      this.render();
    }
  },

  toggleTask(id) {
    const task = this._tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      this.save();
      this.render();
    }
  },

  deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  },

  sortTasks() {
    this._tasks.sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1;
    });
    this.save();
    this.render();
  },

  render() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = '';

    this._tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => this.toggleTask(task.id));

      // Task text span
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'task-edit-btn';
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'widget-input task-edit-input';
        input.value = task.text;

        const save = () => {
          const newText = input.value.trim();
          if (newText) {
            this.editTask(task.id, newText);
          } else {
            this.render();
          }
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            input.removeEventListener('blur', save);
            save();
          } else if (e.key === 'Escape') {
            input.removeEventListener('blur', save);
            this.render();
          }
        });

        li.replaceChild(input, span);
        input.focus();
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-delete-btn';
      deleteBtn.textContent = '🗑️';
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  },

  _showError(msg) {
    const el = document.getElementById('todo-error');
    if (el) {
      el.textContent = msg;
      el.removeAttribute('hidden');
    }
  },

  _hideError() {
    const el = document.getElementById('todo-error');
    if (el) el.setAttribute('hidden', '');
  },

  init() {
    const saved = Storage.get('ld_tasks');
    this._tasks = Array.isArray(saved) ? saved : [];
    this.render();

    const form = document.getElementById('todo-add-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        if (input) {
          const before = this._tasks.length;
          this.addTask(input.value);
          if (this._tasks.length > before) {
            input.value = '';
          }
        }
      });
    }

    const sortBtn = document.getElementById('todo-sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', () => this.sortTasks());
    }
  },
};

/* =========================================================
   LinksWidget
   Quick Links: save, display, and open bookmarked URLs.
   Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
   ========================================================= */
const LinksWidget = {
  _links: [],

  save() {
    Storage.set('ld_links', this._links);
  },

  addLink(name, url) {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      this._showError('Link name cannot be empty.');
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      this._showError('Please enter a valid URL including the protocol (e.g. https://).');
      return;
    }

    const link = {
      id: Date.now().toString(),
      name: trimmedName,
      url: trimmedUrl,
    };

    this._links.push(link);
    this.save();
    this.render();
    this._hideError();
  },

  deleteLink(id) {
    this._links = this._links.filter(l => l.id !== id);
    this.save();
    this.render();
  },

  render() {
    const list = document.getElementById('links-list');
    if (!list) return;
    list.innerHTML = '';

    this._links.forEach(link => {
      const div = document.createElement('div');
      div.className = 'link-item';

      const a = document.createElement('a');
      a.className = 'link-btn';
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.name;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'link-delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

      div.appendChild(a);
      div.appendChild(deleteBtn);
      list.appendChild(div);
    });
  },

  _showError(msg) {
    const el = document.getElementById('links-error');
    if (el) {
      el.textContent = msg;
      el.removeAttribute('hidden');
    }
  },

  _hideError() {
    const el = document.getElementById('links-error');
    if (el) el.setAttribute('hidden', '');
  },

  init() {
    const saved = Storage.get('ld_links');
    this._links = Array.isArray(saved) ? saved : [];
    this.render();

    const form = document.getElementById('links-add-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('links-name-input');
        const urlInput = document.getElementById('links-url-input');
        if (nameInput && urlInput) {
          const before = this._links.length;
          this.addLink(nameInput.value, urlInput.value);
          if (this._links.length > before) {
            nameInput.value = '';
            urlInput.value = '';
          }
        }
      });
    }
  },
};

/* =========================================================
   DOMContentLoaded — widget initialization
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.bindToggle();
  GreetingWidget.init();
  PomodoroWidget.init();
  TodoWidget.init();
  LinksWidget.init();
});
