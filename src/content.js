function formatTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

class YouTubePlayerAdapter {
  video = null;

  async connect(timeoutMs = 10_000) {
    const current = this.findVideo();
    if (current) return current;
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const video = this.findVideo();
        if (!video) return;
        cleanup();
        resolve(video);
      });
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("YouTube video player was not found."));
      }, timeoutMs);
      const cleanup = () => {
        observer.disconnect();
        window.clearTimeout(timeout);
      };
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  get currentTime() { return this.video?.currentTime ?? 0; }
  get duration() { return this.video?.duration ?? 0; }

  seek(seconds) {
    if (!this.video || !Number.isFinite(seconds)) return;
    this.video.currentTime = Math.max(0, Math.min(seconds, this.duration || seconds));
  }

  findVideo() {
    this.video = document.querySelector("video.html5-main-video") ?? document.querySelector("video");
    return this.video;
  }
}

function mountOverlay(player) {
  if (document.getElementById("yt-clip-share-root")) return;
  const host = document.createElement("div");
  host.id = "yt-clip-share-root";
  host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .panel { background:#111827; border:1px solid #374151; border-radius:10px; box-shadow:0 8px 24px #0008; color:#fff; font:13px/1.4 Arial,sans-serif; padding:12px; width:208px; }
      .title { font-weight:700; margin-bottom:6px; } .time { color:#d1d5db; margin-bottom:10px; }
      button { background:#ef4444; border:0; border-radius:6px; color:#fff; cursor:pointer; font:inherit; padding:7px 9px; }
      button + button { background:#374151; margin-left:6px; } button:hover { filter:brightness(1.1); }
    </style>
    <section class="panel" aria-label="YouTube Clip Share">
      <div class="title">Clip Share</div><div class="time" aria-live="polite">Loading player…</div>
      <button type="button" data-action="mark">Mark time</button><button type="button" data-action="back">Back 10s</button>
    </section>`;
  const time = shadow.querySelector(".time");
  shadow.querySelector("[data-action=mark]")?.addEventListener("click", () => {
    const value = formatTime(player.currentTime);
    navigator.clipboard.writeText(value).catch(() => undefined);
    if (time) time.textContent = `Marked ${value} and copied it.`;
  });
  shadow.querySelector("[data-action=back]")?.addEventListener("click", () => player.seek(player.currentTime - 10));
  window.setInterval(() => {
    if (!time) return;
    time.textContent = player.duration > 0
      ? `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
      : "Waiting for video metadata…";
  }, 250);
  document.body.append(host);
}

if (location.pathname === "/watch") {
  const player = new YouTubePlayerAdapter();
  player.connect().then(() => mountOverlay(player)).catch((error) => console.warn("YouTube Clip Share:", error));
}
