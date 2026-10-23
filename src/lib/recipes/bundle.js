import { searchable } from "./format";

/** The `index.json` format this site renders. */
export const SCHEMA = 1;

/**
 * Parses the bundle's `index.json`, failing on any schema but the one this
 * site renders, so a format change can't ship half-rendered.
 */
export function parseIndex(text) {
	const index = JSON.parse(text);
	if (index?.schema !== SCHEMA) {
		throw new Error(
			`The recipes bundle has schema ${JSON.stringify(index?.schema)}, but this site renders schema ${SCHEMA}`,
		);
	}
	return index;
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

/** The bundle's unit table, cut down to the units a recipe's amounts name. */
export function unitsUsed(recipe, units) {
	const used = new Set(
		recipe.ingredients.flatMap((group) =>
			group.items.flatMap((item) => item.amounts.map((amount) => amount.unit)),
		),
	);
	return Object.fromEntries(Object.entries(units).filter(([unit]) => used.has(unit)));
}

/** The fields the recipe listing shows for a plan. */
export function summarizePlan(plan) {
	return { id: plan.id, title: plan.title, start: plan.start, name: plan.name };
}

/** A plan's display name: its title, or what the plan covers. */
export function planTitle(plan) {
	if (plan.title) return plan.title;
	if (plan.name) return plan.name.replaceAll("-", " ");
	return `Week of ${plan.start}`;
}

/** The bundle's JSON-LD leaves out the page URL, which only the site knows. */
export function withUrl(jsonLd, url) {
	return { ...jsonLd, url };
}

/**
 * Serializes JSON-LD into a script tag for `{@html}`. Escaping `<` keeps text
 * such as `</script>` in a recipe from closing the tag early.
 */
export function jsonLdScript(data) {
	const json = JSON.stringify(data).replaceAll("<", "\\u003c");
	return `<script type="application/ld+json">${json}</script>`;
}
