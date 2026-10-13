import { describe, expect, test } from "bun:test";
import { highlight, remarkCodeImports } from "./highlight.js";

describe("highlight", () => {
	test("highlights a known language with Shiki", async () => {
		const html = await highlight("const a = 1;", "js");

		expect(html).toContain('<pre class=\\"shiki poimandres\\"');
	});

	test("wraps code in a CodeBlock", async () => {
		const html = await highlight("const a = 1;", "js");

		expect(html).toMatch(/^<CodeBlock>\{@html ".*"\}<\/CodeBlock>$/s);
	});

	test("removes Shiki's tabindex", async () => {
		expect(await highlight("const a = 1;", "js")).not.toContain("tabindex");
	});

	test("passes the code to Svelte as a string, braces and all", async () => {
		const html = await highlight("function a() { return 1; }", "js");
		const markup = JSON.parse(
			html.slice("<CodeBlock>{@html ".length, -"}</CodeBlock>".length),
		);

		expect(markup).toContain("{");
		expect(markup).toContain("}");
	});

	test("falls back to plain text for an unknown language", async () => {
		const html = await highlight("plain", "not-a-language");

		expect(html.startsWith("<CodeBlock>")).toBe(true);
		expect(html).toContain("plain");
	});

	test("treats a missing language as plain text", async () => {
		expect(await highlight("plain")).toContain("plain");
	});

	test("leaves the background to the panel token", async () => {
		const pre = (await highlight("const a = 1;", "js")).match(/<pre[^>]*>/)[0];

		expect(pre).not.toContain("background-color");
		expect(pre).toContain("color:");
	});

	test("passes a mermaid diagram its highlighted source", async () => {
		const html = await highlight("flowchart LR\n  A --> B", "mermaid");

		expect(html).toContain(' source={"<pre class=\\"shiki poimandres\\"');
	});

	test("renders mermaid fences as diagrams with their natural size", async () => {
		const html = await highlight("flowchart LR\n  A --> B", "mermaid");

		expect(html).toMatch(/^<Diagram width=\{[\d.]+\} height=\{[\d.]+\} source=/);
		expect(html).toContain('>{@html "<div class=\\"diagram-viewport\\"');
		expect(html.endsWith("</Diagram>")).toBe(true);
	});

	test("passes a mermaid title as the diagram's caption", async () => {
		const html = await highlight(
			'---\ntitle: Flow "&" go\n---\nflowchart LR\n  A --> B',
			"mermaid",
		);

		expect(html).toContain('caption={"Flow \\"&\\" go"} source=');
	});

	test("matches the mermaid language case-insensitively", async () => {
		expect(await highlight("flowchart LR\n  A --> B", "Mermaid")).toContain("diagram");
	});
});

describe("remarkCodeImports", () => {
	const code = (lang) => ({ type: "code", lang, value: "" });
	const importsOf = (...children) => {
		const tree = { type: "root", children };
		remarkCodeImports()(tree);
		return tree.children[0].type === "html" ? tree.children[0].value : "";
	};

	test("imports CodeBlock for a code fence", () => {
		expect(importsOf(code("js"))).toContain(
			'import CodeBlock from "$components/CodeBlock.svelte";',
		);
	});

	test("imports Diagram for a mermaid fence", () => {
		const imports = importsOf(code("Mermaid"));

		expect(imports).toContain('import Diagram from "$components/Diagram.svelte";');
		expect(imports).not.toContain("CodeBlock");
	});

	test("finds fences nested in other blocks", () => {
		expect(importsOf({ type: "blockquote", children: [code(null)] })).toContain(
			"import CodeBlock",
		);
	});

	test("imports each component once", () => {
		expect(importsOf(code("js"), code("ts")).match(/import CodeBlock/g)).toHaveLength(
			1,
		);
	});

	test("adds nothing to a post without fences", () => {
		expect(importsOf({ type: "paragraph", children: [] })).toBe("");
	});
});
