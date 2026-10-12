import { describe, expect, test } from "bun:test";
import { highlight } from "./highlight.js";

describe("highlight", () => {
	test("highlights a known language with Shiki", async () => {
		const html = await highlight("const a = 1;", "js");

		expect(html).toContain('<pre class="shiki poimandres"');
	});

	test("wraps code in a block with a copy button", async () => {
		const html = await highlight("const a = 1;", "js");

		expect(html.startsWith('<div class="code-block"><button')).toBe(true);
	});

	test("removes Shiki's tabindex", async () => {
		expect(await highlight("const a = 1;", "js")).not.toContain("tabindex");
	});

	test("escapes braces for Svelte", async () => {
		const html = await highlight("function a() { return 1; }", "js");

		expect(html).not.toMatch(/[{}]/);
	});

	test("falls back to plain text for an unknown language", async () => {
		const html = await highlight("plain", "not-a-language");

		expect(html).toContain('<div class="code-block"><button');
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

	test("includes the highlighted source with a mermaid diagram", async () => {
		const html = await highlight("flowchart LR\n  A --> B", "mermaid");

		expect(html).toContain(
			'<div class=\\"diagram-source\\"><pre class=\\"shiki poimandres\\"',
		);
	});

	test("renders mermaid fences as diagrams", async () => {
		const html = await highlight("flowchart LR\n  A --> B", "mermaid");

		expect(html).toContain('class=\\"figure diagram\\"');
	});

	test("matches the mermaid language case-insensitively", async () => {
		expect(await highlight("flowchart LR\n  A --> B", "Mermaid")).toContain("diagram");
	});
});
