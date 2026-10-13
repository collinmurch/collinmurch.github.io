import rough from "roughjs";

const SHAPE = /<(rect|polygon|polyline|line|circle|ellipse|path)\b([^>]*?)\s*\/>/g;
const DEFS = /(<defs>[\s\S]*?<\/defs>)/;
const ATTRIBUTE = /\s([\w:-]+)="([^"]*)"/g;

const GEOMETRY = {
	rect: ["x", "y", "width", "height", "rx", "ry"],
	polygon: ["points"],
	polyline: ["points"],
	line: ["x1", "y1", "x2", "y2"],
	circle: ["cx", "cy", "r"],
	ellipse: ["cx", "cy", "rx", "ry"],
	path: ["d"],
};

function parseAttributes(source) {
	return Object.fromEntries(
		[...source.matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value]),
	);
}

function serializeAttributes(attributes) {
	return Object.entries(attributes)
		.map(([name, value]) => ` ${name}="${value}"`)
		.join("");
}

function parsePoints(points) {
	const numbers = points
		.trim()
		.split(/[\s,]+/)
		.map(Number);
	const pairs = [];
	for (let index = 0; index + 1 < numbers.length; index += 2) {
		pairs.push([numbers[index], numbers[index + 1]]);
	}
	return pairs;
}

function roundedRect(x, y, width, height, rx, ry) {
	const cx = Math.min(rx, width / 2);
	const cy = Math.min(ry, height / 2);
	return [
		`M${x + cx} ${y}`,
		`H${x + width - cx}`,
		`A${cx} ${cy} 0 0 1 ${x + width} ${y + cy}`,
		`V${y + height - cy}`,
		`A${cx} ${cy} 0 0 1 ${x + width - cx} ${y + height}`,
		`H${x + cx}`,
		`A${cx} ${cy} 0 0 1 ${x} ${y + height - cy}`,
		`V${y + cy}`,
		`A${cx} ${cy} 0 0 1 ${x + cx} ${y}`,
		"Z",
	].join(" ");
}

function draw(generator, tag, geometry, options) {
	const number = (name) => Number.parseFloat(geometry[name] ?? "0");

	switch (tag) {
		case "rect": {
			const rx = number("rx") || number("ry");
			const ry = number("ry") || rx;
			if (rx > 0) {
				return generator.path(
					roundedRect(
						number("x"),
						number("y"),
						number("width"),
						number("height"),
						rx,
						ry,
					),
					options,
				);
			}
			return generator.rectangle(
				number("x"),
				number("y"),
				number("width"),
				number("height"),
				options,
			);
		}
		case "polygon":
			return generator.polygon(parsePoints(geometry.points ?? ""), options);
		case "polyline":
			return generator.linearPath(parsePoints(geometry.points ?? ""), options);
		case "line":
			return generator.line(
				number("x1"),
				number("y1"),
				number("x2"),
				number("y2"),
				options,
			);
		case "circle":
			return generator.circle(number("cx"), number("cy"), number("r") * 2, options);
		case "ellipse":
			return generator.ellipse(
				number("cx"),
				number("cy"),
				number("rx") * 2,
				number("ry") * 2,
				options,
			);
		default:
			return generator.path(geometry.d ?? "", options);
	}
}

/**
 * Redraws an SVG's shapes with rough.js so the diagram looks sketched by hand,
 * like Mermaid's `look: handDrawn`. It runs at build time, so the page ships
 * no drawing code.
 *
 * Each shape keeps its other attributes, so colors, dashes, classes, and
 * markers carry over. Filled shapes become a group holding a wobbly fill and a
 * wobbly outline. Shapes inside `<defs>`, such as arrowheads, are left crisp.
 * The same `seed` always draws the same strokes, so builds are reproducible.
 */
export function sketchSvg(svg, { seed = 1 } = {}) {
	const generator = rough.generator();
	let index = 0;

	const sketch = (markup) =>
		markup.replace(SHAPE, (_match, tag, source) => {
			const attributes = parseAttributes(source);
			const geometry = {};
			for (const name of GEOMETRY[tag]) {
				if (name in attributes) geometry[name] = attributes[name];
				delete attributes[name];
			}

			const open = tag === "polyline" || tag === "line";
			const filled = !open && attributes.fill !== "none";
			const drawable = draw(generator, tag, geometry, {
				seed: seed + index++,
				roughness: 1,
				bowing: 1,
				preserveVertices: true,
				disableMultiStroke: "stroke-dasharray" in attributes,
				fill: filled ? "currentColor" : undefined,
				fillStyle: "solid",
			});

			const outline = drawable.sets.find((set) => set.type === "path");
			const fill = drawable.sets.find((set) => set.type === "fillPath");
			const outlinePath = outline ? generator.opsToPath(outline, 2) : "";

			if (!fill) {
				return `<path d="${outlinePath}"${serializeAttributes({ fill: "none", ...attributes })} />`;
			}

			return `<g${serializeAttributes(attributes)}><path d="${generator.opsToPath(fill, 2)}" stroke="none" /><path d="${outlinePath}" fill="none" /></g>`;
		});

	return svg
		.split(DEFS)
		.map((part) => (DEFS.test(part) ? part : sketch(part)))
		.join("");
}
