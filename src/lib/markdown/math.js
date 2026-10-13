import katex from "katex";
import { toSvelteHtml } from "./html.js";
import { injectImports, walk } from "./mdast.js";

const DELIMITER = "$$";
const BLOCK_OPEN = /^ {0,3}\$\$/;
const STYLESHEET = "katex/dist/katex.min.css?url";
const STYLESHEET_NAME = "katexStylesheet";

/**
 * Renders TeX to KaTeX HTML at build time. Invalid TeX throws, so a broken
 * formula fails the build instead of shipping as an error message.
 */
export function renderMath(tex, { display = false } = {}) {
	return katex.renderToString(tex.trim(), { displayMode: display, throwOnError: true });
}

/**
 * Renders display math in a `MathBlock`, which scrolls sideways when the
 * formula is too wide and copies its TeX source.
 */
export function displayMath(tex) {
	const source = JSON.stringify(tex.trim());
	const html = toSvelteHtml(renderMath(tex, { display: true }));
	return `<MathBlock tex={${source}}>${html}</MathBlock>`;
}

function mathNode(value, math) {
	return { type: "html", value, data: { math } };
}

function locateInlineMath(value, fromIndex) {
	return value.indexOf(DELIMITER, fromIndex);
}

function tokenizeInlineMath(eat, value, silent) {
	if (!value.startsWith(DELIMITER)) return false;
	const end = value.indexOf(DELIMITER, DELIMITER.length);
	const tex = value.slice(DELIMITER.length, end);
	if (end === -1 || !tex.trim()) return false;
	if (silent) return true;

	return eat(value.slice(0, end + DELIMITER.length))(
		mathNode(toSvelteHtml(renderMath(tex)), "inline"),
	);
}
tokenizeInlineMath.locator = locateInlineMath;

function tokenizeBlockMath(eat, value, silent) {
	const open = value.match(BLOCK_OPEN);
	if (!open) return false;

	const start = open[0].length;
	const lineEnd = value.indexOf("\n");
	const firstLine = value.slice(start, lineEnd === -1 ? undefined : lineEnd);
	const sameLineClose = firstLine.indexOf(DELIMITER);

	let tex;
	let length;
	if (sameLineClose !== -1) {
		if (firstLine.slice(sameLineClose + DELIMITER.length).trim()) return false;
		tex = firstLine.slice(0, sameLineClose);
		length = start + sameLineClose + DELIMITER.length;
	} else {
		const close = value.slice(start).match(/\n {0,3}\$\$[ \t]*(?=\n|$)/);
		if (!close) return false;
		tex = value.slice(start, start + close.index);
		length = start + close.index + close[0].length;
	}
	if (!tex.trim()) return false;
	if (silent) return true;

	return eat(value.slice(0, length))(mathNode(displayMath(tex), "display"));
}

function addTokenizer(prototype, kind, name, tokenizer, before) {
	const tokenizers = prototype[`${kind}Tokenizers`];
	const methods = prototype[`${kind}Methods`];
	if (methods.includes(name)) return;

	tokenizers[name] = tokenizer;
	methods.splice(methods.indexOf(before), 0, name);
}

/**
 * Remark plugin for TeX math, rendered with KaTeX at build time so posts ship
 * no math JavaScript. Only `$$` delimits math, never a single `$`, so prices
 * in prose stay text. `$$` alone on the lines around a formula makes display
 * math in a `MathBlock`, which the post imports; `$$` inside a paragraph makes
 * inline math. A post with math links the KaTeX stylesheet from its own head.
 * Importing the CSS directly would attach it to every post, since posts share
 * one dynamically imported route.
 */
export function remarkMath() {
	const prototype = this.Parser.prototype;
	addTokenizer(prototype, "block", "math", tokenizeBlockMath, "paragraph");
	addTokenizer(prototype, "inline", "math", tokenizeInlineMath, "autoLink");
	if (!prototype.interruptParagraph.some(([name]) => name === "math")) {
		prototype.interruptParagraph.push(["math"]);
	}

	return (tree) => {
		let hasMath = false;
		let hasDisplayMath = false;
		walk(tree, (node) => {
			const display =
				node.data?.math === "display" ||
				(node.type === "code" && isMathFence(node.lang));
			hasMath ||= display || node.data?.math === "inline";
			hasDisplayMath ||= display;
		});
		if (!hasMath) return;

		injectImports(tree, [
			{ name: STYLESHEET_NAME, specifier: STYLESHEET },
			...(hasDisplayMath
				? [{ name: "MathBlock", specifier: "#components/MathBlock.svelte" }]
				: []),
		]);
		tree.children.push({
			type: "html",
			value: `<svelte:head><link rel="stylesheet" href={${STYLESHEET_NAME}} /></svelte:head>`,
		});
	};
}

/** Whether a fence's language marks it as display math, as on GitHub. */
export function isMathFence(lang) {
	return lang?.toLowerCase() === "math";
}
