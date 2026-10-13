import { describe, expect, test } from "bun:test";
import { formatDate, parseDate, toISODate } from "./dates";

describe("parseDate", () => {
	test("parses an MM-DD-YYYY string at UTC midnight", () => {
		expect(parseDate("11-16-2024")?.toISOString()).toBe("2024-11-16T00:00:00.000Z");
	});

	test("accepts single-digit months and days", () => {
		expect(parseDate("3-7-2025")?.toISOString()).toBe("2025-03-07T00:00:00.000Z");
	});

	test("rejects a day-first date", () => {
		expect(parseDate("16-11-2024")).toBeNull();
	});

	test("rejects a day past the end of the month", () => {
		expect(parseDate("02-30-2024")).toBeNull();
	});

	test("accepts a leap day", () => {
		expect(parseDate("02-29-2024")?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
	});

	test("accepts a Date instance", () => {
		const date = new Date("2024-11-16T23:45:00Z");
		expect(parseDate(date)?.getTime()).toBe(date.getTime());
	});

	test("returns null for a missing date", () => {
		expect(parseDate(undefined)).toBeNull();
	});
});

describe("formatDate", () => {
	test("formats an MM-DD-YYYY string", () => {
		expect(formatDate("11-16-2024")).toBe("November 16, 2024");
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
	test("converts an MM-DD-YYYY string", () => {
		expect(toISODate("11-16-2024")).toBe("2024-11-16");
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
