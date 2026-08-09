import { describe, expect, test } from "bun:test";
import { getRouteMeta, normalizeRoute } from "./meta";

describe("normalizeRoute", () => {
	test("defaults an empty pathname to the home route", () => {
		expect(normalizeRoute("")).toBe("/");
	});

	test("preserves the home route", () => {
		expect(normalizeRoute("/")).toBe("/");
	});

	test("removes a trailing slash", () => {
		expect(normalizeRoute("/about/")).toBe("/about");
	});
});

describe("getRouteMeta", () => {
	test("returns route-specific metadata", () => {
		expect(getRouteMeta("/about")?.title).toBe("About | Collin Murch");
	});

	test("returns no layout metadata for an article", () => {
		expect(getRouteMeta("/blog/test-post")).toBeNull();
	});

	test("returns default metadata for an unknown route", () => {
		expect(getRouteMeta("/missing")?.title).toBe("Collin Murch | Software Engineer");
	});
});
