# Implementation Plan: Todo Life Dashboard

## Overview

Build a single-page, client-side dashboard using vanilla HTML, CSS, and JavaScript. No build tools, no frameworks, no packages.

## Tasks

- [x] 1. Set up project structure and Storage module
  - Create `index.html`, `css/style.css`, and `js/app.js` with skeleton scaffolding
  - Implement the `Storage` module with `get`, `set`, and `remove` methods wrapping `localStorage`, including try/catch for unavailability
  - Define all storage key constants (`tld_name`, `tld_pomodoro_duration`, `tld_tasks`, `tld_links`, `tld_theme`)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement Greeting and Clock module
  - [x] 2.1 Implement Greeting module
    - Implement `getGreetingPrefix(hour)` mapping 0-4 to "Good Evening", 5-11 to "Good Morning", 12-17 to "Good Afternoon", 18-23 to "Good Evening"
    - Implement `updateClock()` using `setInterval` at 1000ms to update time and date display
    - Implement `saveName(name)` and `render()` to display "[prefix], [name]" or just prefix when no name saved
    - Wire name input field save action; restore name from Storage on `init()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 3. Implement Pomodoro Timer module
  - [x] 3.1 Implement PomodoroTimer module
    - Implement `validateDuration(input)` returning `{ valid, value, error }` - reject zero, negatives, floats, non-numeric strings, empty string
    - Implement `tick()` to decrement remaining seconds and auto-stop with notification at 00:00
    - Implement `start()`, `stop()`, `reset()` controlling a single `intervalId`
    - Implement `saveCustomDuration(minutes)` persisting to Storage and resetting display
    - Format remaining seconds as MM:SS (zero-padded) in `render()`
    - Default to 25 minutes when Storage returns null on `init()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 4. Implement TodoList module
  - [x] 4.1 Implement TodoList module
    - Define `Task` data model: `{ id, text, completed, createdAt }`
    - Implement `validateTask(text)` rejecting empty and whitespace-only strings
    - Implement `isDuplicate(text)` with case-insensitive, trim-aware comparison
    - Implement `addTask(text)`, `deleteTask(id)`, `toggleTask(id)`, `editTask(id, newText)` - each persists to Storage
    - Implement `getSortedTasks()` supporting "pending", "completed", "alpha" orders
    - Implement `setSortOrder(order)` that re-renders without mutating Storage
    - Restore tasks from Storage on `init()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12_

- [x] 5. Implement QuickLinks module
  - [x] 5.1 Implement QuickLinks module
    - Define `Link` data model: `{ id, name, url }`
    - Implement `normalizeUrl(url)` prepending `https://` when no `http://` or `https://` scheme present (idempotent)
    - Implement `validateLink(name, url)` rejecting empty name or empty URL
    - Implement `addLink(name, url)` and `deleteLink(id)` - each persists to Storage
    - Render links as buttons that open URL in a new tab; restore from Storage on `init()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 6. Implement ThemeSwitcher module
  - [x] 6.1 Implement ThemeSwitcher module
    - Implement `apply(theme)` setting `data-theme` attribute on `<html>` and persisting to Storage
    - Implement `toggle()` switching between "light" and "dark"
    - Default to "light" when Storage returns null on `init()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Build layout, CSS, and wire App.init
  - [x] 7.1 Build HTML structure and CSS
    - Implement card-based grid/flexbox layout in `index.html` with one card per module
    - Apply CSS Variables for all theme colors (light default: purple/white scheme)
    - Apply rounded corners (12-16px), box-shadow, and responsive breakpoints for mobile
    - Implement `[data-theme="dark"]` overrides for all CSS Variables
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 7.2 Implement App.init and wire all modules
    - Call each module's `init()` from `App.init()` on `DOMContentLoaded`
    - Ensure full page load restores all persisted state (name, theme, tasks, links, Pomodoro duration)
    - _Requirements: 1.1, 2.8_
