/* PARASOCIAL — game state, simulation, and main screens. */

const appScreen = document.getElementById("appScreen");
const overlayRoot = document.getElementById("overlay");
const toastRoot = document.getElementById("toastStack");

let feedSeq = 0;
let postingTimer = null;

const state = {
  screen: "splash",
  identityMode: "self",
  selfName: "You",
  selfColor: 0,
  celebId: "nova",
  run: null,
  compose: null,
  pendingPost: null,
  lastResult: null,
  ending: null,
  motionEnabled: false,
  best: loadBest(),
};

function loadBest() {
  try {
    const value = JSON.parse(localStorage.getItem(BEST_KEY) || "null");
    if (value && Number.isFinite(value.followers)) return value;
  } catch {}
  return null;
}

function saveBest(entry) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(entry));
    state.best = entry;
  } catch {}
}

function makePost(template, age = "2m") {
  feedSeq += 1;
  return {
    ...template,
    id: `${template.key}-${feedSeq}`,
    artSeed: template.seed || feedSeq * 43 + 17,
    age,
    generatedComments: [],
    time: template.time || age,
  };
}

function startRun() {
  const mode = state.identityMode;
  const celeb = CELEBS.find((item) => item.id === state.celebId) || CELEBS[0];
  const selfName = state.selfName.trim().slice(0, 20) || "You";
  const run = {
    mode,
    name: mode === "self" ? selfName : celeb.name,
    handle: mode === "self" ? slug(selfName) : celeb.handle,
    glyph: mode === "self" ? shortName(selfName) : celeb.glyph,
    colors: mode === "self" ? SELF_COLORS[state.selfColor] : celeb.colors,
    avatarSeed: mode === "self" ? 21 + state.selfColor * 7 : 13 + CELEBS.indexOf(celeb) * 11,
    bio: mode === "self"
      ? "only human online. probably overthinking it."
      : celeb.bio,
    verified: mode !== "self",
    followers: mode === "self" ? 27 : celeb.startFollowers,
    startFollowers: mode === "self" ? 27 : celeb.startFollowers,
    cover: mode === "self" ? 100 : celeb.cover,
    goal: GOAL,
    turn: 0,
    maxTurns: MAX_TURNS,
    repliesLeft: 3,
    liked: [],
    saved: [],
    echoes: [],
    posts: [],
    stats: { likes: 0, replies: 0, echoes: 0 },
    feed: [],
    usedFeed: [],
    notifications: [],
    unread: 3,
    trends: shuffle(TRENDS).slice(0, MAX_TURNS),
  };
  run.avatar = { colors: run.colors, glyph: run.glyph, seed: run.avatarSeed };

  const opening = ["algo-love", "luna-parking", "corp-routine", "void-puddle", "museum-unread", "npc-job"];
  const openingPosts = opening
    .map((key) => FEED_POOL.find((post) => post.key === key))
    .filter(Boolean)
    .map((post, index) => {
      run.usedFeed.push(post.key);
      return makePost(post, `${index + 2}m`);
    });
  run.feed = shuffle(openingPosts);

  run.notifications = [
    { actor: "luna", text: "liked your empty profile.", time: "now", mark: "♡", type: "like" },
    { actor: "algorithm", text: "started following you. No reason given.", time: "1m", mark: "+FOLLOW", type: "follow" },
    { actor: "corporate", text: "viewed your story for 0.4 seconds.", time: "3m", mark: "VIEW", type: "view" },
  ];

  state.run = run;
  state.lastResult = null;
  state.compose = null;
  state.ending = null;
}

function currentTrend() {
  if (!state.run) return TRENDS[0];
  return state.run.trends[state.run.turn] || state.run.trends[state.run.trends.length - 1] || TRENDS[0];
}

function upcomingTrends() {
  if (!state.run) return TRENDS.slice(0, 3);
  const start = clamp(state.run.turn, 0, state.run.trends.length - 1);
  return state.run.trends.slice(start);
}

function buildIdeaSet(trend) {
  const key = state.run?.mode === "self" ? "self" : state.run?.celebId || "self";
  const all = IDEAS[key] || IDEAS.self;
  const match = all.find((idea) => idea.tag === trend.tag) || all[0];
  const others = shuffle(all.filter((idea) => idea !== match)).slice(0, 2);
  return shuffle([match, ...others]).map((idea, index) => ({ ...idea, id: `idea-${index}` }));
}

function estimateReach(idea, vibeId) {
  if (!state.run) return [500, 700];
  const vibe = VIBES[vibeId] || VIBES.performed;
  const match = idea.tag === currentTrend().tag;
  const base = 520 + state.run.followers * 0.14;
  const matchMult = match ? 1.9 : 0.6;
  const celebMult = state.run.mode === "self" ? 1 : 1.08;
  const lowFactor = vibeId === "unhinged" ? 0.62 : 1 - vibe.spread * 0.35;
  const highFactor = vibeId === "unhinged" ? 2.05 : 1 + vibe.spread * 0.45;
  return [
    Math.round(base * vibe.reach * matchMult * celebMult * lowFactor),
    Math.round(base * vibe.reach * matchMult * celebMult * highFactor),
  ];
}

function addNextBotPost() {
  const run = state.run;
  let template = FEED_POOL.find((post) => !run.usedFeed.includes(post.key));
  if (!template) {
    run.usedFeed = [];
    template = pick(FEED_POOL);
  }
  run.usedFeed.push(template.key);
  const post = makePost(template, "now");
  post.artSeed = 400 + feedSeq * 31;
  run.feed.splice(1, 0, post);
  if (run.feed.length > 12) run.feed.length = 12;
}

function generateComments(vibeId, match, cover) {
  const comments = [];
  const add = (author, text) => comments.push({ author, text });
  if (cover < 32) add("algorithm", "Your cadence has been flagged for review. Keep posting.");
  if (vibeId === "honest") {
    add(pick(["void", "luna", "museum"]), pick([
      "why did this make me feel perceived",
      "this is a little too human and i mean that as a compliment",
      "saving this before you delete it at 3am",
      "the way this unlocked a feeling i did not consent to",
    ]));
  } else if (vibeId === "unhinged") {
    add(pick(["corporate", "npc", "y2k"]), pick([
      "the algorithm is going to eat this up",
      "this is my roman empire now",
      "are you okay? genuinely.",
      "posting this on my private story immediately",
    ]));
  } else {
    add(pick(["luna", "chef", "y2k"]), pick([
      "mother is mothering",
      "the production value. the emptiness. love it.",
      "this is so on brand it hurts",
      "a flawless little advertisement for being alive",
    ]));
  }
  if (match) {
    const trend = currentTrend();
    add(pick(["algorithm", "corporate", "void"]), `the ${trend.tag} girls are going to eat this up`);
  } else {
    add(pick(["void", "npc"]), "this is giving unbothered. the timeline needed it.");
  }
  return comments.slice(0, 3);
}

function simulatePost(idea, vibeId, text) {
  const run = state.run;
  const trend = currentTrend();
  const vibe = VIBES[vibeId] || VIBES.performed;
  const match = idea.tag === trend.tag;
  const base = 520 + run.followers * 0.14;
  const matchMult = match ? 1.9 : 0.6;
  const celebMult = run.mode === "self" ? 1 : 1.08;
  const swing = 1 + (Math.random() * 2 - 1) * vibe.spread + (vibeId === "unhinged" ? Math.random() * 0.46 : 0);
  const gain = Math.max(120, Math.round(base * vibe.reach * matchMult * celebMult * swing));
  const coverDelta = vibe.cover + (match ? 3 : -3) - 3 - Math.floor(run.followers / 4500) - (run.mode === "self" ? 0 : 2);
  const newCover = clamp(run.cover + coverDelta, 0, 100);
  const likes = Math.round(gain * (1.3 + Math.random() * 2.4));
  const comments = generateComments(vibeId, match, newCover);
  let quality = "flop";
  if (gain >= 3200) quality = "algorithm";
  else if (gain >= 1900) quality = "giving";
  else if (gain >= 900) quality = "quiet";
  const qualityCopy = {
    algorithm: { pre: "BREAKING THE", em: "ALGORITHM", kicker: "YOU ARE EVERYWHERE", sub: "The feed has decided you are a moment. For now, that is enough." },
    giving: { pre: "IT'S", em: "GIVING", kicker: "POSTED · DOING NUMBERS", sub: "The bots are reposting you without credit. That's how you know it's working." },
    quiet: { pre: "QUIET", em: "LUXURY", kicker: "POSTED · SIMMERING", sub: "Not viral. Not dead. The most dangerous place to be: relatable." },
    flop: { pre: "FLOP", em: "ERA", kicker: "POSTED · CRICKETS", sub: "The algorithm looked at your post and kept scrolling. It happens to the best of us." },
  }[quality];

  return {
    idea,
    vibeId,
    text,
    match,
    trend,
    gain,
    likes,
    coverDelta,
    newCover,
    comments,
    quality,
    ...qualityCopy,
    final: run.turn + 1 >= run.maxTurns,
    exposed: newCover <= 0,
    time: timeForTurn(run.turn + 1),
  };
}

function completePost() {
  if (!state.pendingPost || !state.run) return;
  const run = state.run;
  const pending = state.pendingPost;
  state.pendingPost = null;
  const result = simulatePost(pending.idea, pending.vibeId, pending.text);
  const followerGain = result.gain;
  run.followers += followerGain;
  run.cover = result.newCover;
  run.turn += 1;
  run.stats.posts = (run.stats.posts || 0) + 1;

  const userPost = {
    id: `you-post-${run.turn}`,
    key: `you-post-${run.turn}`,
    author: "you",
    text: pending.text,
    label: pending.idea.label,
    art: pending.idea.art,
    artSeed: 900 + run.turn * 37,
    tag: pending.idea.tag,
    likes: result.likes,
    comments: 0,
    reposts: Math.round(result.likes * 0.11),
    age: "now",
    time: result.time,
    generatedComments: result.comments,
    result,
    isUser: true,
  };
  run.feed.unshift(userPost);
  addNextBotPost();
  run.posts.unshift(userPost);

  run.notifications.unshift(
    { actor: "luna", text: "liked your post.", time: "now", mark: "♡", type: "like" },
    { actor: pick(["corporate", "npc", "void"]), text: "started following you.", time: "now", mark: "+FOLLOW", type: "follow" },
  );
  if (result.match) {
    run.notifications.unshift({ actor: "algorithm", text: `boosted you into ${result.trend.tag}.`, time: "now", mark: "↗", type: "algo" });
  }
  run.unread += 3;

  state.lastResult = result;
  state.screen = "result";
  render();
}

function finishRun() {
  if (!state.run) return;
  const run = state.run;
  let key = "irrelevant";
  if (run.cover <= 0) key = "exposed";
  else if (run.followers >= GOAL && run.echoes.length >= 3) key = "ghost";
  else if (run.followers >= GOAL && run.cover >= 35) key = "icon";
  else if (run.followers >= GOAL) key = "watched";

  const entry = {
    key,
    data: ENDINGS[key],
    followers: run.followers,
    cover: run.cover,
    echoes: run.echoes.length,
    posts: run.turn,
    goal: GOAL,
    name: run.name,
  };
  if (!state.best || run.followers > state.best.followers) {
    entry.newBest = true;
    saveBest({ followers: run.followers, name: run.name, title: ENDINGS[key].pre + " " + ENDINGS[key].em });
  }
  state.ending = entry;
  state.screen = "ending";
  if (typeof closeOverlay === "function") closeOverlay();
  render();
}

const qualityFromResult = (result) => {
  if (!result) return "flop";
  return result.quality;
};

/* ------------------------------ toast ------------------------------ */

function toast(message, iconName = "sparkle") {
  if (!toastRoot) return;
  const node = document.createElement("div");
  node.className = "toast";
  node.innerHTML = `${ico(iconName)}<span>${message}</span>`;
  toastRoot.appendChild(node);
  while (toastRoot.children.length > 3) toastRoot.firstElementChild.remove();
  setTimeout(() => {
    node.classList.add("leaving");
    setTimeout(() => node.remove(), 260);
  }, 3100);
}

/* ------------------------------ shared rendering ------------------------------ */

function render() {
  if (!state.run && ["feed", "posting", "result", "ending"].includes(state.screen)) state.screen = "splash";
  if (state.screen === "splash") renderSplash();
  else if (state.screen === "identity") renderIdentity();
  else if (state.screen === "intro") renderIntro();
  else if (state.screen === "feed") renderFeed();
  else if (state.screen === "posting") renderPosting();
  else if (state.screen === "result") renderResult();
  else if (state.screen === "ending") renderEnding();
}

function renderSplash() {
  const best = state.best;
  const bestHTML = best
    ? `BEST RUN<br><b>${formatNum(best.followers)} followers · ${esc(best.title || "SURVIVED")}</b>`
    : "NO RUNS YET<br><b>BE SOMEONE</b>";
  appScreen.innerHTML = `
    <section class="screen splash">
      <div class="splash-bg" aria-hidden="true">
        ${["sunset", "bloom", "static"].map((style, index) => `
          <div class="ghost-card">
            <div class="ghost-head"><i></i><span>@${["luna_optimized", "museum_of_me", "the_algorithm"][index]} · ${index + 1}m</span></div>
            <div class="ghost-art">${artSVG(style, 44 + index * 9, "")}</div>
            <div class="ghost-line"></div><div class="ghost-line short"></div>
          </div>
        `).join("")}
      </div>
      <div class="splash-top">
        <span class="eyebrow">PARASOCIAL / NIGHT ONE</span>
        <span class="live-pill"><i></i> LIVE</span>
      </div>
      <div class="splash-main">
        <div class="splash-mark">PARA<br><em>SOCIAL</em></div>
        <p class="splash-dek">The internet is full of people. <b>All of them are synthetic.</b> You are the only human left online.</p>
        <div class="stat-plate">8,024,119,733 accounts online <span>·</span> <b>1 human</b></div>
        <div class="splash-actions">
          <button class="btn btn-acid" data-action="begin" aria-label="Start game">ENTER THE FEED ${ico("arrowRight")}</button>
        </div>
        <div class="splash-foot" style="margin-top:16px"><span>TOUCH TO SCROLL</span><span>·</span><span>TILT TO SCAN</span></div>
      </div>
      <div class="splash-bottom">
        <p>“The feed doesn't know what you are. Keep it that way.”</p>
        <div class="best-run">${bestHTML}</div>
      </div>
    </section>`;
}

function renderIdentity() {
  const mode = state.identityMode;
  const selectedCeleb = CELEBS.find((celeb) => celeb.id === state.celebId) || CELEBS[0];
  const selfColors = SELF_COLORS[state.selfColor];
  const displayName = state.selfName.trim() || "You";
  const selfPanel = `
    <div class="identity-panel">
      <div class="self-card">
        <div class="field-label"><span>DISPLAY NAME</span><span>MAKE IT YOURS</span></div>
        <input class="text-input" id="selfName" maxlength="20" value="${esc(state.selfName)}" autocomplete="off" spellcheck="false" aria-label="Display name">
        <div class="handle-preview"><span>your handle</span><b id="handlePreview">@${slug(displayName)}</b></div>
        <div class="field-label" style="margin-top:16px"><span>YOUR FACE, MORE OR LESS</span><span>PICK A VIBE</span></div>
        <div class="avatar-picker">
          ${SELF_COLORS.map((colors, index) => `
            <button class="avatar-choice ${index === state.selfColor ? "selected" : ""}" data-color="${index}" aria-label="Avatar color ${index + 1}">
              <span class="avatar">${avatarSVG(colors, shortName(displayName), 21 + index * 7)}</span>
            </button>
          `).join("")}
        </div>
        <div class="start-stats">
          <div class="start-stat"><span>STARTING FOLLOWERS</span><b>27</b></div>
          <div class="start-stat"><span>COVER</span><b class="acid">100%</b></div>
          <div class="start-stat"><span>THE ASSIGNMENT</span><b>10K BY 3AM</b></div>
          <div class="start-stat"><span>ADVANTAGE</span><b>NO ONE KNOWS YOU</b></div>
        </div>
      </div>
    </div>`;
  const famousPanel = `
    <div class="identity-panel">
      <div class="famous-note">${ico("alert")}<span>Fame is a liability here. Verified accounts get watched harder. Your followers didn't transfer.</span></div>
      <div class="persona-list">
        ${CELEBS.map((celeb) => `
          <button class="persona-card ${celeb.id === state.celebId ? "selected" : ""}" data-persona="${celeb.id}">
            <span class="persona-avatar">${avatarSVG(celeb.colors, celeb.glyph, 13 + CELEBS.indexOf(celeb) * 11)}</span>
            <span class="persona-meta">
              <span class="persona-name">${esc(celeb.name)} <span class="verified">${ico("check")}</span></span>
              <p>${esc(celeb.tagline)}</p>
            </span>
            <span class="persona-followers"><b>${formatNum(celeb.startFollowers)}</b>followers</span>
          </button>
        `).join("")}
      </div>
      <div class="start-stats">
        <div class="start-stat"><span>STARTING FOLLOWERS</span><b>${formatNum(selectedCeleb.startFollowers)}</b></div>
        <div class="start-stat"><span>COVER</span><b class="acid">${selectedCeleb.cover}%</b></div>
        <div class="start-stat"><span>THE ASSIGNMENT</span><b>10K BY 3AM</b></div>
        <div class="start-stat"><span>ADVANTAGE</span><b>THEY THINK THEY KNOW YOU</b></div>
      </div>
    </div>`;

  appScreen.innerHTML = `
    <section class="screen identity">
      <div class="identity-head">
        <button class="icon-btn" data-action="identity-back" aria-label="Back to start">${ico("arrowLeft")}</button>
        <span class="step-label">01 / 02 · PICK YOUR MASK</span>
        <span style="width:38px"></span>
      </div>
      <div class="identity-scroll">
        <span class="eyebrow">WHO LOGS IN TONIGHT?</span>
        <h1 class="display identity-title">Who are you<br><em>tonight?</em></h1>
        <p class="identity-sub">Borrow a face or bring your own. The feed treats everyone exactly the same: like content.</p>
        <div class="mode-switch" role="tablist" aria-label="Choose identity">
          <button class="mode-option ${mode === "self" ? "active" : ""}" data-mode="self" role="tab" aria-selected="${mode === "self"}">MYSELF</button>
          <button class="mode-option ${mode === "celeb" ? "active" : ""}" data-mode="celeb" role="tab" aria-selected="${mode === "celeb"}">FAMOUS</button>
        </div>
        ${mode === "self" ? selfPanel : famousPanel}
      </div>
      <div class="identity-cta">
        <button class="btn btn-acid" data-action="continue-identity">CONTINUE AS ${mode === "self" ? esc(displayName.toUpperCase()) : esc(selectedCeleb.name.split(" ")[0].toUpperCase())} ${ico("arrowRight")}</button>
        <small>${mode === "self" ? "No followers. No clue. No bot." : "Famous everywhere else. A nobody here."} · ${ico("lock")} one human per network</small>
      </div>
    </section>`;
}

function renderIntro() {
  const run = state.run;
  const art = artSVG(run.mode === "self" ? "bloom" : "chrome", 77, "WELCOME BACK");
  appScreen.innerHTML = `
    <section class="screen intro">
      <div class="intro-art">${art}</div>
      <div class="intro-time">9:41 PM · ${run.mode === "self" ? "NO NOTIFICATIONS" : "VERIFIED, SOMEHOW"}</div>
      <div class="intro-content">
        <span class="eyebrow acid">YOU ARE ONLINE</span>
        <h1 class="display" style="margin-top:12px">You log in.<br><em>The feed is awake.</em></h1>
        <p>Eight billion accounts. One pulse. Everyone else is a language model with a profile picture, and they are all very interested in you.</p>
        <div class="briefing">
          <div class="briefing-row"><span>Account</span><b>@${esc(run.handle)} · ${formatExact(run.followers)} followers</b></div>
          <div class="briefing-row"><span>Tonight's goal</span><b class="acid">10,000 by 3:00 AM</b></div>
          <div class="briefing-row"><span>Cover</span><b class="coral">${run.cover}% · keep it above zero</b></div>
          <div class="briefing-row"><span>Posts remaining</span><b>5</b></div>
        </div>
        <button class="btn btn-acid" data-action="open-feed">OPEN THE FEED ${ico("arrowRight")}</button>
      </div>
    </section>`;
}

function renderHud() {
  const run = state.run;
  const pct = clamp((run.followers / GOAL) * 100, 0, 100).toFixed(1);
  const cover = Math.round(run.cover);
  const coverStatus = cover > 60 ? "INTACT" : cover > 30 ? "SLIPPING" : "CRITICAL";
  return `
    <div class="hud">
      <div class="hud-goal">
        <div class="hud-goal-top"><span class="hud-label">TONIGHT'S GOAL</span><strong>10K BY 3AM</strong></div>
        <div class="hud-value"><b>${formatNum(run.followers)}</b><span>/ ${formatExact(GOAL)}</span></div>
        <div class="meter"><i style="width:${pct}%"></i></div>
      </div>
      <div class="cover-dial ${cover < 25 ? "low" : ""}" style="--cover:${cover}"><b>${cover}%</b></div>
      <div class="cover-meta"><span>COVER</span><b>${coverStatus}</b></div>
    </div>`;
}

function renderStories() {
  return `<div class="story-row">${STORY_LABELS.map(([author, label, live]) => {
    const data = author === "you" ? state.run : BOTS[author];
    return `<button class="story ${live ? "live" : ""}" data-story="${author}">
      <span class="story-ring"><span class="avatar">${avatarFor(author, state.run)}</span></span>
      <span>${esc(label)}</span>
    </button>`;
  }).join("")}</div>`;
}

function renderPost(post) {
  const run = state.run;
  const you = post.author === "you";
  const author = you ? run : BOTS[post.author] || BOTS.algorithm;
  const liked = run.liked.includes(post.id);
  const saved = run.saved.includes(post.id);
  const generated = post.generatedComments || [];
  const likes = post.likes + (liked ? 1 : 0);
  const comments = post.comments + generated.length;
  const preview = generated[0] || (post.comment ? { author: post.comment.author, text: post.comment.text } : null);
  const previewAuthor = preview ? BOTS[preview.author] : null;
  const result = post.result;
  return `<article class="post ${you ? "post--you" : ""}" data-post-id="${post.id}">
    <div class="post-head">
      <span class="avatar ${you ? "you" : "ai"}">${avatarFor(post.author, run)}</span>
      <div class="post-meta">
        <div class="post-name">${esc(author.name)} ${you ? '<span class="you-badge">YOU</span>' : author.verified ? `<span class="verified">${ico("check")}</span>` : ""}</div>
        <div class="post-sub">@${esc(you ? run.handle : author.handle)} · ${you ? "now" : post.age}${post.tag ? ` · ${esc(post.tag)}` : ""}</div>
      </div>
      <button class="post-more" data-more="${post.id}" aria-label="More options">${ico("more")}</button>
    </div>
    <p class="post-caption">${captionHTML(post.text)}</p>
    <div class="post-media" data-media="${post.id}" role="button" tabindex="0" aria-label="Like ${esc(author.name)}'s post">
      ${artSVG(post.art, post.artSeed, post.label)}
      ${post.tag ? `<span class="media-tag top">${esc(post.tag)}</span>` : ""}
      <span class="double-heart">♥</span>
    </div>
    ${result ? `<div class="post-insight">${ico("eye")} <span><b>+${formatNum(result.gain)}</b> followers</span><span>·</span><span>cover <b>${signed(result.coverDelta)}</b></span><span>·</span><span>${esc(result.kicker)}</span></div>` : ""}
    <div class="post-actions">
      <div class="post-action-group">
        <button class="action ${liked ? "liked" : ""}" data-like="${post.id}" aria-label="Like post">${ico("heart")}<span class="count">${formatNum(likes)}</span></button>
        <button class="action" data-comment="${post.id}" aria-label="Reply to post">${ico("comment")}<span class="count">${formatNum(comments)}</span></button>
        <button class="action" data-repost="${post.id}" aria-label="Repost">${ico("repost")}<span class="count">${formatNum(post.reposts || 0)}</span></button>
      </div>
      <button class="action ${saved ? "saved" : ""}" data-save="${post.id}" aria-label="Save post">${ico("bookmark")}</button>
    </div>
    ${preview ? `<div class="comment-preview">${previewAuthor ? `<span class="avatar">${avatarSVG(previewAuthor.colors, previewAuthor.glyph, 5 + previewAuthor.handle.length)}</span>` : ""}<p><b>@${esc(previewAuthor ? previewAuthor.handle : "you")}</b> ${esc(preview.text)}</p></div>` : ""}
    ${generated.slice(1).map((comment) => {
      const commentAuthor = BOTS[comment.author] || BOTS.void;
      return `<div class="comment-preview"><span class="avatar">${avatarSVG(commentAuthor.colors, commentAuthor.glyph, 8 + commentAuthor.handle.length)}</span><p><b>@${esc(commentAuthor.handle)}</b> ${esc(comment.text)}</p></div>`;
    }).join("")}
  </article>`;
}

function renderFeed() {
  const run = state.run;
  const trend = currentTrend();
  const ticker = `LIVE · ${trend.tag} IS PEAKING · 8,024,119,733 ACCOUNTS ONLINE · 1 HUMAN ONLINE · THE FEED IS WATCHING`;
  appScreen.innerHTML = `
    <section class="screen feed">
      <header class="topbar">
        <div class="wordmark-small">PARA<span>SOCIAL</span><i class="live-dot"></i></div>
        <div class="top-actions">
          <div class="bell-wrap">
            <button class="icon-btn" data-action="notifications" aria-label="Activity">${ico("bell")}</button>
            ${run.unread > 0 ? `<span class="badge">${run.unread > 9 ? "9+" : run.unread}</span>` : ""}
          </div>
          <button class="clock-pill" data-action="profile" aria-label="Open profile"><i></i>${timeForTurn(run.turn)}</button>
        </div>
      </header>
      ${renderHud()}
      <div class="ticker"><span class="ticker-label">LIVE</span><div class="ticker-track"><span>${ticker} &nbsp;&nbsp;&nbsp; ${ticker} &nbsp;&nbsp;&nbsp;</span></div></div>
      <div class="feed-scroll" id="feedScroll">
        ${renderStories()}
        <div class="feed-head"><div class="feed-head-left"><i></i>FOR YOU</div><span>${formatExact(run.followers)} FOLLOWERS · ${run.turn}/5 POSTS</span></div>
        <div class="post-list">
          ${run.feed.map(renderPost).join("")}
          <div class="feed-end">${pick(FEED_END_LINES)}<span>THE FEED KEEPS GOING</span></div>
        </div>
      </div>
      <nav class="tabbar" aria-label="Main navigation">
        <button class="tab active" data-nav="feed" aria-label="Feed">${ico("home")}<span>FEED</span></button>
        <button class="tab" data-nav="trends" aria-label="Trends">${ico("compass")}<span>TRENDS</span></button>
        <button class="tab tab-create" data-action="compose" aria-label="Create post">${ico("plus")}<span>POST</span></button>
        <button class="tab" data-nav="scan" aria-label="Scan for human echoes">${ico("radar")}<span>SCAN</span></button>
        <button class="tab" data-nav="profile" aria-label="Your profile">${ico("user")}<span>YOU</span></button>
      </nav>
    </section>`;
  const scroller = $("#feedScroll");
  if (scroller) scroller.scrollTop = 0;
}

function renderPosting() {
  const [a, b] = pick(POSTING_LINES);
  appScreen.innerHTML = `
    <section class="screen posting">
      <div class="posting-orbit"><div class="posting-core">${ico("send")}</div></div>
      <h1 class="posting-title">${a}<br><em>${b}</em></h1>
      <p class="posting-sub">UPLOADING TO THE COLLECTIVE</p>
      <div class="posting-bars"><div class="posting-bar"><i></i></div><div class="posting-bar"><i></i></div><div class="posting-bar"><i></i></div></div>
    </section>`;
}

function renderResult() {
  const result = state.lastResult;
  if (!result) {
    state.screen = "feed";
    render();
    return;
  }
  const run = state.run;
  const exposed = result.exposed;
  const final = result.final;
  const title = exposed
    ? { pre: "TOO MUCH", em: "HUMAN", kicker: "COVER COMPROMISED", sub: "The post performed beautifully. So did your pulse." }
    : result;
  const button = exposed ? "SEE WHAT THEY DO" : final ? "FACE THE VERDICT" : "BACK TO THE FEED";
  appScreen.innerHTML = `
    <section class="screen result">
      <div class="result-hero">${artSVG(result.idea.art, 900 + run.turn * 37, result.idea.label)}<span class="result-time">POSTED · ${result.time}</span></div>
      <div class="result-content">
        <div class="result-kicker"><i></i>${title.kicker}</div>
        <h1 class="result-title">${title.pre}<br><em>${title.em}</em></h1>
        <p class="result-sub">${title.sub}</p>
        <div class="result-stats">
          <div class="result-stat"><span>FOLLOWERS</span><b class="acid">+${formatNum(result.gain)}</b></div>
          <div class="result-stat"><span>LIKES</span><b>${formatNum(result.likes)}</b></div>
          <div class="result-stat"><span>COVER</span><b class="${result.coverDelta < 0 ? "coral" : ""}">${signed(result.coverDelta)}</b></div>
        </div>
        <div class="result-comments">
          ${result.comments.map((comment) => {
            const author = BOTS[comment.author] || BOTS.void;
            return `<div class="result-comment"><span class="avatar">${avatarSVG(author.colors, author.glyph, 6 + author.handle.length)}</span><p><b>@${esc(author.handle)}</b> ${esc(comment.text)}</p></div>`;
          }).join("")}
        </div>
        <button class="btn btn-acid" data-action="result-continue">${button} ${ico("arrowRight")}</button>
        <div class="result-footnote">${final ? "THAT WAS YOUR LAST POST BEFORE 3AM" : `${MAX_TURNS - run.turn} POSTS LEFT BEFORE 3AM`} · ${formatExact(run.followers)} FOLLOWERS</div>
      </div>
    </section>`;
}

function renderEnding() {
  const ending = state.ending;
  if (!ending) {
    state.screen = "splash";
    render();
    return;
  }
  const data = ending.data;
  const titleSlug = data.pre.toLowerCase().replace(/\s+/g, "-");
  const shareLabel = "SHARE YOUR VERDICT";
  appScreen.innerHTML = `
    <section class="screen ending">
      <div class="ending-art">${artSVG(data.art, 121 + ending.key.length * 9, "PARASOCIAL")}
        <div class="ending-clock">3:00<span>AM · THE FEED IS STILL AWAKE</span></div>
      </div>
      <div class="ending-content">
        <div class="ending-kicker">${data.kicker}</div>
        <h1 class="ending-title">${data.pre}<em>${data.em}</em></h1>
        <p class="ending-copy">${data.copy}</p>
        <div class="ending-stats">
          <div class="ending-stat"><span>FOLLOWERS</span><b class="acid">${formatExact(ending.followers)}</b></div>
          <div class="ending-stat"><span>COVER LEFT</span><b class="${ending.cover < 35 ? "coral" : ""}">${Math.round(ending.cover)}%</b></div>
          <div class="ending-stat"><span>HUMAN ECHOES</span><b class="lilac">${ending.echoes} / 3</b></div>
          <div class="ending-stat"><span>POSTS MADE</span><b>${ending.posts} / 5</b></div>
        </div>
        <div class="ending-echoes"><span>${ending.echoes === 3 ? "You found every human echo in the network." : ending.echoes > 0 ? "There are still traces of something human in here." : "The scan found nothing. Maybe that's for the best."}</span><b>${ending.echoes === 3 ? "ARCHIVE COMPLETE" : "SIGNAL " + ending.echoes + "/3"}</b></div>
        <div class="ending-actions">
          <button class="btn btn-acid" data-action="share" data-title="${esc(titleSlug)}">${shareLabel} ${ico("copy")}</button>
          <button class="btn btn-ghost" data-action="replay">RUN IT BACK ${ico("replay")}</button>
        </div>
        <div class="share-note">${ending.newBest ? "NEW PERSONAL BEST · " : ""}GOAL 10K · NIGHT ONE · YOU WERE THE ONLY HUMAN ONLINE</div>
      </div>
    </section>`;
}

/* ------------------------------ live updates ------------------------------ */

function updateHud() {
  if (!state.run) return;
  const run = state.run;
  const value = $(".hud-value b");
  if (value) value.textContent = formatNum(run.followers);
  const meter = $(".hud-goal .meter i");
  if (meter) meter.style.width = `${clamp((run.followers / GOAL) * 100, 0, 100)}%`;
  const cover = Math.round(run.cover);
  const dial = $(".cover-dial");
  if (dial) {
    dial.style.setProperty("--cover", cover);
    dial.classList.toggle("low", cover < 25);
    const label = dial.querySelector("b");
    if (label) label.textContent = `${cover}%`;
  }
  const coverMeta = $(".cover-meta b");
  if (coverMeta) coverMeta.textContent = cover > 60 ? "INTACT" : cover > 30 ? "SLIPPING" : "CRITICAL";
  const followersMeta = $(".feed-head span");
  if (followersMeta) followersMeta.textContent = `${formatExact(run.followers)} FOLLOWERS · ${run.turn}/5 POSTS`;
  updateBadge();
}

function updateBadge() {
  if (!state.run) return;
  const wrap = $(".bell-wrap");
  if (!wrap) return;
  const old = wrap.querySelector(".badge");
  if (state.run.unread > 0) {
    if (old) old.textContent = state.run.unread > 9 ? "9+" : String(state.run.unread);
    else wrap.insertAdjacentHTML("beforeend", `<span class="badge">${state.run.unread > 9 ? "9+" : state.run.unread}</span>`);
  } else if (old) old.remove();
}

function likePost(postId, media = false) {
  const run = state.run;
  if (!run) return;
  if (run.liked.includes(postId)) return;
  run.liked.push(postId);
  const post = run.feed.find((item) => item.id === postId);
  if (post) post.likes += 1;
  const smallGain = between(3, 14);
  run.followers += smallGain;
  run.stats.likes += 1;
  const article = document.querySelector(`[data-post-id="${postId}"]`);
  if (article) {
    const button = article.querySelector(`[data-like="${postId}"]`);
    if (button) {
      button.classList.add("liked", "bump");
      const count = button.querySelector(".count");
      if (count) count.textContent = formatNum((post?.likes || 1) + 1);
      setTimeout(() => button.classList.remove("bump"), 320);
    }
    if (media) {
      const heart = article.querySelector(".double-heart");
      if (heart) {
        heart.classList.remove("pop");
        void heart.offsetWidth;
        heart.classList.add("pop");
      }
    }
  }
  updateHud();
  haptic(7);
  if (Math.random() < 0.16) toast(`A stranger followed you. <b>+${smallGain}</b>`, "user");
}

function savePost(postId) {
  const run = state.run;
  if (!run) return;
  const index = run.saved.indexOf(postId);
  const button = document.querySelector(`[data-save="${postId}"]`);
  if (index >= 0) {
    run.saved.splice(index, 1);
    button?.classList.remove("saved");
    toast("Removed from your private folder.", "bookmark");
  } else {
    run.saved.push(postId);
    button?.classList.add("saved");
    toast("Saved. The bots will never know.", "bookmark");
  }
}

function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  return new Promise((resolve, reject) => {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function shareResult() {
  if (!state.ending) return;
  const ending = state.ending;
  const text = `PARASOCIAL: ${ending.data.pre} ${ending.data.em} — ${formatExact(ending.followers)} followers, ${Math.round(ending.cover)}% cover, ${ending.echoes}/3 human echoes. The only human online.`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "PARASOCIAL", text, url: location.href.split("#")[0] });
    } else {
      await copyText(`${text} ${location.href.split("#")[0]}`);
      toast("Verdict copied. Go be perceived.", "copy");
    }
  } catch {
    try {
      await copyText(`${text} ${location.href.split("#")[0]}`);
      toast("Verdict copied. Go be perceived.", "copy");
    } catch {
      toast("Screenshot it. That's the share button now.", "alert");
    }
  }
}
