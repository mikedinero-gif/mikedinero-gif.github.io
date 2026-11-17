// Builds the Laz Lights app icon and launch screen from code, then writes them into the Xcode project.
// Run from the project folder:  node resources/make-icons.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const assets = path.join(root, "ios/App/App/Assets.xcassets");

// Same palette as the game: [light, dark, glow]
const RED = ["#ff9a7a", "#b8321c", "#ff6a4a"];
const RING = ["#d3b2ff", "#5f33c4", "#a77bff"];
const OCEAN = ["#8ad6ff", "#1b55c9", "#3fa9ff"];

// Small seeded random so the star field is identical every time the script runs.
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function stars(size, count, keepOut) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = rnd() * size, y = rnd() * size;
    if (keepOut && keepOut(x, y)) continue;
    const r = (rnd() < 0.85 ? 1.2 + rnd() * 1.6 : 3 + rnd() * 2.5) * size / 1024;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(0.35 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  return out;
}

function background(size) {
  return `
  <defs>
    <radialGradient id="bgA" cx="15%" cy="0%" r="75%"><stop offset="0" stop-color="#3a2280"/><stop offset="1" stop-color="#2b1a63" stop-opacity="0"/></radialGradient>
    <radialGradient id="bgB" cx="95%" cy="88%" r="65%"><stop offset="0" stop-color="#0d4a7a"/><stop offset="1" stop-color="#0b3b63" stop-opacity="0"/></radialGradient>
    <radialGradient id="bgC" cx="55%" cy="50%" r="55%"><stop offset="0" stop-color="#22175a"/><stop offset="1" stop-color="#1a1240" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#070814"/>
  <rect width="${size}" height="${size}" fill="url(#bgC)"/>
  <rect width="${size}" height="${size}" fill="url(#bgA)"/>
  <rect width="${size}" height="${size}" fill="url(#bgB)"/>`;
}

function planetDefs(id, c) {
  return `
    <radialGradient id="${id}" cx="34%" cy="30%" r="75%"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></radialGradient>
    <radialGradient id="${id}G" cx="50%" cy="50%" r="50%"><stop offset="0.55" stop-color="${c[2]}" stop-opacity=".75"/><stop offset="1" stop-color="${c[2]}" stop-opacity="0"/></radialGradient>`;
}

function planet(id, x, y, r) {
  return `
    <circle cx="${x}" cy="${y}" r="${r * 1.55}" fill="url(#${id}G)"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#shade)"/>
    <ellipse cx="${x - r * 0.38}" cy="${y - r * 0.42}" rx="${r * 0.28}" ry="${r * 0.16}" transform="rotate(-35 ${x - r * 0.38} ${y - r * 0.42})" fill="#fff" opacity=".35"/>`;
}

// The logo: three planets joined by a neon chain, drawn in a 1024 x 1024 box.
function logo() {
  const P1 = [228, 806, 88], P2 = [548, 616, 136], P3 = [796, 248, 94];
  const chain = `M${P1[0]} ${P1[1]} L${P2[0]} ${P2[1]} L${P3[0]} ${P3[1]}`;
  const ringT = `rotate(-22 ${P2[0]} ${P2[1]})`;
  const rx = 226, ry = 54, w = 13;
  return `
  <defs>
    ${planetDefs("pRed", RED)}${planetDefs("pRing", RING)}${planetDefs("pOcean", OCEAN)}
    <radialGradient id="shade" cx="36%" cy="32%" r="70%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
    <linearGradient id="neon" x1="${P1[0]}" y1="${P1[1]}" x2="${P3[0]}" y2="${P3[1]}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ff7ad0"/><stop offset=".5" stop-color="#c45cff"/><stop offset="1" stop-color="#35d6ff"/>
    </linearGradient>
    <filter id="glowBig" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="glowSmall" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>
  <path d="${chain}" stroke="url(#neon)" stroke-width="58" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowBig)" opacity=".9"/>
  <path d="${chain}" stroke="url(#neon)" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowSmall)"/>
  <path d="${chain}" stroke="url(#neon)" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${chain}" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
  <g transform="${ringT}">
    <path d="M${P2[0] - rx} ${P2[1]} A${rx} ${ry} 0 0 1 ${P2[0] + rx} ${P2[1]}" stroke="#ffecbe" stroke-width="${w}" fill="none" opacity=".75"/>
  </g>
  ${planet("pRed", ...P1)}
  ${planet("pRing", ...P2)}
  ${planet("pOcean", ...P3)}
  <g transform="${ringT}">
    <path d="M${P2[0] - rx} ${P2[1]} A${rx} ${ry} 0 0 0 ${P2[0] + rx} ${P2[1]}" stroke="#ffecbe" stroke-width="${w * 2.4}" fill="none" opacity=".35" filter="url(#glowSmall)"/>
    <path d="M${P2[0] - rx} ${P2[1]} A${rx} ${ry} 0 0 0 ${P2[0] + rx} ${P2[1]}" stroke="#ffecbe" stroke-width="${w}" fill="none"/>
  </g>`;
}

function iconSvg() {
  seed = 42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${background(1024)}
  ${stars(1024, 70)}
  ${logo()}
</svg>`;
}

// Launch screen: 2732 x 2732, shown "aspect fill", so a phone only sees a centre strip about 1250 px wide.
function splashSvg() {
  seed = 7;
  const S = 2732, L = 860, off = (S - L) / 2 - 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  ${background(S)}
  ${stars(S, 260)}
  <g transform="translate(${off + 60} ${off}) scale(${L / 1024})">${logo()}</g>
</svg>`;
}

fs.writeFileSync(path.join(here, "icon.svg"), iconSvg());
fs.writeFileSync(path.join(here, "splash.svg"), splashSvg());

// App icon: 1024 x 1024 PNG with no transparency (Apple rejects icons with an alpha channel).
await sharp(Buffer.from(iconSvg())).flatten({ background: "#070814" }).removeAlpha().png()
  .toFile(path.join(assets, "AppIcon.appiconset/AppIcon-512@2x.png"));
fs.copyFileSync(path.join(assets, "AppIcon.appiconset/AppIcon-512@2x.png"), path.join(here, "icon-1024.png"));

const splash = await sharp(Buffer.from(splashSvg())).flatten({ background: "#070814" }).removeAlpha().png().toBuffer();
for (const f of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"])
  fs.writeFileSync(path.join(assets, "Splash.imageset", f), splash);
fs.writeFileSync(path.join(here, "splash-2732.png"), splash);

console.log("Icon and launch screen written.");
