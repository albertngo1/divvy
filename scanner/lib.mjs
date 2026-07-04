// Shared helpers for the Divvy generators (scan.mjs feed-sparked ideas + party.mjs
// parallel party-game agents). Kept dependency-free and side-effect-free on import.

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

export function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function extractJSON(stdout) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("no JSON array in claude output");
  return JSON.parse(stdout.slice(start, end + 1));
}

// One-shot `claude -p`. stdin is ignored so claude doesn't block waiting on it.
export function callClaude(prompt, { timeoutMs = 1000 * 300 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", prompt, "--dangerously-skip-permissions"], {
      stdio: ["ignore", "pipe", "inherit"],
      timeout: timeoutMs,
    });
    let out = "";
    child.stdout.on("data", (c) => { out += c; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`claude exited ${code}`));
      else resolve(out);
    });
  });
}

export async function loadIdeas(ideasFile) {
  if (!existsSync(ideasFile)) return { lastScan: "", ideas: [] };
  return JSON.parse(await readFile(ideasFile, "utf8"));
}
