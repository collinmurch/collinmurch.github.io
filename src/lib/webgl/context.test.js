import { describe, expect, test } from "bun:test";
import { drawingBufferSize } from "./context";

describe("drawingBufferSize", () => {
	test("scales the CSS size by the pixel ratio within budget", () => {
		expect(drawingBufferSize(1280, 720, 1.5, 4_000_000)).toEqual({
			width: 1920,
			height: 1080,
		});
	});

	test("lowers the ratio to fit the pixel budget", () => {
		const { width, height } = drawingBufferSize(2560, 1440, 1.5, 2560 * 1440);
		expect(width).toBe(2560);
		expect(height).toBe(1440);
	});

	test("keeps the aspect ratio when limited by the budget", () => {
		const { width, height } = drawingBufferSize(3000, 1000, 2, 1_000_000);
		expect(width / height).toBeCloseTo(3, 2);
		expect(width * height).toBeLessThanOrEqual(1_000_000 + width + height);
	});

	test("never raises the ratio above the requested one", () => {
		expect(drawingBufferSize(390, 844, 1.25, 10_000_000)).toEqual({
			width: 488,
			height: 1055,
		});
	});
});
