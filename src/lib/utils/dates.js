const US_DATE_PATTERN = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
const READABLE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

function parseUSDate(value) {
	const match = US_DATE_PATTERN.exec(value);
	if (!match) return undefined;

	const [month, day, year] = match.slice(1).map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	const isReal =
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day;
	return isReal ? date : null;
}

/**
 * Parses a post date into a `Date` at UTC midnight. Front matter dates are written
 * `MM-DD-YYYY`. `Date` instances and other strings `Date` understands, such as
 * timestamps, are also accepted.
 *
 * @param {unknown} value
 * @returns {Date | null} The date, or `null` when the value is missing or invalid.
 */
export function parseDate(value) {
	if (!value) return null;

	if (value instanceof Date) {
		const time = value.getTime();
		return Number.isFinite(time) ? new Date(time) : null;
	}

	if (typeof value === "string") {
		const usDate = parseUSDate(value.trim());
		if (usDate !== undefined) return usDate;
	}

	const parsed = new Date(value);
	return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function formatDate(date) {
	if (!date) return "No date";

	const normalized = parseDate(date);
	if (!normalized) return "Invalid date";

	return READABLE_DATE_FORMATTER.format(normalized);
}

export function toISODate(date) {
	const normalized = parseDate(date);
	if (!normalized) return null;
	return normalized.toISOString().split("T")[0];
}
