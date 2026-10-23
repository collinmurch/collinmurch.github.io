import { describe, expect, test } from "bun:test";
import { jsonLdScript, parseIndex, sourceUrl, withUrl } from "./bundle";

const EMPTY_INDEX = { schema: 1, commit: null, recipes: [], plans: [], vocab: [] };

describe("parseIndex", () => {
	test("accepts schema 1", () => {
		expect(parseIndex(JSON.stringify(EMPTY_INDEX)).recipes).toEqual([]);
	});

	test("rejects a newer schema", () => {
		expect(() => parseIndex(JSON.stringify({ ...EMPTY_INDEX, schema: 2 }))).toThrow(
			"schema 2",
		);
	});

	test("rejects an index without a schema", () => {
		expect(() => parseIndex("{}")).toThrow("schema undefined");
	});

	test("rejects a schema written as a string", () => {
		expect(() => parseIndex(JSON.stringify({ ...EMPTY_INDEX, schema: "1" }))).toThrow(
			'schema "1"',
		);
	});

	test("rejects malformed JSON", () => {
		expect(() => parseIndex("{")).toThrow();
	});
});

describe("sourceUrl", () => {
	const recipe = { path: "recipes/jambalaya.cook" };

	test("links to the file at the bundle's commit", () => {
		expect(sourceUrl({ commit: "e2a7cf6" }, recipe)).toBe(
			"https://raw.githubusercontent.com/collinmurch/recipes/e2a7cf6/recipes/jambalaya.cook",
		);
	});

	test("links to main for a local build", () => {
		expect(sourceUrl({ commit: null }, recipe)).toContain("/recipes/main/");
	});
});

describe("withUrl", () => {
	test("adds the page url", () => {
		expect(
			withUrl({ name: "Jambalaya" }, "https://example.com/recipes/jambalaya"),
		).toEqual({
			name: "Jambalaya",
			url: "https://example.com/recipes/jambalaya",
		});
	});

	test("does not change the bundle's object", () => {
		const jsonLd = { name: "Jambalaya" };
		withUrl(jsonLd, "https://example.com/recipes/jambalaya");
		expect(jsonLd).toEqual({ name: "Jambalaya" });
	});
});

describe("jsonLdScript", () => {
	test("wraps the data in a JSON-LD script tag", () => {
		expect(jsonLdScript({ name: "Jambalaya" })).toBe(
			'<script type="application/ld+json">{"name":"Jambalaya"}</script>',
		);
	});

	test("escapes a closing script tag in the data", () => {
		expect(jsonLdScript({ name: "</script>" })).not.toContain("</script><");
	});

	test("still parses back to the same data", () => {
		const html = jsonLdScript({ name: "a < b" });
		const json = html.slice(html.indexOf(">") + 1, html.lastIndexOf("<"));
		expect(JSON.parse(json)).toEqual({ name: "a < b" });
	});
});
