import adapter from "@sveltejs/adapter-static";
import { markdownPreprocessor } from "./src/lib/markdown/highlighter.js";

export default {
	kit: {
		adapter: adapter({
			pages: "build",
			assets: "build",
			fallback: undefined,
			precompress: false,
			strict: true,
		}),
	},
	compilerOptions: {
		runes: true,
		warningFilter: (warning) => warning.code !== "script_context_deprecated",
	},
	extensions: [".svelte", ".md"],
	preprocess: [markdownPreprocessor()],
};
