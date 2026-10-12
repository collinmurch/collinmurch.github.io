import { escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";
import { COPY_BUTTON } from "./copy-button.js";
import { renderMermaid } from "./mermaid.js";
import { toSvelteHtml } from "./html.js";

const THEME = "poimandres";

/**
 * Drops the theme's background from `<pre>` so code blocks and diagrams share
 * the `--color-panel` token.
 */
const usePanelBackground = {
	pre(node) {
		node.properties.style = String(node.properties.style ?? "").replace(
			/background-color:[^;]*;?/,
			"",
		);
	},
};

const highlighter = await createHighlighter({ themes: [THEME], langs: [] });

async function loadLanguage(lang) {
	if (highlighter.getLoadedLanguages().includes(lang)) return lang;
	try {
		await highlighter.loadLanguage(lang);
		return lang;
	} catch {
		return "text";
	}
}

async function codeToHtml(code, lang) {
	return highlighter
		.codeToHtml(code, {
			theme: THEME,
			lang: await loadLanguage(lang),
			transformers: [usePanelBackground],
		})
		.replace(/\s*tabindex="0"/, "");
}

/**
 * mdsvex highlighter for fenced code. Code is highlighted with Shiki at build
 * time, and `mermaid` fences become prerendered SVG diagrams that keep their
 * highlighted source for the diagram's source view.
 */
export async function highlight(code, lang) {
	const normalisedLang = lang?.toLowerCase() || "text";
	const html = await codeToHtml(code, normalisedLang);

	if (normalisedLang === "mermaid") {
		return toSvelteHtml(renderMermaid(code, { sourceHtml: html }));
	}
	return escapeSvelte(`<div class="code-block">${COPY_BUTTON}${html}</div>`);
}
