import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { markdownPreprocessor } from "./preprocess.js";

let directory;

async function compile(content, filename) {
	const [mdsvex, finish] = markdownPreprocessor();
	const { code } = await mdsvex.markup({ content, filename });
	return finish.markup({ content: code, filename });
}

beforeAll(() => {
	directory = mkdtempSync(join(tmpdir(), "markdown-preprocess-"));
	writeFileSync(join(directory, "drawing.svg"), '<svg viewBox="0 0 10 10"></svg>');
});

afterAll(() => {
	rmSync(directory, { recursive: true, force: true });
});

describe("markdownPreprocessor", () => {
	test("runs mdsvex before finishing the output", () => {
		expect(markdownPreprocessor().map((preprocessor) => preprocessor.name)).toEqual([
			"mdsvex",
			"markdown-finish",
		]);
	});

	test("writes front matter to a Svelte 5 module script", async () => {
		const { code } = await compile(
			"---\ntitle: Post\n---\n\nHello\n",
			join(directory, "post.md"),
		);

		expect(code).toContain("<script module>");
		expect(code).not.toContain('context="module"');
	});

	test("compiles headings and fences to components it imports", async () => {
		const { code } = await compile(
			"## Intro\n\n```js\nlet a;\n```\n",
			join(directory, "post.md"),
		);

		expect(code).toContain('import HeadingLink from "#components/HeadingLink.svelte";');
		expect(code).toContain('import CodeBlock from "#components/CodeBlock.svelte";');
		expect(code).toMatch(/<h2 id="intro"[^>]*>Intro<HeadingLink id="intro"/);
		expect(code).toContain("<CodeBlock>{@html ");
	});

	test("reports inlined SVGs as dependencies", async () => {
		const { dependencies } = await compile(
			"![Drawing](./drawing.svg)\n",
			join(directory, "post.md"),
		);

		expect(dependencies).toEqual([join(directory, "drawing.svg")]);
	});

	test("reports no dependencies for a post without inlined files", async () => {
		const { dependencies } = await compile("Hello\n", join(directory, "plain.md"));

		expect(dependencies).toEqual([]);
	});

	test("leaves Svelte components alone", () => {
		const [, finish] = markdownPreprocessor();

		expect(
			finish.markup({
				content: '<script context="module"></script>',
				filename: "/src/routes/+page.svelte",
			}),
		).toBeUndefined();
	});
});
