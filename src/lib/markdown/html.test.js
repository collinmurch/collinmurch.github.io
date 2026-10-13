import { describe, expect, test } from "bun:test";
import { escapeHtml, figure, toSvelteHtml } from "./html.js";

describe("escapeHtml", () => {
	test("escapes HTML special characters", () => {
		expect(escapeHtml(`<a href="x">&</a>`)).toBe(
			"&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;",
		);
	});

	test("escapes braces so Svelte does not read them as expressions", () => {
		expect(escapeHtml("{value}")).toBe("&#123;value&#125;");
	});
});

describe("toSvelteHtml", () => {
	test("wraps markup in an @html tag with a string literal", () => {
		expect(toSvelteHtml('<p class="a">{x}</p>')).toBe(
			'{@html "<p class=\\"a\\">{x}</p>"}',
		);
	});
});

describe("figure", () => {
	test("wraps content in a figure", () => {
		expect(figure("<img />")).toBe('<figure class="figure"><img /></figure>');
	});

	test("exposes a natural size as custom properties", () => {
		expect(figure("<svg></svg>", { size: { width: 320, height: 180 } })).toBe(
			'<figure class="figure" style="--figure-width:320;--figure-height:180"><svg></svg></figure>',
		);
	});

	test("adds an escaped caption", () => {
		expect(figure("", { caption: "<b>{Tides}</b>" })).toContain(
			"<figcaption>&lt;b&gt;&#123;Tides&#125;&lt;/b&gt;</figcaption>",
		);
	});
});
