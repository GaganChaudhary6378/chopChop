import { decodeWatchPath, encodeWatchPath, formatTime, parseWatchPathCommand, validateSegments, videoIdFromLocation } from "./lib/core.js";
import { SegmentPlaybackController, YouTubePlayerAdapter } from "./lib/player.js";

const storageKey = (videoId) => `chophop:${videoId}`;
const saveDraft = (videoId, segments) => chrome.storage.local.set({ [storageKey(videoId)]: segments });
async function loadDraft(videoId) {
  const stored = await chrome.storage.local.get(storageKey(videoId));
  return stored[storageKey(videoId)] ?? [];
}

function mountOverlay(player, videoId, savedSegments, initialMessage = "") {
  if (document.getElementById("chophop-root")) return;
  let segments = savedSegments;
  let start = null;
  let proposal = null;
  const host = document.createElement("div");
  host.id = "chophop-root";
  host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .panel { background:#121826; border:1px solid #3b4559; border-radius:12px; box-shadow:0 10px 30px #0009; color:#fff; font:13px/1.4 Arial,sans-serif; padding:14px; width:272px; }
      h1 { font-size:15px; margin:0 0 4px; } .sub,.status { color:#b8c0d1; margin:0 0 10px; } .status { min-height:18px; }
      button { background:#ef476f; border:0; border-radius:7px; color:#fff; cursor:pointer; font:inherit; margin:0 5px 7px 0; padding:7px 9px; } button.secondary { background:#34405a; } button:focus-visible { outline:2px solid #ffd166; outline-offset:2px; }
      ol { margin:2px 0 10px; max-height:118px; overflow:auto; padding-left:22px; } li { margin:3px 0; } .remove { background:transparent; color:#ff9aad; margin:0; padding:0 0 0 5px; } .move { background:transparent; color:#b8c0d1; margin:0; padding:0 0 0 5px; } textarea { background:#202a3c; border:1px solid #52607a; border-radius:7px; box-sizing:border-box; color:#fff; font:inherit; margin:0 0 7px; min-height:56px; padding:7px; resize:vertical; width:100%; } textarea:focus-visible { outline:2px solid #ffd166; outline-offset:2px; } .proposal { color:#ffd166; margin:0 0 7px; }
    </style>
    <section class="panel" aria-label="ChopHop video watch path">
      <h1>ChopHop</h1><p class="sub">Build a watch path.</p><p class="status" aria-live="polite">Loading video…</p>
      <div><button data-action="start">Start segment</button><button class="secondary" data-action="end">End segment</button></div>
      <textarea data-command aria-label="Ask ChopHop to build a watch path" placeholder="Ask ChopHop: keep 0:30 to 2:10, then 7:45 to 9:00"></textarea><button data-action="ask">Ask ChopHop</button><p class="proposal" data-proposal></p><div data-proposal-actions hidden><button data-action="apply">Apply proposal</button><button class="secondary" data-action="cancel">Discard</button></div>
      <ol data-segments></ol><div><button data-action="play">Play path</button><button class="secondary" data-action="stop">Stop</button><button class="secondary" data-action="share">Copy link</button></div>
    </section>`;
  const status = shadow.querySelector(".status");
  const list = shadow.querySelector("[data-segments]");
  const command = shadow.querySelector("[data-command]");
  const proposalText = shadow.querySelector("[data-proposal]");
  const proposalActions = shadow.querySelector("[data-proposal-actions]");
  const controller = new SegmentPlaybackController(player, ({ active, index }) => { if (active) status.textContent = `Playing segment ${index + 1} of ${segments.length}.`; });
  const render = (message = "") => {
    const error = segments.length ? validateSegments(segments, player.duration) : null;
    list.replaceChildren(...segments.map(([from, to], index) => {
      const item = document.createElement("li"); item.textContent = `${formatTime(from)}–${formatTime(to)} `;
      const move = (direction, label) => { const button = document.createElement("button"); button.className = "move"; button.textContent = label; button.setAttribute("aria-label", `Move segment ${index + 1} ${direction}`); button.disabled = direction === "up" ? index === 0 : index === segments.length - 1; button.addEventListener("click", () => { const target = direction === "up" ? index - 1 : index + 1; [segments[index], segments[target]] = [segments[target], segments[index]]; saveDraft(videoId, segments); render("Segment order updated."); }); return button; };
      const remove = document.createElement("button"); remove.className = "remove"; remove.textContent = "Remove"; remove.setAttribute("aria-label", `Remove segment ${index + 1}`);
      remove.addEventListener("click", () => { segments = segments.filter((_, itemIndex) => itemIndex !== index); saveDraft(videoId, segments); render("Segment removed."); });
      item.append(move("up", "Up"), move("down", "Down"), remove); return item;
    }));
    status.textContent = error ?? (message || `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`);
    proposalText.textContent = proposal ? `Proposed: ${proposal.map(([from, to]) => `${formatTime(from)}–${formatTime(to)}`).join(", ")}` : "";
    proposalActions.hidden = !proposal;
  };
  shadow.querySelector("[data-action=start]").addEventListener("click", () => { start = player.currentTime; render(`Start marked at ${formatTime(start)}.`); });
  shadow.querySelector("[data-action=end]").addEventListener("click", () => {
    if (start === null) return render("Mark a start first.");
    const candidate = [...segments, [start, player.currentTime]]; const error = validateSegments(candidate, player.duration);
    if (error) return render(error); segments = candidate; start = null; saveDraft(videoId, segments); render("Segment added.");
  });
  shadow.querySelector("[data-action=play]").addEventListener("click", () => { const error = validateSegments(segments, player.duration); if (error) return render(error); controller.setSegments(segments); controller.start(); });
  shadow.querySelector("[data-action=stop]").addEventListener("click", () => controller.stop());
  shadow.querySelector("[data-action=ask]").addEventListener("click", () => {
    const result = parseWatchPathCommand(command.value, player.duration);
    if (result.error) return render(result.error);
    proposal = result.segments;
    render("Review the proposed watch path before applying it.");
  });
  shadow.querySelector("[data-action=apply]").addEventListener("click", () => {
    if (!proposal) return;
    segments = proposal; proposal = null; saveDraft(videoId, segments); render("Agent proposal applied.");
  });
  shadow.querySelector("[data-action=cancel]").addEventListener("click", () => { proposal = null; render("Proposal discarded."); });
  shadow.querySelector("[data-action=share]").addEventListener("click", () => {
    const error = validateSegments(segments, player.duration);
    if (error) return render(error);
    const link = new URL(location.href); link.hash = new URLSearchParams({ chophop: encodeWatchPath(videoId, segments) }).toString();
    navigator.clipboard.writeText(link.href).then(() => render("Watch path link copied.")).catch(() => render("Could not copy link."));
  });
  window.setInterval(() => { if (!controller.active) render(); }, 500);
  document.body.append(host); render(initialMessage);
}

if (location.pathname === "/watch") {
  const player = new YouTubePlayerAdapter(); const videoId = videoIdFromLocation();
  player.connect().then(async () => {
    const shared = decodeWatchPath(location.hash);
    if (shared.error) return mountOverlay(player, videoId, await loadDraft(videoId), shared.error);
    if (shared.path && shared.path.videoId !== videoId) return mountOverlay(player, videoId, await loadDraft(videoId), "This watch path is for another video.");
    if (shared.path) {
      const error = validateSegments(shared.path.segments, player.duration);
      return mountOverlay(player, videoId, shared.path.segments, error ?? "Shared watch path loaded.");
    }
    return mountOverlay(player, videoId, await loadDraft(videoId));
  }).catch((error) => console.warn("ChopHop:", error));
}
