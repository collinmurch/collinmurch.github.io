import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { remarkImages } from "./images.js";

function png(width, height) {
	const bytes = Buffer.alloc(33);
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
	bytes.writeUInt32BE(13, 8);
	bytes.write("IHDR", 12, "ascii");
	bytes.writeUInt32BE(width, 16);
	bytes.writeUInt32BE(height, 20);
	bytes.writeUInt8(8, 24);
	bytes.writeUInt8(6, 25);
	return bytes;
}

const image = (url, alt = "Alt", title = null) => ({ type: "image", url, alt, title });
const text = (value) => ({ type: "text", value });
const paragraph = (...children) => ({ type: "paragraph", children });
const root = (...children) => ({ type: "root", children });

let directory;

function transform(tree, options) {
	remarkImages(options)(tree, { filename: join(directory, "post.md") });
	return tree;
}

beforeAll(() => {
	directory = mkdtempSync(join(tmpdir(), "remark-images-"));
	writeFileSync(join(directory, "photo.png"), png(1200, 800));
	writeFileSync(
		join(directory, "drawing.svg"),
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><circle id="c" r="4" /></svg>',
	);
});

afterAll(() => {
	rmSync(directory, { recursive: true, force: true });
});

describe("remarkImages", () => {
	test("inlines a lone local SVG as a figure", () => {
		const tree = transform(root(paragraph(image("./drawing.svg", "A drawing"))));
		const [node] = tree.children;

		expect(node.type).toBe("html");
		expect(node.value.startsWith("{@html ")).toBe(true);
		expect(node.value).toContain("--figure-width:300;--figure-height:150");
		expect(node.value).toContain('aria-label=\\"A drawing\\"');
	});

	test("reports an inlined SVG with the post that inlined it", () => {
		const inlined = [];
		transform(root(paragraph(image("./drawing.svg"))), {
			onInline: (...args) => inlined.push(args),
		});

		expect(inlined).toEqual([
			[join(directory, "post.md"), join(directory, "drawing.svg")],
		]);
	});

	test("does not report imported images", () => {
		const inlined = [];
		transform(root(paragraph(image("./photo.png"))), {
			onInline: (...args) => inlined.push(args),
		});

		expect(inlined).toEqual([]);
	});

	test("adds a caption from the image title", () => {
		const tree = transform(root(paragraph(image("./drawing.svg", "A", "Caption"))));

		expect(tree.children[0].value).toContain("<figcaption>Caption</figcaption>");
	});

	test("does not need a leading ./ for local images", () => {
		const tree = transform(root(paragraph(image("drawing.svg"))));

		expect(tree.children[0].value).toContain("<figure");
	});

	test("imports a lone raster image and wraps it in a figure", () => {
		const tree = transform(root(paragraph(image("./photo.png", "A photo"))));
		const [script, node] = tree.children;

		expect(script.value).toBe(
			'<script>\n\timport __postImage0 from "./photo.png";\n</script>',
		);
		expect(node.value).toBe(
			'<figure class="figure"><img src={__postImage0} alt="A photo" width="1200" height="800" loading="lazy" decoding="async" /></figure>',
		);
	});

	test("keeps an image inside text inline", () => {
		const tree = transform(
			root(paragraph(text("See "), image("./photo.png"), text("."))),
		);
		const inline = tree.children[1].children[1];

		expect(inline.type).toBe("html");
		expect(inline.value.startsWith("<img ")).toBe(true);
	});

	test("imports an inline SVG instead of inlining it", () => {
		const tree = transform(root(paragraph(text("See "), image("./drawing.svg"))));

		expect(tree.children[0].value).toContain(
			'import __postImage0 from "./drawing.svg";',
		);
		expect(tree.children[1].children[1].value).toContain("src={__postImage0}");
	});

	test("numbers imports in document order", () => {
		const tree = transform(
			root(paragraph(image("./photo.png")), paragraph(image("./photo.png"))),
		);

		expect(tree.children[0].value).toContain("__postImage0");
		expect(tree.children[0].value).toContain("__postImage1");
	});

	test("adds imports to an existing instance script", () => {
		const tree = transform(
			root(
				{ type: "html", value: "<script>\n\tconst a = 1;\n</script>" },
				paragraph(image("./photo.png")),
			),
		);

		expect(tree.children).toHaveLength(2);
		expect(tree.children[0].value).toBe(
			'<script>\n\timport __postImage0 from "./photo.png";\n\tconst a = 1;\n</script>',
		);
	});

	test("does not add imports to a module script", () => {
		const tree = transform(
			root(
				{ type: "html", value: "<script module></script>" },
				paragraph(image("./photo.png")),
			),
		);

		expect(tree.children[0].value).toContain("import __postImage0");
		expect(tree.children[1].value).toBe("<script module></script>");
	});

	test("escapes alt text for Svelte", () => {
		const tree = transform(
			root(paragraph(image("./photo.png", 'A {brace} & "quote"'))),
		);

		expect(tree.children[1].value).toContain(
			'alt="A &#123;brace&#125; &amp; &quot;quote&quot;"',
		);
	});

	test("leaves remote images alone", () => {
		const remote = image("https://example.com/a.png");
		const tree = transform(root(paragraph(remote)));

		expect(tree.children[0].children[0]).toBe(remote);
	});

	test("leaves root-relative images alone", () => {
		const absolute = image("/images/profile.webp");
		const tree = transform(root(paragraph(absolute)));

		expect(tree.children[0].children[0]).toBe(absolute);
	});

	test("does not add a script when there are no local images", () => {
		const tree = transform(root(paragraph(text("No images"))));

		expect(tree.children).toHaveLength(1);
	});

	test("fails when a local image is missing", () => {
		expect(() => transform(root(paragraph(image("./missing.png"))))).toThrow();
	});
});
