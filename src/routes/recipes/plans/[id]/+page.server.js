import { error } from "@sveltejs/kit";
import { getBundle } from "#lib/recipes/data.server";

export function entries() {
	return getBundle().index.plans.map(({ id }) => ({ id }));
}

export function load({ params }) {
	const bundle = getBundle();
	const plan = bundle.plan(params.id);
	if (!plan) error(404, `Plan not found: ${params.id}`);

	return {
		plan,
		meals: plan.meals.map((meal) => ({
			...meal,
			title: bundle.recipe(meal.recipe)?.title ?? meal.recipe,
		})),
	};
}
