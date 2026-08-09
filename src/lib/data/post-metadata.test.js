import { describe, expect, test } from "bun:test";
import { buildPostMetadata } from "./post-metadata";

describe("buildPostMetadata", () => {
	test("converts post paths to slugs", () => {
		const posts = buildPostMetadata([
			["/src/posts/example.md", { title: "Example", date: "2024-01-01" }],
		]);

		expect(posts[0].path).toBe("example");
	});

	test("sorts newest posts first", () => {
		const posts = buildPostMetadata([
			["/src/posts/older.md", { date: "2023-01-01" }],
			["/src/posts/newer.md", { date: "2024-01-01" }],
		]);

		expect(posts.map((post) => post.path)).toEqual(["newer", "older"]);
	});

	test("places posts without valid dates last", () => {
		const posts = buildPostMetadata([
			["/src/posts/undated.md", { date: "invalid" }],
			["/src/posts/dated.md", { date: "2024-01-01" }],
		]);

		expect(posts.map((post) => post.path)).toEqual(["dated", "undated"]);
	});

	test("normalizes missing metadata", () => {
		const posts = buildPostMetadata([["/src/posts/example.md", undefined]]);

		expect(posts[0].meta).toEqual({});
	});
});
