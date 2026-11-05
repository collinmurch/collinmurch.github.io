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

/** How many recipes a course's carousel on the listing shows before its "All N" card. */
export const CAROUSEL_SIZE = 7;

/** How many plans the listing shows before linking to the plans page. */
export const PLAN_PREVIEW_SIZE = 6;

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

/** Plans for a listing, newest first. The bundle lists them oldest first. */
export function listPlans(plans) {
	return plans.map(summarizePlan).toReversed();
}

/** The fields the recipe listing shows for a plan. */
function summarizePlan(plan) {
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

export const RECIPES_HOME = { href: "/recipes", label: "Recipes" };

/**
 * Where a recipe page's back link leads after arriving from `pathname`: the
 * recipe listing, a course page, or one of `plans` (the plans that include the
 * recipe, as `{ id, title }`). Null for anywhere else, such as another recipe.
 */
export function backTo(pathname, plans) {
	const [, root, slug, id, ...rest] = pathname.replace(/\/$/, "").split("/");
	if (root !== "recipes" || rest.length > 0) return null;
	if (!slug) return RECIPES_HOME;
	if (slug === "plans") {
		const plan = plans.find((candidate) => candidate.id === id);
		return plan ? { href: `/recipes/plans/${id}`, label: plan.title } : null;
	}
	const course = !id && courseOf(slug);
	return course ? { href: `/recipes/${slug}`, label: courseLabel(course) } : null;
}
