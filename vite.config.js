import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { markdownPreprocessor } from "./src/lib/markdown/preprocess.js";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			compilerOptions: {
				runes: true,
			},
			extensions: [".svelte", ".md"],
			preprocess: markdownPreprocessor(),
		}),
	],
});
