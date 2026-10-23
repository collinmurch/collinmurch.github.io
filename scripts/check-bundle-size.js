import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { brotliCompressSync } from "node:zlib";

const buildDirectory = resolve(import.meta.dir, "../build");
const pageBudgets = {
	"index.html": 42 * 1024,
	"about.html": 42 * 1024,
	"blog.html": 42 * 1024,
	"recipes.html": 42 * 1024,
};
const cssBudget = 8 * 1024;
const katexCssBudget = 8 * 1024;

function compressedSize(path) {
	return brotliCompressSync(readFileSync(path)).byteLength;
}

function modulePreloadSize(page) {
	const html = readFileSync(resolve(buildDirectory, page), "utf8");
	const hrefs = [...html.matchAll(/<link\b[^>]*>/g)]
		.map(([tag]) => tag)
		.filter((tag) => /\srel="modulepreload"/.test(tag))
		.map((tag) => tag.match(/\shref="([^"]+)"/)?.[1])
		.filter(Boolean);
	if (hrefs.length === 0) {
		throw new Error(
			`${page} has no modulepreload links; the budget would measure nothing`,
		);
	}
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
const cssFiles = readdirSync(assetsDirectory).filter((file) => file.endsWith(".css"));
const isKatex = (file) => file.startsWith("katex.");
const cssSize = cssFiles
	.filter((file) => !isKatex(file))
	.reduce((total, file) => total + compressedSize(resolve(assetsDirectory, file)), 0);

if (cssSize > cssBudget) {
	throw new Error(`CSS is ${cssSize} bytes; budget is ${cssBudget}`);
}
console.log(`CSS: ${cssSize} of ${cssBudget} Brotli bytes`);

const katexSize = cssFiles
	.filter(isKatex)
	.reduce((total, file) => total + compressedSize(resolve(assetsDirectory, file)), 0);

if (katexSize > katexCssBudget) {
	throw new Error(`KaTeX CSS is ${katexSize} bytes; budget is ${katexCssBudget}`);
}
console.log(
	`KaTeX CSS (math posts only): ${katexSize} of ${katexCssBudget} Brotli bytes`,
);
