import pluginSvelte from "prettier-plugin-svelte";

/** @type {import("prettier").Config} */
const config = {
    plugins: [pluginSvelte],
    printWidth: 88,
    singleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    tabWidth: 4,
};

export default config;
