# Implementation Plan: Life Dashboard

## Overview

Implement the Life Dashboard as three files (`index.html`, `css/style.css`, `js/app.js`) using vanilla JS, a module-per-widget pattern, and localStorage for all persistence. Property-based tests use fast-check against the 13 correctness properties defined in the design.

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with semantic markup: `<html data-theme>`, `<head>` with CSS/JS links, and five `<section class="widget-card">` elements for each widget
  - Add `#theme-toggle` button in the header area
  - Create `css/style.css` and `js/app.js` as empty stubs so the page loads without errors
  - Create `tests/` directory structure: `unit/`, `property/`, `integration/`
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x] 2. Implement Storage utility and ThemeManager
  - [x] 2.1 Implement `Storage` utility in `js/app.js`
    - Write `Storage.get(key)`, `Storage.set(key, value)`, `Storage.remove(key)` with `try/catch` for unavailable localStorage (graceful in-memory fallback)
    - _Requirements: 1.4_
  - [x] 2.2 Implement `ThemeManager` in `js/app.js`
    - Write `ThemeManager.apply()` as a synchronous call before `DOMContentLoaded` — reads `ld_theme`, sets `data-theme` on `<html>`
    - Write `ThemeManager.toggle()` — flips theme, saves to `ld_theme`, updates `data-theme` and button label/icon
    - Write `ThemeManager.bindToggle()` — attaches click handler to `#theme-toggle`
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_
  - [ ]* 2.3 Write property test for ThemeManager toggle involution (Property 13)
    - **Property 13: Theme toggle is an involution with persistence**
    - **Validates: Requirements 8.2, 8.3, 8.5**
    - File: `tests/property/theme.prop.test.js`
  - [ ]* 2.4 Write unit tests for ThemeManager
    - Test FOUC prevention: `ThemeManager.apply()` sets `data-theme` before `DOMContentLoaded`
    - Test theme persists across simulated page reload
    - File: `tests/unit/theme.test.js`

- [x] 3. Implement CSS — Dark Elegance theme and layout
  - Define CSS custom properties for Dark Mode defaults (`--bg-primary`, `--bg-card`, `--border-card`, `--accent`, `--accent-secondary`, `--text-primary`, `--text-muted`, `--shadow-card`, `--blur`, `--transition`)
  - Define `[data-theme="light"]` overrides for Light Mode
  - Implement `.widget-card` glassmorphism styles (`backdrop-filter`, `border`, `border-radius`, `box-shadow`)
  - Implement CSS Grid dashboard layout (2–3 columns on wide screens, single column below 768px)
  - Apply `transition: all 0.3s ease` to all interactive elements
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 8.4_

- [x] 4. Implement GreetingWidget
  - [x] 4.1 Implement `GreetingWidget` module in `js/app.js`
    - Write `getGreeting(h)` pure function mapping hour [0–23] to greeting string
    - Write `tick()` updating time/date display every second via `setInterval`
    - Write `renderGreeting()` composing greeting + name and updating DOM
    - Write `saveName(name)` persisting to `ld_name`
    - Write `init()` loading saved name, starting clock, binding name form
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  - [ ]* 4.2 Write property test for greeting hour mapping (Property 1)
    - **Property 1: Greeting maps correctly for all hours**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.6**
    - File: `tests/property/greeting.prop.test.js`
  - [ ]* 4.3 Write property test for greeting includes name (Property 2)
    - **Property 2: Greeting includes name for all valid names**
    - **Validates: Requirements 4.8**
    - File: `tests/property/greeting.prop.test.js`
  - [ ]* 4.4 Write property test for name persistence round-trip (Property 3)
    - **Property 3: Name persistence round-trip**
    - **Validates: Requirements 4.9, 4.10**
    - File: `tests/property/greeting.prop.test.js`
  - [ ]* 4.5 Write unit tests for GreetingWidget
    - Test greeting renders saved name on load
    - Test clock updates every second
    - File: `tests/unit/greeting.test.js`

- [x] 5. Implement PomodoroWidget
  - [x] 5.1 Implement `PomodoroWidget` module in `js/app.js`
    - Write `formatTime(s)` pure function: seconds → `"MM:SS"` zero-padded string
    - Write `start()`, `stop()`, `reset()`, `tick()` with module-level `remaining`, `intervalId`, `configuredDuration` state
    - Write `saveDuration(mins)` persisting to `ld_pomodoro_duration`
    - Write `showEndNotification()` displaying visual end-of-session indicator
    - Write `init()` loading saved duration (default 1500s), rendering timer, binding Start/Stop/Reset and custom duration input
    - Disable Start button while `intervalId` is set
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  - [ ]* 5.2 Write property test for formatTime MM:SS (Property 4)
    - **Property 4: Timer format is always MM:SS**
    - **Validates: Requirements 5.9**
    - File: `tests/property/pomodoro.prop.test.js`
  - [ ]* 5.3 Write property test for duration persistence round-trip (Property 5)
    - **Property 5: Pomodoro duration persistence round-trip**
    - **Validates: Requirements 5.7, 5.8**
    - File: `tests/property/pomodoro.prop.test.js`
  - [ ]* 5.4 Write unit tests for PomodoroWidget
    - Test default initialization to 25 minutes (1500 seconds)
    - Test end notification fires when countdown reaches zero
    - File: `tests/unit/pomodoro.test.js`

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement TodoWidget
  - [x] 7.1 Implement `TodoWidget` module in `js/app.js`
    - Write `addTask(text)` with case-insensitive duplicate check, inline error display, Task object creation (`id`, `text`, `done`, `createdAt`), save, and re-render
    - Write `editTask(id, newText)`, `toggleTask(id)`, `deleteTask(id)` each saving and re-rendering
    - Write `sortTasks()` reordering incomplete tasks before completed
    - Write `render()` full re-render from state array with visual distinction for done tasks (strikethrough/opacity)
    - Write `save()` writing tasks array to `ld_tasks`
    - Write `init()` loading tasks from localStorage, rendering, binding add form
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_
  - [ ]* 7.2 Write property test for task addition round-trip (Property 6)
    - **Property 6: Task addition round-trip**
    - **Validates: Requirements 6.2, 6.12**
    - File: `tests/property/todo.prop.test.js`
  - [ ]* 7.3 Write property test for duplicate task rejection (Property 7)
    - **Property 7: Duplicate task rejection**
    - **Validates: Requirements 6.3**
    - File: `tests/property/todo.prop.test.js`
  - [ ]* 7.4 Write property test for task edit persistence round-trip (Property 8)
    - **Property 8: Task edit persistence round-trip**
    - **Validates: Requirements 6.5**
    - File: `tests/property/todo.prop.test.js`
  - [ ]* 7.5 Write property test for task completion toggle involution (Property 9)
    - **Property 9: Task completion toggle is an involution**
    - **Validates: Requirements 6.6, 6.7, 6.8**
    - File: `tests/property/todo.prop.test.js`
  - [ ]* 7.6 Write property test for task deletion (Property 10)
    - **Property 10: Task deletion removes from list and storage**
    - **Validates: Requirements 6.9, 6.10**
    - File: `tests/property/todo.prop.test.js`
  - [ ]* 7.7 Write property test for sort ordering (Property 11)
    - **Property 11: Sort places incomplete tasks before completed tasks**
    - **Validates: Requirements 6.11**
    - File: `tests/property/todo.prop.test.js`
  - [ ]* 7.8 Write unit tests for TodoWidget
    - Test empty task submission is rejected (no localStorage write)
    - Test inline error message shown on duplicate submission
    - File: `tests/unit/todo.test.js`

- [x] 8. Implement LinksWidget
  - [x] 8.1 Implement `LinksWidget` module in `js/app.js`
    - Write `addLink(name, url)` with `URL` constructor validation (inline error on invalid URL), QuickLink object creation (`id`, `name`, `url`), save, and re-render
    - Write `deleteLink(id)` removing by id, saving, re-rendering
    - Write `render()` full re-render rendering each link as a button that opens URL in new tab
    - Write `save()` writing links array to `ld_links`
    - Write `init()` loading links from localStorage, rendering, binding add form
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [ ]* 8.2 Write property test for Quick Link persistence round-trip (Property 12)
    - **Property 12: Quick Link persistence round-trip**
    - **Validates: Requirements 7.4, 7.6, 7.7**
    - File: `tests/property/links.prop.test.js`
  - [ ]* 8.3 Write unit tests for LinksWidget
    - Test empty name/URL submission is rejected
    - Test invalid URL is rejected with inline error
    - File: `tests/unit/links.test.js`

- [x] 9. Wire everything together in `js/app.js`
  - [x] 9.1 Add top-level initialization sequence
    - Call `ThemeManager.apply()` synchronously at script parse time (before `DOMContentLoaded`)
    - On `DOMContentLoaded`: call `GreetingWidget.init()`, `PomodoroWidget.init()`, `TodoWidget.init()`, `LinksWidget.init()`, then `ThemeManager.bindToggle()`
    - _Requirements: 1.1, 8.6_
  - [ ]* 9.2 Write integration tests
    - Test full page load with pre-populated localStorage: all widgets render saved state correctly
    - Test theme persists across simulated page reload
    - File: `tests/integration/dashboard.integration.test.js`

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Unit tests and property tests are complementary — both should be run together
- `ThemeManager.apply()` MUST run synchronously before `DOMContentLoaded` to prevent FOUC
