import { describe, expect, test } from "bun:test";
import { formatDate, toISODate } from "./dates";

describe("formatDate", () => {
	test("formats a date-only string in UTC", () => {
		expect(formatDate("2024-11-16")).toBe("November 16, 2024");
	});

	test("formats a valid Date instance", () => {
		expect(formatDate(new Date("2024-11-16T23:45:00Z"))).toBe("November 16, 2024");
	});

	test("reports an invalid date", () => {
		expect(formatDate("not-a-date")).toBe("Invalid date");
	});

	test("reports a missing date", () => {
		expect(formatDate(null)).toBe("No date");
	});
});

describe("toISODate", () => {
	test("preserves a date-only value", () => {
		expect(toISODate("2024-11-16")).toBe("2024-11-16");
	});

	test("normalizes a timestamp to its UTC date", () => {
		expect(toISODate("2024-11-16T23:45:00-05:00")).toBe("2024-11-17");
	});

	test("returns null for an invalid date", () => {
		expect(toISODate("not-a-date")).toBeNull();
	});

	test("returns null for a missing date", () => {
		expect(toISODate(undefined)).toBeNull();
	});
});
