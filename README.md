# ChopHop

Tell an agent what matters in a YouTube video. ChopHop creates a reviewable watch path and one shareable link.

Example: a 20-minute tutorial can share `00:30–02:10`, `07:45–09:00`, and `15:20–16:05`. The recipient never needs “skip to…” instructions.

This is playback editing only. It does not download, alter, or re-upload YouTube video files.

See [product-scope.md](product-scope.md), [architecture.md](architecture.md), and [to-do.md](to-do.md).

## MVP stack

- Manifest V3 Chrome extension
- Browser-native JavaScript
- Content script for YouTube player controls
- Browser storage for saved local drafts
- URL fragment payload for anonymous shared clips

No backend is required for MVP.

## Local setup

```bash
npm run build
```

In Chrome, open `chrome://extensions`, turn on Developer mode, select **Load unpacked**, then choose `dist/`.

For development, run `npm run dev`, then press Reload on the extension card after changes.

## Commands

```bash
npm run build      # build dist/
npm test           # test time and segment validation helpers
npm run dev        # rebuild on source changes
```

## Development status

Phase 1 implementation is ready for live Chrome testing.
