import { describe, expect, test } from "bun:test";
import { formatAmount, formatNumber, fractionGlyphs, scaleAmounts } from "./amounts";
import { getBundle } from "./data.server";

const UNITS = {
	cup: { plural: "cups", metric: false },
	tsp: { plural: null, metric: false },
	g: { plural: null, metric: true },
	clove: { plural: "cloves", metric: false },
};

describe("formatNumber", () => {
	test("shows whole numbers plainly", () => {
		expect(formatNumber(3)).toBe("3");
	});

	test("shows kitchen fractions", () => {
		expect(formatNumber(1.5)).toBe("1 1/2");
		expect(formatNumber(1 / 3)).toBe("1/3");
		expect(formatNumber(0.375)).toBe("3/8");
	});

	test("rounds to a near kitchen fraction", () => {
		expect(formatNumber(0.333333 * 2)).toBe("2/3");
	});

	test("shows decimals for metric units", () => {
		expect(formatNumber(1.5, true)).toBe("1.5");
	});

	test("rounds large values to whole numbers", () => {
		expect(formatNumber(12.3, true)).toBe("12");
	});
});

describe("formatAmount", () => {
	test("scales by the factor", () => {
		expect(formatAmount({ value: 0.5, unit: "cup" }, 3, UNITS)).toBe("1 1/2 cups");
	});

	test("keeps the unit singular up to one", () => {
		expect(formatAmount({ value: 0.5, unit: "cup" }, 2, UNITS)).toBe("1 cup");
	});

	test("keeps an unchanging unit as is", () => {
		expect(formatAmount({ value: 2, unit: "tsp" }, 1, UNITS)).toBe("2 tsp");
	});

	test("does not scale a fixed amount", () => {
		expect(formatAmount({ value: 1, unit: "tsp", fixed: true }, 4, UNITS)).toBe(
			"1 tsp",
		);
	});

	test("does not scale a text amount", () => {
		expect(formatAmount({ text: "2-3", unit: "clove" }, 2, UNITS)).toBe("2-3 cloves");
	});

	test("shows a count without a unit", () => {
		expect(formatAmount({ value: 2, unit: null }, 2, UNITS)).toBe("4");
	});

	test("shows a unit written without a quantity", () => {
		expect(formatAmount({ unit: "pinch" }, 2, UNITS)).toBe("pinch");
	});

	test("keeps a unit it doesn't know as written", () => {
		expect(formatAmount({ value: 2, unit: "glug" }, 1, UNITS)).toBe("2 glug");
	});
});

describe("scaleAmounts", () => {
	test("joins amounts that can't be combined", () => {
		const amounts = [
			{ value: 200, unit: "g" },
			{ value: 1, unit: "cup" },
		];
		expect(scaleAmounts(amounts, 2, UNITS)).toBe("400 g + 2 cups");
	});

	test("gives nothing for an ingredient without an amount", () => {
		expect(scaleAmounts([], 2, UNITS)).toBe("");
	});

	test("reads every amount in the bundle exactly as the bundle writes it", () => {
		const { index } = getBundle();
		for (const recipe of index.recipes) {
			for (const item of recipe.ingredients.flatMap((group) => group.items)) {
				expect(scaleAmounts(item.amounts, 1, index.units)).toBe(item.amount);
			}
		}
	});
});

describe("fractionGlyphs", () => {
	test("joins a whole number and its fraction", () => {
		expect(fractionGlyphs("1 1/2 cups")).toBe("1½ cups");
	});

	test("typesets a lone fraction", () => {
		expect(fractionGlyphs("3/4 tsp")).toBe("¾ tsp");
	});

	test("keeps a fraction without a glyph", () => {
		expect(fractionGlyphs("1 3/16 cups")).toBe("1 3/16 cups");
	});
});
