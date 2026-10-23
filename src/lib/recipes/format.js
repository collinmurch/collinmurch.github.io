/** A slug or vocab name as words: `southeast-asian` reads "southeast asian". */
export function humanize(slug) {
	return slug.replaceAll("-", " ");
}

/** Minutes as a short duration, like "45 min" or "1 hr 5 min". */
export function formatMinutes(minutes) {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (hours === 0) return `${rest} min`;
	return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/**
 * Splits a section's content into runs of consecutive steps and the notes
 * between them, so each run can render as one numbered list.
 */
export function stepRuns(content) {
	const runs = [];
	for (const item of content) {
		const last = runs.at(-1);
		if (item.type === "step" && last?.type === "steps") last.steps.push(item);
		else if (item.type === "step") runs.push({ type: "steps", steps: [item] });
		else runs.push(item);
	}
	return runs;
}

/** A step token's display text, which joins with the others into the step's text. */
export function tokenText(token) {
	if (token.type === "text") return token.value;
	if (token.type === "timer") return token.amount;
	return token.text;
}

/** A recipe's source as a link, or as text when it isn't a URL. */
export function describeSource(source) {
	try {
		const url = new URL(source);
		if (url.protocol === "http:" || url.protocol === "https:") {
			return { href: url.href, text: url.hostname.replace(/^www\./, "") };
		}
	} catch {
		// Not a URL, so it names a person or a book.
	}
	return { href: null, text: source };
}

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

/** Search text in one form: lowercase, with hyphens read as spaces. */
export function searchable(text) {
	return text.toLowerCase().replaceAll("-", " ");
}

/** Whether a recipe's keywords contain every word of a search. */
export function matchesSearch(recipe, query) {
	return searchable(query)
		.split(/\s+/)
		.every((word) => recipe.keywords.includes(word));
}
