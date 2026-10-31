/* PARASOCIAL — generated editorial artwork and avatars. */

let artSeq = 0;

const PALETTES = {
  sunset: { a: "#ff7b9c", b: "#8c5cff", c: "#151021", glow: "#ffe8c9", ink: "#fff6e9" },
  chrome: { a: "#1b1b24", b: "#57576d", c: "#09090d", glow: "#f4f1ff", ink: "#f5f2e9" },
  bloom: { a: "#411b57", b: "#9b5cff", c: "#100818", glow: "#ffb7e5", ink: "#fff1fa" },
  static: { a: "#06080a", b: "#13251a", c: "#040505", glow: "#d8ff3e", ink: "#eaff9b" },
  ocean: { a: "#0b3350", b: "#1f86a8", c: "#06141f", glow: "#a8f0ff", ink: "#e9fcff" },
  food: { a: "#f2d1a0", b: "#be7548", c: "#3a1d10", glow: "#ffe6bc", ink: "#2c170d" },
  minimal: { a: "#f2eee3", b: "#cfc8b7", c: "#b8b09d", glow: "#ffffff", ink: "#111116" },
  glitch: { a: "#1a0622", b: "#4d0d4f", c: "#060309", glow: "#ff4fd8", ink: "#f5f2e9" },
  city: { a: "#111a3b", b: "#4b2f68", c: "#060812", glow: "#ffce8a", ink: "#f3f0ff" },
  orbit: { a: "#080b1c", b: "#1f2a5c", c: "#05060d", glow: "#9e8cff", ink: "#e8e5ff" },
  mirror: { a: "#1c2331", b: "#465b7c", c: "#0a0d14", glow: "#b8e9ff", ink: "#f0f8ff" },
};

const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function artSVG(style = "chrome", seed = 1, label = "") {
  const p = PALETTES[style] || PALETTES.chrome;
  const id = `art${++artSeq}`;
  const rnd = mulberry32(seed * 7919 + 31);
  const W = 640;
  const H = 470;
  let scene = "";

  if (style === "sunset") {
    const stars = Array.from({ length: 18 }, () => {
      const x = Math.round(rnd() * 620 + 10);
      const y = Math.round(rnd() * 235 + 20);
      const r = (rnd() * 1.7 + 0.5).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe8ef" opacity="${(0.28 + rnd() * 0.55).toFixed(2)}"/>`;
    }).join("");
    scene = `
      <circle cx="468" cy="178" r="132" fill="url(#${id}glow)" opacity=".46" filter="url(#${id}blur)"/>
      <circle cx="468" cy="178" r="54" fill="${p.glow}"/>
      <circle cx="468" cy="178" r="69" fill="none" stroke="#ffe4c6" stroke-opacity=".22"/>
      ${stars}
      <path d="M0 338 C112 320 182 346 264 336 C352 326 420 350 520 334 C570 327 610 337 640 330 V470 H0Z" fill="#171020"/>
      <path d="M0 373 C90 360 166 380 244 372 C340 362 436 390 536 374 C582 367 612 376 640 371 V470 H0Z" fill="#0f0a17" opacity=".9"/>
      <g stroke="#ffb9cb" stroke-width="1" opacity=".32">
        <path d="M-20 470 L286 334 L660 470"/>
        <path d="M82 470 L326 334 L564 470"/>
        <path d="M196 470 L360 334 L436 470"/>
        <path d="M308 470 L388 334 L318 470"/>
      </g>
      <g fill="#ffd8df" opacity=".65">
        <circle cx="88" cy="316" r="2"/><circle cx="158" cy="286" r="1.4"/>
        <circle cx="566" cy="292" r="1.8"/><circle cx="602" cy="330" r="1.3"/>
      </g>
      <text x="30" y="76" fill="#fff3e7" opacity=".74" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">GOLDEN HOUR</text>
      <text x="30" y="121" fill="#fff3e7" opacity=".38" font-family="Space Grotesk, Arial, sans-serif" font-size="8" letter-spacing="2">A MEMORY STILL BUFFERING</text>
      <text x="608" y="88" fill="#fff3e7" opacity=".5" text-anchor="end" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="29">04:47</text>`;
  }

  if (style === "chrome") {
    const lines = Array.from({ length: 8 }, (_, i) => {
      const y = 80 + i * 43;
      return `<path d="M-20 ${y} C150 ${y - 58} 420 ${y + 74} 670 ${y - 12}" stroke="#dfdcff" stroke-opacity="${(0.04 + i * 0.008).toFixed(3)}" fill="none"/>`;
    }).join("");
    scene = `
      <ellipse cx="322" cy="220" rx="238" ry="174" fill="url(#${id}glow)" opacity=".18" filter="url(#${id}blur)"/>
      ${lines}
      <circle cx="326" cy="213" r="131" fill="url(#${id}metal)"/>
      <ellipse cx="285" cy="164" rx="67" ry="28" fill="#ffffff" opacity=".46" transform="rotate(-23 285 164)"/>
      <ellipse cx="374" cy="268" rx="82" ry="26" fill="#08080b" opacity=".27" transform="rotate(-17 374 268)"/>
      <circle cx="326" cy="213" r="131" fill="none" stroke="#ffffff" stroke-opacity=".24"/>
      <path d="M174 317 C258 354 388 332 468 274" stroke="#f5f2e9" stroke-opacity=".28" fill="none"/>
      <g fill="#f5f2e9" opacity=".5">
        <circle cx="112" cy="112" r="2"/><circle cx="542" cy="356" r="2"/><circle cx="518" cy="98" r="1.3"/>
      </g>
      <text x="30" y="75" fill="#f4f1ff" opacity=".7" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">CHROME / 001</text>
      <text x="610" y="420" fill="#f4f1ff" opacity=".45" text-anchor="end" font-family="Space Grotesk, Arial, sans-serif" font-size="8" letter-spacing="2">REFLECTION NOT FOUND</text>`;
  }

  if (style === "bloom") {
    const petals = Array.from({ length: 11 }, (_, i) => `<ellipse cx="0" cy="-82" rx="${30 + (i % 3) * 8}" ry="122" transform="rotate(${i * 32.7})" fill="url(#${id}petal)" opacity="${(0.2 + (i % 4) * 0.055).toFixed(3)}"/>`).join("");
    scene = `
      <circle cx="320" cy="222" r="190" fill="url(#${id}glow)" opacity=".17" filter="url(#${id}blur)"/>
      <g transform="translate(320 225)">${petals}<circle r="43" fill="#0d0715"/><circle r="24" fill="url(#${id}glow)" opacity=".8"/></g>
      <g stroke="#ffd6f3" stroke-opacity=".17" fill="none">
        <circle cx="320" cy="225" r="202"/><circle cx="320" cy="225" r="157"/><circle cx="320" cy="225" r="112"/>
      </g>
      <text x="30" y="75" fill="#fff1fa" opacity=".65" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">IN BLOOM</text>
      <text x="608" y="87" fill="#fff1fa" opacity=".4" text-anchor="end" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="28">soft / 03</text>`;
  }

  if (style === "static") {
    const glitches = Array.from({ length: 13 }, () => {
      const x = Math.round(rnd() * 520 + 20);
      const y = Math.round(rnd() * 350 + 40);
      const w = Math.round(rnd() * 130 + 20);
      const h = Math.round(rnd() * 4 + 1);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${rnd() > 0.4 ? "#d8ff3e" : "#ff6b8a"}" opacity="${(0.1 + rnd() * 0.32).toFixed(2)}"/>`;
    }).join("");
    scene = `
      <rect width="640" height="470" fill="url(#${id}scan)" opacity=".55"/>
      ${glitches}
      <g font-family="Space Grotesk, Arial, sans-serif" font-weight="700" letter-spacing="-9">
        <text x="31" y="235" fill="#ff4b7d" opacity=".4" font-size="89">NO SIGNAL</text>
        <text x="27" y="231" fill="#d8ff3e" opacity=".88" font-size="89">NO SIGNAL</text>
        <text x="25" y="227" fill="#eaff9b" font-size="89">NO SIGNAL</text>
      </g>
      <rect x="28" y="273" width="244" height="1" fill="#d8ff3e" opacity=".55"/>
      <text x="30" y="300" fill="#d8ff3e" opacity=".55" font-family="Space Grotesk, Arial, sans-serif" font-size="9" letter-spacing="3">SIGNAL LOST / RETRYING</text>
      <text x="609" y="87" fill="#d8ff3e" opacity=".4" text-anchor="end" font-family="Space Grotesk, Arial, sans-serif" font-size="8" letter-spacing="2">ERR 0x1HUMAN</text>`;
  }

  if (style === "ocean") {
    const waves = [0, 1, 2, 3].map((i) => {
      const y = 274 + i * 35;
      return `<path d="M-30 ${y} C86 ${y - 24} 178 ${y + 22} 294 ${y - 2} C410 ${y - 28} 508 ${y + 22} 670 ${y - 10}" fill="none" stroke="${i % 2 ? "#81e6ff" : "#c4f7ff"}" stroke-opacity="${0.32 - i * 0.05}" stroke-width="${1.2 + i * 0.3}"/>`;
    }).join("");
    scene = `
      <circle cx="468" cy="132" r="57" fill="#d6f8ff" opacity=".9"/>
      <circle cx="468" cy="132" r="92" fill="url(#${id}glow)" opacity=".22" filter="url(#${id}blur)"/>
      ${waves}
      <path d="M0 395 C96 376 190 404 286 392 C392 378 514 414 640 386 V470 H0Z" fill="#07141f"/>
      <g fill="#b8f4ff" opacity=".5"><circle cx="132" cy="196" r="1.5"/><circle cx="574" cy="223" r="1.2"/><circle cx="80" cy="248" r="1"/></g>
      <text x="30" y="75" fill="#e9fcff" opacity=".62" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">LOW TIDE</text>
      <text x="608" y="88" fill="#e9fcff" opacity=".4" text-anchor="end" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="28">2:14</text>`;
  }

  if (style === "food") {
    scene = `
      <rect x="78" y="76" width="484" height="320" rx="160" fill="#f8e0b6" opacity=".13" transform="rotate(-4 320 236)"/>
      <circle cx="322" cy="225" r="143" fill="#f8e0b6"/>
      <circle cx="322" cy="225" r="121" fill="#f3c996"/>
      <circle cx="322" cy="225" r="91" fill="#e9b07d"/>
      <g fill="#3c4c26">
        <ellipse cx="300" cy="205" rx="25" ry="17" transform="rotate(-22 300 205)"/>
        <ellipse cx="360" cy="250" rx="22" ry="15" transform="rotate(18 360 250)"/>
        <ellipse cx="280" cy="266" rx="17" ry="12" transform="rotate(41 280 266)"/>
        <circle cx="344" cy="189" r="8"/>
      </g>
      <g fill="#ffffff" opacity=".7">
        <circle cx="330" cy="229" r="3"/><circle cx="312" cy="221" r="2"/><circle cx="351" cy="230" r="2.5"/>
      </g>
      <g stroke="#f8e0b6" stroke-width="3" opacity=".55">
        <path d="M114 145v170M110 145v38M118 145v38M110 183h8"/>
        <path d="M524 150c-13 19-13 43 0 55v105M524 150c16 17 18 38 0 55"/>
      </g>
      <text x="30" y="75" fill="#2c170d" opacity=".68" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">GIRL DINNER</text>
      <text x="608" y="88" fill="#2c170d" opacity=".46" text-anchor="end" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="28">one olive</text>`;
  }

  if (style === "minimal") {
    scene = `
      <rect x="36" y="36" width="568" height="398" fill="none" stroke="#111116" stroke-opacity=".13"/>
      <circle cx="454" cy="197" r="93" fill="#111116"/>
      <circle cx="454" cy="197" r="93" fill="none" stroke="#f2eee3" stroke-opacity=".2" transform="translate(6 6)"/>
      <text x="36" y="163" fill="#111116" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="62" letter-spacing="-2">no caption.</text>
      <text x="38" y="211" fill="#111116" opacity=".72" font-family="Space Grotesk, Arial, sans-serif" font-size="10" letter-spacing="4.5">NO LOCATION. NO PROOF.</text>
      <path d="M38 238h288" stroke="#111116" stroke-opacity=".42"/>
      <text x="608" y="87" fill="#111116" opacity=".55" text-anchor="end" font-family="Space Grotesk, Arial, sans-serif" font-size="8" letter-spacing="2">OBJECTS / 04</text>`;
  }

  if (style === "glitch") {
    scene = `
      <g font-family="Space Grotesk, Arial, sans-serif" font-weight="700" letter-spacing="-9">
        <text x="48" y="255" fill="#ff3fd4" opacity=".5" font-size="91">DELULU</text>
        <text x="32" y="243" fill="#6ed5ff" opacity=".55" font-size="91">DELULU</text>
        <text x="40" y="249" fill="#f5f2e9" font-size="91">DELULU</text>
      </g>
      <rect x="38" y="277" width="210" height="7" fill="#d8ff3e" opacity=".68"/>
      <rect x="258" y="277" width="76" height="7" fill="#ff3fd4" opacity=".6"/>
      <rect x="344" y="277" width="128" height="7" fill="#6ed5ff" opacity=".45"/>
      <g stroke="#f5f2e9" stroke-opacity=".14">
        <path d="M0 120h640M0 322h640M0 88h640"/>
      </g>
      <text x="40" y="313" fill="#d8ff3e" opacity=".6" font-family="Space Grotesk, Arial, sans-serif" font-size="9" letter-spacing="3">MANIFESTING IN PROGRESS</text>
      <text x="608" y="87" fill="#f5f2e9" opacity=".44" text-anchor="end" font-family="Space Grotesk, Arial, sans-serif" font-size="8" letter-spacing="2">REALITY / BETA</text>`;
  }

  if (style === "city") {
    const buildings = [
      [0, 282, 74, 188], [60, 248, 52, 222], [120, 305, 84, 165], [192, 266, 58, 204],
      [246, 227, 70, 243], [326, 292, 54, 178], [386, 245, 88, 225], [478, 276, 58, 194],
      [540, 236, 100, 234],
    ].map(([x, y, w, h], i) => {
      const windows = Array.from({ length: Math.floor(h / 26) }, (_, r) => {
        const count = Math.max(1, Math.floor(w / 22));
        return Array.from({ length: count }, (_, c) => {
          if (rnd() > 0.38) return "";
          return `<rect x="${x + 10 + c * 20}" y="${y + 15 + r * 25}" width="5" height="7" fill="${rnd() > 0.25 ? "#ffd894" : "#a4c8ff"}" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`;
        }).join("");
      }).join("");
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${i % 2 ? "#0c0f21" : "#10152b"}"/>${windows}`;
    }).join("");
    scene = `
      <circle cx="492" cy="114" r="39" fill="#ffe1aa" opacity=".92"/>
      <circle cx="492" cy="114" r="66" fill="url(#${id}glow)" opacity=".28" filter="url(#${id}blur)"/>
      ${buildings}
      <rect y="394" width="640" height="76" fill="#060812" opacity=".8"/>
      <g fill="#ffd894" opacity=".38"><rect x="0" y="420" width="640" height="1"/><rect x="0" y="437" width="640" height="1"/></g>
      <text x="30" y="75" fill="#f3f0ff" opacity=".64" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">AFTER HOURS</text>
      <text x="608" y="88" fill="#f3f0ff" opacity=".4" text-anchor="end" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="28">01:13</text>`;
  }

  if (style === "orbit") {
    scene = `
      <g transform="translate(328 220)">
        <ellipse rx="210" ry="92" fill="none" stroke="#9e8cff" stroke-opacity=".25" transform="rotate(-17)"/>
        <ellipse rx="158" ry="62" fill="none" stroke="#9e8cff" stroke-opacity=".17" transform="rotate(24)"/>
        <ellipse rx="112" ry="42" fill="none" stroke="#9e8cff" stroke-opacity=".13" transform="rotate(-52)"/>
        <circle r="52" fill="url(#${id}planet)"/>
        <circle r="52" fill="none" stroke="#ffffff" stroke-opacity=".2"/>
        <circle cx="187" cy="-38" r="6" fill="#d8ff3e" opacity=".9"/>
        <circle cx="-168" cy="34" r="3" fill="#b9a7ff" opacity=".8"/>
      </g>
      <g stroke="#b9a7ff" stroke-opacity=".08"><path d="M0 100h640M0 170h640M0 240h640M0 310h640M0 380h640M110 0v470M230 0v470M350 0v470M470 0v470M590 0v470"/></g>
      <text x="30" y="75" fill="#e8e5ff" opacity=".64" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">ORBITAL / SIGNAL 07</text>
      <text x="608" y="420" fill="#e8e5ff" opacity=".36" text-anchor="end" font-family="Space Grotesk, Arial, sans-serif" font-size="8" letter-spacing="2">YOU ARE BEING OBSERVED</text>`;
  }

  if (style === "mirror") {
    scene = `
      <rect x="188" y="55" width="264" height="356" rx="132" fill="url(#${id}mirror)" stroke="#d9f2ff" stroke-opacity=".26"/>
      <rect x="202" y="69" width="236" height="328" rx="118" fill="none" stroke="#d9f2ff" stroke-opacity=".12"/>
      <ellipse cx="282" cy="168" rx="45" ry="77" fill="#e5f8ff" opacity=".12"/>
      <ellipse cx="386" cy="274" rx="55" ry="92" fill="#6ed5ff" opacity=".13"/>
      <circle cx="320" cy="232" r="48" fill="#07101b" opacity=".35"/>
      <path d="M320 190c28 0 48 20 48 47 0 34-48 72-48 72s-48-38-48-72c0-27 20-47 48-47z" fill="none" stroke="#daeeff" stroke-opacity=".35"/>
      <text x="30" y="75" fill="#eefaff" opacity=".62" font-family="Space Grotesk, Arial, sans-serif" font-size="11" letter-spacing="4">SELF PORTRAIT</text>
      <text x="608" y="88" fill="#eefaff" opacity=".4" text-anchor="end" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="28">untitled</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p.a}"/><stop offset=".54" stop-color="${p.b}"/><stop offset="1" stop-color="${p.c}"/>
      </linearGradient>
      <radialGradient id="${id}glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${p.glow}" stop-opacity=".94"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id}metal" cx="35%" cy="28%" r="72%">
        <stop offset="0" stop-color="#fbfaff"/><stop offset=".22" stop-color="#aaa9c1"/><stop offset=".48" stop-color="#f1efff"/><stop offset=".67" stop-color="#4f4d68"/><stop offset=".84" stop-color="#d6d2e8"/><stop offset="1" stop-color="#24222f"/>
      </radialGradient>
      <radialGradient id="${id}petal" cx="50%" cy="12%" r="70%">
        <stop offset="0" stop-color="#ffc4ee" stop-opacity=".78"/><stop offset=".5" stop-color="#b66bff" stop-opacity=".35"/><stop offset="1" stop-color="#521c6d" stop-opacity=".04"/>
      </radialGradient>
      <radialGradient id="${id}planet" cx="36%" cy="30%" r="70%">
        <stop offset="0" stop-color="#d4cbff"/><stop offset=".45" stop-color="#6758b8"/><stop offset="1" stop-color="#151331"/>
      </radialGradient>
      <linearGradient id="${id}mirror" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#bceaff" stop-opacity=".3"/><stop offset=".5" stop-color="#6d8ca8" stop-opacity=".12"/><stop offset="1" stop-color="#06101b" stop-opacity=".52"/>
      </linearGradient>
      <linearGradient id="${id}shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".48"/>
      </linearGradient>
      <pattern id="${id}scan" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="1.5" fill="#d8ff3e" opacity=".13"/>
      </pattern>
      <filter id="${id}blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>
      <filter id="${id}grain">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
    ${scene}
    <rect y="310" width="${W}" height="160" fill="url(#${id}shade)"/>
    <text x="28" y="437" fill="${p.ink}" opacity=".86" font-family="Space Grotesk, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="3.2">${esc(label || "PARASOCIAL")}</text>
    <text x="612" y="437" fill="${p.ink}" opacity=".42" text-anchor="end" font-family="Space Grotesk, Arial, sans-serif" font-size="7" letter-spacing="2">PARASOCIAL / NIGHT 01</text>
    <rect width="${W}" height="${H}" filter="url(#${id}grain)" opacity=".13" style="mix-blend-mode:overlay"/>
  </svg>`;
}

function avatarSVG(colors = ["#b9a7ff", "#6a4cff", "#14102a"], glyph = "Y", seed = 2) {
  const id = `av${++artSeq}`;
  const rnd = mulberry32(seed * 131 + 7);
  const [a, b, c] = colors;
  const orb1 = { x: (rnd() * 30 + 12).toFixed(1), y: (rnd() * 30 + 14).toFixed(1), r: (rnd() * 12 + 9).toFixed(1) };
  const orb2 = { x: (rnd() * 30 + 45).toFixed(1), y: (rnd() * 32 + 40).toFixed(1), r: (rnd() * 12 + 8).toFixed(1) };
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".56" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
      <radialGradient id="${id}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".52"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="64" height="64" fill="url(#${id}g)"/>
    <circle cx="${orb1.x}" cy="${orb1.y}" r="${orb1.r}" fill="url(#${id}h)" opacity=".7"/>
    <circle cx="${orb2.x}" cy="${orb2.y}" r="${orb2.r}" fill="#06060a" opacity=".28"/>
    <text x="32" y="39" fill="#fff" fill-opacity=".9" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-size="${glyph.length > 1 ? 16 : 22}" font-weight="600" letter-spacing="-1">${esc(glyph)}</text>
  </svg>`;
}

const avatarFor = (author, run) => {
  if (author === "you" && run) {
    return avatarSVG(run.avatar.colors, run.avatar.glyph, run.avatar.seed);
  }
  const bot = BOTS[author] || BOTS.algorithm;
  return avatarSVG(bot.colors, bot.glyph, (bot.handle.charCodeAt(1) || 3) + 12);
};
