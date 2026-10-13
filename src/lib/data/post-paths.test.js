import { describe, expect, test } from "bun:test";
import { resolvePostEntries } from "./post-paths";

describe("resolvePostEntries", () => {
	test("keys each post by its folder name", () => {
		const entries = resolvePostEntries(["/posts/tides/index.md"]);

		expect([...entries.keys()]).toEqual(["tides"]);
	});

	test("prefers a file named after the folder", () => {
		const entries = resolvePostEntries([
			"/posts/tides/index.md",
			"/posts/tides/README.md",
			"/posts/tides/tides.md",
		]);

		expect(entries.get("tides")).toBe("/posts/tides/tides.md");
	});

	test("falls back to README.md before index.md", () => {
		const entries = resolvePostEntries([
			"/posts/tides/index.md",
			"/posts/tides/README.md",
		]);

		expect(entries.get("tides")).toBe("/posts/tides/README.md");
	});

	test("falls back to index.md", () => {
		const entries = resolvePostEntries([
			"/posts/tides/notes.md",
			"/posts/tides/index.md",
		]);

		expect(entries.get("tides")).toBe("/posts/tides/index.md");
	});

	test("ignores other Markdown files in a post folder", () => {
		const entries = resolvePostEntries([
			"/posts/tides/tides.md",
			"/posts/tides/notes.md",
		]);

		expect([...entries.values()]).toEqual(["/posts/tides/tides.md"]);
	});

	test("throws for a folder without an entry file", () => {
		expect(() => resolvePostEntries(["/posts/tides/notes.md"])).toThrow(
			'Post folder "tides" needs tides.md, README.md, or index.md',
		);
	});
});
