export const SITE_ORIGIN = "https://collinmurch.com";

const DEFAULT_META = {
	title: "Collin Murch | Software Engineer",
	description:
		"Collin Murch is a full stack software engineer exploring web, AI, and systems design.",
	twitterCard: "summary",
};

const META_BY_ROUTE = {
	"/": {
		title: "Collin Murch | Software Engineer",
		description:
			"Welcome to Collin Murch's personal site featuring experience, writing, and contact links.",
	},
	"/about": {
		title: "About | Collin Murch",
		description:
			"Learn more about Collin Murch's background, interests, and current work at Zillow Home Loans.",
	},
	"/blog": {
		title: "Blog | Collin Murch",
		description:
			"Articles and notes from Collin Murch on engineering, architecture, AI, and more.",
	},
	"/recipes": {
		title: "Recipes | Collin Murch",
		description: "Recipes and drinks from Collin Murch's kitchen.",
	},
};

const SECTIONS = ["/blog", "/recipes"];

export function normalizeRoute(pathname) {
	if (!pathname) return "/";
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

/**
 * Returns the top-level section a pathname belongs to, so every page under
 * `/blog` or `/recipes` counts as that section.
 */
export function getSection(pathname) {
	const normalized = normalizeRoute(pathname);
	return (
		SECTIONS.find(
			(section) => normalized === section || normalized.startsWith(`${section}/`),
		) ?? normalized
	);
}

/**
 * Returns the layout's title and description for a route, or `null` for a page
 * inside a section, such as a post or a recipe, which sets its own.
 */
export function getRouteMeta(pathname) {
	const normalized = normalizeRoute(pathname);
	if (getSection(normalized) !== normalized) return null;

	return META_BY_ROUTE[normalized] ?? DEFAULT_META;
}
