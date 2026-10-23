import { describe, expect, test } from "bun:test";
import { getRouteMeta, getSection, normalizeRoute } from "./meta";

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

describe("getSection", () => {
	test("maps an article to the blog section", () => {
		expect(getSection("/blog/test-post")).toBe("/blog");
	});

	test("maps a recipe to the recipes section", () => {
		expect(getSection("/recipes/carnitas/")).toBe("/recipes");
	});

	test("keeps a section's own route", () => {
		expect(getSection("/recipes")).toBe("/recipes");
	});

	test("does not match a route that only shares a prefix", () => {
		expect(getSection("/blogroll")).toBe("/blogroll");
	});

	test("returns other routes normalized", () => {
		expect(getSection("/about/")).toBe("/about");
	});
});

describe("getRouteMeta", () => {
	test("returns route-specific metadata", () => {
		expect(getRouteMeta("/about")?.title).toBe("About | Collin Murch");
	});

	test("returns metadata for the recipes page", () => {
		expect(getRouteMeta("/recipes")?.title).toBe("Recipes | Collin Murch");
	});

	test("returns no layout metadata for an article", () => {
		expect(getRouteMeta("/blog/test-post")).toBeNull();
	});

	test("returns no layout metadata for a recipe", () => {
		expect(getRouteMeta("/recipes/pork-carnitas")).toBeNull();
	});

	test("returns no layout metadata for a plan", () => {
		expect(getRouteMeta("/recipes/plans/2026-10-12")).toBeNull();
	});

	test("returns default metadata for an unknown route", () => {
		expect(getRouteMeta("/missing")?.title).toBe("Collin Murch | Software Engineer");
	});
});
