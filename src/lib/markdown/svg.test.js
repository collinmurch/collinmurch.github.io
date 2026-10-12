import { describe, expect, test } from "bun:test";
import { prepareSvg } from "./svg.js";

const rootTag = (svg) => svg.match(/<svg\b[^>]*>/)[0];

describe("prepareSvg", () => {
	test("reads the natural size from the viewBox", () => {
		const { width, height } = prepareSvg(
			'<svg viewBox="0 0 320 180" width="640" height="360"></svg>',
		);

		expect({ width, height }).toEqual({ width: 320, height: 180 });
	});

	test("derives a viewBox from width and height when there is none", () => {
		const { svg, width, height } = prepareSvg('<svg width="200px" height="100"></svg>');

		expect({ width, height }).toEqual({ width: 200, height: 100 });
		expect(rootTag(svg)).toContain('viewBox="0 0 200 100"');
	});

	test("rounds the natural size to two decimals", () => {
		const { width, height } = prepareSvg(
			'<svg viewBox="0 0 100.123456 50.987654"></svg>',
		);

		expect({ width, height }).toEqual({ width: 100.12, height: 50.99 });
	});

	test("throws when the size cannot be determined", () => {
		expect(() => prepareSvg('<svg width="100%"></svg>')).toThrow(/viewBox/);
	});

	test("throws when there is no svg element", () => {
		expect(() => prepareSvg("<div></div>")).toThrow(/<svg>/);
	});

	test("removes the fixed width and height from the root", () => {
		const { svg } = prepareSvg(
			'<svg viewBox="0 0 10 10" width="10" height="10"></svg>',
		);

		expect(rootTag(svg)).not.toMatch(/\s(?:width|height)=/);
	});

	test("keeps width and height on child elements", () => {
		const { svg } = prepareSvg(
			'<svg viewBox="0 0 10 10"><rect width="4" height="5" /></svg>',
		);

		expect(svg).toContain('<rect width="4" height="5" />');
	});

	test("strips the XML prolog, doctype, and comments", () => {
		const { svg } = prepareSvg(
			'<?xml version="1.0"?>\n<!DOCTYPE svg>\n<!-- exported --><svg viewBox="0 0 1 1"></svg>',
		);

		expect(svg).toBe('<svg viewBox="0 0 1 1"></svg>');
	});

	test("prefixes ids and the references to them", () => {
		const { svg } = prepareSvg(
			'<svg viewBox="0 0 1 1"><linearGradient id="g" /><use href="#g" /><use xlink:href="#g" /><rect fill="url(#g)" stroke="url(\'#g\')" /></svg>',
		);
		const id = svg.match(/\sid="([^"]+)"/)[1];

		expect(id).toMatch(/^s[\da-f]{8}-g$/);
		expect(svg).toContain(`href="#${id}"`);
		expect(svg).toContain(`xlink:href="#${id}"`);
		expect(svg).toContain(`fill="url(#${id})"`);
		expect(svg).toContain(`stroke="url('#${id}')"`);
	});

	test("leaves data-id attributes alone", () => {
		const { svg } = prepareSvg('<svg viewBox="0 0 1 1"><g data-id="node" /></svg>');

		expect(svg).toContain('data-id="node"');
	});

	test("uses the same prefix for the same source", () => {
		const source = '<svg viewBox="0 0 1 1"><g id="a" /></svg>';

		expect(prepareSvg(source).svg).toBe(prepareSvg(source).svg);
	});

	test("uses different prefixes for different sources", () => {
		const first = prepareSvg('<svg viewBox="0 0 1 1"><g id="a" /></svg>').svg;
		const second = prepareSvg('<svg viewBox="0 0 2 2"><g id="a" /></svg>').svg;

		expect(first.match(/\sid="([^"]+)"/)[1]).not.toBe(
			second.match(/\sid="([^"]+)"/)[1],
		);
	});

	test("scopes embedded styles to the svg", () => {
		const { svg } = prepareSvg(
			'<svg viewBox="0 0 1 1"><style>text { fill: red; }</style></svg>',
		);

		expect(svg).toContain("<style>@scope{text { fill: red; }}</style>");
	});

	test("targets the root svg as :scope", () => {
		const { svg } = prepareSvg(
			'<svg viewBox="0 0 1 1"><style>svg { --a: 1; }\nsvg text, svg:hover { fill: red; }</style></svg>',
		);

		expect(svg).toContain(
			"<style>@scope{:scope { --a: 1; }\n:scope text, :scope:hover { fill: red; }}</style>",
		);
	});

	test("leaves selectors that only contain svg in a class name alone", () => {
		const { svg } = prepareSvg(
			'<svg viewBox="0 0 1 1"><style>.svg-label { fill: red; }</style></svg>',
		);

		expect(svg).toContain("<style>@scope{.svg-label { fill: red; }}</style>");
	});

	test("drops @import rules, including URLs that contain semicolons", () => {
		const { svg } = prepareSvg(
			"<svg viewBox=\"0 0 1 1\"><style>@import url('https://fonts.example/css?family=A:wght@400;600&amp;display=swap');\ntext { fill: red; }</style></svg>",
		);

		expect(svg).toContain("<style>@scope{text { fill: red; }}</style>");
	});

	test("labels the svg as an image when given alt text", () => {
		const { svg } = prepareSvg('<svg viewBox="0 0 1 1"></svg>', {
			label: 'Waves & "tides"',
		});

		expect(rootTag(svg)).toContain('role="img"');
		expect(rootTag(svg)).toContain('aria-label="Waves &amp; &quot;tides&quot;"');
	});

	test("hides the svg from assistive tech when alt text is empty", () => {
		const { svg } = prepareSvg('<svg viewBox="0 0 1 1"></svg>', { label: "" });

		expect(rootTag(svg)).toContain('aria-hidden="true"');
		expect(rootTag(svg)).not.toContain("role=");
	});

	test("leaves the svg readable when no label is given", () => {
		const { svg } = prepareSvg('<svg viewBox="0 0 1 1"></svg>');

		expect(rootTag(svg)).not.toMatch(/role=|aria-/);
	});
});
