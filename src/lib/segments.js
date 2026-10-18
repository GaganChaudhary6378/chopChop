export function formatTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function isValidSegment(segment, duration) {
  const [start, end] = segment;
  return Number.isFinite(start) && Number.isFinite(end) && start >= 0 && start < end && end <= duration;
}
