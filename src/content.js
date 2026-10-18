import { formatTime, validateSegments, videoIdFromLocation } from "./lib/core.js";
import { SegmentPlaybackController, YouTubePlayerAdapter } from "./lib/player.js";

const storageKey = (videoId) => `chophop:${videoId}`;
const saveDraft = (videoId, segments) => chrome.storage.local.set({ [storageKey(videoId)]: segments });
async function loadDraft(videoId) {
  const stored = await chrome.storage.local.get(storageKey(videoId));
  return stored[storageKey(videoId)] ?? [];
}

function mountOverlay(player, videoId, savedSegments) {
  if (document.getElementById("chophop-root")) return;
  let segments = savedSegments;
  let start = null;
  const host = document.createElement("div");
  host.id = "chophop-root";
  host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .panel { background:#121826; border:1px solid #3b4559; border-radius:12px; box-shadow:0 10px 30px #0009; color:#fff; font:13px/1.4 Arial,sans-serif; padding:14px; width:272px; }
      h1 { font-size:15px; margin:0 0 4px; } .sub,.status { color:#b8c0d1; margin:0 0 10px; } .status { min-height:18px; }
      button { background:#ef476f; border:0; border-radius:7px; color:#fff; cursor:pointer; font:inherit; margin:0 5px 7px 0; padding:7px 9px; } button.secondary { background:#34405a; } button:focus-visible { outline:2px solid #ffd166; outline-offset:2px; }
      ol { margin:2px 0 10px; max-height:118px; overflow:auto; padding-left:22px; } li { margin:3px 0; } .remove { background:transparent; color:#ff9aad; margin:0; padding:0 0 0 5px; }
    </style>
    <section class="panel" aria-label="ChopHop video watch path">
      <h1>ChopHop</h1><p class="sub">Build a watch path.</p><p class="status" aria-live="polite">Loading video…</p>
      <div><button data-action="start">Start segment</button><button class="secondary" data-action="end">End segment</button></div>
      <ol data-segments></ol><div><button data-action="play">Play path</button><button class="secondary" data-action="stop">Stop</button></div>
    </section>`;
  const status = shadow.querySelector(".status");
  const list = shadow.querySelector("[data-segments]");
  const controller = new SegmentPlaybackController(player, ({ active, index }) => { if (active) status.textContent = `Playing segment ${index + 1} of ${segments.length}.`; });
  const render = (message = "") => {
    const error = segments.length ? validateSegments(segments, player.duration) : null;
    list.replaceChildren(...segments.map(([from, to], index) => {
      const item = document.createElement("li"); item.textContent = `${formatTime(from)}–${formatTime(to)} `;
      const remove = document.createElement("button"); remove.className = "remove"; remove.textContent = "Remove"; remove.setAttribute("aria-label", `Remove segment ${index + 1}`);
      remove.addEventListener("click", () => { segments = segments.filter((_, itemIndex) => itemIndex !== index); saveDraft(videoId, segments); render("Segment removed."); });
      item.append(remove); return item;
    }));
    status.textContent = error ?? (message || `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`);
  };
  shadow.querySelector("[data-action=start]").addEventListener("click", () => { start = player.currentTime; render(`Start marked at ${formatTime(start)}.`); });
  shadow.querySelector("[data-action=end]").addEventListener("click", () => {
    if (start === null) return render("Mark a start first.");
    const candidate = [...segments, [start, player.currentTime]]; const error = validateSegments(candidate, player.duration);
    if (error) return render(error); segments = candidate; start = null; saveDraft(videoId, segments); render("Segment added.");
  });
  shadow.querySelector("[data-action=play]").addEventListener("click", () => { const error = validateSegments(segments, player.duration); if (error) return render(error); controller.setSegments(segments); controller.start(); });
  shadow.querySelector("[data-action=stop]").addEventListener("click", () => controller.stop());
  window.setInterval(() => { if (!controller.active) render(); }, 500);
  document.body.append(host); render();
}

if (location.pathname === "/watch") {
  const player = new YouTubePlayerAdapter(); const videoId = videoIdFromLocation();
  player.connect().then(() => loadDraft(videoId)).then((segments) => mountOverlay(player, videoId, segments)).catch((error) => console.warn("ChopHop:", error));
}
