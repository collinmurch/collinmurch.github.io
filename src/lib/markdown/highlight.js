import { createHighlighter } from "shiki";
import { renderMermaid } from "./mermaid.js";
import { toSvelteHtml } from "./html.js";
import { injectImports, walk } from "./mdast.js";

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
 * time and wrapped in a `CodeBlock`, and `mermaid` fences become prerendered
 * SVG `Diagram`s that carry their highlighted source for the source view.
 * `remarkCodeImports` imports both into the post.
 */
export async function highlight(code, lang) {
	const language = lang?.toLowerCase() || "text";
	const html = await codeToHtml(code, language);

	if (language === "mermaid") {
		const { body, width, height, caption } = renderMermaid(code);
		const captionProp = caption ? ` caption={${JSON.stringify(caption)}}` : "";
		return `<Diagram width={${width}} height={${height}}${captionProp} source={${JSON.stringify(html)}}>${toSvelteHtml(body)}</Diagram>`;
	}
	return `<CodeBlock>${toSvelteHtml(html)}</CodeBlock>`;
}

/**
 * Remark plugin that imports the components `highlight` wraps fences in:
 * `CodeBlock` for code and `Diagram` for Mermaid.
 */
export function remarkCodeImports() {
	return (tree) => {
		const imports = new Map();
		walk(tree, (node) => {
			if (node.type !== "code") return;
			const component =
				node.lang?.toLowerCase() === "mermaid" ? "Diagram" : "CodeBlock";
			imports.set(component, {
				name: component,
				specifier: `#components/${component}.svelte`,
			});
		});
		if (imports.size) injectImports(tree, [...imports.values()]);
	};
}
