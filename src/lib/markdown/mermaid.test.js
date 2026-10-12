import { describe, expect, test } from "bun:test";
import { extractAccessibility, renderMermaid } from "./mermaid.js";

const FLOWCHART = `flowchart LR
  A[Start] --> B{Ready?}
  B -->|yes| C[Ship]
  B -->|no| A`;

const SEQUENCE = `sequenceDiagram
  Alice->>Bob: Hello
  Bob-->>Alice: Hi`;

const ids = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const references = (html) =>
	[...html.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)].map(
		(match) => match[1] ?? match[2],
	);

describe("extractAccessibility", () => {
	test("reads a title", () => {
		expect(extractAccessibility("graph TD\n  accTitle: Flow\n  A --> B").label).toBe(
			"Flow",
		);
	});

	test("joins a title and a single-line description", () => {
		const { label } = extractAccessibility(
			"graph TD\n  accTitle: Flow\n  accDescr: How it moves\n  A --> B",
		);

		expect(label).toBe("Flow. How it moves");
	});

	test("reads a block description", () => {
		const { label } = extractAccessibility(
			"graph TD\n  accDescr {\n    Spans\n    lines\n  }\n  A --> B",
		);

		expect(label).toBe("Spans lines");
	});

	test("removes the accessibility lines from the diagram body", () => {
		const { body } = extractAccessibility(
			"graph TD\n  accTitle: Flow\n  accDescr: Moves\n  A --> B",
		);

		expect(body).not.toContain("acc");
		expect(body).toContain("A --> B");
	});

	test("returns an empty label when there is none", () => {
		expect(extractAccessibility(FLOWCHART).label).toBe("");
	});
});

describe("renderMermaid", () => {
	test("renders a figure with the diagram's natural size", () => {
		expect(renderMermaid(FLOWCHART)).toMatch(
			/^<figure class="figure diagram" style="--figure-width:[\d.]+;--figure-height:[\d.]+">/,
		);
	});

	test("puts the diagram in a focusable scroll viewport", () => {
		expect(renderMermaid(FLOWCHART)).toContain(
			'<div class="diagram-viewport" tabindex="0" role="region" aria-label="Diagram"><svg',
		);
	});

	test("keeps the highlighted source for the source view", () => {
		const html = renderMermaid(FLOWCHART, {
			sourceHtml: "<pre><code>src</code></pre>",
		});

		expect(html).toContain(
			'<div class="diagram-source"><pre><code>src</code></pre></div>',
		);
	});

	test("leaves the toolbar to the client", () => {
		expect(renderMermaid(FLOWCHART)).not.toContain("<button");
	});

	test("names the viewport after the accessibility title", () => {
		expect(
			renderMermaid(`flowchart LR\n  accTitle: Shipping & "sorting"\n  A --> B`),
		).toContain('aria-label="Diagram: Shipping &amp; &quot;sorting&quot;"');
	});

	test("colors the diagram with site tokens", () => {
		const html = renderMermaid(FLOWCHART);

		expect(html).toContain("--bg:var(--color-panel)");
		expect(html).toContain("--fg:var(--color-foreground)");
	});

	test("does not load external fonts", () => {
		const html = renderMermaid(FLOWCHART);

		expect(html).not.toContain("@import");
		expect(html).not.toContain("fonts.googleapis.com");
	});

	test("leaves the font family to the page", () => {
		expect(renderMermaid(SEQUENCE)).not.toContain("font-family");
	});

	test("scopes its styles to the diagram", () => {
		const styles = [
			...renderMermaid(FLOWCHART).matchAll(/<style>([\s\S]*?)<\/style>/g),
		];

		expect(styles.length).toBeGreaterThan(0);
		for (const [, css] of styles) expect(css.startsWith("@scope{")).toBe(true);
	});

	test("defines its color variables on the scoping root", () => {
		for (const source of [FLOWCHART, SEQUENCE]) {
			const css = renderMermaid(source).match(/<style>([\s\S]*?)<\/style>/)[1];

			expect(css).toMatch(/:scope\s*\{[^}]*--_text:/);
			expect(css).not.toMatch(/(^|[{},]\s*)svg\s*[{,]/);
		}
	});

	test("resolves every marker reference to an id in the same diagram", () => {
		for (const source of [FLOWCHART, SEQUENCE]) {
			const html = renderMermaid(source);
			const defined = new Set(ids(html));

			expect(references(html).length).toBeGreaterThan(0);
			for (const reference of references(html))
				expect(defined.has(reference)).toBe(true);
		}
	});

	test("gives two diagrams on a page distinct ids", () => {
		const first = new Set(ids(renderMermaid(FLOWCHART)));
		const second = ids(renderMermaid(`${FLOWCHART}\n  C --> D[Done]`));

		expect(second.some((id) => first.has(id))).toBe(false);
	});

	test("rounds geometry to two decimals", () => {
		const html = renderMermaid(FLOWCHART);
		const geometry = [
			...html.matchAll(/\s(?:x|y|width|height|points|viewBox)="([^"]*)"/g),
		]
			.map((match) => match[1])
			.join(" ");

		expect(geometry).not.toMatch(/\d\.\d{3,}/);
	});

	test("labels the diagram from its accessibility title", () => {
		const html = renderMermaid(`flowchart LR\n  accTitle: Shipping\n  A --> B`);

		expect(html).toContain('role="img" aria-label="Shipping"');
	});

	test("does not draw accessibility lines as nodes", () => {
		const html = renderMermaid(`flowchart LR\n  accTitle: Shipping\n  A --> B`);

		expect(html).not.toContain('data-id="accTitle"');
	});

	test("leaves an untitled diagram's text readable", () => {
		expect(renderMermaid(FLOWCHART)).not.toContain('role="img"');
	});

	test("fails with the diagram source when it cannot render", () => {
		expect(() => renderMermaid("notADiagram\n  ???")).toThrow(/notADiagram/);
	});
});
