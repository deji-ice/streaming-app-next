// Tests the redirects in next.config.ts the way the live Worker runs them.
//
//   node scripts/check-redirects.mjs
//
// Why: `next dev` fills in ":path*" for a "/" request; OpenNext (the Cloudflare adapter) does
// not, so "/" once redirected to the literal address "https://streamscapex.app/:path*" on the
// live site while every local check passed. This runs OpenNext's own redirect matcher (copied
// to a temp folder with its build-file imports stubbed) against the real redirect list,
// compiled the way `next build` does. Run it after changing `redirects()` or upgrading
// @opennextjs/cloudflare; it needs no build and does not touch .next or a running dev server.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const repo = process.cwd();
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "redirect-check-"));
const awsDist = path.join(repo, "node_modules/@opennextjs/aws/dist");
const routing = path.join(awsDist, "core/routing");
const require = createRequire(path.join(repo, "package.json"));
const awsRequire = createRequire(path.join(routing, "matcher.js"));
const url = (file) => pathToFileURL(file).href;

// 1. util.js with its build-file imports removed and stubbed.
const dropImport = /^import .* from "(\.\.\/\.\.\/adapters|\.\.\/\.\.\/http|\.\.\/\.\.\/utils\/binary|\.\/i18n|\.\/queue)/;
const utilLines = fs.readFileSync(path.join(routing, "util.js"), "utf8").split("\n");
const utilStubs = [
  'const BuildId = "", HtmlPages = [], NextConfig = {}; class OpenNextNodeResponse {}',
  "const getQueryFromIterator = () => ({}), parseHeaders = () => ({}), debug = () => {}, error = () => {};",
  'const isBinaryContentType = () => false, localizePath = (e) => e.rawPath, generateMessageGroupId = () => "";',
];
const utilFile = path.join(outDir, "util-test.mjs");
fs.writeFileSync(utilFile, [...utilStubs, ...utilLines.filter((line) => !dropImport.test(line))].join("\n"));

// 2. matcher.js with config, i18n and route matchers stubbed; everything else is the real code.
const replacements = [
  [/import \{ NextConfig \} from "[^"]+";/, "const NextConfig = {};"],
  [/from "path-to-regexp"/, `from "${url(awsRequire.resolve("path-to-regexp"))}"`],
  [/import \{ handleLocaleRedirect, localizePath \} from "\.\/i18n";/, "const handleLocaleRedirect = () => undefined; const localizePath = (e) => e.rawPath;"],
  [/import \{ dynamicRouteMatcher, staticRouteMatcher \} from "\.\/routeMatcher";/, "const dynamicRouteMatcher = () => []; const staticRouteMatcher = () => [];"],
  [/import \{ debug \} from "[^"]+";/, "const debug = () => {};"],
  [/from "\.\/util"/, `from "${url(utilFile)}"`],
  [/from "\.\.\/\.\.\/utils\/normalize-path"/, `from "${url(path.join(awsDist, "utils/normalize-path.js"))}"`],
  [/from "\.\.\/\.\.\/utils\/stream"/, `from "${url(path.join(awsDist, "utils/stream.js"))}"`],
];
let matcher = fs.readFileSync(path.join(routing, "matcher.js"), "utf8");
for (const [pattern, replacement] of replacements) {
  if (!pattern.test(matcher)) {
    console.error(`OpenNext's matcher changed (no match for ${pattern}); update this script.`);
    process.exit(2);
  }
  matcher = matcher.replace(pattern, replacement);
}
const matcherFile = path.join(outDir, "matcher-test.mjs");
fs.writeFileSync(matcherFile, matcher);
const { handleRedirects } = await import(url(matcherFile));

// 3. The real redirects from next.config.ts, compiled the way `next build` does.
const ts = require("typescript");
const configSource = fs.readFileSync(path.join(repo, "next.config.ts"), "utf8");
const js = ts.transpileModule(configSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", "require", js)(mod, mod.exports, require);
const config = mod.exports.default ?? mod.exports;
const { buildCustomRoute } = require("next/dist/lib/build-custom-route");
const redirects = (await config.redirects()).map((route) =>
  buildCustomRoute("redirect", { ...route, statusCode: route.permanent ? 308 : 307 }, ["/_next"]),
);

// 4. Requests: [host, path, query string]. Redirected hosts must land on the same path and query.
const REDIRECTED_HOSTS = ["stream.scapex.workers.dev", "www.streamscapex.app"];
const cases = [
  ["stream.scapex.workers.dev", "/", ""],
  ["stream.scapex.workers.dev", "/", "?utm_source=x&a=1"],
  ["stream.scapex.workers.dev", "/movie/the-odyssey-1368337", "?x=1"],
  ["stream.scapex.workers.dev", "/movie", ""],
  ["stream.scapex.workers.dev", "/robots.txt", ""],
  ["stream.scapex.workers.dev", "/series", "?genres=18"],
  ["www.streamscapex.app", "/", ""],
  ["www.streamscapex.app", "/series/foo-1", "?a=b"],
  // Must NOT redirect: version preview URLs (for testing a deploy), the site itself, look-alikes.
  ["1a2b3c-stream.scapex.workers.dev", "/", ""],
  ["streamscapex.app", "/", ""],
  ["streamscapex.app", "/movie", ""],
  ["xstream.scapex.workers.dev.evil.com", "/", ""],
];
// A bare origin and origin + "/" are the same URL.
const norm = (u) => u.replace(/^(https:\/\/[^/?]+)\/(\?|$)/, "$1$2");
let failed = 0;
for (const [host, pathname, search] of cases) {
  const event = {
    type: "core",
    method: "GET",
    rawPath: pathname,
    localizedRawPath: pathname,
    url: `https://${host}${pathname}${search}`,
    headers: { host },
    query: Object.fromEntries(new URLSearchParams(search)),
    cookies: {},
    remoteAddress: "1.1.1.1",
  };
  const out = handleRedirects(event, redirects);
  const actual = out?.headers?.Location ?? "(no redirect)";
  const expected = REDIRECTED_HOSTS.includes(host)
    ? `https://streamscapex.app${pathname === "/" ? "" : pathname}${search}`
    : "(no redirect)";
  const ok = norm(actual) === norm(expected) && (expected === "(no redirect)" || out.statusCode === 308);
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${out?.statusCode ?? "---"} ${host}${pathname}${search} -> ${actual}${ok ? "" : `  (expected ${expected})`}`);
}
fs.rmSync(outDir, { recursive: true, force: true });
console.log(failed ? `\n${failed} of ${cases.length} FAILED` : `\nall ${cases.length} ok`);
process.exit(failed ? 1 : 0);
