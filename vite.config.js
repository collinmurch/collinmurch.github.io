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
			prerender: {
				// Recipe and plan pages exist only for what the bundle holds, which
				// can be nothing, such as before the first plan is written.
				handleUnseenRoutes({ routes, message }) {
					if (routes.some((route) => !route.startsWith("/recipes/"))) {
						throw new Error(message);
					}
				},
			},
			preprocess: markdownPreprocessor(),
		}),
	],
});
