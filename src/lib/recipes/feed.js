const XML_ESCAPES = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&apos;",
};

function escapeXml(value) {
	return String(value).replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

function element(name, value) {
	return value == null || value === "" ? "" : `<${name}>${escapeXml(value)}</${name}>`;
}

/**
 * When a recipe was added, in epoch ms. Prefers the bundle's `added_at`
 * timestamp; a bare `added` date falls back to UTC midnight. Readers may skip
 * items dated before their last poll, so a real commit time beats a bare day.
 */
export function addedTime(recipe) {
	if (recipe.added_at) return Date.parse(recipe.added_at);
	if (recipe.added) return Date.parse(`${recipe.added}T00:00:00Z`);
	return null;
}

/** Epoch ms as an RFC 822 date, for RSS. */
export function rfc822(time) {
	return new Date(time).toUTCString();
}

/**
 * Orders recipes newest first by when they were added, so feed readers show
 * new ones as new. Recipes without a date follow, by title.
 */
export function feedOrder(recipes) {
	return recipes
		.map((recipe) => ({ recipe, time: addedTime(recipe) }))
		.toSorted((a, b) => {
			if (a.time !== b.time) {
				if (a.time == null || b.time == null) return a.time == null ? 1 : -1;
				return b.time - a.time;
			}
			return a.recipe.title.localeCompare(b.recipe.title);
		})
		.map(({ recipe }) => recipe);
}

/**
 * Builds an RSS 2.0 feed with one item per recipe, each linking to its page.
 * Mela follows each link and reads the page's JSON-LD.
 */
export function buildFeed({ title, description, link, recipes }) {
	const ordered = feedOrder(recipes);
	const newest = ordered.length ? addedTime(ordered[0]) : null;
	const items = ordered.map((recipe) => {
		const time = addedTime(recipe);
		const url = `${link}/${recipe.slug}`;
		return [
			"<item>",
			element("title", recipe.title),
			element("link", url),
			`<guid isPermaLink="true">${escapeXml(url)}</guid>`,
			element("description", recipe.description),
			element("category", recipe.course),
			time == null ? "" : element("pubDate", rfc822(time)),
			"</item>",
		].join("");
	});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0">',
		"<channel>",
		element("title", title),
		element("link", link),
		element("description", description),
		newest == null ? "" : element("lastBuildDate", rfc822(newest)),
		...items,
		"</channel>",
		"</rss>",
		"",
	].join("\n");
}
