import { describe, expect, test } from "bun:test";
import { sketchSvg } from "./sketch.js";

const svg = (body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">${body}</svg>`;

describe("sketchSvg", () => {
	test("redraws a filled rect as a fill and an outline", () => {
		const out = sketchSvg(
			svg(
				'<rect x="10" y="10" width="80" height="40" rx="0" ry="0" fill="#fff" stroke="#000" stroke-width="2" />',
			),
		);

		expect(out).not.toContain("<rect");
		expect(out).toMatch(
			/<g fill="#fff" stroke="#000" stroke-width="2"><path d="M[^"]+" stroke="none" \/><path d="M[^"]+" fill="none" \/><\/g>/,
		);
	});

	test("draws rounded rects with their corners", () => {
		const out = sketchSvg(
			svg('<rect x="0" y="0" width="80" height="40" rx="8" ry="8" fill="#fff" />'),
		);

		expect(out).not.toContain("<rect");
		expect(out).not.toContain('rx="');
	});

	test("turns a polyline into an unfilled path that keeps its marker", () => {
		const out = sketchSvg(
			svg(
				'<polyline class="edge" points="0,0 50,0 50,50" fill="none" stroke="red" marker-end="url(#arrowhead)" />',
			),
		);

		expect(out).toMatch(
			/<path d="M[^"]+" fill="none" class="edge" stroke="red" marker-end="url\(#arrowhead\)" \/>/,
		);
	});

	test("keeps an edge's endpoints where the layout put them", () => {
		const out = sketchSvg(svg('<polyline points="3,7 120,7 120,90" fill="none" />'));
		const d = out.match(/ d="([^"]+)"/)[1];

		expect(d.startsWith("M3 7")).toBe(true);
		expect(d.trim().endsWith("120 90")).toBe(true);
	});

	test("draws dashed strokes once", () => {
		const out = sketchSvg(
			svg('<polyline points="0,0 100,0" fill="none" stroke-dasharray="4 4" />'),
		);
		const moves = out.match(/ d="([^"]+)"/)[1].match(/M/g);

		expect(moves.length).toBe(1);
	});

	test("draws polygons, circles, ellipses, lines, and paths", () => {
		const out = sketchSvg(
			svg(
				'<polygon points="0,0 10,0 5,10" fill="#000" />' +
					'<circle cx="20" cy="20" r="5" fill="#000" />' +
					'<ellipse cx="40" cy="20" rx="8" ry="4" fill="#000" />' +
					'<line x1="0" y1="0" x2="10" y2="10" stroke="#000" />' +
					'<path d="M0 0 L10 10" fill="none" />',
			),
		);

		expect(out).not.toMatch(/<(polygon|circle|ellipse|line)\b/);
		expect(out).not.toMatch(/\s(points|cx|cy|r|rx|ry|x1|y1|x2|y2)="/);
	});

	test("leaves shapes in defs crisp", () => {
		const marker =
			'<defs><marker id="a"><polygon points="0 0, 8 2.5, 0 5" /></marker></defs>';
		const out = sketchSvg(
			svg(`${marker}<rect x="0" y="0" width="10" height="10" fill="#fff" />`),
		);

		expect(out).toContain(marker);
	});

	test("leaves text alone", () => {
		const text = '<text x="5" y="5">Label</text>';

		expect(sketchSvg(svg(text))).toContain(text);
	});

	test("draws the same strokes for the same seed", () => {
		const input = svg('<rect x="0" y="0" width="50" height="20" fill="#fff" />');

		expect(sketchSvg(input, { seed: 7 })).toBe(sketchSvg(input, { seed: 7 }));
	});

	test("draws different strokes for a different seed", () => {
		const input = svg('<rect x="0" y="0" width="50" height="20" fill="#fff" />');

		expect(sketchSvg(input, { seed: 1 })).not.toBe(sketchSvg(input, { seed: 2 }));
	});
});
