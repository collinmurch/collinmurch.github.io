import { describe, expect, test } from "bun:test";
import { readBundle } from "./data.server";

const missing = `${import.meta.dir}/no-such-bundle`;
const quiet = { warn: () => {} };

describe("readBundle", () => {
	test("gives an empty collection when the folder is missing", () => {
		expect(readBundle(missing, quiet).index.recipes).toEqual([]);
	});

	test("warns when the folder is missing", () => {
		const warnings = [];
		readBundle(missing, { warn: (message) => warnings.push(message) });
		expect(warnings[0]).toContain("No recipe bundle");
	});

	test("serves a valid index for an empty collection", () => {
		expect(JSON.parse(readBundle(missing, quiet).indexText).schema).toBe(1);
	});

	test("finds no recipe in an empty collection", () => {
		expect(readBundle(missing, quiet).recipe("jambalaya")).toBeUndefined();
	});
});
