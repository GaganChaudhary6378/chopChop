export const MAX_SEGMENTS = 20;

export function formatTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    : `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function isValidSegment(segment, duration) {
  const [start, end] = segment;
  return Number.isFinite(start) && Number.isFinite(end) && start >= 0 && start < end && end <= duration;
}

export function validateSegments(segments, duration) {
  if (!Array.isArray(segments) || segments.length === 0) return "Add at least one segment.";
  if (segments.length > MAX_SEGMENTS) return `Keep at most ${MAX_SEGMENTS} segments.`;
  if (!segments.every((segment) => isValidSegment(segment, duration))) return "Each segment must start before it ends and stay inside the video.";
  const sorted = [...segments].sort((a, b) => a[0] - b[0]);
  if (sorted.some((segment, index) => index > 0 && segment[0] < sorted[index - 1][1])) return "Segments cannot overlap.";
  return null;
}

export function videoIdFromLocation(locationValue = location) {
  return new URLSearchParams(locationValue.search).get("v") ?? "";
}

function base64UrlEncode(value) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeWatchPath(videoId, segments) {
  return base64UrlEncode(JSON.stringify({ v: 1, videoId, segments }));
}

export function decodeWatchPath(hash) {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get("chophop");
  if (!encoded) return { path: null, error: null };
  try {
    const decoded = JSON.parse(base64UrlDecode(encoded));
    if (decoded.v !== 1 || !/^[A-Za-z0-9_-]{11}$/.test(decoded.videoId) || !Array.isArray(decoded.segments)) throw new Error();
    return { path: decoded, error: null };
  } catch {
    return { path: null, error: "This shared watch path is invalid." };
  }
}

export function parseTimeExpression(value) {
  const text = value.trim().toLowerCase();
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(text)) {
    return text.split(":").map(Number).reduce((total, part) => total * 60 + part, 0);
  }
  let seconds = 0;
  for (const match of text.matchAll(/(\d+)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)/g)) {
    const amount = Number(match[1]);
    const unit = match[2];
    seconds += amount * (/^h/.test(unit) ? 3600 : /^m/.test(unit) ? 60 : 1);
  }
  return seconds || Number.NaN;
}

export function parseWatchPathCommand(command, duration) {
  // shortcut: explicit time syntax only, add transcript or LLM support when users need semantic edits.
  const time = "(?:(?:\\d{1,2}:){1,2}\\d{2}|(?:\\d+\\s*(?:hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\\s*){1,3})";
  const range = new RegExp(`(${time})\\s*(?:to|until|through|[-–])\\s*(${time})`, "gi");
  const segments = [];
  for (const match of command.matchAll(range)) segments.push([parseTimeExpression(match[1]), parseTimeExpression(match[2])]);
  if (!segments.length) return { segments: null, error: "Use clear ranges, for example: keep 0:30 to 2:10, then 7:45 to 9:00." };
  return { segments, error: validateSegments(segments, duration) };
}
