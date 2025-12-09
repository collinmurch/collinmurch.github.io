import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const READABLE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

function normalizeDateInput(value) {
	if (!value) return null;

	if (value instanceof Date) {
		const time = value.getTime();
		return Number.isFinite(time) ? new Date(time) : null;
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		const match = DATE_ONLY_PATTERN.exec(trimmed);
		if (match) {
			const [, year, month, day] = match;
			const utcDate = Date.UTC(Number(year), Number(month) - 1, Number(day));
			return new Date(utcDate);
		}
	}

	const parsed = new Date(value);
	return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function formatDate(date) {
	if (!date) return "No date";

	const normalized = normalizeDateInput(date);
	if (!normalized) return "Invalid date";

	return READABLE_DATE_FORMATTER.format(normalized);
}

export function toISODate(date) {
	if (!date) return null;
	const normalized = normalizeDateInput(date);
	if (!normalized) return null;
	return normalized.toISOString().split("T")[0];
}
