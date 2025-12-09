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
};

export function normalizeRoute(pathname) {
	if (!pathname) return "/";
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

export function getRouteMeta(pathname) {
	const normalized = normalizeRoute(pathname);
	if (normalized.startsWith("/blog/") && normalized !== "/blog") {
		return null;
	}

	return META_BY_ROUTE[normalized] ?? DEFAULT_META;
}
