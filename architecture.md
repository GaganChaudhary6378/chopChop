# Architecture

## Design principle

Use a client-only extension first. The core value is deterministic player control and portable segment settings. Neither needs a backend.

## Components

```text
YouTube watch page
  └─ Content script
       ├─ Player adapter: reads/seeks HTML5 YouTube player
       ├─ Playback controller: enforces selected segments
       ├─ Overlay UI: timeline, segment list, share button
       ├─ Segment store: current video state and validation
       └─ Command parser: turns time instructions into a proposed edit

Extension service worker
  └─ Chrome storage gateway: local drafts and preferences

Shared URL fragment
  └─ Versioned payload: video ID + ordered [start, end] segments
```

## Playback state

```text
idle
  -> editing: user marks start/end points
  -> ready: valid ordered segments exist
  -> playing-segments: player is inside a selected range
  -> transition: end reached, seek next segment
  -> complete: final segment ends, pause player
```

The controller checks `timeupdate`, `seeking`, and `ended` events. When current time passes a segment end, it seeks to the next segment start. Manual seeking stays allowed; if the user seeks into a gap, playback resumes only when they press play or choose a segment.

## Share payload

```text
https://www.youtube.com/watch?v=VIDEO_ID#clip=v1.PAYLOAD
```

Decoded payload shape:

```json
{
  "v": 1,
  "videoId": "VIDEO_ID",
  "segments": [[30, 130], [465, 540]]
}
```

Rules:

- Validate video ID against current page before applying.
- Sort only after explicit user approval. Preserve entered order in drafts.
- Reject missing, non-numeric, overlapping, reversed, or over-limit segments.
- Never place free text or user identity in the link.

## Agentic command flow

```text
User command
  -> time-expression parser
  -> proposed segments
  -> validation
  -> preview in UI
  -> user clicks Apply
  -> segment store + playback controller
```

Phase 1 parser supports clear ranges only: `0:30 to 2:10`, `keep 7m 45s–9m`. It returns an error for ambiguous requests such as “remove boring parts.” A later optional LLM can create proposals from free text, but it must use the same validation and approval step.

## Security and privacy

- Manifest permissions: only `storage`, `activeTab`, and `https://www.youtube.com/*` host access.
- No video downloads, credentials, cookies, transcript collection, or background network calls in MVP.
- Treat URL payload as untrusted input.
- Avoid `innerHTML` for command and share payload rendering.

## Test strategy

- Unit tests: payload codec, segment validation, command parser, transition decisions.
- Browser tests: create segments, share/open link, gap skipping, final pause, malformed payload, manual seek.
- Manual checks: normal video, ads, captions, fullscreen, slow page load, refreshed page, changed video URL.
