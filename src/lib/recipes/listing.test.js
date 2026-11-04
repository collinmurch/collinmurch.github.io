import { describe, expect, test } from "bun:test";
import {
	backTo,
	byCourse,
	courseOf,
	listPlans,
	listRecipes,
	matchesSearch,
	summarize,
} from "./listing";

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

describe("listRecipes", () => {
	const cooked = (slug, last_cooked, times_cooked) => ({
		...carnitas,
		slug,
		last_cooked,
		times_cooked,
	});

	test("puts the most recently cooked first", () => {
		const recipes = listRecipes([
			cooked("never", null, 0),
			cooked("spring", "2026-04-02", 1),
			cooked("summer", "2026-07-10", 1),
		]);
		expect(recipes.map(({ slug }) => slug)).toEqual(["summer", "spring", "never"]);
	});

	test("breaks a tie by how often it's been cooked", () => {
		const recipes = listRecipes([
			cooked("once", "2026-07-10", 1),
			cooked("often", "2026-07-10", 4),
		]);
		expect(recipes.map(({ slug }) => slug)).toEqual(["often", "once"]);
	});

	test("keeps the bundle's order otherwise", () => {
		const recipes = listRecipes([cooked("a", null, 0), cooked("b", null, 0)]);
		expect(recipes.map(({ slug }) => slug)).toEqual(["a", "b"]);
	});
});

describe("byCourse", () => {
	const recipe = (slug, course) => ({ slug, course });

	test("orders courses the way a menu reads", () => {
		const courses = byCourse([
			recipe("manhattan", "drink"),
			recipe("carnitas", "main"),
		]);
		expect(courses.map(({ label }) => label)).toEqual(["Mains", "Drinks"]);
	});

	test("keeps each course's recipes in order", () => {
		const courses = byCourse([
			recipe("a", "side"),
			recipe("b", "main"),
			recipe("c", "side"),
		]);
		expect(courses[1].recipes.map(({ slug }) => slug)).toEqual(["a", "c"]);
	});

	test("puts a course it doesn't know last, named after itself", () => {
		const courses = byCourse([recipe("a", "late-night"), recipe("b", "main")]);
		expect(courses.map(({ label }) => label)).toEqual(["Mains", "late night"]);
	});

	test("gives each known course a page slug", () => {
		const courses = byCourse([recipe("a", "main"), recipe("b", "late-night")]);
		expect(courses.map(({ slug }) => slug)).toEqual(["mains", undefined]);
	});
});

describe("courseOf", () => {
	test("reads a page slug as its course", () => {
		expect(courseOf("mains")).toBe("main");
		expect(courseOf("breakfast")).toBe("breakfast");
	});

	test("rejects anything else, such as a recipe's slug", () => {
		expect(courseOf("pork-carnitas")).toBeUndefined();
		expect(courseOf("main")).toBeUndefined();
	});
});

describe("matchesSearch", () => {
	const carnitas = { keywords: "pork carnitas mexican pork pork shoulder" };

	test("matches everything for an empty search", () => {
		expect(matchesSearch(carnitas, "  ")).toBe(true);
	});

	test("ignores case", () => {
		expect(matchesSearch(carnitas, "Mexican")).toBe(true);
	});

	test("matches part of a word", () => {
		expect(matchesSearch(carnitas, "carn")).toBe(true);
	});

	test("needs every word", () => {
		expect(matchesSearch(carnitas, "pork chicken")).toBe(false);
	});

	test("reads hyphens as spaces", () => {
		expect(matchesSearch(carnitas, "pork-shoulder")).toBe(true);
	});
});

describe("backTo", () => {
	const plans = [{ id: "2026-w44", title: "Week of fall" }];

	test("leads back to the listing, a course, or a plan", () => {
		expect(backTo("/recipes", plans)).toEqual({ href: "/recipes", label: "Recipes" });
		expect(backTo("/recipes/mains/", plans)).toEqual({
			href: "/recipes/mains",
			label: "Mains",
		});
		expect(backTo("/recipes/plans/2026-w44", plans)).toEqual({
			href: "/recipes/plans/2026-w44",
			label: "Week of fall",
		});
	});

	test("ignores recipes, unrelated plans, and other pages", () => {
		expect(backTo("/recipes/pork-carnitas", plans)).toBeNull();
		expect(backTo("/recipes/plans/other", plans)).toBeNull();
		expect(backTo("/recipes/mains/extra", plans)).toBeNull();
		expect(backTo("/blog", plans)).toBeNull();
		expect(backTo("/", plans)).toBeNull();
	});
});

describe("listPlans", () => {
	test("puts the newest plan first", () => {
		const plans = [
			{ id: "2026-10-12", start: "2026-10-12", meals: [] },
			{ id: "2026-10-19", start: "2026-10-19", meals: [] },
		];
		expect(listPlans(plans).map((plan) => plan.id)).toEqual([
			"2026-10-19",
			"2026-10-12",
		]);
	});
});
