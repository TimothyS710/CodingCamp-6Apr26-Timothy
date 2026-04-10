// Todo Life Dashboard — js/app.js

// ---------------------------------------------------------------------------
// Storage key constants
// ---------------------------------------------------------------------------
const KEYS = {
  NAME: 'tld_name',
  POMODORO_DURATION: 'tld_pomodoro_duration',
  TASKS: 'tld_tasks',
  LINKS: 'tld_links',
  THEME: 'tld_theme',
};

// ---------------------------------------------------------------------------
// Storage module
// Wraps localStorage with JSON serialization and graceful error handling.
// Falls back silently when localStorage is unavailable (e.g. private mode).
// ---------------------------------------------------------------------------
const Storage = {
  /**
   * Retrieve a value by key.
   * @param {string} key
   * @returns {*} Parsed JSON value, or null if missing / unavailable.
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Persist a value by key.
   * @param {string} key
   * @param {*} value  Will be JSON-serialized.
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable or quota exceeded — continue in-memory
    }
  },

  /**
   * Remove a key from storage.
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage unavailable — no-op
    }
  },
};

// ---------------------------------------------------------------------------
// Greeting module
// Displays a personalized greeting with live clock and date.
// ---------------------------------------------------------------------------
const Greeting = {
  /** @type {number|null} setInterval handle */
  _intervalId: null,

  /**
   * Return the appropriate greeting prefix for the given hour (0–23).
   * [0–4]  → "Good Evening"
   * [5–11] → "Good Morning"
   * [12–17]→ "Good Afternoon"
   * [18–23]→ "Good Evening"
   * @param {number} hour  Integer in [0, 23]
   * @returns {"Good Morning"|"Good Afternoon"|"Good Evening"}
   */
  getGreetingPrefix(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    return 'Good Evening';
  },

  /**
   * Update the #clock-time and #clock-date elements with the current time/date,
   * then re-render the greeting text.
   */
  updateClock() {
    const now = new Date();

    const timeEl = document.getElementById('clock-time');
    if (timeEl) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}:${ss}`;
    }

    const dateEl = document.getElementById('clock-date');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    this.render();
  },

  /**
   * Save a custom name to Storage and re-render the greeting.
   * @param {string} name
   */
  saveName(name) {
    const trimmed = name.trim();
    if (trimmed) {
      Storage.set(KEYS.NAME, trimmed);
    } else {
      Storage.remove(KEYS.NAME);
    }
    this.render();
  },

  /**
   * Update #greeting-text with the current prefix (and name if saved).
   */
  render() {
    const greetingEl = document.getElementById('greeting-text');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    const prefix = this.getGreetingPrefix(hour);
    const name = Storage.get(KEYS.NAME);

    greetingEl.textContent = name ? `${prefix}, ${name}` : prefix;
  },

  /**
   * Restore saved name, wire the save button, and start the clock interval.
   */
  init() {
    // Wire save button
    const saveBtn = document.getElementById('name-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = document.getElementById('name-input');
        if (input) this.saveName(input.value);
      });
    }

    // Allow pressing Enter in the name input to save
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.saveName(nameInput.value);
      });
    }

    // Initial render + start clock
    this.updateClock();
    this._intervalId = setInterval(() => this.updateClock(), 1000);
  },
};

// ---------------------------------------------------------------------------
// PomodoroTimer module
// Manages a countdown timer with configurable session duration.
// Only sessionDuration is persisted; timer state is in-memory only.
// ---------------------------------------------------------------------------
const PomodoroTimer = {
  /** @type {number|null} setInterval handle */
  _intervalId: null,

  /** @type {number} Current session duration in minutes */
  _duration: 25,

  /** @type {number} Remaining seconds in the current countdown */
  _remaining: 25 * 60,

  /**
   * Validate a duration input value.
   * Accepts only positive integers (no floats, no negatives, no zero, no non-numeric).
   * @param {*} input
   * @returns {{ valid: boolean, value: number|null, error: string }}
   */
  validateDuration(input) {
    if (input === '' || input === null || input === undefined) {
      return { valid: false, value: null, error: 'Duration is required.' };
    }
    const str = String(input).trim();
    if (str === '') {
      return { valid: false, value: null, error: 'Duration is required.' };
    }
    // Must be a string of digits only (positive integer, no decimals, no signs)
    if (!/^\d+$/.test(str)) {
      return { valid: false, value: null, error: 'Duration must be a positive whole number.' };
    }
    const num = Number(str);
    if (num <= 0) {
      return { valid: false, value: null, error: 'Duration must be greater than zero.' };
    }
    return { valid: true, value: num, error: '' };
  },

  /**
   * Format a number of seconds as a MM:SS string (zero-padded).
   * @param {number} seconds  Non-negative integer
   * @returns {string}  e.g. "25:00", "04:07"
   */
  formatTime(seconds) {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  },

  /**
   * Decrement remaining seconds by one. Calls render() after each tick.
   * When remaining reaches 0, stops the timer and notifies the user.
   */
  tick() {
    if (this._remaining > 0) {
      this._remaining -= 1;
    }
    this.render();
    if (this._remaining === 0) {
      this.stop();
      this._notify();
    }
  },

  /**
   * Show a session-complete notification.
   * Updates #pomodoro-notification if present, otherwise falls back to alert.
   */
  _notify() {
    const notifEl = document.getElementById('pomodoro-notification');
    if (notifEl) {
      notifEl.textContent = 'Session complete! Take a break.';
      notifEl.style.display = 'block';
    } else {
      // eslint-disable-next-line no-alert
      alert('Pomodoro session complete! Take a break.');
    }
  },

  /**
   * Start the countdown interval. No-op if already running.
   */
  start() {
    if (this._intervalId !== null) return;
    // Hide any previous notification
    const notifEl = document.getElementById('pomodoro-notification');
    if (notifEl) notifEl.style.display = 'none';
    this._intervalId = setInterval(() => this.tick(), 1000);
  },

  /**
   * Pause the countdown. No-op if not running.
   */
  stop() {
    if (this._intervalId === null) return;
    clearInterval(this._intervalId);
    this._intervalId = null;
  },

  /**
   * Stop the countdown and restore remaining time to the current session duration.
   */
  reset() {
    this.stop();
    this._remaining = this._duration * 60;
    // Hide notification on reset
    const notifEl = document.getElementById('pomodoro-notification');
    if (notifEl) notifEl.style.display = 'none';
    this.render();
  },

  /**
   * Validate, persist, and apply a new custom session duration.
   * @param {*} minutes  Raw input value from the duration input field
   */
  saveCustomDuration(minutes) {
    const result = this.validateDuration(minutes);
    const errorEl = document.getElementById('pomodoro-error');

    if (!result.valid) {
      if (errorEl) errorEl.textContent = result.error;
      return;
    }

    if (errorEl) errorEl.textContent = '';
    this._duration = result.value;
    Storage.set(KEYS.POMODORO_DURATION, this._duration);
    this.reset();
  },

  /**
   * Update the timer display and button states in the DOM.
   */
  render() {
    const displayEl = document.getElementById('pomodoro-display');
    if (displayEl) {
      displayEl.textContent = this.formatTime(this._remaining);
    }
  },

  /**
   * Restore persisted duration from Storage, wire event listeners, and render.
   */
  init() {
    const saved = Storage.get(KEYS.POMODORO_DURATION);
    this._duration = (saved !== null && Number.isInteger(saved) && saved > 0) ? saved : 25;
    this._remaining = this._duration * 60;

    // Wire Start button
    const startBtn = document.getElementById('pomodoro-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    }

    // Wire Stop button
    const stopBtn = document.getElementById('pomodoro-stop-btn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }

    // Wire Reset button
    const resetBtn = document.getElementById('pomodoro-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    // Wire Save custom duration button
    const saveBtn = document.getElementById('pomodoro-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = document.getElementById('pomodoro-duration-input');
        if (input) this.saveCustomDuration(input.value);
      });
    }

    this.render();
  },
};

// ---------------------------------------------------------------------------
// TodoList module
// ---------------------------------------------------------------------------
const TodoList = {
  /** @type {Array<{id:string,text:string,completed:boolean,createdAt:number}>} */
  _tasks: [],
  /** @type {'pending'|'completed'|'alpha'} */
  _sortOrder: 'pending',

  validateTask(text) {
    if (!text || text.trim() === '') {
      return { valid: false, error: 'Task cannot be empty.' };
    }
    return { valid: true, error: '' };
  },

  isDuplicate(text) {
    const normalized = text.trim().toLowerCase();
    return this._tasks.some(t => t.text.trim().toLowerCase() === normalized);
  },

  addTask(text) {
    const trimmed = text.trim();
    const validation = this.validateTask(trimmed);
    const errorEl = document.getElementById('todo-error');

    if (!validation.valid) {
      if (errorEl) errorEl.textContent = validation.error;
      return;
    }
    if (this.isDuplicate(trimmed)) {
      if (errorEl) errorEl.textContent = 'Task already exists.';
      return;
    }
    if (errorEl) errorEl.textContent = '';

    const task = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    this._tasks.push(task);
    Storage.set(KEYS.TASKS, this._tasks);
    this.render();
  },

  deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    Storage.set(KEYS.TASKS, this._tasks);
    this.render();
  },

  toggleTask(id) {
    const task = this._tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      Storage.set(KEYS.TASKS, this._tasks);
      this.render();
    }
  },

  editTask(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const task = this._tasks.find(t => t.id === id);
    if (task) {
      task.text = trimmed;
      Storage.set(KEYS.TASKS, this._tasks);
      this.render();
    }
  },

  setSortOrder(order) {
    this._sortOrder = order;
    this.render();
  },

  getSortedTasks() {
    const copy = [...this._tasks];
    if (this._sortOrder === 'completed') {
      return copy.sort((a, b) => Number(b.completed) - Number(a.completed));
    }
    if (this._sortOrder === 'alpha') {
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    }
    // pending-first (default)
    return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
  },

  render() {
    const listEl = document.getElementById('todo-list');
    if (!listEl) return;
    const sorted = this.getSortedTasks();
    listEl.innerHTML = '';
    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => this.toggleTask(task.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = task.text;

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null) this.editTask(task.id, newText);
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-icon btn-delete';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => this.deleteTask(task.id));

      li.append(checkbox, span, editBtn, delBtn);
      listEl.appendChild(li);
    });
  },

  init() {
    const saved = Storage.get(KEYS.TASKS);
    this._tasks = Array.isArray(saved) ? saved : [];

    const addBtn = document.getElementById('todo-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const input = document.getElementById('todo-input');
        if (input) { this.addTask(input.value); input.value = ''; }
      });
    }

    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
      todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { this.addTask(todoInput.value); todoInput.value = ''; }
      });
    }

    const sortSelect = document.getElementById('todo-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.setSortOrder(sortSelect.value));
    }

    this.render();
  },
};

// ---------------------------------------------------------------------------
// QuickLinks module
// ---------------------------------------------------------------------------
const QuickLinks = {
  /** @type {Array<{id:string,name:string,url:string}>} */
  _links: [],

  normalizeUrl(url) {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return 'https://' + trimmed;
    }
    return trimmed;
  },

  validateLink(name, url) {
    if (!name || !name.trim()) return { valid: false, error: 'Link name is required.' };
    if (!url || !url.trim()) return { valid: false, error: 'URL is required.' };
    return { valid: true, error: '' };
  },

  addLink(name, url) {
    const errorEl = document.getElementById('links-error');
    const validation = this.validateLink(name, url);
    if (!validation.valid) {
      if (errorEl) errorEl.textContent = validation.error;
      return;
    }
    if (errorEl) errorEl.textContent = '';

    const link = {
      id: Date.now().toString(),
      name: name.trim(),
      url: this.normalizeUrl(url),
    };
    this._links.push(link);
    Storage.set(KEYS.LINKS, this._links);
    this.render();
  },

  deleteLink(id) {
    this._links = this._links.filter(l => l.id !== id);
    Storage.set(KEYS.LINKS, this._links);
    this.render();
  },

  render() {
    const container = document.getElementById('links-container');
    if (!container) return;
    container.innerHTML = '';
    this._links.forEach(link => {
      const wrapper = document.createElement('div');
      wrapper.className = 'link-item';

      const btn = document.createElement('a');
      btn.className = 'link-btn';
      btn.href = link.url;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.textContent = link.name;

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-icon btn-delete';
      delBtn.title = 'Remove';
      delBtn.innerHTML = '✕';
      delBtn.addEventListener('click', () => this.deleteLink(link.id));

      wrapper.append(btn, delBtn);
      container.appendChild(wrapper);
    });
  },

  init() {
    const saved = Storage.get(KEYS.LINKS);
    this._links = Array.isArray(saved) ? saved : [];

    const addBtn = document.getElementById('links-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('links-name-input');
        const urlInput = document.getElementById('links-url-input');
        if (nameInput && urlInput) {
          this.addLink(nameInput.value, urlInput.value);
          nameInput.value = '';
          urlInput.value = '';
        }
      });
    }

    this.render();
  },
};

// ---------------------------------------------------------------------------
// ThemeSwitcher module
// ---------------------------------------------------------------------------
const ThemeSwitcher = {
  _theme: 'light',

  apply(theme) {
    this._theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    Storage.set(KEYS.THEME, theme);
    this.render();
  },

  toggle() {
    this.apply(this._theme === 'light' ? 'dark' : 'light');
  },

  render() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.textContent = this._theme === 'light' ? '🌙 Dark' : '☀️ Light';
      btn.setAttribute('aria-label', `Switch to ${this._theme === 'light' ? 'dark' : 'light'} mode`);
    }
  },

  init() {
    const saved = Storage.get(KEYS.THEME);
    this.apply(saved === 'dark' ? 'dark' : 'light');

    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  },
};

// ---------------------------------------------------------------------------
// App — entry point
// ---------------------------------------------------------------------------
const App = {
  init() {
    ThemeSwitcher.init();
    Greeting.init();
    PomodoroTimer.init();
    TodoList.init();
    QuickLinks.init();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
