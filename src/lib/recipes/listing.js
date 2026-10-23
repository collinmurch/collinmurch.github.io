import { humanize } from "./format";

const COURSES = {
	breakfast: "Breakfast",
	main: "Mains",
	side: "Sides",
	sauce: "Sauces",
	snack: "Snacks",
	dessert: "Desserts",
	drink: "Drinks",
};

/** The fields a recipe card shows, plus the words a search can match. */
export function summarize(recipe) {
	return {
		slug: recipe.slug,
		title: recipe.title,
		course: recipe.course,
		cuisine: recipe.cuisine ?? null,
		time: recipe.time_total ?? null,
		description: recipe.description ?? null,
		keywords: keywords(recipe),
	};
}

function keywords(recipe) {
	const ingredients = recipe.ingredients
		.flatMap((group) => group.items)
		.flatMap((item) => [item.text, item.name]);
	const words = [
		recipe.title,
		recipe.cuisine,
		...recipe.proteins,
		...(recipe.tags ?? []),
	];
	return searchable([...words, ...ingredients].filter(Boolean).join(" "));
}

function searchable(text) {
	return text.toLowerCase().replaceAll("-", " ");
}

/** Whether a recipe's keywords contain every word of a search. */
export function matchesSearch(recipe, query) {
	return searchable(query)
		.split(/\s+/)
		.every((word) => recipe.keywords.includes(word));
}

/** The fields the recipe listing shows for a plan. */
export function summarizePlan(plan) {
	return { id: plan.id, title: plan.title, start: plan.start, name: plan.name };
}

/**
 * Recipes grouped the way a menu reads, breakfast through drinks. A course
 * this site doesn't know yet goes last, named after itself.
 */
export function byCourse(recipes) {
	const present = new Set(recipes.map((recipe) => recipe.course));
	const known = Object.keys(COURSES).filter((course) => present.has(course));
	const unknown = [...present].filter((course) => !(course in COURSES)).toSorted();
	return [...known, ...unknown].map((course) => ({
		course,
		label: COURSES[course] ?? humanize(course),
		recipes: recipes.filter((recipe) => recipe.course === course),
	}));
}
