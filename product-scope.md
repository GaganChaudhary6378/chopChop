# Product scope

## Problem

People share long YouTube videos but only mean a few moments. Current sharing forces manual instructions: “start at 0:30, stop at 2:10, then skip to 7:45.” Instructions are slow, error-prone, and easy to misread.

## Product promise

Pick one or more video segments. Share one link. Recipient watches only those segments, in the selected order.

## Primary user

Someone who shares technical tutorials, demos, lectures, reviews, or meeting recordings with a friend or colleague.

## Core user flow

1. User opens a YouTube watch page.
2. User presses “Start segment” at the current playback time.
3. User presses “End segment” later.
4. User adds more segments if needed and reorders or removes them.
5. User presses “Copy share link.”
6. Recipient opens link with extension installed.
7. Extension loads segments and automatically skips gaps.

## MVP

- Add, edit, delete, and reorder playback segments.
- Show current timestamp and video duration.
- Keep segment boundaries valid: `0 <= start < end <= duration`.
- Highlight current segment and skip directly to next segment.
- Share same YouTube video plus segment settings in a copied URL.
- If recipient lacks extension, show normal YouTube URL and a short install message in the shared payload page or extension landing page.
- Save drafts locally in the browser.
- Plain-language agent command box:
  - “Keep 30 seconds to 2 minutes, then 7:45 to 9:00.”
  - Agent converts request into a proposed segment list.
  - User must review and apply it before playback changes.

## Not in MVP

- Downloading, re-encoding, uploading, or modifying video files.
- Server accounts, shared libraries, comments, team workspaces, or analytics.
- Editing Shorts, live streams, playlists, embeds, or non-YouTube sites.
- Automatic transcript analysis or semantic clip finding.
- Agent actions without user review.

## Success checks

- A sender creates a two-segment link in under 30 seconds.
- A recipient opens it and sees the same segment sequence.
- Segment transitions stay within 0.5 seconds of each saved boundary.
- Invalid agent requests never change playback settings silently.

## Product decisions

- Call this “segment sharing,” not trimming. It sets playback ranges and leaves YouTube media untouched.
- Put shared data in the URL fragment (`#...`). Browsers do not send fragments to YouTube servers.
- Encode a compact schema, version it from day one, and reject malformed payloads.
- Start agentic editing with deterministic time parsing. Add an LLM only if people request natural, ambiguous commands.

## Risks

- YouTube can change page/player internals. Keep player access behind one adapter module.
- Long segment lists can exceed practical URL limits. MVP caps sharing at 20 segments and warns before copy.
- A shared fragment is visible to anyone who receives the link. Do not include notes, account data, or private metadata.
