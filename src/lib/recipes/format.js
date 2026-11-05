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

const MONTH_DAY = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});
const WEEKDAY = new Intl.DateTimeFormat("en-US", {
	weekday: "short",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

function utcDate(isoDate) {
	return new Date(`${isoDate}T00:00:00Z`);
}

/**
 * A plan's display name: its title, its name in title case, or the week it
 * starts. The year is left to the plan page's subtitle.
 */
export function planTitle(plan) {
	if (plan.title) return plan.title;
	if (plan.name) return humanize(plan.name).replaceAll(/\b\w/g, (c) => c.toUpperCase());
	return `Week of ${MONTH_DAY.format(utcDate(plan.start))}`;
}

/** A meal's day in a plan, like "Thu, Nov 5". */
export function mealDay(isoDate) {
	return WEEKDAY.format(utcDate(isoDate));
}
