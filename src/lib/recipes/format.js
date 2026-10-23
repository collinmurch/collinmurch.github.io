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

/** The listing's filters: each facet's values, sorted. */
export function facets(recipes) {
	const values = (pick) => [...new Set(recipes.flatMap(pick))].toSorted();
	return {
		course: values((recipe) => [recipe.course]),
		cuisine: values((recipe) => (recipe.cuisine ? [recipe.cuisine] : [])),
		protein: values((recipe) => recipe.proteins),
	};
}

/** Whether a recipe matches every chosen filter. A null filter matches all. */
export function matchesFilters(recipe, { course, cuisine, protein }) {
	return (
		(!course || recipe.course === course) &&
		(!cuisine || recipe.cuisine === cuisine) &&
		(!protein || recipe.proteins.includes(protein))
	);
}
