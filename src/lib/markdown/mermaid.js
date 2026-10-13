import { renderMermaidSVG } from "beautiful-mermaid";
import { parse as parseYaml } from "yaml";
import { escapeHtml } from "./html.js";
import { sketchSvg } from "./sketch.js";
import { prepareSvg, round } from "./svg.js";

/**
 * Diagram colors are site tokens rather than literal colors, so diagrams follow
 * `app.css`. beautiful-mermaid derives every other shade from these with
 * `color-mix()`.
 */
const THEME = {
	bg: "var(--color-panel)",
	fg: "var(--color-foreground)",
	accent: "var(--color-accent)",
	border: "var(--color-border)",
	transparent: true,
};

const GEOMETRY_ATTRIBUTE =
	/(\s(?:x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|dx|dy|width|height|points|d|viewBox|transform)=")([^"]*)"/g;

function roundGeometry(svg) {
	return svg.replace(
		GEOMETRY_ATTRIBUTE,
		(_match, start, value) =>
			`${start}${value.replace(/-?\d+\.\d{3,}/g, (number) => String(round(Number(number))))}"`,
	);
}

function removeFontRules(svg) {
	return svg.replace(/^\s*(?:text|\.mono)\s*\{\s*font-family:[^}]*\}\s*$/gm, "");
}

const FRONT_MATTER = /^\s*---[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*---[ \t]*(?:\r?\n|$)/;

/**
 * Splits Mermaid's YAML front matter from the diagram. beautiful-mermaid
 * rejects front matter, so it is read here instead.
 *
 * `title` and `config.look: handDrawn` (with `config.handDrawnSeed`) are
 * honored. Theme and font settings are ignored, since diagrams always use the
 * site's color tokens and font.
 */
export function extractFrontMatter(source) {
	const match = source.match(FRONT_MATTER);
	if (!match) return { body: source, title: "", look: "classic", seed: 1 };

	const data = parseYaml(match[1]) ?? {};
	const config = data.config ?? {};
	return {
		body: source.slice(match[0].length),
		title: typeof data.title === "string" ? data.title.trim() : "",
		look: config.look === "handDrawn" ? "handDrawn" : "classic",
		seed: Number.isInteger(config.handDrawnSeed) ? config.handDrawnSeed : 1,
	};
}

/**
 * Pulls Mermaid's accessibility lines out of the source. beautiful-mermaid
 * does not understand them and would draw them as nodes.
 */
export function extractAccessibility(source) {
	let title = "";
	let description = "";

	const body = source
		.replace(/^\s*accDescr\s*\{([\s\S]*?)\}\s*$/m, (_match, text) => {
			description = text.trim().replace(/\s+/g, " ");
			return "";
		})
		.replace(/^\s*acc(Title|Descr)\s*:\s*(.*)$/gm, (_match, kind, text) => {
			if (kind === "Title") title = text.trim();
			else description = text.trim();
			return "";
		});

	return { body, label: [title, description].filter(Boolean).join(". ") };
}

/**
 * Renders a Mermaid diagram to a themed, self-contained SVG at build time, so
 * pages ship no diagram renderer. Invalid diagrams fail the build.
 *
 * Returns the parts `Diagram.svelte` assembles: the `body`, which holds the SVG
 * in a focusable scroll viewport; the drawing's natural `width` and `height`;
 * and a `caption` from the front matter `title`. The title also labels the
 * diagram when it has no `accTitle`.
 */
export function renderMermaid(source) {
	let svg;
	let title;
	let label;
	try {
		const frontMatter = extractFrontMatter(source);
		const accessibility = extractAccessibility(frontMatter.body);
		title = frontMatter.title;
		label = accessibility.label || title;
		svg = renderMermaidSVG(accessibility.body, THEME);
		if (frontMatter.look === "handDrawn")
			svg = sketchSvg(svg, { seed: frontMatter.seed });
	} catch (error) {
		throw new Error(
			`Could not render Mermaid diagram: ${error.message}\n${source.trim()}`,
			{ cause: error },
		);
	}

	const prepared = prepareSvg(roundGeometry(removeFontRules(svg)), {
		label: label || undefined,
	});
	const viewportLabel = label ? `Diagram: ${escapeHtml(label)}` : "Diagram";
	return {
		body: `<div class="diagram-viewport" tabindex="0" role="region" aria-label="${viewportLabel}">${prepared.svg}</div>`,
		width: prepared.width,
		height: prepared.height,
		caption: title,
	};
}
