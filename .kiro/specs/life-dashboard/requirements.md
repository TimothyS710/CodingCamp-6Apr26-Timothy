# Requirements Document

## Introduction

A high-quality, luxurious To-Do List Life Dashboard delivered as a single-page web application using HTML, CSS, and Vanilla JavaScript. All data persists client-side via the browser LocalStorage API. The application presents five integrated widgets — Greeting & Time, Pomodoro Timer, Smart To-Do List, Quick Links, and Theme Switcher — within a "Dark Elegance" aesthetic featuring glassmorphism cards, metallic accents, and smooth transitions. A Light Mode toggle provides a high-end editorial print alternative.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Widget**: A self-contained UI panel within the Dashboard (e.g., Greeting Widget, Timer Widget).
- **Greeting_Widget**: The widget that displays the current time, date, time-of-day greeting, and personalized user name.
- **Timer_Widget**: The Pomodoro focus timer widget with configurable duration and session controls.
- **Todo_Widget**: The Smart To-Do List widget for managing tasks.
- **Links_Widget**: The Quick Links widget for storing and accessing bookmarked URLs.
- **Theme_Switcher**: The toggle control that switches the Dashboard between Dark Mode and Light Mode.
- **LocalStorage**: The browser's `localStorage` API used for all client-side data persistence.
- **Dark_Mode**: The default "Dark Elegance" theme using deep background colors and metallic accents.
- **Light_Mode**: The alternative theme with a crisp white/cream background, deep black text, and gold accents.
- **Glassmorphism_Card**: A UI card styled with `backdrop-filter: blur()`, a semi-transparent dark background, and a thin 1px semi-transparent border.
- **Task**: A single to-do item stored in the Todo_Widget.
- **Quick_Link**: A stored bookmark consisting of a display name and a URL.
- **Pomodoro_Session**: A single timed focus interval managed by the Timer_Widget.

---

## Requirements

### Requirement 1: Application Structure and Technology Stack

**User Story:** As a developer, I want the application built with plain HTML, CSS, and Vanilla JavaScript so that it runs in any browser without a build step or framework dependency.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using exactly one HTML file, one CSS file located in a `css/` folder, and one JavaScript file located in a `js/` folder.
2. THE Dashboard SHALL use no JavaScript frameworks, libraries, or runtime dependencies (e.g., no React, Vue, Angular, jQuery).
3. THE Dashboard SHALL require no backend server and SHALL function entirely from the local file system or a static file host.
4. THE Dashboard SHALL use the browser LocalStorage API as the sole persistence mechanism for all user data.

---

### Requirement 2: Dark Elegance Visual Theme (Default)

**User Story:** As a user, I want a premium dark aesthetic by default so that the Dashboard feels luxurious and visually refined.

#### Acceptance Criteria

1. THE Dashboard SHALL apply a deep, rich background color (Midnight Blue, Charcoal, or Obsidian palette) as the default page background in Dark_Mode.
2. THE Dashboard SHALL render all Widget cards as Glassmorphism_Cards with `backdrop-filter: blur()`, a semi-transparent dark background, and a thin 1px semi-transparent white or gold border.
3. THE Dashboard SHALL apply metallic accent colors (Champagne Gold, Rose Gold, or Silver) to interactive elements such as buttons, highlights, and heading text.
4. THE Dashboard SHALL apply soft, glowing `box-shadow` drop-shadows to all Glassmorphism_Cards.
5. THE Dashboard SHALL use a sleek geometric sans-serif typeface for body text and a refined serif or elegant sans-serif typeface for headings.
6. THE Dashboard SHALL apply `transition: all 0.3s ease` to all interactive elements so that hover and focus state changes animate smoothly.

---

### Requirement 3: Layout

**User Story:** As a user, I want a well-structured, responsive layout so that all widgets are clearly organized and usable across screen sizes.

#### Acceptance Criteria

1. THE Dashboard SHALL arrange Widget cards using CSS Grid or Flexbox.
2. THE Dashboard SHALL display all five Widgets on a single page without requiring navigation between pages.

---

### Requirement 4: Greeting & Time Widget

**User Story:** As a user, I want to see the current time, date, and a personalized greeting so that the Dashboard feels welcoming and contextually aware.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current local time, updating every second without a page reload.
2. THE Greeting_Widget SHALL display the current local date in a human-readable format.
3. WHEN the current local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the current local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the current local hour is between 18:00 and 21:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the current local hour is between 22:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. THE Greeting_Widget SHALL provide an input field for the user to enter a custom name.
8. WHEN the user submits a custom name, THE Greeting_Widget SHALL append the name to the time-of-day greeting (e.g., "Good Morning, [name]").
9. WHEN the user submits a custom name, THE Greeting_Widget SHALL save the name to LocalStorage.
10. WHEN the Dashboard loads, THE Greeting_Widget SHALL retrieve the saved name from LocalStorage and display it in the greeting if a name has been previously saved.

---

### Requirement 5: Pomodoro Timer Widget

**User Story:** As a user, I want a configurable focus timer so that I can manage my work sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Timer_Widget SHALL display a countdown timer initialized to 25 minutes (1500 seconds) by default.
2. THE Timer_Widget SHALL provide a Start button that begins the countdown.
3. WHEN the Start button is activated and the timer is running, THE Timer_Widget SHALL provide a Stop button that pauses the countdown.
4. THE Timer_Widget SHALL provide a Reset button that stops the countdown and restores the timer to the configured duration.
5. WHEN the countdown reaches zero, THE Timer_Widget SHALL display a visual notification indicating the Pomodoro_Session has ended.
6. THE Timer_Widget SHALL provide an input field for the user to set a custom focus duration in minutes.
7. WHEN the user saves a custom duration, THE Timer_Widget SHALL save the duration value to LocalStorage.
8. WHEN the Dashboard loads, THE Timer_Widget SHALL retrieve the saved custom duration from LocalStorage and initialize the timer to that duration if one has been previously saved.
9. THE Timer_Widget SHALL display the remaining time in MM:SS format at all times.

---

### Requirement 6: Smart To-Do List Widget

**User Story:** As a user, I want to manage a personal task list so that I can track and organize my daily responsibilities.

#### Acceptance Criteria

1. THE Todo_Widget SHALL provide an input field and a submit control for adding new Tasks.
2. WHEN a new Task is submitted, THE Todo_Widget SHALL add the Task to the list and save the updated list to LocalStorage.
3. WHEN a new Task is submitted and a Task with identical text (case-insensitive) already exists in the list, THE Todo_Widget SHALL reject the duplicate and display an inline error message.
4. THE Todo_Widget SHALL provide an edit control on each Task that allows the user to modify the Task text inline.
5. WHEN a Task edit is saved, THE Todo_Widget SHALL update the Task in LocalStorage.
6. THE Todo_Widget SHALL provide a completion toggle on each Task that marks the Task as done.
7. WHEN a Task is marked as done, THE Todo_Widget SHALL apply a visual distinction (e.g., strikethrough, reduced opacity) to differentiate it from incomplete Tasks.
8. WHEN a Task completion is toggled, THE Todo_Widget SHALL update the Task state in LocalStorage.
9. THE Todo_Widget SHALL provide a delete control on each Task that removes the Task from the list.
10. WHEN a Task is deleted, THE Todo_Widget SHALL remove the Task from LocalStorage.
11. THE Todo_Widget SHALL provide a sort control that reorders Tasks with incomplete Tasks displayed before completed Tasks.
12. WHEN the Dashboard loads, THE Todo_Widget SHALL retrieve all saved Tasks from LocalStorage and render them.

---

### Requirement 7: Quick Links Widget

**User Story:** As a user, I want to save and access frequently visited URLs so that I can navigate to important sites quickly from the Dashboard.

#### Acceptance Criteria

1. THE Links_Widget SHALL provide a form with a name field and a URL field for adding a new Quick_Link.
2. WHEN a Quick_Link is submitted, THE Links_Widget SHALL display the Quick_Link as a button labeled with the provided name.
3. WHEN a Quick_Link button is activated, THE Links_Widget SHALL open the associated URL in a new browser tab.
4. WHEN a Quick_Link is submitted, THE Links_Widget SHALL save the Quick_Link to LocalStorage.
5. THE Links_Widget SHALL provide a delete control on each Quick_Link button that removes the Quick_Link.
6. WHEN a Quick_Link is deleted, THE Links_Widget SHALL remove the Quick_Link from LocalStorage.
7. WHEN the Dashboard loads, THE Links_Widget SHALL retrieve all saved Quick_Links from LocalStorage and render them.

---

### Requirement 8: Theme Switcher

**User Story:** As a user, I want to toggle between Dark and Light modes so that I can choose the visual style that suits my environment.

#### Acceptance Criteria

1. THE Theme_Switcher SHALL provide a toggle button visible at all times on the Dashboard.
2. WHEN the toggle button is activated while the Dashboard is in Dark_Mode, THE Theme_Switcher SHALL switch the Dashboard to Light_Mode.
3. WHEN the toggle button is activated while the Dashboard is in Light_Mode, THE Theme_Switcher SHALL switch the Dashboard to Dark_Mode.
4. WHILE the Dashboard is in Light_Mode, THE Dashboard SHALL apply a crisp white or cream background, deep black body text, and gold accent colors.
5. WHEN the user activates the Theme_Switcher, THE Theme_Switcher SHALL save the selected theme to LocalStorage.
6. WHEN the Dashboard loads, THE Theme_Switcher SHALL retrieve the saved theme from LocalStorage and apply it before the page renders visible content, preventing a flash of the default theme.
