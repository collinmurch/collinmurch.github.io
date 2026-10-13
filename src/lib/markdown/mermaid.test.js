import { describe, expect, test } from "bun:test";
import { extractAccessibility, extractFrontMatter, renderMermaid } from "./mermaid.js";

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

describe("extractFrontMatter", () => {
	test("returns the source unchanged without front matter", () => {
		expect(extractFrontMatter(FLOWCHART)).toEqual({
			body: FLOWCHART,
			title: "",
			look: "classic",
			seed: 1,
		});
	});

	test("removes the front matter from the diagram body", () => {
		const { body } = extractFrontMatter(`---\ntitle: Flow\n---\n${FLOWCHART}`);

		expect(body).toBe(FLOWCHART);
	});

	test("reads the title", () => {
		expect(extractFrontMatter(`---\ntitle: Flow\n---\n${FLOWCHART}`).title).toBe(
			"Flow",
		);
	});

	test("reads the hand-drawn look and seed", () => {
		const { look, seed } = extractFrontMatter(
			`---\nconfig:\n  look: handDrawn\n  handDrawnSeed: 42\n---\n${FLOWCHART}`,
		);

		expect(look).toBe("handDrawn");
		expect(seed).toBe(42);
	});

	test("treats other looks as classic", () => {
		expect(
			extractFrontMatter(`---\nconfig:\n  look: neo\n---\n${FLOWCHART}`).look,
		).toBe("classic");
	});

	test("ignores theme and font settings", () => {
		const source = `---\nconfig:\n  theme: base\n  themeVariables:\n    fontFamily: "Comic Sans MS"\n---\n${FLOWCHART}`;

		expect(extractFrontMatter(source)).toEqual({
			body: FLOWCHART,
			title: "",
			look: "classic",
			seed: 1,
		});
	});

	test("throws on invalid YAML", () => {
		expect(() =>
			extractFrontMatter(`---\ntitle: [unclosed\n---\n${FLOWCHART}`),
		).toThrow();
	});
});

describe("renderMermaid", () => {
	test("returns the diagram's natural size", () => {
		const { width, height } = renderMermaid(FLOWCHART);

		expect(width).toBeGreaterThan(0);
		expect(height).toBeGreaterThan(0);
	});

	test("puts the diagram in a focusable scroll viewport", () => {
		expect(renderMermaid(FLOWCHART).body).toContain(
			'<div class="diagram-viewport" tabindex="0" role="region" aria-label="Diagram"><svg',
		);
	});

	test("leaves the controls to the Diagram component", () => {
		expect(renderMermaid(FLOWCHART).body).not.toContain("<button");
	});

	test("names the viewport after the accessibility title", () => {
		expect(
			renderMermaid(`flowchart LR\n  accTitle: Shipping & "sorting"\n  A --> B`).body,
		).toContain('aria-label="Diagram: Shipping &amp; &quot;sorting&quot;"');
	});

	test("colors the diagram with site tokens", () => {
		const html = renderMermaid(FLOWCHART).body;

		expect(html).toContain("--bg:var(--color-panel)");
		expect(html).toContain("--fg:var(--color-foreground)");
	});

	test("does not load external fonts", () => {
		const html = renderMermaid(FLOWCHART).body;

		expect(html).not.toContain("@import");
		expect(html).not.toContain("fonts.googleapis.com");
	});

	test("leaves the font family to the page", () => {
		expect(renderMermaid(SEQUENCE).body).not.toContain("font-family");
	});

	test("scopes its styles to the diagram", () => {
		const styles = [
			...renderMermaid(FLOWCHART).body.matchAll(/<style>([\s\S]*?)<\/style>/g),
		];

		expect(styles.length).toBeGreaterThan(0);
		for (const [, css] of styles) expect(css.startsWith("@scope{")).toBe(true);
	});

	test("defines its color variables on the scoping root", () => {
		for (const source of [FLOWCHART, SEQUENCE]) {
			const css = renderMermaid(source).body.match(/<style>([\s\S]*?)<\/style>/)[1];

			expect(css).toMatch(/:scope\s*\{[^}]*--_text:/);
			expect(css).not.toMatch(/(^|[{},]\s*)svg\s*[{,]/);
		}
	});

	test("resolves every marker reference to an id in the same diagram", () => {
		for (const source of [FLOWCHART, SEQUENCE]) {
			const html = renderMermaid(source).body;
			const defined = new Set(ids(html));

			expect(references(html).length).toBeGreaterThan(0);
			for (const reference of references(html))
				expect(defined.has(reference)).toBe(true);
		}
	});

	test("gives two diagrams on a page distinct ids", () => {
		const first = new Set(ids(renderMermaid(FLOWCHART).body));
		const second = ids(renderMermaid(`${FLOWCHART}\n  C --> D[Done]`).body);

		expect(second.some((id) => first.has(id))).toBe(false);
	});

	test("rounds geometry to two decimals", () => {
		const html = renderMermaid(FLOWCHART).body;
		const geometry = [
			...html.matchAll(/\s(?:x|y|width|height|points|viewBox)="([^"]*)"/g),
		]
			.map((match) => match[1])
			.join(" ");

		expect(geometry).not.toMatch(/\d\.\d{3,}/);
	});

	test("labels the diagram from its accessibility title", () => {
		const html = renderMermaid(`flowchart LR\n  accTitle: Shipping\n  A --> B`).body;

		expect(html).toContain('role="img" aria-label="Shipping"');
	});

	test("does not draw accessibility lines as nodes", () => {
		const html = renderMermaid(`flowchart LR\n  accTitle: Shipping\n  A --> B`).body;

		expect(html).not.toContain('data-id="accTitle"');
	});

	test("leaves an untitled diagram's text readable", () => {
		expect(renderMermaid(FLOWCHART).body).not.toContain('role="img"');
	});

	test("renders a diagram with front matter", () => {
		expect(renderMermaid(`---\ntitle: Flow\n---\n${FLOWCHART}`).body).toContain("<svg");
	});

	test("captions the diagram with its front matter title", () => {
		expect(renderMermaid(`---\ntitle: Flow & go\n---\n${FLOWCHART}`).caption).toBe(
			"Flow & go",
		);
	});

	test("leaves an untitled diagram without a caption", () => {
		expect(renderMermaid(FLOWCHART).caption).toBeFalsy();
	});

	test("labels the diagram from its front matter title", () => {
		expect(renderMermaid(`---\ntitle: Flow\n---\n${FLOWCHART}`).body).toContain(
			'role="img" aria-label="Flow"',
		);
	});

	test("prefers the accessibility title for the label", () => {
		const html = renderMermaid(
			`---\ntitle: Caption\n---\nflowchart LR\n  accTitle: Label\n  A --> B`,
		).body;

		expect(html).toContain('aria-label="Label"');
	});

	test("sketches a hand-drawn diagram", () => {
		const html = renderMermaid(
			`---\nconfig:\n  look: handDrawn\n---\n${FLOWCHART}`,
		).body;

		expect(html).not.toMatch(/<(rect|polyline)\b/);
		expect(html).toContain("<text");
	});

	test("leaves a classic diagram's shapes alone", () => {
		expect(renderMermaid(FLOWCHART).body).toMatch(/<rect\b/);
	});

	test("keeps marker references resolvable when hand-drawn", () => {
		const html = renderMermaid(
			`---\nconfig:\n  look: handDrawn\n---\n${FLOWCHART}`,
		).body;
		const defined = new Set(ids(html));

		expect(references(html).length).toBeGreaterThan(0);
		for (const reference of references(html)) expect(defined.has(reference)).toBe(true);
	});

	test("includes the renderer's reason when it cannot render", () => {
		expect(() => renderMermaid("notADiagram\n  ???")).toThrow(/Invalid mermaid header/);
	});

	test("fails with the diagram source when it cannot render", () => {
		expect(() => renderMermaid("notADiagram\n  ???")).toThrow(/notADiagram/);
	});
});
