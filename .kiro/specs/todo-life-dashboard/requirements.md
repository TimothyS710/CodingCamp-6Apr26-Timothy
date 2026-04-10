# Requirements Document

## Introduction

A single-page, client-side To-Do List Life Dashboard web application built with vanilla HTML, CSS, and JavaScript. The dashboard consolidates daily productivity tools — a personalized greeting with live clock, a Pomodoro timer, a smart to-do list, quick-access links, and a light/dark theme switcher — into one clean, card-based interface. All data is persisted in the browser's Local Storage with no backend required.

## Glossary

- **Dashboard**: The single HTML page that hosts all feature cards.
- **App**: The Dashboard application as a whole.
- **Storage**: The browser's Local Storage API used for all client-side persistence.
- **Greeting_Card**: The UI card displaying the current time, date, and personalized greeting.
- **Pomodoro_Timer**: The UI card containing the countdown timer and its controls.
- **Todo_List**: The UI card containing the task management interface.
- **Quick_Links**: The UI card containing saved website shortcut buttons.
- **Theme_Switcher**: The toggle control that switches the Dashboard between light and dark mode.
- **Task**: A single to-do item with a text label and a completion state.
- **Link**: A saved shortcut consisting of a display name and a URL.
- **Session_Duration**: The user-configured length of a Pomodoro focus session in minutes.

---

## Requirements

### Requirement 1: Project Structure and Technical Constraints

**User Story:** As a developer, I want the project to follow a strict file structure, so that the codebase remains maintainable and easy to navigate.

#### Acceptance Criteria

1. THE App SHALL be implemented using exactly one HTML file, one CSS file located inside a `css/` folder, and one JavaScript file located inside a `js/` folder.
2. THE App SHALL use only vanilla HTML, CSS, and JavaScript with no external frameworks or libraries.
3. THE App SHALL require no backend server and SHALL function entirely in the browser.

---

### Requirement 2: Layout and Visual Design

**User Story:** As a user, I want a clean, modern interface, so that the dashboard is pleasant and easy to use.

#### Acceptance Criteria

1. THE Dashboard SHALL use a card-based grid or Flexbox layout to visually separate each feature into its own card.
2. THE Dashboard SHALL apply rounded corners between 12px and 16px to all cards.
3. THE Dashboard SHALL apply a subtle box-shadow to each card so the cards appear to float above the background.
4. THE Dashboard SHALL use CSS Variables to define all theme colors, enabling consistent theme switching.
5. THE Dashboard SHALL use a primary purple and white color scheme as the default (light) theme.
6. THE Dashboard SHALL use professional, readable typography throughout.
7. THE Dashboard SHALL be fully responsive and usable on both desktop and mobile screen sizes.
8. WHEN the Dashboard loads or updates any data, THE App SHALL render changes with no noticeable lag (under 100ms for all DOM updates).

---

### Requirement 3: Greeting and Live Clock

**User Story:** As a user, I want to see the current time, date, and a personalized greeting, so that the dashboard feels relevant and welcoming.

#### Acceptance Criteria

1. THE Greeting_Card SHALL display the current time updated every second.
2. THE Greeting_Card SHALL display the current date in a human-readable format.
3. WHEN the current local time is between 05:00 and 11:59, THE Greeting_Card SHALL display the prefix "Good Morning".
4. WHEN the current local time is between 12:00 and 17:59, THE Greeting_Card SHALL display the prefix "Good Afternoon".
5. WHEN the current local time is between 18:00 and 04:59, THE Greeting_Card SHALL display the prefix "Good Evening".
6. THE Greeting_Card SHALL provide an input field for the user to enter a custom name.
7. WHEN the user saves a custom name, THE Greeting_Card SHALL display the greeting as "[prefix], [name]" (e.g., "Good Morning, Timothy").
8. WHEN the user saves a custom name, THE Storage SHALL persist the name so it is restored on subsequent page loads.
9. IF no custom name has been saved, THE Greeting_Card SHALL display the greeting prefix without a name suffix.

---

### Requirement 4: Pomodoro Timer

**User Story:** As a user, I want a configurable countdown timer, so that I can manage focused work sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Pomodoro_Timer SHALL default to a 25-minute session duration on first load.
2. THE Pomodoro_Timer SHALL display the remaining time in MM:SS format.
3. WHEN the user clicks Start, THE Pomodoro_Timer SHALL begin counting down one second at a time.
4. WHEN the user clicks Stop, THE Pomodoro_Timer SHALL pause the countdown at the current remaining time.
5. WHEN the user clicks Reset, THE Pomodoro_Timer SHALL stop the countdown and restore the display to the current Session_Duration.
6. WHEN the countdown reaches 00:00, THE Pomodoro_Timer SHALL stop automatically and notify the user that the session is complete.
7. THE Pomodoro_Timer SHALL provide an input field for the user to set a custom Session_Duration in minutes.
8. WHEN the user saves a custom Session_Duration, THE Pomodoro_Timer SHALL update the display to reflect the new duration and reset the countdown.
9. WHEN the user saves a custom Session_Duration, THE Storage SHALL persist the value so it is restored on subsequent page loads.
10. IF the user enters a Session_Duration that is not a positive integer, THEN THE Pomodoro_Timer SHALL display a validation error and SHALL NOT update the timer.

---

### Requirement 5: Smart To-Do List

**User Story:** As a user, I want to manage a list of tasks with full CRUD operations, so that I can track my daily work.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and an "Add" button to create new tasks.
2. WHEN the user submits a new task, THE Todo_List SHALL add the task to the list and persist it in Storage.
3. IF the user submits a task whose text (case-insensitive, trimmed) matches an existing task, THEN THE Todo_List SHALL display a duplicate warning and SHALL NOT add the task.
4. IF the user submits an empty or whitespace-only task, THEN THE Todo_List SHALL display a validation error and SHALL NOT add the task.
5. THE Todo_List SHALL allow the user to mark any task as done, visually distinguishing completed tasks from pending ones.
6. WHEN the user marks a task as done or undone, THE Todo_List SHALL persist the updated state in Storage.
7. THE Todo_List SHALL allow the user to edit the text of any existing task inline.
8. WHEN the user saves an edited task, THE Todo_List SHALL persist the updated text in Storage.
9. THE Todo_List SHALL allow the user to delete any task.
10. WHEN the user deletes a task, THE Todo_List SHALL remove it from the list and from Storage.
11. THE Todo_List SHALL provide a sort control allowing the user to sort tasks by: pending-first (default), completed-first, or alphabetical order.
12. WHEN the user changes the sort order, THE Todo_List SHALL re-render the task list in the selected order without altering the stored data.

---

### Requirement 6: Quick Links

**User Story:** As a user, I want to save and access website shortcuts, so that I can quickly navigate to frequently used sites.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a form with a "Link Name" field and a "URL" field to add new links.
2. IF the user submits the form with an empty Link Name or empty URL, THEN THE Quick_Links SHALL display a validation error and SHALL NOT save the link.
3. IF the user submits a URL that does not begin with `http://` or `https://`, THEN THE Quick_Links SHALL prepend `https://` to the URL before saving.
4. WHEN the user saves a valid link, THE Quick_Links SHALL display it as a button and persist it in Storage.
5. WHEN the user clicks a link button, THE App SHALL open the associated URL in a new browser tab.
6. THE Quick_Links SHALL allow the user to delete any saved link.
7. WHEN the user deletes a link, THE Quick_Links SHALL remove the button and update Storage.

---

### Requirement 7: Theme Switcher

**User Story:** As a user, I want to toggle between light and dark mode, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Switcher SHALL provide a toggle button visible on the Dashboard at all times.
2. WHEN the user clicks the Theme_Switcher, THE Dashboard SHALL switch between light mode and dark mode by updating the CSS Variable values.
3. WHEN the theme changes, THE Storage SHALL persist the selected theme.
4. WHEN the Dashboard loads, THE App SHALL restore the previously saved theme from Storage.
5. IF no theme has been saved, THE Dashboard SHALL default to light mode.
