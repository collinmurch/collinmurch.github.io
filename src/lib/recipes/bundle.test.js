import { describe, expect, test } from "bun:test";
import { jsonLdScript, parseIndex, planTitle, summarize, withUrl } from "./bundle";

const EMPTY_INDEX = { schema: 1, commit: null, recipes: [], plans: [], vocab: [] };

const carnitas = {
	slug: "pork-carnitas",
	kind: "recipe",
	path: "recipes/pork-carnitas.cook",
	title: "Pork Carnitas",
	course: "main",
	cuisine: "mexican",
	servings: 4,
	time_total: 240,
	leftovers: "great",
	proteins: ["pork"],
	ingredients: [],
	cookware: [],
	sections: [],
	last_cooked: null,
	times_cooked: 0,
};

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

describe("summarize", () => {
	test("keeps the listing's fields", () => {
		expect(summarize(carnitas)).toEqual({
			slug: "pork-carnitas",
			title: "Pork Carnitas",
			kind: "recipe",
			course: "main",
			cuisine: "mexican",
			proteins: ["pork"],
			time: 240,
			leftovers: "great",
			description: null,
		});
	});

	test("leaves out the method", () => {
		expect(summarize(carnitas)).not.toHaveProperty("sections");
	});

	test("gives a drink without a total time a null time", () => {
		const { time_total: _, ...manhattan } = { ...carnitas, kind: "drink" };
		expect(summarize(manhattan).time).toBeNull();
	});
});

describe("planTitle", () => {
	test("prefers the plan's title", () => {
		expect(
			planTitle({ title: "Thanksgiving", name: "turkey", start: "2026-11-26" }),
		).toBe("Thanksgiving");
	});

	test("names a one-off plan from its id", () => {
		expect(planTitle({ title: null, name: "christmas-eve", start: "2026-12-24" })).toBe(
			"christmas eve",
		);
	});

	test("names a week by its start", () => {
		expect(planTitle({ title: null, name: null, start: "2026-10-12" })).toBe(
			"Week of 2026-10-12",
		);
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
