import { error } from "@sveltejs/kit";
import { getBundle } from "#lib/recipes/data.server";

export const prerender = true;

export function entries() {
	return getBundle().index.recipes.map(({ slug }) => ({ slug }));
}

export function GET({ params }) {
	const bundle = getBundle();
	if (!bundle.recipe(params.slug)) error(404, `Recipe not found: ${params.slug}`);
	return new Response(bundle.source(params.slug), {
		headers: { "content-type": "text/plain; charset=utf-8" },
	});
}
