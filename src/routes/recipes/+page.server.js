import { summarize, summarizePlan } from "#lib/recipes/bundle";
import { getBundle } from "#lib/recipes/data.server";

export function load() {
	const { index } = getBundle();
	return {
		recipes: index.recipes.map(summarize),
		plans: index.plans.map(summarizePlan).toReversed(),
	};
}
