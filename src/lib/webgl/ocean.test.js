import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
	SHADER_COLORS,
	SHADER_CONSTANTS,
	sceneEdgeColors,
	swellHeight,
	swellIterations,
	waterLevel,
} from "./ocean";

const shaderSource = readFileSync(new URL("./fragment.glsl", import.meta.url), "utf8");
const stylesheet = readFileSync(new URL("../../app.css", import.meta.url), "utf8");

const shaderValue = (name) => {
	const match =
		shaderSource.match(new RegExp(`const float ${name} = ([-0-9.]+);`)) ??
		shaderSource.match(new RegExp(`#define ${name} ([-0-9.]+)`));
	return match ? Number(match[1]) : undefined;
};

describe("SHADER_CONSTANTS", () => {
	for (const [name, value] of Object.entries(SHADER_CONSTANTS)) {
		test(`matches ${name} in the fragment shader`, () => {
			expect(shaderValue(name)).toBe(value);
		});
	}
});

const shaderColor = (name) => {
	const match = shaderSource.match(
		new RegExp(`const vec3 ${name} = vec3\\(([^)]+)\\);`),
	);
	return match ? match[1].split(",").map(Number) : undefined;
};

const cssColor = (name) =>
	stylesheet.match(new RegExp(`--color-${name}: (#[0-9a-f]{6});`))?.[1];

describe("SHADER_COLORS", () => {
	for (const [name, value] of Object.entries(SHADER_COLORS)) {
		test(`matches ${name} in the fragment shader`, () => {
			expect(shaderColor(name)).toEqual(value);
		});
	}
});

describe("sceneEdgeColors", () => {
	for (const [name, value] of Object.entries(sceneEdgeColors())) {
		test(`matches --color-${name} in app.css`, () => {
			expect(cssColor(name)).toBe(value);
		});
	}
});

describe("waterLevel", () => {
	test("rests at the base level on the home page", () => {
		expect(waterLevel(0)).toBe(SHADER_CONSTANTS.WATER_LEVEL);
	});

	test("rises above the top of the screen when fully submerged", () => {
		expect(waterLevel(1)).toBeGreaterThan(1);
	});
});

describe("swellIterations", () => {
	test("uses every octave at high quality", () => {
		expect(swellIterations(1)).toBe(12);
	});

	test("drops octaves at medium quality", () => {
		expect(swellIterations(0)).toBe(8);
	});

	test("uses the fewest octaves at low quality", () => {
		expect(swellIterations(-1)).toBe(5);
	});
});

describe("swellHeight", () => {
	test("is flat without iterations", () => {
		expect(swellHeight(0.7, 12, 0)).toBe(0);
	});

	test("stays within the swell amplitude", () => {
		for (let x = 0; x < 2; x += 0.05) {
			const height = swellHeight(x, 31, 12);
			expect(height).toBeGreaterThan(-SHADER_CONSTANTS.SWELL_AMPLITUDE);
			expect(height).toBeLessThan(SHADER_CONSTANTS.SWELL_AMPLITUDE);
		}
	});

	test("varies along the surface", () => {
		expect(swellHeight(0.2, 31, 12)).not.toBeCloseTo(swellHeight(0.9, 31, 12), 3);
	});

	test("moves over time", () => {
		expect(swellHeight(0.5, 10, 12)).not.toBeCloseTo(swellHeight(0.5, 10.5, 12), 3);
	});
});
