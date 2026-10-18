# Delivery plan

## Phase 0 — Scope and technical spike

- [x] Define playback-segment MVP and exclusions.
- [x] Define client-only architecture and share payload.
- [x] Create a player adapter spike against the standard YouTube HTML5 video element.
- [ ] Confirm player integration works on current Chrome and live YouTube UI.
- [ ] Decide extension name and icon direction.

Outcome: one tested browser integration path before UI work.

## Phase 1 — Extension skeleton and player adapter

- [x] Create Manifest V3 and TypeScript project.
- [x] Mount a minimal YouTube overlay only on watch pages.
- [x] Read current time, duration, playback events, and seek safely.
- [x] Add unit tests for player-independent helpers.
- [ ] Test the built extension in Chrome on a live watch page.

Outcome: extension can show current playback time and seek reliably.

## Phase 2 — Segment editor and playback controller

- [ ] Add start/end actions, segment list, edit/delete, and reorder.
- [ ] Validate ranges and cap shareable segments at 20.
- [ ] Skip gaps, play ordered segments, and pause at completion.
- [ ] Save draft settings by video ID in Chrome storage.
- [ ] Add browser tests for create, edit, transition, and manual seek.

Outcome: user can create and replay a clean segment sequence locally.

## Phase 3 — Portable sharing

- [ ] Add versioned URL-fragment encoder and decoder.
- [ ] Copy share link and load settings from a received link.
- [ ] Reject malformed or wrong-video payloads with clear UI messages.
- [ ] Test sender-to-recipient flow in separate browser profiles.

Outcome: same video opens with same selected segments on another browser with extension installed.

## Phase 4 — Guided editing

- [ ] Parse explicit time-range commands into proposed segments.
- [ ] Display proposal and require Apply before any change.
- [ ] Explain parsing failures and supported command examples.
- [ ] Add tests for timestamps, range syntax, invalid input, and confirmation.

Outcome: user can make edits with clear time instructions, without an LLM dependency.

## Phase 5 — Polish and release readiness

- [ ] Make overlay keyboard-accessible and usable in fullscreen.
- [ ] Test ads, captions, reloads, slow loading, and page navigation.
- [ ] Add privacy copy, store listing assets, README setup steps, and screenshots.
- [ ] Package extension and run final Chrome acceptance tests.

Outcome: installable Chrome extension ready for private testers.

## Deferred after MVP

- [ ] Optional LLM command interpreter for ambiguous natural language.
- [ ] Server-backed short links and shared collections.
- [ ] Multi-site support.
- [ ] Transcript-aware highlights.
