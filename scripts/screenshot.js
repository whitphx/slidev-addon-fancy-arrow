#!/usr/bin/env node
// Renders a slide from a running dev server to a PNG, for environments that have
// no browser to open the slides in, such as Claude Code cloud sessions.
//
// It drives a Chrome that is already on the machine rather than depending on
// `puppeteer`, which downloads a copy of Chrome on every install.

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import puppeteer from "puppeteer-core";

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const ANIMATION_START_TIMEOUT = 2000;
const ANIMATION_END_TIMEOUT = 5000;

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
    url: { type: "string", default: "http://localhost:3030" },
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
    "No Chrome found. Set CHROME_PATH to a Chrome executable. `npx @puppeteer/browsers install chrome@stable` downloads one and prints the path to point it at.",
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
  await page.setViewport(VIEWPORT);
  const query = values.clicks ? `?clicks=${values.clicks}` : "";
  await page.goto(`${values.url}/${slide}${query}`, {
    waitUntil: "networkidle0",
  });
  // An arrow animates itself into place once its endpoints resolve, which happens
  // after the load event. Wait for the first animation to exist, otherwise the
  // wait below has nothing to wait for and the capture catches an empty slide.
  await page
    .waitForFunction(() => document.getAnimations().length > 0, {
      timeout: ANIMATION_START_TIMEOUT,
    })
    .catch(() => {});
  await page.evaluate(async (timeout) => {
    await Promise.race([
      Promise.all(
        document.getAnimations().map((animation) => animation.finished),
      ),
      new Promise((resolve) => setTimeout(resolve, timeout)),
    ]);
  }, ANIMATION_END_TIMEOUT);
  await page.screenshot({ path: out });
} finally {
  await browser.close();
}

console.log(out);
