import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readBundle } from "./data.server";

function writeBundle(index) {
	const dir = mkdtempSync(join(tmpdir(), "bundle-"));
	mkdirSync(join(dir, "jsonld"));
	writeFileSync(join(dir, "index.json"), JSON.stringify(index));
	writeFileSync(join(dir, "jsonld", "jambalaya.json"), '{"name":"Jambalaya"}');
	return dir;
}

const bundle = readBundle(
	writeBundle({
		schema: 1,
		commit: null,
		recipes: [{ slug: "jambalaya", title: "Jambalaya" }],
		plans: [{ id: "2026-10-12" }],
		vocab: [],
	}),
);

describe("readBundle", () => {
	test("fails when the folder is missing", () => {
		expect(() => readBundle(`${import.meta.dir}/no-such-bundle`)).toThrow(
			"No recipe bundle",
		);
	});

	test("fails on an unknown schema", () => {
		expect(() => readBundle(writeBundle({ schema: 2 }))).toThrow("schema 2");
	});

	test("finds a recipe by slug", () => {
		expect(bundle.recipe("jambalaya")?.title).toBe("Jambalaya");
	});

	test("finds a plan by id", () => {
		expect(bundle.plan("2026-10-12")).toBeDefined();
	});

	test("finds no recipe for an unknown slug", () => {
		expect(bundle.recipe("gumbo")).toBeUndefined();
	});

	test("reads a recipe's JSON-LD", () => {
		expect(bundle.jsonLd("jambalaya").name).toBe("Jambalaya");
	});
});
