import { renderMermaidSVG } from "beautiful-mermaid";
import { escapeHtml, figure } from "./html.js";
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
 * Renders a Mermaid diagram to a themed, self-contained SVG figure at build
 * time, so pages ship no diagram renderer. Invalid diagrams fail the build.
 *
 * The SVG sits in a focusable scroll viewport, and `sourceHtml`, the
 * highlighted diagram source, sits hidden beside it. `diagram-controls.js`
 * adds the toolbar that zooms and switches between them.
 */
export function renderMermaid(source, { sourceHtml = "" } = {}) {
	const { body, label } = extractAccessibility(source);

	let svg;
	try {
		svg = renderMermaidSVG(body, THEME);
	} catch (error) {
		throw new Error(`Could not render Mermaid diagram:\n${source.trim()}`, {
			cause: error,
		});
	}

	const prepared = prepareSvg(roundGeometry(removeFontRules(svg)), {
		label: label || undefined,
	});
	const viewportLabel = label ? `Diagram: ${escapeHtml(label)}` : "Diagram";
	return figure(
		`<div class="diagram-viewport" tabindex="0" role="region" aria-label="${viewportLabel}">${prepared.svg}</div><div class="diagram-source">${sourceHtml}</div>`,
		{ className: "diagram", size: prepared },
	);
}
