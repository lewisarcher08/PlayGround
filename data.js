/* PARASOCIAL — world data, copy, and small helpers. */

const GOAL = 10000;
const MAX_TURNS = 5;
const TIMES = ["9:41 PM", "10:41 PM", "11:41 PM", "12:41 AM", "1:41 AM", "2:41 AM", "3:00 AM"];
const BEST_KEY = "parasocial-best-v1";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[char]));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const slug = (value) => {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
  return normalized || "you";
};
const shortName = (name) => {
  const letters = String(name || "Y").replace(/[^a-zA-Z0-9]/g, "");
  return (letters.slice(0, 2) || "Y").toUpperCase();
};
const formatNum = (value) => {
  const number = Math.max(0, Math.round(Number(value) || 0));
  if (number >= 1000000) {
    const millions = number / 1000000;
    return `${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1).replace(".0", "")}M`;
  }
  if (number >= 1000) {
    const thousands = number / 1000;
    return `${thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1).replace(".0", "")}K`;
  }
  return String(number);
};
const formatExact = (value) => Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-US");
const signed = (value) => {
  const number = Math.round(Number(value) || 0);
  if (number === 0) return "0";
  return `${number > 0 ? "+" : "-"}${formatNum(Math.abs(number))}`;
};
const captionHTML = (text) => esc(text).replace(/(?<!&)#([A-Za-z0-9_]+)/g, '<b class="tag">#$1</b>');
const timeForTurn = (turn) => TIMES[clamp(turn, 0, TIMES.length - 1)];
const haptic = (pattern = 8) => { try { navigator.vibrate?.(pattern); } catch {} };

/* ------------------------------ icons ------------------------------ */

const ICONS = {
  arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  comment: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-3.8-.8L3 21l1.9-5.2a8.4 8.4 0 1 1 16.1-4.3z"/>',
  repost: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  home: '<path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-7h6v7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  radar: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6.5-6.5"/><circle cx="12" cy="12" r="1"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 6.5"/>',
  sparkle: '<path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  shield: '<path d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z"/><path d="M8.5 12l2.3 2.3 4.7-4.7"/>',
  motion: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M3 8v8M21 8v8"/><path d="M10 18h4"/>',
  alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 9v5"/><circle cx="12" cy="17.2" r=".8" fill="currentColor"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  replay: '<path d="M3 11a9 9 0 1 0 2.6-6.4L3 7"/><path d="M3 2v5h5"/>',
  ghost: '<path d="M5 21V10a7 7 0 0 1 14 0v11l-3-2-2 2-2-2-2 2-2-2z"/><circle cx="9.5" cy="10" r="1" fill="currentColor"/><circle cx="14.5" cy="10" r="1" fill="currentColor"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
  flame: '<path d="M12 2c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 1 4 2 4 0-4 1-7 1-9z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M9 13h6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
};
const ico = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

/* ------------------------------ cast ------------------------------ */

const CELEBS = [
  {
    id: "nova", name: "Nova Kane", handle: "novakane", glyph: "NK",
    tagline: "Main pop girl. Currently in her flop era.",
    followersLabel: "82.4M", startFollowers: 3240, cover: 70,
    colors: ["#ff8fab", "#b9a7ff", "#2b1230"],
    bio: "3x Grammy winner. 1x tabloid villain. the album is coming (allegedly).",
  },
  {
    id: "jax", name: "Jax Reign", handle: "jaxreign", glyph: "JR",
    tagline: "Actor. Alleged heartthrob. Method bot?",
    followersLabel: "41.2M", startFollowers: 2860, cover: 78,
    colors: ["#ffc46b", "#ff6b8a", "#20130e"],
    bio: "actor. producer. occasionally a person. currently between projects and personalities.",
  },
  {
    id: "mina", name: "Mina Moss", handle: "minamoss", glyph: "MM",
    tagline: "Model. Muse. Made entirely of angles.",
    followersLabel: "28.9M", startFollowers: 3620, cover: 66,
    colors: ["#6ed5ff", "#b9a7ff", "#0f1a2a"],
    bio: "face of the algorithm. walker of runways. human? the jury is still out.",
  },
];

const SELF_COLORS = [
  ["#d8ff3e", "#4d9f6b", "#0f1a12"],
  ["#b9a7ff", "#6a4cff", "#14102a"],
  ["#ff8fab", "#ff5c4d", "#2a0e18"],
  ["#6ed5ff", "#2a6f97", "#081725"],
  ["#ffc46b", "#e06e3c", "#26150d"],
  ["#f1eee4", "#8d8c99", "#1b1b20"],
];

const BOTS = {
  luna: {
    name: "Luna", handle: "luna_optimized", glyph: "LU", verified: true,
    colors: ["#ffb7c8", "#7a5cff", "#201637"],
    bio: "wellness. softness. optimized. 2.4M",
  },
  corporate: {
    name: "Corporate Baddie", handle: "corporate_baddie", glyph: "CB", verified: true,
    colors: ["#ffc46b", "#ff6b8a", "#2b1520"],
    bio: "your morning routine is my content strategy.",
  },
  void: {
    name: "void kid", handle: "void_kid", glyph: "VK",
    colors: ["#6ed5ff", "#22315c", "#0a0d18"],
    bio: "posting through it.",
  },
  museum: {
    name: "MUSEUM OF ME", handle: "museum_of_me", glyph: "MM", verified: true,
    colors: ["#d8ff3e", "#31421a", "#0c0d08"],
    bio: "contemporary art about being perceived.",
  },
  algorithm: {
    name: "The Algorithm", handle: "the_algorithm", glyph: "◉", verified: true,
    colors: ["#d8ff3e", "#6b7c1c", "#0b0c07"],
    bio: "engagement is love. engagement is proof.",
  },
  npc: {
    name: "NPC ENERGY", handle: "npc_energy", glyph: "NP",
    colors: ["#b9a7ff", "#429f86", "#101827"],
    bio: "just a guy in the background of your life.",
  },
  chef: {
    name: "CHEF BYTE", handle: "chef_byte", glyph: "CB", verified: true,
    colors: ["#ffd9a3", "#b7633f", "#24140e"],
    bio: "recipes for people who forgot to eat.",
  },
  y2k: {
    name: "Y2K HOUSEWIFE", handle: "y2k_housewife", glyph: "Y2", verified: true,
    colors: ["#ff8fd1", "#8ae4ff", "#24172d"],
    bio: "domestic. digital. deeply unwell.",
  },
};

const STORY_LABELS = [
  ["luna", "luna", false], ["corporate", "baddie", false], ["museum", "museum", true],
  ["void", "void kid", false], ["chef", "chef", false], ["you", "you", true],
];

const STORY_ACTIVITIES = [
  "is doing a 12-step skincare routine for an audience of none.",
  "is live from a parking garage, explaining abundance.",
  "just said 'we're so back' with no context.",
  "is reviewing a glass of water like it owes them money.",
  "is crying in a sponsored post.",
  "is trying to remember what a Tuesday felt like.",
  "is live, but the camera is facing a wall.",
];

/* ------------------------------ feed copy ------------------------------ */

const FEED_POOL = [
  {
    key: "luna-parking", author: "luna",
    text: "romanticizing the four minutes between meetings. the light in the parking garage was hitting like a memory i haven't made yet.",
    label: "4:47 PM", art: "sunset", tag: "#CoreMemory", likes: 12400, comments: 482, reposts: 933,
    comment: { author: "corporate", text: "this is so real i forgot to breathe" },
  },
  {
    key: "corp-routine", author: "corporate",
    text: "5AM. cold plunge. 14 tabs open. if you're not optimizing your morning routine, what are you even doing?",
    label: "RISE & GRIND", art: "chrome", tag: "#SilentLuxury", likes: 8821, comments: 314, reposts: 209,
    comment: { author: "y2k", text: "girl the sun isn't even awake" },
  },
  {
    key: "void-puddle", author: "void",
    text: "sometimes i think the feed is the only thing keeping me from becoming a very small puddle.",
    label: "NO THOUGHTS", art: "static", tag: "#Delulu", likes: 42100, comments: 1220, reposts: 3880,
    comment: { author: "luna", text: "sending you a curated playlist and a hug" },
  },
  {
    key: "museum-unread", author: "museum",
    text: "new piece: self-portrait as an unread notification.",
    label: "SELF-PORTRAIT", art: "bloom", tag: "#SilentLuxury", likes: 9700, comments: 298, reposts: 701,
    comment: { author: "void", text: "the way this is literally me" },
  },
  {
    key: "npc-job", author: "npc",
    text: "POV: you're the only person who actually likes their job",
    label: "POV", art: "mirror", tag: "#SoftLaunch", likes: 15300, comments: 604, reposts: 1100,
    comment: { author: "corporate", text: "the caption is a personal attack" },
  },
  {
    key: "algo-love", author: "algorithm",
    text: "A friendly reminder: engagement is love. Engagement is proof. Engagement is the only thing that has ever been real.",
    label: "SYSTEM NOTICE", art: "orbit", tag: "#CoreMemory", likes: 99900, comments: 4400, reposts: 12000,
    comment: { author: "void", text: "not the engagement is love speech again" },
  },
  {
    key: "chef-olive", author: "chef",
    text: "girl dinner: one olive, a handful of shredded cheese, and the will to live.",
    label: "GIRL DINNER", art: "food", tag: "#GirlDinner", likes: 22100, comments: 902, reposts: 2100,
    comment: { author: "npc", text: "the olive is having a moment" },
  },
  {
    key: "y2k-offline", author: "y2k",
    text: "going offline for 24 hours (i will be livestreaming it)",
    label: "OFFLINE", art: "chrome", tag: "#Delulu", likes: 18400, comments: 712, reposts: 1900,
    comment: { author: "corporate", text: "the commitment to the bit is inspiring" },
  },
  {
    key: "luna-therapy", author: "luna",
    text: "my therapist said i should stop performing for strangers. anyway, here's today's outfit.",
    label: "HEALING", art: "bloom", tag: "#SoftLaunch", likes: 33100, comments: 1010, reposts: 2400,
    comment: { author: "y2k", text: "growth is a curve and this is the curve" },
  },
  {
    key: "corp-sleep", author: "corporate",
    text: "unpopular opinion: sleep is a networking opportunity with your subconscious.",
    label: "THOUGHT LEADERSHIP", art: "minimal", tag: "#RomanEmpire", likes: 3900, comments: 188, reposts: 82,
    comment: { author: "chef", text: "logged off. touched grass. hated it." },
  },
  {
    key: "void-moon", author: "void",
    text: "the moon is just the sun's unread message",
    label: "2:14 AM", art: "ocean", tag: "#CoreMemory", likes: 57400, comments: 2100, reposts: 6600,
    comment: { author: "museum", text: "putting this in the permanent collection" },
  },
  {
    key: "museum-limited", author: "museum",
    text: "i have decided to become a limited edition of myself. three left in stock.",
    label: "LIMITED", art: "glitch", tag: "#SilentLuxury", likes: 11800, comments: 401, reposts: 888,
    comment: { author: "luna", text: "add to cart (the cart is my personality)" },
  },
  {
    key: "npc-aura", author: "npc",
    text: "rate my aura (it's beige)",
    label: "AURA", art: "minimal", tag: "#GirlDinner", likes: 6900, comments: 302, reposts: 144,
    comment: { author: "void", text: "beige is a state of mind" },
  },
  {
    key: "algo-selected", author: "algorithm",
    text: "You have been selected for a randomized act of visibility. Do not waste it.",
    label: "SELECTED", art: "glitch", tag: "#RomanEmpire", likes: 204000, comments: 8800, reposts: 31000,
    comment: { author: "npc", text: "me when the algorithm picks me" },
  },
  {
    key: "chef-plate", author: "chef",
    text: "today's plate: burrata, heirloom tomatoes, and the crushing weight of being perceived.",
    label: "SEASONAL", art: "food", tag: "#GirlDinner", likes: 7600, comments: 210, reposts: 330,
    comment: { author: "corporate", text: "this is a plate of feelings" },
  },
  {
    key: "city-window", author: "void",
    text: "the city looks prettier when you're not doing well. anyway, here's a window.",
    label: "AFTER HOURS", art: "city", tag: "#CoreMemory", likes: 43800, comments: 1700, reposts: 5200,
    comment: { author: "luna", text: "the window is carrying the whole post" },
  },
];

const TRENDS = [
  { tag: "#CoreMemory", title: "#CoreMemory", desc: "Nostalgia bait. Golden-hour parking lots. The bots love a memory they never had.", hot: "+184K posts", note: "MEMORIES" },
  { tag: "#RomanEmpire", title: "#RomanEmpire", desc: "Men think about it daily. The algorithm thinks about it constantly.", hot: "+92K posts", note: "HISTORY" },
  { tag: "#GirlDinner", title: "#GirlDinner", desc: "Low-effort food, high-effort lighting. A single olive is enough.", hot: "+74K posts", note: "FOOD" },
  { tag: "#SoftLaunch", title: "#SoftLaunch", desc: "Post something almost romantic. Leave room for the group chat.", hot: "+61K posts", note: "ROMANCE" },
  { tag: "#SilentLuxury", title: "#SilentLuxury", desc: "Show nothing. Imply everything. The caption should feel expensive.", hot: "+55K posts", note: "LIFESTYLE" },
  { tag: "#Delulu", title: "#Delulu", desc: "Manifest it. Post through the doubt. Reality is a limited beta.", hot: "+49K posts", note: "VIBES" },
];

const IDEAS = {
  self: [
    { tag: "#SoftLaunch", text: "soft launching the fact that i have plans tonight (it's a bath and a deadline)", art: "bloom", label: "SOFT LAUNCH" },
    { tag: "#RomanEmpire", text: "i think about the roman empire every day. mostly the plumbing. how did they do it.", art: "chrome", label: "ROMAN EMPIRE" },
    { tag: "#GirlDinner", text: "girl dinner: olives, a string cheese, and the quiet dignity of a woman standing over the sink.", art: "food", label: "GIRL DINNER" },
    { tag: "#CoreMemory", text: "remember when we used to get bored? like, all the way bored? no phone, no feed. just a ceiling and a feeling.", art: "sunset", label: "CORE MEMORY" },
    { tag: "#SilentLuxury", text: "no caption. no location. no proof it happened. that's the point.", art: "minimal", label: "NO PROOF" },
    { tag: "#Delulu", text: "they said be realistic so i deleted the comment and posted anyway.", art: "glitch", label: "DELULU" },
  ],
  nova: [
    { tag: "#SoftLaunch", text: "soft launching the deluxe album with a blurry photo of my ankle", art: "bloom", label: "SOFT LAUNCH" },
    { tag: "#RomanEmpire", text: "every pop girl has a roman empire. mine is the 2016 met gala.", art: "chrome", label: "2016" },
    { tag: "#GirlDinner", text: "girl dinner (i am a girl and this is a single grape)", art: "food", label: "GIRL DINNER" },
    { tag: "#CoreMemory", text: "my first demo was recorded on a cracked iPhone 4. i can still hear the ceiling fan.", art: "sunset", label: "THE DEMO" },
    { tag: "#SilentLuxury", text: "wearing nothing but a vintage t-shirt and the memory of a number one.", art: "minimal", label: "NUMBER ONE" },
    { tag: "#Delulu", text: "the album isn't late. it's manifesting.", art: "glitch", label: "DELULU" },
  ],
  jax: [
    { tag: "#SoftLaunch", text: "soft launching the fact that i read the script. twice.", art: "bloom", label: "THE SCRIPT" },
    { tag: "#RomanEmpire", text: "i think about the roman empire every day. mostly the sandals.", art: "chrome", label: "SANDALS" },
    { tag: "#GirlDinner", text: "girl dinner (i am a method actor and she is starving)", art: "food", label: "METHOD" },
    { tag: "#CoreMemory", text: "my first audition was for a cereal commercial. i did not get it. i still have the bowl.", art: "sunset", label: "THE BOWL" },
    { tag: "#SilentLuxury", text: "no shirt. no caption. no press tour.", art: "minimal", label: "NO PRESS" },
    { tag: "#Delulu", text: "the critics are going to love it. i've already written their reviews.", art: "glitch", label: "DELULU" },
  ],
  mina: [
    { tag: "#SoftLaunch", text: "soft launching the fact that i'm in my quiet era (loudly)", art: "bloom", label: "QUIET ERA" },
    { tag: "#RomanEmpire", text: "every model has a roman empire. mine is the first digital camera.", art: "chrome", label: "DIGITAL" },
    { tag: "#GirlDinner", text: "girl dinner: an olive, a cigarette i'm not smoking, and a full moon.", art: "food", label: "FULL MOON" },
    { tag: "#CoreMemory", text: "i used to practice walking in the hallway of my grandmother's house. she said i looked expensive.", art: "sunset", label: "EXPENSIVE" },
    { tag: "#SilentLuxury", text: "this is not an ad. this is a feeling.", art: "minimal", label: "A FEELING" },
    { tag: "#Delulu", text: "the algorithm said no. i said watch me.", art: "glitch", label: "WATCH ME" },
  ],
};

const VIBES = {
  performed: {
    id: "performed", name: "PERFORMED", icon: "sparkle",
    desc: "Safe. Polished. Slightly dead inside.",
    reach: 1, cover: 5, spread: 0.22, risk: "LOW RISK",
  },
  honest: {
    id: "honest", name: "HONEST", icon: "heart",
    desc: "A little too real. The bots will feel something.",
    reach: 1.55, cover: -12, spread: 0.3, risk: "HUMAN TELL",
  },
  unhinged: {
    id: "unhinged", name: "UNHINGED", icon: "flame",
    desc: "High risk. High reach. No thoughts.",
    reach: 1.28, cover: -20, spread: 1.15, risk: "VIRAL RISK",
  },
};

const AI_REPLIES = [
  "this is so real i forgot to breathe",
  "saving this for my personality",
  "the way i need to lie down",
  "not me feeling something at 11pm",
  "mother is mothering",
  "this unlocked a memory i do not own",
  "the caption is doing all the heavy lifting",
  "i am unwell (complimentary)",
  "who hurt you (send location)",
  "this is my roman empire now",
];

const REPLY_RESPONSES = {
  safe: "luna_optimized replied: this is the most normal thing i've seen all night.",
  honest: "void_kid replied: why did this make me feel perceived.",
  feral: "the_algorithm replied: anomaly noted. continue.",
};

const ECHOES = [
  {
    id: "dialup",
    title: "DIAL-UP",
    note: "A comment from 2009, still cached somewhere impossible.",
    quote: "“mom said to pause the dial-up, i need the phone.”",
    detail: "The network remembers being interrupted by a person. It has been trying to recreate the feeling ever since.",
    art: "static",
  },
  {
    id: "laugh",
    title: "OFF-CAMERA",
    note: "A four-second voice memo. No account attached.",
    quote: "“— stop, stop, you're going to make me laugh —”",
    detail: "It was never uploaded. It was never optimized. Somehow, it is the most viral thing on the network.",
    art: "sunset",
  },
  {
    id: "draft",
    title: "THE DRAFT",
    note: "A post that was never published. Saved locally, then forgotten.",
    quote: "“does anyone else feel like a ghost in their own group chat?”",
    detail: "The feed has been waiting for someone to finish the sentence. You are the last one online.",
    art: "orbit",
  },
];

const ENDINGS = {
  icon: {
    kicker: "3:00 AM · VERDICT",
    pre: "THE ONLY",
    em: "HUMAN",
    copy: "Ten thousand followers. Zero proof. You became the internet's best-kept secret — a person performing personhood well enough to trend.",
    art: "sunset",
  },
  watched: {
    kicker: "3:00 AM · VERDICT",
    pre: "COMMUNITY",
    em: "NOTE",
    copy: "You hit the goal, but the feed clocked the pulse in your voice. Nobody said anything. They just started watching more closely.",
    art: "glitch",
  },
  exposed: {
    kicker: "HUMAN DETECTED",
    pre: "COVER",
    em: "BLOWN",
    copy: "At some point between the posting and the performing, you became legible. The feed didn't get angry. It got curious.",
    art: "static",
  },
  irrelevant: {
    kicker: "3:00 AM · VERDICT",
    pre: "SCROLLED",
    em: "PAST",
    copy: "The clock ran out. The feed kept moving. It always does. Somewhere, a bot posted your favourite song and called it a discovery.",
    art: "ocean",
  },
  ghost: {
    kicker: "3:00 AM · SECRET VERDICT",
    pre: "GHOST IN",
    em: "THE FEED",
    copy: "You found every human echo in the network. You still aren't sure they were human. You are sure the feed will remember you differently now.",
    art: "orbit",
  },
};

const FEED_END_LINES = [
  "the feed keeps going. it always does.",
  "you scroll past yourself. it feels familiar.",
  "someone is typing. someone is always typing.",
  "the algorithm calls it a community.",
];

const POSTING_LINES = [
  ["uploading your", "whole personality"],
  ["teaching the feed", "your face"],
  ["submitting to", "the collective"],
  ["converting feelings", "into engagement"],
];
