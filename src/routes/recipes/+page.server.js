import { listPlans, listRecipes } from "#lib/recipes/listing";
import { getBundle } from "#lib/recipes/data.server";

export function load() {
	const { index } = getBundle();
	return {
		recipes: listRecipes(index.recipes),
		plans: listPlans(index.plans),
	};
}
