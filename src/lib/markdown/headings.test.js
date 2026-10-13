import { describe, expect, test } from "bun:test";
import { remarkHeadings, slugify } from "./headings.js";

const text = (value) => ({ type: "text", value });
const heading = (...children) => ({ type: "heading", depth: 2, children });
const root = (...children) => ({ type: "root", children });

function idsOf(tree) {
	remarkHeadings()(tree);
	return tree.children
		.filter((node) => node.type === "heading")
		.map((node) => node.data.hProperties.id);
}

describe("slugify", () => {
	test("lowercases and hyphenates spaces", () => {
		expect(slugify("LLM Pipeline")).toBe("llm-pipeline");
	});

	test("drops punctuation", () => {
		expect(slugify("What's new? (2026)")).toBe("whats-new-2026");
	});

	test("keeps hyphens, underscores, and non-ASCII letters", () => {
		expect(slugify("snake_case-and Café")).toBe("snake_case-and-café");
	});
});

describe("remarkHeadings", () => {
	test("gives a heading an id from its text", () => {
		expect(idsOf(root(heading(text("Preview Generation"))))).toEqual([
			"preview-generation",
		]);
	});

	test("includes inline code and nested text", () => {
		const tree = root(
			heading(
				text("Run "),
				{ type: "inlineCode", value: "make" },
				{ type: "emphasis", children: [text(" now")] },
			),
		);
		expect(idsOf(tree)).toEqual(["run-make-now"]);
	});

	test("suffixes repeated headings", () => {
		const tree = root(
			heading(text("Notes")),
			heading(text("Notes")),
			heading(text("Notes")),
		);
		expect(idsOf(tree)).toEqual(["notes", "notes-1", "notes-2"]);
	});

	test("falls back when a heading has no sluggable text", () => {
		expect(idsOf(root(heading(text("!!!"))))).toEqual(["section"]);
	});

	test("keeps existing heading properties", () => {
		const node = heading(text("Kept"));
		node.data = { hProperties: { className: "x" } };
		remarkHeadings()(root(node));
		expect(node.data.hProperties).toEqual({
			className: ["x", "group/heading"],
			id: "kept",
			tabIndex: -1,
		});
	});

	test("makes a heading focusable on tap", () => {
		const node = heading(text("Intro"));
		remarkHeadings()(root(node));
		expect(node.data.hProperties.tabIndex).toBe(-1);
	});

	test("leaves other nodes alone", () => {
		const paragraph = { type: "paragraph", children: [text("Hi")] };
		remarkHeadings()(root(paragraph));
		expect(paragraph.data).toBeUndefined();
	});

	test("marks a heading as a hover group", () => {
		const node = heading(text("Intro"));
		remarkHeadings()(root(node));
		expect(node.data.hProperties.className).toEqual(["group/heading"]);
	});

	test("ends a heading with a link to its section", () => {
		const node = heading(text("Intro"));
		remarkHeadings()(root(node));
		expect(node.children.at(-1)).toEqual({
			type: "html",
			value: '<HeadingLink id="intro" label={"Copy link to section: Intro"} />',
		});
	});

	test("passes the link's label as a string, quotes and braces included", () => {
		const node = heading(text('Say "hi" {now}'));
		remarkHeadings()(root(node));
		expect(node.children.at(-1).value).toContain(
			'label={"Copy link to section: Say \\"hi\\" {now}"}',
		);
	});

	test("imports HeadingLink when the post has headings", () => {
		const tree = root(heading(text("Intro")));
		remarkHeadings()(tree);
		expect(tree.children[0].value).toContain(
			'import HeadingLink from "#components/HeadingLink.svelte";',
		);
	});

	test("adds no import to a post without headings", () => {
		const tree = root({ type: "paragraph", children: [text("Hi")] });
		remarkHeadings()(tree);
		expect(tree.children).toHaveLength(1);
	});
});
