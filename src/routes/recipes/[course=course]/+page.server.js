import { error } from "@sveltejs/kit";
import { getBundle } from "#lib/recipes/data.server";
import { byCourse, courseLabel, listRecipes } from "#lib/recipes/listing";

export function entries() {
	return byCourse(getBundle().index.recipes)
		.filter(({ slug }) => slug)
		.map(({ slug }) => ({ course: slug }));
}

export function load({ params: { course } }) {
	const recipes = getBundle().index.recipes.filter(
		(recipe) => recipe.course === course,
	);
	if (recipes.length === 0) error(404, `No recipes in ${course}`);

	return { label: courseLabel(course), recipes: listRecipes(recipes) };
}
