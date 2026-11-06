# Common Ground Events

A modern, fully responsive event management website for a college events. Visitors can explore upcoming events, read full details, search and filter the calendar, and register through a validated form. Registrations are saved in the browser and can be managed from a "My seats" list.

Built with **HTML5, CSS3 and vanilla JavaScript**.

| | |
|---|---|
| **Live site** | `https://AbhiRaj-hub.github.io/Common_Ground--Event_Manegement/` |
| **Repository** | `https://github.com/AbhiRaj-hub/Common_Ground--Event_Manegement`|

---

## Features

### Core requirements

| Requirement | Where it lives | How it works |
|---|---|---|
| **Hero section** | Top of the page | Headline, call to action, a photo and a live "Next up" card |
| **Upcoming and featured events** | Featured section and All events grid | 3 featured cards plus all 12 events, each with image, date badge, venue, price, description and spots left |
| **Browse, search, filter** | All events section | Live text search across title, tagline, venue, host and category, combined with category chips that show counts |
| **Event details** | Details dialog | Full description, date and time, venue, host, price, availability, countdown and a timed agenda |
| **Registration form** | Register section | Name, email, phone and event selection, with a live summary of the chosen event |
| **JavaScript validation** | `js/app.js` | Per-field rules, inline error messages, duplicate and sold-out checks (see [rules](#form-validation-rules)) |
| **Confirmation message** | Register section | Success panel with the participant's name, event details and a reference ID |
| **Responsive** | `css/styles.css` | Mobile, tablet and desktop layouts with a collapsing menu |

### Features

| Features | Implementation |
|---|---|
| **Dark / light mode** | Toggle in the header. Defaults to the system setting and remembers the choice |
| **Event countdown timers** | Hero "Next up" card and every event's detail view, updating every second |
| **Animations** | Hero entrance, scroll-reveal on sections, card hover, dialog and confirmation transitions. All switch off under `prefers-reduced-motion` |
| **Local Storage registration data** | Registrations and theme are saved, listed under "My seats", can be cancelled, and reduce each event's spots left |

- Add-to-calendar (`.ics`) download for every registration
- Shareable deep links to an event, for example `index.html#event-hacknova`
- Sold-out state with disabled registration
- Toast notifications and an empty state for search results

---

## Tech stack

- **HTML5**
- **CSS3**
- **JavaScript (ES2020, no modules)**
- **Git and GitHub**

---

Scripts are loaded as classic `<script>` tags in this order: `events.js`, `ui.js`, `app.js`. `events.js` defines globals (`EVENTS`, `CATEGORIES`, `eventArt`) that `app.js` reads. No bundler is needed and the site also works when `index.html` is opened directly from disk.

### CSS organisation

`styles.css` is divided into numbered sections so it is easy to navigate:

1. Tokens (colours, fonts, radii) and the dark theme overrides
2. Base styles
3. Layout and buttons
4. Header
5. Hero
6. Sections (scroll reveal, quote band, how-it-works cards)
7. Event cards
8. Search toolbar and chips
9. Registration form, confirmation and summary card, then My seats and toast
10. Details dialog
11. Footer
12. Responsive breakpoints
13. Reduced motion

---

## How it works

The app follows a simple **data, then state, then render** loop with a single set of event handlers.

```
 events.js (EVENTS)         app.js state                     DOM
 ───────────────────   ─────────────────────────   ─────────────────────────
 12 event objects  ──▶  filters {query, category}  ──▶  renderHero()
                        registrations[]  (saved)        renderFeatured()
                                                        renderChips() / renderGrid()
                                                        renderSelect() / renderSummary()
                                                        renderMine()
```

1. **Data.** Each event is a plain object with `id`, `title`, `category`, `start`, `durationMin`, `venue`, `price`, `capacity`, `registered`, `featured`, `host`, `tagline`, `description` and `agenda`.
2. **State.** Two pieces of state drive the interface: the `filters` object (search text and category) and the `registrations` array, which is mirrored to Local Storage.
3. **Derived values.** Helper functions compute what the UI needs. `upcoming()` returns future events sorted by date, and `spotsLeft(event)` is `capacity - registered - local registrations`.
4. **Render.** `render*()` functions rebuild their part of the page from state, using template strings. Anything that changes state calls the relevant render functions, so the screen never goes out of sync.
5. **Events.** One delegated `click` listener on `document` handles every button through `data-*` attributes (`data-open`, `data-register`, `data-cat`, `data-cancel`, `data-ics`, and so on). Cards that are re-rendered never need new listeners.

---

## Implementation details

### Search and category filter

`matches(event)` checks the category chip first, then does a case-insensitive substring search over title, tagline, venue, host and category label. Typing in the search box updates `filters.query` and calls `renderGrid()`. The result count sits in an `aria-live="polite"` region, and an empty state offers a "Clear filters" button.

### Countdown timers

`countdownHTML(timestamp)` outputs four boxes (days, hours, minutes, seconds) with a `data-countdown` attribute. A single `setInterval` calls `tickCountdowns()` every second and updates every timer on the page, whether in the hero or in an open dialog, by comparing the stored timestamp to `Date.now()`.

### Event dates

`events.js` generates every date relative to today with `at(daysFromNow, hour)`, so the demo never shows past events. Replace these with fixed `new Date("2027-01-15T09:00")` values for a real fest.

### Generated artwork

Each event gets a unique illustration without any image files. `eventArt(event)` seeds a small random number generator from the event id and draws circles, rounded rectangles and arcs into an SVG, coloured from the event's category palette, then returns it as a data URI. Add `image: "images/poster.jpg"` to an event to use a real photo instead.

### Details dialog

The dialog uses the native `<dialog>` element with `showModal()`, which gives focus trapping, Escape-to-close and a backdrop for free. Clicking the backdrop also closes it. Opening an event updates the URL hash so the event can be shared, and loading `#event-<id>` opens that event directly.

### Registration and storage

On a successful submit a registration object `{ id, eventId, name, email, phone, at }` is pushed into `registrations` and written to Local Storage under the key `cg.registrations`. Reads and writes are wrapped in `try/catch`, so the site still works (in memory) if storage is blocked. The reference ID is `CG-` followed by six random characters. Cancelling removes the entry, which frees the seat again.

### Theme

An inline script in `<head>` sets `data-theme` on `<html>` before first paint, using the saved choice (`cg.theme`) or the system preference, so there is no flash of the wrong theme. All colours are CSS variables defined in `:root` and overridden under `[data-theme="dark"]`, so switching themes changes one attribute and the whole page follows.

### Animations

- **Hero entrance:** staggered fade-up using CSS keyframes
- **Scroll reveal:** `ui.js` watches elements with the `.reveal` class using `IntersectionObserver` and adds an `.in` class once, then stops observing
- **Micro-interactions:** card lift and image zoom on hover, dialog slide-in, confirmation pop, button press
- **Reduced motion:** a `prefers-reduced-motion` rule shortens all transitions and shows reveal elements immediately

### Safety

All user-entered text (names and emails shown in "My seats" and the confirmation) is escaped with `esc()` before being inserted into HTML. Event data is authored by the developer, not the user.

---

## Form validation rules

Fields are checked when you leave them. After a field shows an error it re-checks as you type, so the message clears as soon as it is fixed. On submit, every field is checked and focus moves to the first invalid one.

| Field | Rule | Example error |
|---|---|---|
| Name | 2 to 60 characters. Letters, spaces, hyphens, apostrophes and full stops only | "Use letters only. Spaces, hyphens and apostrophes are fine." |
| Email | Must match `name@domain.tld` | "Enter a valid email, like name@example.com." |
| Phone | 10 to 14 digits with an optional leading `+`. Spaces, dashes and brackets are ignored | "Enter 10 to 14 digits, for example +91 98765 43210." |
| Event | Required. Sold-out events can't be selected | "This event is sold out. Pick another one." |
| Duplicate | The same email can't register twice for the same event | "This email is already registered for this event." |

Error text is linked to its input with `aria-describedby`, and invalid inputs carry `aria-invalid="true"`.

---

## Responsive design

The layout adapts at four main breakpoints.

| Width | Changes |
|---|---|
| **above 1100 px** | Full desktop layout: numbered navigation, two-column hero and registration, asymmetric featured grid |
| **1100 px and below** | Navigation numbers are hidden to save space |
| **960 px and below** | Hero, registration and summary stack into one column. The "Next up" card overlaps the hero photo |
| **900 px and below** | Navigation collapses into a menu button. The header call-to-action is hidden |
| **520 px and below** | Tighter spacing, stacked card actions and full-width buttons |

Card grids use `repeat(auto-fill, minmax(290px, 1fr))`, so they reflow smoothly between breakpoints without extra rules.

---

## Accessibility

- Skip link to the events list
- Semantic landmarks, one `h1`, and a logical heading order
- Visible keyboard focus on every interactive element
- Native `<dialog>` for focus handling, plus labelled close buttons
- Form labels, error text tied to inputs, and a live region for results and errors
- Colours chosen for readable contrast in both themes, with a darker oak accent used for small text
- Decorative images use empty `alt` text, and the hero photo has a descriptive one
- Respects `prefers-reduced-motion` and `prefers-color-scheme`

---

## Development log

The project was built over four days, with a working site at the end of each one.

| Day | Date | Focus | Delivered |
|---|---|---|---|
| 1 | 4 Nov | Foundation | Repo and structure, HTML skeleton, design tokens, header, hero, dark/light mode, mobile menu |
| 2 | 5 Nov | Events and browsing | Event data, generated artwork, featured and all-events cards, search, category filters, hero countdown |
| 4 | 6 Nov | Polish and launch | My seats, add-to-calendar, toasts, scroll animations, quote band and how-it-works, responsive and accessibility pass, README, deployment |
