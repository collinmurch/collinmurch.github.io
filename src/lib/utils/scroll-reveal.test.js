import { describe, expect, test } from "bun:test";
import { createScrollReveal } from "./scroll-reveal";

describe("createScrollReveal", () => {
	test("starts shown", () => {
		const reveal = createScrollReveal();
		expect(reveal.update(0)).toBe(false);
	});

	test("hides after scrolling down past the threshold", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		expect(reveal.update(200)).toBe(true);
	});

	test("ignores downward movement within the threshold", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(100);
		reveal.update(50);
		expect(reveal.update(58)).toBe(false);
	});

	test("accumulates small downward steps", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(100);
		reveal.update(50);
		reveal.update(55);
		expect(reveal.update(61)).toBe(true);
	});

	test("stays shown until scrolling down past hideAfter", () => {
		const reveal = createScrollReveal({ hideAfter: 100, showAfter: 10 });
		reveal.update(500);
		reveal.update(400);
		expect(reveal.update(480)).toBe(false);
	});

	test("shows after a shorter upward scroll than it takes to hide", () => {
		const reveal = createScrollReveal({ hideAfter: 100, showAfter: 10 });
		reveal.update(500);
		expect(reveal.update(485)).toBe(false);
	});

	test("shows again after scrolling up past the threshold", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(300);
		expect(reveal.update(280)).toBe(false);
	});

	test("stays hidden on a small upward jitter", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(300);
		expect(reveal.update(295)).toBe(true);
	});

	test("always shows within the top zone", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(300);
		expect(reveal.update(290, { topZone: 400 })).toBe(false);
	});

	test("ignores rubber-band overscroll past the bottom", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(1000, { max: 1000 });
		reveal.update(1080, { max: 1000 });
		expect(reveal.update(1000, { max: 1000 })).toBe(true);
	});

	test("treats negative overscroll at the top as the top", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(500);
		expect(reveal.update(-40, { topZone: 0 })).toBe(false);
	});

	test("reset shows and rebases the position", () => {
		const reveal = createScrollReveal({ hideAfter: 10, showAfter: 10 });
		reveal.update(500);
		reveal.reset(800);
		expect(reveal.update(805)).toBe(false);
	});
});
