import { createHash } from "node:crypto";
import { escapeHtml } from "./html.js";

const ROOT_TAG = /<svg\b[^>]*>/;
const IMPORT_RULE = /@import\s+(?:url\([^)]*\)|"[^"]*"|'[^']*')[^;]*;/g;
const ROOT_SELECTOR = /(^|[{},]\s*)svg(?=\s*[{,:.[#>+~\s])/g;

function readAttribute(tag, name) {
	return tag.match(new RegExp(`\\s${name}=(["'])(.*?)\\1`))?.[2];
}

function removeAttribute(tag, name) {
	return tag.replace(new RegExp(`\\s${name}=(["']).*?\\1`), "");
}

function readSize(tag) {
	const viewBox = readAttribute(tag, "viewBox")
		?.trim()
		.split(/[\s,]+/)
		.map(Number);
	if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
		return { width: viewBox[2], height: viewBox[3], viewBox: null };
	}

	const width = Number.parseFloat(readAttribute(tag, "width") ?? "");
	const height = Number.parseFloat(readAttribute(tag, "height") ?? "");
	if (width > 0 && height > 0) {
		return { width, height, viewBox: `0 0 ${width} ${height}` };
	}

	throw new Error("SVG needs a viewBox or a numeric width and height");
}

function accessibilityAttributes(label) {
	if (label) return ` role="img" aria-label="${escapeHtml(label)}"`;
	if (label === "") return ' aria-hidden="true"';
	return "";
}

/**
 * Selectors inside `@scope` only match descendants of the scoping root, so a
 * rule aimed at the root `svg` must name it as `:scope` instead.
 */
function scopeCss(css) {
	return css.replace(IMPORT_RULE, "").trim().replace(ROOT_SELECTOR, "$1:scope");
}

/**
 * Rounds to two decimals, which is finer than a pixel at any zoom we allow.
 */
export function round(value) {
	return Math.round(value * 100) / 100;
}

/**
 * Prepares SVG markup to be inlined into a page next to other SVGs.
 *
 * IDs are prefixed with a hash of the source so markers and gradients from two
 * figures on one page cannot collide, embedded styles are confined to the SVG
 * with a prelude-less `@scope`, external `@import`s are dropped, and the root
 * loses its fixed size so CSS can scale it from the returned dimensions.
 *
 * A non-empty `label` makes the SVG a labelled image, an empty one marks it
 * decorative, and leaving it out keeps its text readable by assistive tech.
 */
export function prepareSvg(source, { label } = {}) {
	let svg = source
		.replace(/<\?xml[\s\S]*?\?>/g, "")
		.replace(/<!DOCTYPE[\s\S]*?>/gi, "")
		.replace(/<!--[\s\S]*?-->/g, "")
		.trim();

	const rootTag = svg.match(ROOT_TAG)?.[0];
	if (!rootTag) throw new Error("Expected an <svg> element");

	const { width, height, viewBox } = readSize(rootTag);
	const extraAttributes =
		(viewBox ? ` viewBox="${viewBox}"` : "") + accessibilityAttributes(label);
	const nextRootTag = removeAttribute(
		removeAttribute(rootTag, "width"),
		"height",
	).replace(/^<svg/, `<svg${extraAttributes}`);

	const prefix = `s${createHash("sha256").update(source).digest("hex").slice(0, 8)}`;
	svg = svg
		.replace(rootTag, nextRootTag)
		.replace(/(\sid=)(["'])(.*?)\2/g, `$1$2${prefix}-$3$2`)
		.replace(/url\((["']?)#/g, `url($1#${prefix}-`)
		.replace(/(\s(?:xlink:)?href=)(["'])#/g, `$1$2#${prefix}-`)
		.replace(
			/<style([^>]*)>([\s\S]*?)<\/style>/g,
			(_match, attributes, css) =>
				`<style${attributes}>@scope{${scopeCss(css)}}</style>`,
		);

	return { svg, width: round(width), height: round(height) };
}
