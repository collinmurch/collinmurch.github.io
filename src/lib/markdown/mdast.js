const INSTANCE_SCRIPT = /^<script(?![^>]*\b(?:context|module)\b)[^>]*>/;

/** Calls `visit` on a Markdown node and every node beneath it. */
export function walk(node, visit) {
	visit(node);
	for (const child of node.children ?? []) walk(child, visit);
}

/** Returns a Markdown node's plain text, including inline code. */
export function textOf(node) {
	if (node.type === "text" || node.type === "inlineCode") return node.value;
	return (node.children ?? []).map(textOf).join("");
}

/**
 * Adds default imports to a post's instance script, creating the script when
 * the post has none.
 *
 * @param {object} tree The post's Markdown syntax tree.
 * @param {{ name: string, specifier: string }[]} imports
 */
export function injectImports(tree, imports) {
	const statements = imports
		.map(({ name, specifier }) => `\timport ${name} from ${JSON.stringify(specifier)};`)
		.join("\n");
	const script = tree.children.find(
		(node) => node.type === "html" && INSTANCE_SCRIPT.test(node.value),
	);

	if (script) {
		script.value = script.value.replace(
			INSTANCE_SCRIPT,
			(tag) => `${tag}\n${statements}`,
		);
	} else {
		tree.children.unshift({
			type: "html",
			value: `<script>\n${statements}\n</script>`,
		});
	}
}
