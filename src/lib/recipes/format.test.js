import { describe, expect, test } from "bun:test";
import {
	describeSource,
	formatMinutes,
	humanize,
	planTitle,
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
