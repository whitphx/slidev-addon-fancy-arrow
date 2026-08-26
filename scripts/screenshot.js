#!/usr/bin/env node
// Renders a slide from a running dev server to a PNG, for environments that have
// no browser to open the slides in, such as Claude Code cloud sessions.
//
// Usage: node scripts/screenshot.js [slide] [outfile] [--clicks N]

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import puppeteer from "puppeteer-core";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    url: {
      type: "string",
      default: process.env.SLIDEV_URL ?? "http://localhost:3030",
    },
    width: { type: "string", default: "1280" },
    height: { type: "string", default: "720" },
    scale: { type: "string", default: "2" },
    wait: { type: "string", default: "5000" },
    clicks: { type: "string" },
  },
});

const slide = positionals[0] ?? "1";
const out =
  positionals[1] ??
  `screenshots/slide-${slide}${values.clicks ? `-clicks-${values.clicks}` : ""}.png`;

const executablePath = CHROME_CANDIDATES.find(
  (path) => path && existsSync(path),
);
if (!executablePath) {
  console.error(
    "No Chrome found. Set CHROME_PATH, or install one with `npx @puppeteer/browsers install chrome@stable`.",
  );
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });

// --no-sandbox because cloud session VMs run commands as root.
const browser = await puppeteer.launch({
  executablePath,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({
    width: Number(values.width),
    height: Number(values.height),
    deviceScaleFactor: Number(values.scale),
  });
  const query = values.clicks ? `?clicks=${values.clicks}` : "";
  await page.goto(`${values.url}/${slide}${query}`, {
    waitUntil: "networkidle0",
  });
  // Arrows draw themselves through delayed CSS animations, so capturing on load
  // would catch them half-drawn.
  await page.evaluate(async (timeout) => {
    await Promise.race([
      Promise.all(
        document.getAnimations().map((animation) => animation.finished),
      ),
      new Promise((resolve) => setTimeout(resolve, timeout)),
    ]);
  }, Number(values.wait));
  await page.screenshot({ path: out });
} finally {
  await browser.close();
}

console.log(out);
