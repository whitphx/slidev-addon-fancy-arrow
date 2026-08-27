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
const PAGE_READY_TIMEOUT = 60000;
const RELOAD_RETRIES = 3;
const ANIMATION_START_TIMEOUT = 2000;
const ANIMATION_END_TIMEOUT = 5000;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  // Playwright's browsers, which some cloud images ship instead of a system Chrome.
  "/opt/pw-browsers/chromium",
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
// Vite reloads the page when it meets a dependency it has not optimized yet, which
// is routine on a cold dev server and destroys whatever we were waiting on.
const isNavigationError = (error) =>
  /Execution context was destroyed|Execution context is not available|frame was detached|Target closed/.test(
    error.message,
  );

// The load event only means the entry module arrived. The slide mounts later, and on
// a cold dev server it sits behind a "Loading slide..." placeholder while Vite
// compiles, which can take tens of seconds. Without this wait the capture is a blank
// page or that placeholder. Neighbouring slides are in the DOM too, so this looks at
// the requested one rather than whichever `.slidev-page` comes first.
const waitForSlide = (page) =>
  page.waitForFunction(
    (slideNumber) => {
      const el = document.querySelector(`.slidev-page-${slideNumber}`);
      if (!el || /Loading slide/.test(el.innerText)) return false;
      return el.innerText.trim() !== "" || el.querySelector("img, svg, video");
    },
    { timeout: PAGE_READY_TIMEOUT, polling: 100 },
    slide,
  );

// An arrow animates itself into place once its endpoints resolve, which happens after
// the load event. Wait for the first animation to exist, otherwise the wait below has
// nothing to wait for and the capture catches an arrow that has not been drawn yet.
const waitForAnimations = async (page) => {
  await page
    .waitForFunction(() => document.getAnimations().length > 0, {
      timeout: ANIMATION_START_TIMEOUT,
    })
    .catch((error) => {
      if (isNavigationError(error)) throw error;
    });
  await page.evaluate(async (timeout) => {
    await Promise.race([
      Promise.all(
        document.getAnimations().map((animation) => animation.finished),
      ),
      new Promise((resolve) => setTimeout(resolve, timeout)),
    ]);
  }, ANIMATION_END_TIMEOUT);
};

try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  const query = values.clicks ? `?clicks=${values.clicks}` : "";
  // Not `networkidle0`: Slidev keeps a `/@server-reactive/` connection open for the
  // life of the page, so the network never goes idle and the navigation times out.
  await page.goto(`${values.url}/${slide}${query}`, {
    waitUntil: "load",
  });
  for (let attempt = 0; ; attempt++) {
    try {
      await waitForSlide(page);
      await waitForAnimations(page);
      break;
    } catch (error) {
      if (attempt >= RELOAD_RETRIES || !isNavigationError(error)) throw error;
    }
  }
  await page.screenshot({ path: out });
} finally {
  await browser.close();
}

console.log(out);
