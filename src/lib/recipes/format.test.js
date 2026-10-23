import { describe, expect, test } from "bun:test";
import {
	byCourse,
	describeSource,
	formatMinutes,
	humanize,
	matchesSearch,
	stepRuns,
	tokenText,
} from "./format";

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
