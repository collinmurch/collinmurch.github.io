import adapter from "@sveltejs/adapter-static";
import { markdownPreprocessor } from "./src/lib/markdown/preprocess.js";

export default {
	kit: {
		adapter: adapter(),
		alias: {
			$components: "src/components",
		},
	},
	compilerOptions: {
		runes: true,
	},
	extensions: [".svelte", ".md"],
	preprocess: markdownPreprocessor(),
};
