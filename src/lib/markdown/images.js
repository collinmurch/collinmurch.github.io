import { readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { imageSize } from "image-size";
import { escapeHtml, figure, toSvelteHtml } from "./html.js";
import { injectImports } from "./mdast.js";
import { prepareSvg } from "./svg.js";

function isLocal(url) {
	return !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url);
}

function isLoneImage(node) {
	const content = node.children.filter(
		(child) => !(child.type === "text" && !child.value.trim()),
	);
	return content.length === 1 && content[0].type === "image";
}

function intrinsicSize(file) {
	const { width, height, orientation } = imageSize(readFileSync(file));
	return orientation >= 5 ? { width: height, height: width } : { width, height };
}

/**
 * Remark plugin for images that live next to a post.
 *
 * A local SVG on its own line is inlined as a figure so it can use
 * `currentColor` and the site's color tokens. Other local images are imported
 * through Vite, which fingerprints them and fails the build when one is
 * missing, and get their intrinsic size so the page does not shift as they
 * load. Remote and root-relative images are left alone.
 *
 * Inlined SVGs are read here rather than imported, so `onInline` reports each
 * one for the preprocessor to hand to Vite as a watched dependency.
 */
export function remarkImages({ onInline } = {}) {
	return (tree, file) => {
		const filename = file.filename ?? file.path;
		const imports = [];

		const render = (node, block) => {
			if (!isLocal(node.url)) return null;

			const specifier = decodeURI(
				node.url.startsWith(".") ? node.url : `./${node.url}`,
			);
			const path = resolve(dirname(filename), specifier);
			const alt = node.alt ?? "";

			if (block && extname(path).toLowerCase() === ".svg") {
				const prepared = prepareSvg(readFileSync(path, "utf8"), { label: alt });
				onInline?.(filename, path);
				return toSvelteHtml(
					figure(prepared.svg, { size: prepared, caption: node.title }),
				);
			}

			const { width, height } = intrinsicSize(path);
			const name = `__postImage${imports.length}`;
			imports.push({ name, specifier });

			const img = `<img src={${name}} alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
			return block ? figure(img, { caption: node.title }) : img;
		};

		const visit = (node, parent, index) => {
			if (node.type === "paragraph" && parent && isLoneImage(node)) {
				const image = node.children.find((child) => child.type === "image");
				const html = render(image, true);
				if (html) {
					parent.children[index] = { type: "html", value: html };
					return;
				}
			}

			if (node.type === "image") {
				const html = render(node, false);
				if (html) parent.children[index] = { type: "html", value: html };
				return;
			}

			node.children?.forEach((child, childIndex) => visit(child, node, childIndex));
		};

		visit(tree);
		if (imports.length) injectImports(tree, imports);
	};
}
