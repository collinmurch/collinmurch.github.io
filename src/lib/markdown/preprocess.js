import { mdsvex } from "mdsvex";
import { highlight } from "./highlight.js";
import { remarkImages } from "./images.js";

const EXTENSIONS = [".md"];

const isMarkdown = (filename) =>
	EXTENSIONS.some((extension) => filename?.endsWith(extension));

/**
 * Runs after mdsvex. mdsvex still emits the Svelte 4 `<script context="module">`
 * for front matter, so this rewrites it to keep posts on Svelte 5 syntax
 * without silencing the deprecation for every component. It also reports the
 * files a post inlined so Vite reloads the post when they change.
 */
function finishMarkdown(dependencies) {
	return {
		name: "markdown-finish",
		markup({ content, filename }) {
			if (!isMarkdown(filename)) return;

			const files = [...(dependencies.get(filename) ?? [])];
			dependencies.delete(filename);
			return {
				code: content.replace(/<script context="module">/g, "<script module>"),
				dependencies: files,
			};
		},
	};
}

/**
 * Svelte preprocessors that compile Markdown posts: mdsvex with build-time
 * code highlighting, Mermaid diagrams, and post-relative images.
 */
export function markdownPreprocessor() {
	const dependencies = new Map();
	const onInline = (filename, path) => {
		if (!dependencies.has(filename)) dependencies.set(filename, new Set());
		dependencies.get(filename).add(path);
	};

	return [
		mdsvex({
			extensions: EXTENSIONS,
			highlight: { highlighter: highlight },
			remarkPlugins: [[remarkImages, { onInline }]],
		}),
		finishMarkdown(dependencies),
	];
}
