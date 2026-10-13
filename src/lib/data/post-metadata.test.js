import { describe, expect, test } from "bun:test";
import { assertFrontMatter, buildPostMetadata } from "./post-metadata";

const meta = (overrides) => ({
	title: "Example",
	date: "01-01-2024",
	description: "About it.",
	...overrides,
});

describe("assertFrontMatter", () => {
	test("accepts complete front matter", () => {
		expect(() => assertFrontMatter("example", meta())).not.toThrow();
	});

	test("names every missing field", () => {
		expect(() => assertFrontMatter("example", { date: "01-01-2024" })).toThrow(
			'Post "example" needs title, description in its front matter',
		);
	});

	test("rejects missing front matter", () => {
		expect(() => assertFrontMatter("example", undefined)).toThrow(
			"needs title, date, description",
		);
	});

	test("rejects a date that does not parse", () => {
		expect(() => assertFrontMatter("example", meta({ date: "13-45-2024" }))).toThrow(
			'Post "example" has an invalid date "13-45-2024"',
		);
	});
});

describe("buildPostMetadata", () => {
	test("uses the slug as the post path", () => {
		const posts = buildPostMetadata([["example", meta()]]);

		expect(posts[0].path).toBe("example");
	});

	test("keeps the front matter as the post's meta", () => {
		const posts = buildPostMetadata([["example", meta()]]);

		expect(posts[0].meta).toEqual(meta());
	});

	test("sorts newest posts first", () => {
		const posts = buildPostMetadata([
			["older", meta({ date: "01-01-2023" })],
			["newer", meta({ date: "01-01-2024" })],
		]);

		expect(posts.map((post) => post.path)).toEqual(["newer", "older"]);
	});

	test("fails on a post with invalid front matter", () => {
		expect(() => buildPostMetadata([["broken", { title: "Broken" }]])).toThrow(
			'Post "broken"',
		);
	});
});
