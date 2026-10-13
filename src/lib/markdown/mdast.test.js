import { describe, expect, test } from "bun:test";
import { injectImports, textOf, walk } from "./mdast.js";

const text = (value) => ({ type: "text", value });
const imports = [{ name: "A", specifier: "$components/A.svelte" }];

describe("walk", () => {
	test("visits a node and everything beneath it in order", () => {
		const types = [];
		walk(
			{ type: "root", children: [{ type: "list", children: [text("a")] }] },
			(node) => types.push(node.type),
		);

		expect(types).toEqual(["root", "list", "text"]);
	});
});

describe("textOf", () => {
	test("joins text and inline code beneath a node", () => {
		const node = {
			type: "heading",
			children: [text("Run "), { type: "inlineCode", value: "make" }],
		};

		expect(textOf(node)).toBe("Run make");
	});
});

describe("injectImports", () => {
	test("creates an instance script when the post has none", () => {
		const tree = { type: "root", children: [text("Hi")] };
		injectImports(tree, imports);

		expect(tree.children[0]).toEqual({
			type: "html",
			value: '<script>\n\timport A from "$components/A.svelte";\n</script>',
		});
	});

	test("adds to an existing instance script", () => {
		const tree = {
			type: "root",
			children: [{ type: "html", value: "<script>\n</script>" }],
		};
		injectImports(tree, imports);

		expect(tree.children).toHaveLength(1);
		expect(tree.children[0].value).toContain("import A");
	});

	test("leaves the module script alone", () => {
		const tree = {
			type: "root",
			children: [{ type: "html", value: "<script module>\n</script>" }],
		};
		injectImports(tree, imports);

		expect(tree.children).toHaveLength(2);
		expect(tree.children[1].value).toBe("<script module>\n</script>");
	});
});
