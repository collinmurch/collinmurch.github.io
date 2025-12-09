import adapter from "@sveltejs/adapter-static";
import { mdsvex, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";

const highlighter = await createHighlighter({
	themes: ["poimandres"],
});

async function highlightWithShiki(code, lang = "text") {
	const normalisedLang = lang?.toLowerCase?.() || "text";

	if (!highlighter.getLoadedLanguages().includes(normalisedLang)) {
		try {
			await highlighter.loadLanguage(normalisedLang);
		} catch {
			const fallbackHtml = highlighter.codeToHtml(code, {
				theme: "poimandres",
				lang: "text",
			});
			return escapeSvelte(fallbackHtml.replace(/\s*tabindex="0"/, ""));
		}
	}

	const html = highlighter.codeToHtml(code, {
		theme: "poimandres",
		lang: normalisedLang,
	});

	// Shiki sets tabindex="0" on <pre>, which triggers Svelte's a11y warnings for noninteractive elements.
	const cleaned = html.replace(/\s*tabindex="0"/, "");

	const styleEnhancements =
		"border-radius:0.9rem;border:1px solid rgba(137,221,255,0.25);" +
		"box-shadow:0 10px 30px rgba(7,12,18,0.45);max-width:100%;" +
		"overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;" +
		"scrollbar-gutter:stable both-edges;padding:1.25rem 1.5rem;";

	let styled = cleaned.replace(
		/(<pre[^>]*style=")([^"]*)"/,
		(_match, prefix, styles) =>
			`${prefix}${styles.trim().replace(/;?$/, ";")}${styleEnhancements}"`,
	);

	if (styled === cleaned) {
		styled = cleaned.replace(
			/<pre class="([^"]*)"/,
			`<pre class="$1" style="${styleEnhancements}"`,
		);
	}

	const copyButton =
		'<button type="button" class="code-copy-btn" aria-live="polite" aria-label="Copy code" title="Copy code" data-copy-btn data-default-label="Copy code" data-success-label="Copied!" data-error-label="Copy failed"><span class="copy-icon" aria-hidden="true"><svg class="copy-icon-default" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2.4" ry="2.4"></rect><path d="M5 15H4.2A2.2 2.2 0 0 1 2 12.8V4.2A2.2 2.2 0 0 1 4.2 2h8.6A2.2 2.2 0 0 1 15 4.2V5"></path></svg><svg class="copy-icon-success" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 10.5 16.5 6 12"></path></svg></span><span class="sr-only copy-announce">Copy code</span></button>';

	const wrapped = `<div class="code-block relative group">${copyButton}${styled}</div>`;

	return escapeSvelte(wrapped);
}

export default {
	kit: {
		adapter: adapter({
			pages: "build",
			assets: "build",
			fallback: undefined,
			precompress: true,
			strict: true,
		}),
	},
	compilerOptions: {
		runes: true,
		warningFilter: (warning) => warning.code !== "script_context_deprecated",
	},
	extensions: [".svelte", ".md"], // Include .md files and the .svelte files from MDsveX
	preprocess: [
		mdsvex({
			extensions: [".md"],
			highlight: {
				highlighter: highlightWithShiki,
			},
		}),
	],
};
