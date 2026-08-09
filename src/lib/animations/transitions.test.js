import { describe, expect, test } from "bun:test";
import { getTransition, transitions } from "./transitions";

describe("getTransition", () => {
	test("flies upward when leaving home", () => {
		expect(getTransition("/", "/about")).toBe(transitions.flyUp);
	});

	test("flies downward when returning home", () => {
		expect(getTransition("/about", "/")).toBe(transitions.flyDown);
	});

	test("uses the default transition between interior routes", () => {
		expect(getTransition("/about", "/blog")).toBe(transitions.fadeScale);
	});

	test("uses the instant transition for reduced motion", () => {
		expect(getTransition("/", "/about", true)).toBe(transitions.instant);
	});
});
