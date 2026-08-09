import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { brotliCompressSync } from "node:zlib";

const buildDirectory = resolve(import.meta.dir, "../build");
const pageBudgets = {
	"index.html": 42 * 1024,
	"about.html": 42 * 1024,
	"blog.html": 42 * 1024,
};
const cssBudget = 8 * 1024;

function compressedSize(path) {
	return brotliCompressSync(readFileSync(path)).byteLength;
}

function modulePreloadSize(page) {
	const html = readFileSync(resolve(buildDirectory, page), "utf8");
	const hrefs = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(
		(match) => match[1],
	);
	const uniquePaths = new Set(
		hrefs.map((href) => new URL(href, `https://example.com/${page}`).pathname),
	);

	return [...uniquePaths].reduce(
		(total, path) => total + compressedSize(resolve(buildDirectory, `.${path}`)),
		0,
	);
}

for (const [page, budget] of Object.entries(pageBudgets)) {
	const size = modulePreloadSize(page);
	if (size > budget) {
		throw new Error(`${page} initial JavaScript is ${size} bytes; budget is ${budget}`);
	}
	console.log(`${page}: ${size} of ${budget} Brotli bytes`);
}

const assetsDirectory = resolve(buildDirectory, "_app/immutable/assets");
const cssSize = readdirSync(assetsDirectory)
	.filter((file) => file.endsWith(".css"))
	.reduce((total, file) => total + compressedSize(resolve(assetsDirectory, file)), 0);

if (cssSize > cssBudget) {
	throw new Error(`CSS is ${cssSize} bytes; budget is ${cssBudget}`);
}
console.log(`CSS: ${cssSize} of ${cssBudget} Brotli bytes`);
