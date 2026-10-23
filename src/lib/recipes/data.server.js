import { existsSync, readFileSync } from "node:fs";
import { parseIndex } from "./bundle.js";

/**
 * Reads the recipe bundle that the recipes repo builds: `index.json`, plus a
 * JSON-LD file per recipe. This is the only place the site touches recipe
 * data, and it never parses Cooklang.
 *
 * The recipes repo's CI commits the bundle to `recipes-data/`, so a missing
 * bundle fails the build rather than deploying an empty `/recipes`. It reads
 * with `node:fs` because it runs inside SvelteKit's build, which runs on Node.
 */
export function readBundle(dir) {
	const indexPath = `${dir}/index.json`;
	if (!existsSync(indexPath)) {
		throw new Error(
			`No recipe bundle at ${indexPath}. The recipes repo's CI commits it to recipes-data/, so restore that folder, or set RECIPES_DIR to a bundle from \`recipes build\`.`,
		);
	}

	const indexText = readFileSync(indexPath, "utf8");
	const index = parseIndex(indexText);
	const recipes = new Map(index.recipes.map((recipe) => [recipe.slug, recipe]));
	const plans = new Map(index.plans.map((plan) => [plan.id, plan]));

	return {
		index,
		indexText,
		recipe: (slug) => recipes.get(slug),
		plan: (id) => plans.get(id),
		jsonLd: (slug) => JSON.parse(readFileSync(`${dir}/jsonld/${slug}.json`, "utf8")),
	};
}

let bundle;

/**
 * The bundle in `recipes-data/`, read once. `RECIPES_DIR` points it at another
 * bundle, such as a local `recipes build` of unpublished recipes. A relative
 * path is read from the project root, where the build runs.
 */
export function getBundle() {
	bundle ??= readBundle(process.env.RECIPES_DIR ?? "recipes-data");
	return bundle;
}
