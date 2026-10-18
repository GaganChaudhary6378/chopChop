export class YouTubePlayerAdapter {
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
      const timeout = window.setTimeout(() => { cleanup(); reject(new Error("YouTube video player was not found.")); }, timeoutMs);
      const cleanup = () => { observer.disconnect(); window.clearTimeout(timeout); };
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  get currentTime() { return this.video?.currentTime ?? 0; }
  get duration() { return this.video?.duration ?? 0; }
  get element() { return this.video; }
  seek(seconds) { if (this.video && Number.isFinite(seconds)) this.video.currentTime = Math.max(0, Math.min(seconds, this.duration || seconds)); }
  play() { return this.video?.play() ?? Promise.resolve(); }
  pause() { this.video?.pause(); }
  findVideo() { this.video = document.querySelector("video.html5-main-video") ?? document.querySelector("video"); return this.video; }
}

export class SegmentPlaybackController {
  constructor(player, onChange) {
    this.player = player; this.onChange = onChange; this.segments = []; this.index = 0; this.active = false;
    player.element?.addEventListener("timeupdate", () => this.tick());
  }
  setSegments(segments) { this.segments = segments.map(([start, end]) => [start, end]); this.index = 0; this.active = false; this.onChange(this.state()); }
  start() { if (!this.segments.length) return; this.index = 0; this.active = true; this.player.seek(this.segments[0][0]); this.player.play(); this.onChange(this.state()); }
  stop() { this.active = false; this.player.pause(); this.onChange(this.state()); }
  tick() {
    if (!this.active) return;
    const segment = this.segments[this.index];
    if (!segment) return this.stop();
    if (this.player.currentTime < segment[1] - 0.12) return;
    this.index += 1;
    if (this.index >= this.segments.length) return this.stop();
    this.player.seek(this.segments[this.index][0]); this.player.play(); this.onChange(this.state());
  }
  state() { return { active: this.active, index: this.index }; }
}
