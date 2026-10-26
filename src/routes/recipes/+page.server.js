import { listRecipes, summarizePlan } from "#lib/recipes/listing";
import { getBundle } from "#lib/recipes/data.server";

export function load() {
	const { index } = getBundle();
	return {
		recipes: listRecipes(index.recipes),
		plans: index.plans.map(summarizePlan).toReversed(),
	};
}
