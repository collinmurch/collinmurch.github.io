/** The `index.json` format this site renders. */
export const SCHEMA = 1;

const SOURCE_BASE = "https://raw.githubusercontent.com/collinmurch/recipes";

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

/**
 * A recipe's raw Cooklang file in the recipes repo, at the commit the bundle was
 * built from, so it always matches the page. A local build has no commit, so
 * it links to the file on main.
 */
export function sourceUrl(index, recipe) {
	return `${SOURCE_BASE}/${index.commit ?? "main"}/${recipe.path}`;
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
