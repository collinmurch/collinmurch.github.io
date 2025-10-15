import adapter from "@sveltejs/adapter-static";
import { mdsvex } from "mdsvex";

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
        }),
    ],
};
