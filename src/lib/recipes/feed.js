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

/** An ISO `YYYY-MM-DD` date as an RFC 822 date at UTC midnight, for RSS. */
export function rfc822(date) {
	return new Date(`${date}T00:00:00Z`).toUTCString();
}

/**
 * Orders recipes newest first by their `added` date, so feed readers show new
 * ones as new. Recipes without a date follow, by title.
 */
export function feedOrder(recipes) {
	return recipes.toSorted((a, b) => {
		if (a.added && b.added && a.added !== b.added) return a.added < b.added ? 1 : -1;
		if (Boolean(a.added) !== Boolean(b.added)) return a.added ? -1 : 1;
		return a.title.localeCompare(b.title);
	});
}

/**
 * Builds an RSS 2.0 feed with one item per recipe, each linking to its page.
 * Mela follows each link and reads the page's JSON-LD.
 */
export function buildFeed({ title, description, link, recipes }) {
	const items = feedOrder(recipes).map((recipe) => {
		const url = `${link}/${recipe.slug}`;
		return [
			"<item>",
			element("title", recipe.title),
			element("link", url),
			`<guid isPermaLink="true">${escapeXml(url)}</guid>`,
			element("description", recipe.description),
			element("category", recipe.course),
			recipe.added ? element("pubDate", rfc822(recipe.added)) : "",
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
		...items,
		"</channel>",
		"</rss>",
		"",
	].join("\n");
}
