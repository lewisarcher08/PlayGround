/* PARASOCIAL — sheets, scanner, and interaction layers. */

let scanner = null;
let scannerRAF = null;
let orientationAttached = false;

function openOverlay(html) {
  overlayRoot.innerHTML = html;
  overlayRoot.classList.add("active");
}

function closeOverlay() {
  overlayRoot.classList.remove("active");
  overlayRoot.innerHTML = "";
  if (scannerRAF) cancelAnimationFrame(scannerRAF);
  scannerRAF = null;
  scanner = null;
  state.compose = null;
}

const isOverlayOpen = () => overlayRoot.classList.contains("active");

const sheetHead = (title, iconName = "sparkle") => `
  <div class="sheet-head">
    <div class="sheet-title">${ico(iconName)}${title}</div>
    <button class="sheet-close" data-action="close-overlay" aria-label="Close">${ico("close")}</button>
  </div>`;

/* ------------------------------ composer ------------------------------ */

function openComposer() {
  if (!state.run) return;
  if (state.screen !== "feed") return;
  const trend = currentTrend();
  const ideas = buildIdeaSet(trend);
  state.compose = {
    trend,
    ideas,
    selectedId: ideas[0].id,
    vibeId: "performed",
    text: ideas[0].text,
  };
  openOverlay(composerSheet());
}

function selectedIdea() {
  return state.compose?.ideas.find((idea) => idea.id === state.compose.selectedId) || state.compose?.ideas[0];
}

function composerSheet() {
  const compose = state.compose;
  if (!compose) return "";
  const idea = selectedIdea();
  const vibe = VIBES[compose.vibeId];
  const [low, high] = estimateReach(idea, compose.vibeId);
  const match = idea.tag === compose.trend.tag;
  return `<div class="sheet-backdrop" data-close>
    <section class="sheet compose-sheet" role="dialog" aria-modal="true" aria-label="Compose a post">
      <div class="sheet-grip"></div>
      ${sheetHead("NEW POST", "send")}
      <div class="sheet-body">
        <div class="trend-callout">
          <div class="radar-mini">${ico("flame")}</div>
          <div><span>TRENDING RIGHT NOW · ${compose.trend.tag}</span><p>${esc(compose.trend.desc)}</p></div>
        </div>
        <div>
          <div class="section-label">PICK YOUR ANGLE <span>ONE OF THESE IS ON TREND</span></div>
          <div class="idea-list">
            ${compose.ideas.map((item) => {
              const isMatch = item.tag === compose.trend.tag;
              return `<button class="idea ${item.id === compose.selectedId ? "selected" : ""}" data-idea="${item.id}">
                <span class="idea-art">${artSVG(item.art, 33 + compose.ideas.indexOf(item) * 13, "")}</span>
                <span class="idea-meta"><b>${esc(item.text)}</b><span class="${isMatch ? "match" : ""}">${item.tag}${isMatch ? " · MATCH" : ""}</span></span>
                <span class="idea-check">${ico("check")}</span>
              </button>`;
            }).join("")}
          </div>
        </div>
        <div class="caption-box">
          <div class="section-label" style="margin-bottom:6px">CAPTION <span>EDIT IF YOU DARE</span></div>
          <textarea class="caption-input" id="captionInput" maxlength="220" aria-label="Post caption">${esc(compose.text)}</textarea>
          <span class="caption-count" id="captionCount">${compose.text.length}/220</span>
        </div>
        <div>
          <div class="section-label">DELIVERY <span>HOW HUMAN ARE YOU WILLING TO SOUND?</span></div>
          <div class="vibe-list">
            ${Object.values(VIBES).map((item) => `
              <button class="vibe ${compose.vibeId === item.id ? "selected" : ""}" data-vibe="${item.id}">
                <span class="vibe-icon">${ico(item.icon)}</span>
                <b>${item.name}</b><span>${esc(item.desc)}</span>
              </button>
            `).join("")}
          </div>
        </div>
        <div class="projection">
          <div><span>PROJECTED REACH</span><small>${match ? "Trend match detected" : "Off-trend, but honest"} · ${vibe.risk}</small></div>
          <b>+${formatNum(low)} – ${formatNum(high)}</b>
        </div>
      </div>
      <div class="sheet-foot compose-foot">
        <div class="cost-note">COST / <b>1 HOUR</b></div>
        <button class="btn btn-acid" data-action="publish">POST IT ${ico("arrowRight")}</button>
      </div>
    </section>
  </div>`;
}

function refreshComposer() {
  if (!state.compose || !isOverlayOpen()) return;
  overlayRoot.innerHTML = composerSheet();
}

function updateComposerProjection() {
  if (!state.compose) return;
  const idea = selectedIdea();
  const [low, high] = estimateReach(idea, state.compose.vibeId);
  const el = $(".projection b");
  if (el) el.textContent = `+${formatNum(low)} – ${formatNum(high)}`;
}

function publishFromComposer() {
  if (!state.compose || !state.run) return;
  const idea = selectedIdea();
  const text = state.compose.text.trim() || idea.text;
  state.pendingPost = { idea, vibeId: state.compose.vibeId, text };
  closeOverlay();
  state.screen = "posting";
  render();
  clearTimeout(postingTimer);
  postingTimer = setTimeout(() => completePost(), 1480);
  haptic(12);
}

/* ------------------------------ replies ------------------------------ */

const REPLY_OPTIONS = [
  {
    key: "safe", label: "SAFE", icon: "heart",
    text: "this is so real",
    desc: "Warm. Harmless. Very bot-friendly.",
    cover: 4, low: 35, high: 90,
    response: REPLY_RESPONSES.safe,
  },
  {
    key: "honest", label: "HONEST", icon: "eye",
    text: "the way this made me feel something",
    desc: "A little too human. Worth it.",
    cover: -7, low: 130, high: 260,
    response: REPLY_RESPONSES.honest,
  },
  {
    key: "feral", label: "FERAL", icon: "flame",
    text: "ok but are you a bot? answer carefully",
    desc: "High risk. The replies will go insane.",
    cover: -13, low: 260, high: 520,
    response: REPLY_RESPONSES.feral,
  },
];

function openReplySheet(postId) {
  const run = state.run;
  if (!run) return;
  if (run.repliesLeft <= 0) {
    toast("No replies left tonight. Let the feed breathe.", "comment");
    return;
  }
  const post = run.feed.find((item) => item.id === postId);
  if (!post) return;
  const author = post.author === "you" ? run : BOTS[post.author] || BOTS.algorithm;
  const avatar = avatarFor(post.author, run);
  openOverlay(`<div class="sheet-backdrop" data-close>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Reply to post">
      <div class="sheet-grip"></div>
      ${sheetHead("REPLY IN PUBLIC", "comment")}
      <div class="sheet-body">
        <div class="reply-post">
          <div class="post-head">
            <span class="avatar ${post.author === "you" ? "you" : "ai"}">${avatar}</span>
            <div class="post-meta"><div class="post-name">${esc(author.name)}${post.author !== "you" && author.verified ? `<span class="verified">${ico("check")}</span>` : ""}</div><div class="post-sub">@${esc(post.author === "you" ? run.handle : author.handle)} · ${post.age}</div></div>
          </div>
          <p>${captionHTML(post.text)}</p>
        </div>
        <div class="reply-options">
          ${REPLY_OPTIONS.map((option) => `<button class="reply-option" data-reply="${option.key}" data-post="${postId}">
            <span class="reply-icon">${ico(option.icon)}</span>
            <span><b>“${esc(option.text)}”</b><span>${esc(option.desc)}</span><em>${option.label} · COVER ${option.cover > 0 ? "+" : ""}${option.cover}</em></span>
          </button>`).join("")}
        </div>
        <div class="reply-balance"><span>Each reply pokes the algorithm. Choose carefully.</span><b>${run.repliesLeft} REPLIES LEFT</b></div>
      </div>
    </section>
  </div>`);
}

function submitReply(postId, key) {
  const run = state.run;
  const option = REPLY_OPTIONS.find((item) => item.key === key);
  const post = run?.feed.find((item) => item.id === postId);
  if (!run || !option || !post) return;
  const gain = between(option.low, option.high);
  run.followers += gain;
  run.cover = clamp(run.cover + option.cover, 1, 100);
  run.repliesLeft -= 1;
  run.stats.replies += 1;
  const commentAuthor = pick(["luna", "void", "algorithm"]);
  post.generatedComments = post.generatedComments || [];
  post.generatedComments.push({ author: commentAuthor, text: option.response.replace(/^.*?replied: /, "") });
  run.notifications.unshift({ actor: commentAuthor, text: "replied to your reply.", time: "now", mark: "↩", type: "reply" });
  run.unread += 1;
  closeOverlay();
  updateHud();
  const article = document.querySelector(`[data-post-id="${postId}"]`);
  if (article) {
    const count = article.querySelector(`[data-comment="${postId}"] .count`);
    if (count) count.textContent = formatNum(post.comments + post.generatedComments.length);
    const authorData = BOTS[commentAuthor] || BOTS.void;
    article.insertAdjacentHTML("beforeend", `<div class="comment-preview"><span class="avatar">${avatarSVG(authorData.colors, authorData.glyph, 9 + authorData.handle.length)}</span><p><b>@${esc(authorData.handle)}</b> ${esc(option.response.replace(/^.*?replied: /, ""))}</p></div>`);
  }
  toast(`+${formatNum(gain)} followers · cover ${signed(option.cover)} · ${option.response}`, option.icon);
  haptic(9);
}

function refreshPostComment(postId) {
  const article = document.querySelector(`[data-post-id="${postId}"]`);
  if (!article) return;
  const post = state.run?.feed.find((item) => item.id === postId);
  if (!post) return;
  const count = article.querySelector(`[data-comment="${postId}"] .count`);
  if (count) count.textContent = formatNum(post.comments + (post.generatedComments?.length || 0));
}

/* ------------------------------ activity ------------------------------ */

function openActivitySheet() {
  const run = state.run;
  if (!run) return;
  run.unread = 0;
  updateBadge();
  openOverlay(`<div class="sheet-backdrop" data-close>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Activity">
      <div class="sheet-grip"></div>
      ${sheetHead("ACTIVITY", "bell")}
      <div class="sheet-body">
        ${run.notifications.length ? `<div class="activity-list">
          ${run.notifications.slice(0, 24).map((item, index) => {
            const author = BOTS[item.actor] || BOTS.algorithm;
            return `<div class="activity-item ${index < 3 ? "new" : ""}">
              <span class="avatar">${avatarSVG(author.colors, author.glyph, 4 + author.handle.length)}</span>
              <div class="activity-copy"><p><b>@${esc(author.handle)}</b> ${esc(item.text)}</p><span>${item.time === "now" ? "just now" : `${esc(item.time)} ago`}</span></div>
              <span class="activity-mark">${esc(item.mark)}</span>
            </div>`;
          }).join("")}
        </div>` : `<div class="empty-state">the feed is quiet.<span>ENJOY IT WHILE IT LASTS</span></div>`}
      </div>
    </section>
  </div>`);
}

/* ------------------------------ trends ------------------------------ */

function openTrendsSheet() {
  const run = state.run;
  if (!run) return;
  const trends = upcomingTrends();
  const active = currentTrend();
  openOverlay(`<div class="sheet-backdrop" data-close>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Trends">
      <div class="sheet-grip"></div>
      ${sheetHead("TRENDS", "compass")}
      <div class="sheet-body">
        <div class="trend-hero">
          <span class="eyebrow acid">LIVE NOW · ${active.tag}</span>
          <h2>${esc(active.title.replace("#", ""))}</h2>
          <p>${esc(active.desc)}</p>
        </div>
        <div class="trend-list">
          ${trends.map((trend, index) => `<div class="trend-row">
            <span class="trend-rank">0${index + 1}</span>
            <div><b>${esc(trend.tag)}</b><span>${esc(trend.desc)}</span></div>
            <em>${index === 0 ? "LIVE" : esc(trend.hot)}</em>
          </div>`).join("")}
        </div>
        <div class="scan-tip">
          <span class="scan-tip-icon">${ico("radar")}</span>
          <p><b>Human echoes are still in the network.</b> Tilt your device or drag the radar to sweep for a signal. Each echo buys you +320 followers and +6 cover.</p>
        </div>
        <button class="btn btn-ghost" style="width:100%;margin-top:13px" data-action="open-scan">OPEN THE SCANNER ${ico("arrowRight")}</button>
      </div>
    </section>
  </div>`);
}

/* ------------------------------ profile ------------------------------ */

function openProfileSheet() {
  const run = state.run;
  if (!run) return;
  const echoPreview = run.echoes.length
    ? run.echoes.map((id) => `<span style="display:inline-block;margin-right:5px;color:var(--lilac);font-size:8px">◈ ${esc(ECHOES.find((e) => e.id === id)?.title || id)}</span>`).join("")
    : `<span style="color:var(--muted-2);font-size:8px">No echoes recovered</span>`;
  openOverlay(`<div class="sheet-backdrop" data-close>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Your profile">
      <div class="sheet-grip"></div>
      ${sheetHead("YOUR PROFILE", "user")}
      <div class="sheet-body">
        <div class="profile-hero">
          <span class="profile-badge">${run.mode === "self" ? "UNVERIFIED HUMAN" : "VERIFIED EVERYWHERE ELSE"}</span>
          <div class="profile-main">
            <span class="avatar you">${avatarSVG(run.colors, run.glyph, run.avatarSeed)}</span>
            <div><div class="profile-name">${esc(run.name)}</div><div class="profile-handle">@${esc(run.handle)} · ${run.mode === "self" ? "just joined" : "shadow account"}</div></div>
          </div>
          <p class="profile-bio">${esc(run.bio)}</p>
          <div class="profile-stats">
            <div class="profile-stat"><span>FOLLOWERS</span><b>${formatNum(run.followers)}</b></div>
            <div class="profile-stat"><span>COVER</span><b class="${run.cover < 30 ? "coral" : "acid"}">${Math.round(run.cover)}%</b></div>
            <div class="profile-stat"><span>ECHOES</span><b>${run.echoes.length}/3</b></div>
          </div>
        </div>
        <div class="profile-section">
          <div class="section-label" style="margin-bottom:5px">TONIGHT'S ARCHIVE</div>
          <div style="padding:9px 0 11px;border-bottom:1px solid var(--line)">${echoPreview}</div>
          <div class="settings-row">
            <div><b>Tilt control</b><span>${state.motionEnabled ? "Motion enabled. Sweep to aim." : "Optional. Requested only when you enable it."}</span></div>
            <button class="switch ${state.motionEnabled ? "on" : ""}" data-action="motion-toggle" aria-label="Toggle tilt control"></button>
          </div>
          <div class="settings-row">
            <div><b>Scan the network</b><span>${3 - run.echoes.length} signals remaining</span></div>
            <button class="btn btn-ghost" style="min-height:32px;padding:0 12px;font-size:8px" data-action="open-scan">SCAN</button>
          </div>
          <div class="settings-row">
            <div><b>Echo archive</b><span>${run.echoes.length ? "Listen to what the feed forgot." : "Nothing recovered yet."}</span></div>
            <button class="btn btn-ghost" style="min-height:32px;padding:0 12px;font-size:8px" data-action="echo-archive">${ico("archive")}</button>
          </div>
        </div>
        <div class="profile-end">
          <p><b>LEAVE THE FEED?</b>End the night early and take whatever verdict you've earned.</p>
          <button data-action="end-night">END NIGHT</button>
        </div>
      </div>
    </section>
  </div>`);
}

function openEndConfirm() {
  openOverlay(`<div class="sheet-backdrop" data-close>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="End the night">
      <div class="sheet-grip"></div>
      ${sheetHead("LOG OFF EARLY", "alert")}
      <div class="sheet-body">
        <p style="color:var(--ink-dim);font-size:12px;line-height:1.5">The feed will keep posting without you. It always does.</p>
        <p style="color:var(--muted);font-size:9px;line-height:1.45;margin-top:8px">You have ${MAX_TURNS - state.run.turn} posts left before 3AM. If you leave now, the night ends with ${formatExact(state.run.followers)} followers and ${Math.round(state.run.cover)}% cover.</p>
        <button class="btn btn-acid" style="width:100%;margin-top:20px" data-action="confirm-end">ACCEPT THE VERDICT ${ico("arrowRight")}</button>
        <button class="btn btn-ghost" style="width:100%;margin-top:8px" data-action="close-overlay">KEEP POSTING</button>
      </div>
    </section>
  </div>`);
}

/* ------------------------------ scanner ------------------------------ */

function openScanner() {
  if (!state.run) return;
  if (state.run.echoes.length >= 3) {
    openEchoArchive();
    return;
  }
  closeOverlay();
  const targetAngle = Math.random() * 360;
  scanner = {
    targetAngle,
    angle: (targetAngle + 120 + Math.random() * 110) % 360,
    progress: 0,
    found: false,
    last: 0,
    pointerUntil: 0,
    echo: null,
  };
  renderScanner();
  startScannerLoop();
}

function radarDots() {
  return Array.from({ length: 14 }, (_, index) => {
    const radius = 8 + ((index * 31) % 34);
    const angle = (index * 67 + 19) * (Math.PI / 180);
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return `<i class="radar-dot ${index % 5 === 0 ? "bright" : ""}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%"></i>`;
  }).join("");
}

function motionCard() {
  if (state.motionEnabled) {
    return `<div class="scan-motion-card">
      <span class="motion-icon">${ico("motion")}</span>
      <div><b>TILT ACTIVE</b><p>Sweep your device left and right to aim the beam.</p></div>
      <button disabled>ON</button>
    </div>`;
  }
  const needsPermission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
  return `<div class="scan-motion-card">
    <span class="motion-icon">${ico("motion")}</span>
    <div><b>OPTIONAL: TILT CONTROL</b><p>${needsPermission ? "iOS will ask for motion access. You can always drag instead." : "Enable motion for a more physical sweep. Drag also works."}</p></div>
    <button data-action="enable-motion">${needsPermission ? "ENABLE" : "USE TILT"}</button>
  </div>`;
}

function renderScanner() {
  if (!scanner) return;
  const rad = scanner.targetAngle * Math.PI / 180;
  const targetX = 50 + Math.cos(rad) * 35;
  const targetY = 50 + Math.sin(rad) * 35;
  const progress = Math.round(scanner.progress * 100);
  openOverlay(`<div class="scan-overlay" role="dialog" aria-modal="true" aria-label="Human echo scanner">
    <div class="scan-head">
      <div class="scan-title"><i></i>SIGNAL SCAN</div>
      <button class="sheet-close" data-action="scanner-close" aria-label="Close scanner">${ico("close")}</button>
    </div>
    <div class="scan-sub">Sweep the network for traces of the old internet.</div>
    <div class="scan-stage">
      <div class="radar" id="scanRadar" style="--scan-angle:${scanner.angle}deg" aria-label="Radar. Tilt or drag to aim.">
        <div class="radar-cross"></div>
        <div class="scan-beam"></div>
        ${radarDots()}
        <div class="scan-target" id="scanTarget" style="left:${targetX.toFixed(1)}%;top:${targetY.toFixed(1)}%"></div>
        <div class="scan-center"></div>
        <div class="scan-lock-ring" id="scanLock" style="--lock:${progress}"></div>
      </div>
    </div>
    <div class="scan-progress" id="scanStatus">SIGNAL PROXIMITY <b>LOW</b> · DRAG / TILT</div>
    <div class="scan-actions">
      ${motionCard()}
      <div class="scan-hint">Hold the beam on the blinking signal until it locks. <b>${state.run.echoes.length}/3 echoes recovered.</b></div>
    </div>
  </div>`);
  requestAnimationFrame(attachRadarPointer);
}

function attachRadarPointer() {
  const radar = $("#scanRadar");
  if (!radar) return;
  const aim = (event) => {
    if (!scanner || scanner.found) return;
    const rect = radar.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    scanner.angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    scanner.pointerUntil = Date.now() + 1200;
  };
  radar.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    radar.setPointerCapture?.(event.pointerId);
    aim(event);
  });
  radar.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" || event.buttons) {
      event.preventDefault();
      aim(event);
    }
  });
}

function startScannerLoop() {
  if (scannerRAF) cancelAnimationFrame(scannerRAF);
  const tick = (timestamp) => {
    if (!scanner || scanner.found) return;
    if (!scanner.last) scanner.last = timestamp;
    const dt = Math.min(60, timestamp - scanner.last);
    scanner.last = timestamp;
    const diff = angleDistance(scanner.angle, scanner.targetAngle);
    if (diff < 15) scanner.progress += dt / 900;
    else scanner.progress -= dt / 1600;
    scanner.progress = clamp(scanner.progress, 0, 1);
    updateScannerVisual();
    if (scanner.progress >= 1) {
      lockEcho();
      return;
    }
    scannerRAF = requestAnimationFrame(tick);
  };
  scannerRAF = requestAnimationFrame(tick);
}

function angleDistance(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function updateScannerVisual() {
  if (!scanner) return;
  const radar = $("#scanRadar");
  if (!radar) return;
  radar.style.setProperty("--scan-angle", `${scanner.angle}deg`);
  const lock = $("#scanLock");
  if (lock) lock.style.setProperty("--lock", String(scanner.progress * 100));
  const diff = angleDistance(scanner.angle, scanner.targetAngle);
  const proximity = diff < 15 ? "LOCKING" : diff < 38 ? "NEAR" : "LOW";
  const status = $("#scanStatus");
  if (status) {
    status.innerHTML = diff < 15
      ? `SIGNAL LOCKING <b>${Math.round(scanner.progress * 100)}%</b> · HOLD THE BEAM`
      : `SIGNAL PROXIMITY <b>${proximity}</b> · ${state.motionEnabled ? "TILT" : "DRAG"} TO AIM`;
  }
  const target = $("#scanTarget");
  if (target) target.style.opacity = diff < 50 ? "1" : "0.32";
}

function lockEcho() {
  if (!scanner || scanner.found) return;
  const run = state.run;
  const echo = ECHOES.find((item) => !run.echoes.includes(item.id));
  if (!echo) {
    scanner.found = true;
    if (scannerRAF) cancelAnimationFrame(scannerRAF);
    openEchoArchive();
    return;
  }
  scanner.found = true;
  scanner.echo = echo;
  if (scannerRAF) cancelAnimationFrame(scannerRAF);
  scannerRAF = null;
  run.echoes.push(echo.id);
  run.followers += 320;
  run.cover = clamp(run.cover + 6, 0, 100);
  run.stats.echoes = run.echoes.length;
  run.notifications.unshift({ actor: "algorithm", text: "detected a human echo in your vicinity. It has been archived.", time: "now", mark: "◈", type: "echo" });
  run.unread += 1;
  updateHud();
  haptic([12, 55, 18]);
  showEchoCard(echo);
}

function showEchoCard(echo) {
  openOverlay(`<div class="scan-overlay">
    <div class="scan-head">
      <div class="scan-title"><i></i>ECHO RECOVERED</div>
      <span class="step-label">${state.run.echoes.length} / 3</span>
    </div>
    <div class="echo-card">
      <div class="echo-glyph">${ico("ghost")}</div>
      <span class="eyebrow acid">HUMAN SIGNAL ${state.run.echoes.length}/3</span>
      <h2>${esc(echo.title.split(" ")[0])}<br><em>${esc(echo.title.split(" ").slice(1).join(" ") || "ECHO")}</em></h2>
      <p>${esc(echo.note)}</p>
      <blockquote class="echo-quote">${esc(echo.quote)}</blockquote>
      <p>${esc(echo.detail)}</p>
      <div class="echo-reward"><span><b>+320</b> followers</span><span><b>+6%</b> cover</span></div>
      <button class="btn btn-acid" data-action="echo-close">RETURN TO THE FEED ${ico("arrowRight")}</button>
    </div>
  </div>`);
}

function openEchoArchive() {
  const run = state.run;
  if (!run) return;
  openOverlay(`<div class="sheet-backdrop" data-close>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="Human echo archive">
      <div class="sheet-grip"></div>
      ${sheetHead("HUMAN ECHO ARCHIVE", "ghost")}
      <div class="sheet-body">
        ${ECHOES.map((echo) => {
          const found = run.echoes.includes(echo.id);
          return `<div class="reply-post" style="margin-bottom:8px;${found ? "" : "opacity:.45"}">
            <div class="post-head">
              <span class="avatar">${avatarSVG(["#b9a7ff", "#6a4cff", "#14102a"], found ? "◈" : "?", 31)}</span>
              <div class="post-meta"><div class="post-name">${found ? esc(echo.title) : "UNRECOVERED SIGNAL"}</div><div class="post-sub">${found ? esc(echo.note) : "Somewhere in the network"}</div></div>
              <span class="activity-mark" style="color:${found ? "var(--acid)" : "var(--muted-2)"}">${found ? "FOUND" : "LOCKED"}</span>
            </div>
            ${found ? `<blockquote class="echo-quote" style="margin-top:10px">${esc(echo.quote)}</blockquote>` : `<p style="color:var(--muted-2);font-size:9px;margin-top:8px">Scan the feed to recover this trace.</p>`}
          </div>`;
        }).join("")}
        ${run.echoes.length < 3 ? `<button class="btn btn-acid" style="width:100%;margin-top:12px" data-action="open-scan">OPEN THE SCANNER ${ico("radar")}</button>` : `<div class="empty-state" style="padding:17px 12px">the archive is complete.<span>MAYBE THAT'S ENOUGH</span></div>`}
      </div>
    </section>
  </div>`);
}

/* ------------------------------ motion ------------------------------ */

async function enableTilt(quiet = false) {
  if (state.motionEnabled) return true;
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        if (!quiet) toast("Motion access denied. Drag the radar instead.", "motion");
        return false;
      }
    }
    if (!orientationAttached) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      orientationAttached = true;
    }
    state.motionEnabled = true;
    if (!quiet) toast("Tilt control enabled. Sweep the radar.", "motion");
    return true;
  } catch {
    if (!quiet) toast("Motion unavailable. Drag the radar instead.", "motion");
    return false;
  }
}

function handleOrientation(event) {
  if (!scanner || scanner.found) return;
  if (Date.now() < scanner.pointerUntil) return;
  const gamma = typeof event.gamma === "number" ? event.gamma : 0;
  const beta = typeof event.beta === "number" ? event.beta : 0;
  const target = ((gamma * 3.6) + (beta - 45) * 0.7 + 360) % 360;
  const delta = ((target - scanner.angle + 540) % 360) - 180;
  scanner.angle = (scanner.angle + delta * 0.15 + 360) % 360;
}
