import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            $components: "/src/components",
        },
    },
    optimizeDeps: {
        include: ["mdsvex"],
        exclude: ["@sveltejs/kit"],
    },
    ssr: {
        noExternal: ["@sveltejs/kit"],
    },
});
