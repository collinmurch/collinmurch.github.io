import { existsSync, readFileSync } from "node:fs";
import { EMPTY_INDEX, parseIndex } from "./bundle.js";

/**
 * Reads the recipe bundle that the recipes repo builds: `index.json`, plus a
 * JSON-LD file and the raw `.cook` source per recipe. This is the only place
 * the site touches recipe data, and it never parses Cooklang.
 *
 * A missing folder gives an empty collection and a warning, so the site still
 * builds locally without the bundle. CI fetches the bundle before building.
 * It reads with `node:fs` because it runs inside SvelteKit's build, which runs
 * on Node.
 */
export function readBundle(dir, { warn = console.warn } = {}) {
	const indexPath = `${dir}/index.json`;
	const found = existsSync(indexPath);
	if (!found) {
		warn(
			`No recipe bundle at ${indexPath}, so /recipes will be empty. Run \`recipes build\` in the recipes repo and set RECIPES_DIR to its dist folder.`,
		);
	}

	const indexText = found
		? readFileSync(indexPath, "utf8")
		: JSON.stringify(EMPTY_INDEX);
	const index = parseIndex(indexText);
	const recipes = new Map(index.recipes.map((recipe) => [recipe.slug, recipe]));
	const plans = new Map(index.plans.map((plan) => [plan.id, plan]));

	return {
		index,
		indexText,
		recipe: (slug) => recipes.get(slug),
		plan: (id) => plans.get(id),
		jsonLd: (slug) => JSON.parse(readFileSync(`${dir}/jsonld/${slug}.json`, "utf8")),
		source: (slug) => readFileSync(`${dir}/sources/${slug}.cook`, "utf8"),
	};
}

let bundle;

/**
 * The bundle in `RECIPES_DIR`, or `recipes-data/` by default, read once. A
 * relative path is read from the project root, where the build runs.
 */
export function getBundle() {
	bundle ??= readBundle(process.env.RECIPES_DIR ?? "recipes-data");
	return bundle;
}
