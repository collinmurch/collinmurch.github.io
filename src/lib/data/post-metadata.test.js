import { describe, expect, test } from "bun:test";
import { buildPostMetadata } from "./post-metadata";

describe("buildPostMetadata", () => {
	test("uses the slug as the post path", () => {
		const posts = buildPostMetadata([
			["example", { title: "Example", date: "2024-01-01" }],
		]);

		expect(posts[0].path).toBe("example");
	});

	test("sorts newest posts first", () => {
		const posts = buildPostMetadata([
			["older", { date: "2023-01-01" }],
			["newer", { date: "2024-01-01" }],
		]);

		expect(posts.map((post) => post.path)).toEqual(["newer", "older"]);
	});

	test("places posts without valid dates last", () => {
		const posts = buildPostMetadata([
			["undated", { date: "invalid" }],
			["dated", { date: "2024-01-01" }],
		]);

		expect(posts.map((post) => post.path)).toEqual(["dated", "undated"]);
	});

	test("normalizes missing metadata", () => {
		const posts = buildPostMetadata([["example", undefined]]);

		expect(posts[0].meta).toEqual({});
	});
});
