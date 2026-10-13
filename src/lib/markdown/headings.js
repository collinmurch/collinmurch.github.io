import { injectImports, textOf, walk } from "./mdast.js";

/**
 * Turns heading text into a GitHub-style anchor slug: lowercase, punctuation
 * dropped, spaces replaced with hyphens.
 */
export function slugify(text) {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s_-]/gu, "")
		.replace(/\s/g, "-");
}

/**
 * Remark plugin for post headings. Each gets a GitHub-style id, so posts can
 * link to their own sections with `[text](#heading-text)`, and repeated
 * headings get a numeric suffix. Each also ends with a `HeadingLink` that
 * copies a link to its section, and marks itself `group/heading` so the link
 * shows on hover. Headings take focus on tap (`tabindex="-1"`), so touch
 * screens without hover reveal the link by tapping the heading.
 */
export function remarkHeadings() {
	return (tree) => {
		const seen = new Map();

		walk(tree, (node) => {
			if (node.type !== "heading") return;

			const text = textOf(node);
			const base = slugify(text) || "section";
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			const id = count ? `${base}-${count}` : base;

			const properties = node.data?.hProperties ?? {};
			node.data = {
				...node.data,
				hProperties: {
					...properties,
					id,
					tabIndex: -1,
					className: [properties.className, "group/heading"].flat().filter(Boolean),
				},
			};

			const label = JSON.stringify(`Copy link to section: ${text}`);
			node.children.push({
				type: "html",
				value: `<HeadingLink id="${id}" label={${label}} />`,
			});
		});

		if (seen.size) {
			injectImports(tree, [
				{ name: "HeadingLink", specifier: "#components/HeadingLink.svelte" },
			]);
		}
	};
}
