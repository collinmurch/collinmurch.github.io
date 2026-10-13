import { describe, expect, test } from "bun:test";
import { markdownPreprocessor } from "./preprocess.js";
import { displayMath, isMathFence, renderMath } from "./math.js";

async function compile(content) {
	const [mdsvex] = markdownPreprocessor();
	const { code } = await mdsvex.markup({ content, filename: "post.md" });
	return code;
}

describe("renderMath", () => {
	test("renders TeX to KaTeX HTML", () => {
		expect(renderMath("x^2")).toContain('class="katex"');
	});

	test("renders inline by default", () => {
		expect(renderMath("x")).not.toContain("katex-display");
	});

	test("renders display math when asked", () => {
		expect(renderMath("x", { display: true })).toContain("katex-display");
	});

	test("throws on invalid TeX", () => {
		expect(() => renderMath("\\frac{")).toThrow();
	});
});

describe("displayMath", () => {
	test("wraps display math in a MathBlock", () => {
		expect(displayMath("x")).toMatch(
			/^<MathBlock tex=\{.*\}>\{@html ".*"\}<\/MathBlock>$/s,
		);
	});

	test("passes the trimmed TeX source for copying", () => {
		expect(displayMath("\n  x^2  \n")).toStartWith('<MathBlock tex={"x^2"}>');
	});

	test("passes the TeX source as a string, braces and all", () => {
		const html = displayMath("\\frac{a}{b}");
		const source = html.slice("<MathBlock tex={".length, html.indexOf("}>{@html"));

		expect(JSON.parse(source)).toBe("\\frac{a}{b}");
	});

	test("passes the markup to Svelte inside a string", () => {
		const html = displayMath("\\{x\\}");
		const markup = JSON.parse(
			html.slice(html.indexOf("{@html ") + "{@html ".length, -"}</MathBlock>".length),
		);

		expect(markup).toContain("{");
	});
});

describe("isMathFence", () => {
	test("matches math fences in any case", () => {
		expect(isMathFence("Math")).toBe(true);
	});

	test("ignores other languages", () => {
		expect(isMathFence("js")).toBe(false);
	});

	test("ignores fences without a language", () => {
		expect(isMathFence(undefined)).toBe(false);
	});
});

describe("remarkMath", () => {
	test("renders $$ inside a paragraph as inline math", async () => {
		const code = await compile("Euler: $$e^{i\\pi} + 1 = 0$$ holds.\n");

		expect(code).toContain('class=\\"katex\\"');
		expect(code).not.toContain("MathBlock");
	});

	test("keeps underscores in inline math out of emphasis", async () => {
		const code = await compile("Let $$a_i + b_i$$ be given.\n");

		expect(code).not.toContain("<em>");
	});

	test("leaves single dollars as text", async () => {
		const code = await compile("It costs $3, not $99.\n");

		expect(code).toContain("It costs $3, not $99.");
		expect(code).not.toContain("katex");
	});

	test("leaves an unclosed $$ as text", async () => {
		const code = await compile("Just $$ here.\n");

		expect(code).toContain("Just $$ here.");
	});

	test("renders $$ lines around a formula as display math", async () => {
		const code = await compile("$$\n\\sum_{i=1}^n i\n$$\n");

		expect(code).toContain("<MathBlock ");
	});

	test("keeps markdown syntax inside display math as TeX", async () => {
		const code = await compile("$$\na\n- b\n$$\n");

		expect(code).not.toContain("<li>");
		expect(code).toContain("<MathBlock ");
	});

	test("renders a one-line $$ block as display math", async () => {
		const code = await compile("$$ x = 1 $$\n");

		expect(code).toContain("<MathBlock ");
	});

	test("lets display math interrupt a paragraph", async () => {
		const code = await compile("Consider\n$$\nx\n$$\n");

		expect(code).toContain("<MathBlock ");
	});

	test("renders math fences as display math", async () => {
		const code = await compile("```math\nx^2\n```\n");

		expect(code).toContain("<MathBlock ");
		expect(code).not.toContain("CodeBlock");
	});

	test("leaves $$ in inline code alone", async () => {
		const code = await compile("Write `$$x$$` for math.\n");

		expect(code).not.toContain("katex");
	});

	test("imports the KaTeX stylesheet's URL when a post has math", async () => {
		const code = await compile("$$x$$\n");

		expect(code).toContain(
			'import katexStylesheet from "katex/dist/katex.min.css?url";',
		);
	});

	test("links the stylesheet from the post's head", async () => {
		const code = await compile("$$x$$\n");

		expect(code).toContain(
			'<svelte:head><link rel="stylesheet" href={katexStylesheet} /></svelte:head>',
		);
	});

	test("links the stylesheet for math fences", async () => {
		const code = await compile("```math\nx\n```\n");

		expect(code).toContain("katexStylesheet");
	});

	test("imports MathBlock when a post has display math", async () => {
		const code = await compile("$$\nx\n$$\n");

		expect(code).toContain('import MathBlock from "#components/MathBlock.svelte";');
	});

	test("imports MathBlock for math fences", async () => {
		const code = await compile("```math\nx\n```\n");

		expect(code).toContain('import MathBlock from "#components/MathBlock.svelte";');
	});

	test("skips MathBlock when a post only has inline math", async () => {
		const code = await compile("Inline $$x$$ only.\n");

		expect(code).not.toContain("MathBlock");
		expect(code).toContain("katexStylesheet");
	});

	test("skips the stylesheet when a post has no math", async () => {
		const code = await compile("No math here.\n");

		expect(code).not.toContain("katex");
	});

	test("fails on invalid TeX", async () => {
		await expect(compile("$$\\frac{$$\n")).rejects.toThrow();
	});
});
