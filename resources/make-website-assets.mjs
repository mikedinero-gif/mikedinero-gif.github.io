// Makes the web-sized icon and screenshots for the Laz Lights website.
// Run from the project folder:  node resources/make-website-assets.mjs
import sharp from "sharp";
const out = "website/assets/";
await sharp("resources/icon-1024.png").resize(512).png().toFile(out + "icon-512.png");
await sharp("resources/icon-1024.png").resize(180).png().toFile(out + "apple-touch-icon.png");
await sharp("resources/icon-1024.png").resize(64).png().toFile(out + "favicon.png");
for (const n of ["01-gameplay", "02-map", "03-boss-intro", "04-daily-signal", "05-journal"])
  await sharp(`resources/screenshots/${n}.png`).resize(660).webp({ quality: 82 }).toFile(`${out}${n}.webp`);
await sharp("resources/screenshots/01-gameplay.png").resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 82 }).toFile(out + "share.jpg");
console.log("done");
