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

    return escapeSvelte(styled);
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
