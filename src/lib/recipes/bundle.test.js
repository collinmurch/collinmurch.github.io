import { describe, expect, test } from "bun:test";
import {
	jsonLdScript,
	parseIndex,
	planTitle,
	summarize,
	unitsUsed,
	withUrl,
} from "./bundle";

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
	tags: ["freezer-friendly"],
	proteins: ["pork"],
	ingredients: [
		{
			section: null,
			items: [
				{
					name: "pork-shoulder",
					text: "boston butt",
					amounts: [{ value: 1.5, unit: "kg" }],
				},
				{ name: "salt", text: "salt", amounts: [] },
			],
		},
	],
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
	test("keeps what a card shows", () => {
		expect(summarize(carnitas)).toMatchObject({
			slug: "pork-carnitas",
			title: "Pork Carnitas",
			course: "main",
			cuisine: "mexican",
			time: 240,
			description: null,
		});
	});

	test("leaves out the method", () => {
		expect(summarize(carnitas)).not.toHaveProperty("sections");
	});

	test("leaves out how well it keeps", () => {
		expect(summarize(carnitas)).not.toHaveProperty("leftovers");
	});

	test("gives a drink without a total time a null time", () => {
		const { time_total: _, ...manhattan } = { ...carnitas, kind: "drink" };
		expect(summarize(manhattan).time).toBeNull();
	});

	test("searches the title, cuisine, protein, and tags", () => {
		const { keywords } = summarize(carnitas);
		for (const word of ["carnitas", "mexican", "pork", "freezer friendly"]) {
			expect(keywords).toContain(word);
		}
	});

	test("searches ingredients as written and by name", () => {
		const { keywords } = summarize(carnitas);
		expect(keywords).toContain("boston butt");
		expect(keywords).toContain("pork shoulder");
	});
});

describe("unitsUsed", () => {
	test("keeps only the units a recipe names", () => {
		const units = {
			kg: { plural: null, metric: true },
			cup: { plural: "cups", metric: false },
		};
		expect(unitsUsed(carnitas, units)).toEqual({ kg: units.kg });
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
