import { describe, expect, test } from "bun:test";
import {
	TOOLBAR,
	anchoredScroll,
	clampZoom,
	stepZoom,
	wheelZoomFactor,
} from "./diagram-controls.js";

describe("clampZoom", () => {
	test("keeps zoom within the minimum", () => {
		expect(clampZoom(0.1)).toBe(0.5);
	});

	test("keeps zoom within the maximum", () => {
		expect(clampZoom(10)).toBe(4);
	});

	test("snaps values close to 1", () => {
		expect(clampZoom(1.004)).toBe(1);
	});

	test("rounds away floating point noise", () => {
		expect(clampZoom(1.5625000000000002)).toBe(1.563);
	});
});

describe("stepZoom", () => {
	test("zooms in by a fixed factor", () => {
		expect(stepZoom(1, 1)).toBe(1.25);
	});

	test("zooms out by the same factor", () => {
		expect(stepZoom(1, -1)).toBe(0.8);
	});

	test("returns to 1 after stepping in and back out", () => {
		expect(stepZoom(stepZoom(stepZoom(1, 1), 1), -2)).toBe(1);
	});
});

describe("wheelZoomFactor", () => {
	test("zooms in when scrolling up", () => {
		expect(wheelZoomFactor(-10)).toBeGreaterThan(1);
	});

	test("zooms out when scrolling down", () => {
		expect(wheelZoomFactor(10)).toBeLessThan(1);
	});

	test("caps large mouse wheel deltas", () => {
		expect(wheelZoomFactor(1000)).toBe(wheelZoomFactor(50));
	});
});

describe("anchoredScroll", () => {
	test("keeps the point under the cursor fixed when zooming in", () => {
		const scroll = anchoredScroll(0, 100, 100, 150, 2);

		expect(scroll).toBe(50);
	});

	test("accounts for content that moved while resizing", () => {
		expect(anchoredScroll(0, 100, 80, 150, 1)).toBe(-20);
	});

	test("does nothing when the scale and position are unchanged", () => {
		expect(anchoredScroll(30, 100, 100, 150, 1)).toBe(30);
	});
});

describe("TOOLBAR", () => {
	const buttons = () => [...TOOLBAR.matchAll(/<button[^>]*>/g)].map(([tag]) => tag);

	test("groups zoom out, zoom in, and recenter", () => {
		const group = TOOLBAR.match(/<div class="block-btn-group"[^>]*>([\s\S]*?)<\/div>/);
		const actions = [...group[1].matchAll(/data-diagram-action="(\w+)"/g)].map(
			(match) => match[1],
		);

		expect(actions).toEqual(["out", "in", "reset"]);
	});

	test("shows the zoom group only in the diagram view", () => {
		expect(TOOLBAR).toContain(
			'<div class="block-btn-group" role="group" aria-label="Zoom" data-when="diagram">',
		);
	});

	test("puts the view toggle after the zoom group", () => {
		expect(TOOLBAR.indexOf('data-diagram-action="toggle"')).toBeGreaterThan(
			TOOLBAR.indexOf("</div>"),
		);
	});

	test("shows the copy button only in the source view", () => {
		expect(buttons().at(-1)).toMatch(/^<button data-when="source" [^>]*data-copy-btn/);
	});

	test("styles every button like the code copy button", () => {
		for (const button of buttons()) expect(button).toMatch(/class="block-btn/);
	});
});
