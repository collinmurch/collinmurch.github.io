import { describe, expect, test } from "bun:test";
import { resolvePostEntries } from "./post-paths";

describe("resolvePostEntries", () => {
	test("keys each post by its folder name", () => {
		const entries = resolvePostEntries(["/src/posts/tides/index.md"]);

		expect([...entries.keys()]).toEqual(["tides"]);
	});

	test("prefers a file named after the folder", () => {
		const entries = resolvePostEntries([
			"/src/posts/tides/index.md",
			"/src/posts/tides/README.md",
			"/src/posts/tides/tides.md",
		]);

		expect(entries.get("tides")).toBe("/src/posts/tides/tides.md");
	});

	test("falls back to README.md before index.md", () => {
		const entries = resolvePostEntries([
			"/src/posts/tides/index.md",
			"/src/posts/tides/README.md",
		]);

		expect(entries.get("tides")).toBe("/src/posts/tides/README.md");
	});

	test("falls back to index.md", () => {
		const entries = resolvePostEntries([
			"/src/posts/tides/notes.md",
			"/src/posts/tides/index.md",
		]);

		expect(entries.get("tides")).toBe("/src/posts/tides/index.md");
	});

	test("ignores other Markdown files in a post folder", () => {
		const entries = resolvePostEntries([
			"/src/posts/tides/tides.md",
			"/src/posts/tides/notes.md",
		]);

		expect([...entries.values()]).toEqual(["/src/posts/tides/tides.md"]);
	});

	test("throws for a folder without an entry file", () => {
		expect(() => resolvePostEntries(["/src/posts/tides/notes.md"])).toThrow(
			'Post folder "tides" needs tides.md, README.md, or index.md',
		);
	});
});
