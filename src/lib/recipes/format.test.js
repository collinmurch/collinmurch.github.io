import { describe, expect, test } from "bun:test";
import {
	describeSource,
	facets,
	formatMinutes,
	humanize,
	matchesFilters,
	stepRuns,
	tokenText,
} from "./format";

const carnitas = { course: "main", cuisine: "mexican", proteins: ["pork"] };
const asparagus = { course: "side", cuisine: null, proteins: [] };
const jambalaya = { course: "main", cuisine: "cajun", proteins: ["chicken", "pork"] };
const noFilters = { course: null, cuisine: null, protein: null };

describe("humanize", () => {
	test("turns hyphens into spaces", () => {
		expect(humanize("green-bell-pepper")).toBe("green bell pepper");
	});
});

describe("formatMinutes", () => {
	test("shows minutes under an hour", () => {
		expect(formatMinutes(45)).toBe("45 min");
	});

	test("shows whole hours alone", () => {
		expect(formatMinutes(120)).toBe("2 hr");
	});

	test("shows hours and minutes", () => {
		expect(formatMinutes(65)).toBe("1 hr 5 min");
	});
});

describe("stepRuns", () => {
	const step = (number) => ({ type: "step", number, text: `Step ${number}` });
	const note = { type: "note", text: "Tip" };

	test("groups consecutive steps", () => {
		expect(stepRuns([step(1), step(2)])).toEqual([
			{ type: "steps", steps: [step(1), step(2)] },
		]);
	});

	test("breaks a run at a note", () => {
		expect(stepRuns([step(1), note, step(2)]).map((run) => run.type)).toEqual([
			"steps",
			"note",
			"steps",
		]);
	});

	test("keeps a leading note first", () => {
		expect(stepRuns([note, step(1)])[0]).toEqual(note);
	});

	test("gives nothing for an empty section", () => {
		expect(stepRuns([])).toEqual([]);
	});
});

describe("tokenText", () => {
	test("shows prose as written", () => {
		expect(tokenText({ type: "text", value: "Season " })).toBe("Season ");
	});

	test("shows an ingredient by its written name", () => {
		expect(
			tokenText({
				type: "ingredient",
				text: "green onions",
				name: "scallion",
				amount: "2",
			}),
		).toBe("green onions");
	});

	test("shows a timer by its duration", () => {
		expect(tokenText({ type: "timer", text: null, amount: "8 minutes" })).toBe(
			"8 minutes",
		);
	});

	test("shows equipment as written", () => {
		expect(tokenText({ type: "cookware", text: "dutch oven" })).toBe("dutch oven");
	});
});

describe("describeSource", () => {
	test("links a URL by its host", () => {
		expect(describeSource("https://www.seriouseats.com/carnitas")).toEqual({
			href: "https://www.seriouseats.com/carnitas",
			text: "seriouseats.com",
		});
	});

	test("keeps a name as text", () => {
		expect(describeSource("Grandma")).toEqual({ href: null, text: "Grandma" });
	});

	test("does not link a non-web URL", () => {
		expect(describeSource("javascript:alert(1)").href).toBeNull();
	});
});

describe("facets", () => {
	test("lists each course once, sorted", () => {
		expect(facets([carnitas, asparagus, jambalaya]).course).toEqual(["main", "side"]);
	});

	test("skips recipes without a cuisine", () => {
		expect(facets([carnitas, asparagus]).cuisine).toEqual(["mexican"]);
	});

	test("collects every protein", () => {
		expect(facets([carnitas, jambalaya]).protein).toEqual(["chicken", "pork"]);
	});
});

describe("matchesFilters", () => {
	test("matches everything with no filters", () => {
		expect(matchesFilters(asparagus, noFilters)).toBe(true);
	});

	test("filters by course", () => {
		expect(matchesFilters(asparagus, { ...noFilters, course: "main" })).toBe(false);
	});

	test("filters by cuisine", () => {
		expect(matchesFilters(carnitas, { ...noFilters, cuisine: "cajun" })).toBe(false);
	});

	test("matches any of a recipe's proteins", () => {
		expect(matchesFilters(jambalaya, { ...noFilters, protein: "pork" })).toBe(true);
	});

	test("requires every filter to match", () => {
		expect(
			matchesFilters(jambalaya, { course: "main", cuisine: "mexican", protein: null }),
		).toBe(false);
	});
});
