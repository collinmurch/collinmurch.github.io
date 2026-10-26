import { humanize } from "./format.js";

const COURSES = {
	breakfast: "Breakfast",
	main: "Mains",
	side: "Sides",
	sauce: "Sauces",
	snack: "Snacks",
	dessert: "Desserts",
	drink: "Drinks",
};

/**
 * How many recipes a course shows on the listing before linking to its own
 * page. Six fills whole rows whether the cards sit one, two, or three across.
 */
export const PREVIEW_SIZE = 6;

/** Recipe cards for a listing, the most recently and most often cooked first. */
export function listRecipes(recipes) {
	return recipes.toSorted(byCooking).map(summarize);
}

function byCooking(a, b) {
	return (
		(b.last_cooked ?? "").localeCompare(a.last_cooked ?? "") ||
		b.times_cooked - a.times_cooked
	);
}

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
 * Recipes grouped the way a menu reads, breakfast through drinks. Each known
 * course has a page at `/recipes/<slug>`. A course this site doesn't know yet
 * goes last, named after itself, and has no page.
 */
export function byCourse(recipes) {
	const present = new Set(recipes.map((recipe) => recipe.course));
	const known = Object.keys(COURSES).filter((course) => present.has(course));
	const unknown = [...present].filter((course) => !(course in COURSES)).toSorted();
	return [...known, ...unknown].map((course) => ({
		course,
		label: courseLabel(course),
		slug: courseSlug(course),
		recipes: recipes.filter((recipe) => recipe.course === course),
	}));
}

/** A course's heading, such as `Mains` for `main`. */
export function courseLabel(course) {
	return COURSES[course] ?? humanize(course);
}

function courseSlug(course) {
	return COURSES[course]?.toLowerCase();
}

/** The course a course page's slug names, such as `main` for `mains`. */
export function courseOf(slug) {
	return Object.keys(COURSES).find((course) => courseSlug(course) === slug);
}
