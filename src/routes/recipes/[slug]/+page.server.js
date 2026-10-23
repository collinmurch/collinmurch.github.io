import { error } from "@sveltejs/kit";
import { jsonLdScript, sourceUrl, withUrl } from "#lib/recipes/bundle";
import { getBundle } from "#lib/recipes/data.server";
import { summarize } from "#lib/recipes/listing";
import { SITE_ORIGIN } from "#lib/seo/meta";

export function entries() {
	return getBundle().index.recipes.map(({ slug }) => ({ slug }));
}

export function load({ params }) {
	const bundle = getBundle();
	const recipe = bundle.recipe(params.slug);
	if (!recipe) error(404, `Recipe not found: ${params.slug}`);

	const url = `${SITE_ORIGIN}/recipes/${recipe.slug}`;
	return {
		recipe,
		jsonLd: jsonLdScript(withUrl(bundle.jsonLd(recipe.slug), url)),
		sourceUrl: sourceUrl(bundle.index, recipe),
		units: bundle.index.units,
		pairs: (recipe.pairs ?? [])
			.map((slug) => bundle.recipe(slug))
			.filter(Boolean)
			.map(summarize),
	};
}
