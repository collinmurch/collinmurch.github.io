import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
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
