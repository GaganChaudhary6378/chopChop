# Delivery plan

## Phase 0 — Scope and technical spike

- [x] Define playback-segment MVP and exclusions.
- [x] Define client-only architecture and share payload.
- [x] Create a player adapter spike against the standard YouTube HTML5 video element.
- [ ] Confirm player integration works on current Chrome and live YouTube UI.
- [x] Decide extension name: ChopHop.

Outcome: one tested browser integration path before UI work.

## Phase 1 — Extension skeleton and player adapter

- [x] Create Manifest V3 and TypeScript project.
- [x] Mount a minimal YouTube overlay only on watch pages.
- [x] Read current time, duration, playback events, and seek safely.
- [x] Add unit tests for player-independent helpers.
- [ ] Test the built extension in Chrome on a live watch page.

Outcome: extension can show current playback time and seek reliably.

## Phase 2 — Segment editor and playback controller

- [x] Add start/end actions, segment list, and delete.
- [x] Validate ranges and cap shareable segments at 20.
- [x] Skip gaps, play ordered segments, and pause at completion.
- [x] Save draft settings by video ID in Chrome storage.
- [x] Add unit tests for range validation.
- [x] Add reorder controls.
- [ ] Add browser tests for a live YouTube page.

Outcome: user can create and replay a clean segment sequence locally.

## Phase 3 — Portable sharing

- [x] Add versioned URL-fragment encoder and decoder.
- [x] Copy share link and load settings from a received link.
- [x] Reject malformed or wrong-video payloads with clear UI messages.
- [x] Add unit tests for share payloads.
- [ ] Test sender-to-recipient flow in separate browser profiles.

Outcome: same video opens with same selected segments on another browser with extension installed.

## Phase 4 — Agent-guided editing

- [x] Parse explicit time-range commands into proposed segments.
- [x] Display proposal and require Apply before any change.
- [x] Explain parsing failures and supported command examples.
- [x] Add tests for timestamps, range syntax, and invalid input.

Outcome: user can make edits with clear time instructions, without an LLM dependency.

## Phase 5 — Polish and release readiness

- [x] Make overlay keyboard-accessible.
- [ ] Verify fullscreen behavior on a live YouTube page.
- [ ] Test ads, captions, reloads, slow loading, and page navigation.
- [x] Add privacy copy, store listing draft, and README setup steps.
- [x] Package a loadable extension in `dist/`.
- [ ] Run final Chrome acceptance tests and capture screenshots.

Outcome: installable Chrome extension ready for private testers.

## Deferred after MVP

- [ ] Optional LLM command interpreter for ambiguous natural language.
- [ ] Server-backed short links and shared collections.
- [ ] Multi-site support.
- [ ] Transcript-aware highlights.
