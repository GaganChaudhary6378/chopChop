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
