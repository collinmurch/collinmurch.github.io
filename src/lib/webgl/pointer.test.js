import { describe, expect, test } from "bun:test";
import { createPointerTracker } from "./pointer";

describe("createPointerTracker", () => {
	test("starts inactive with no presence", () => {
		const tracker = createPointerTracker();
		expect(tracker.active).toBe(false);
		expect(tracker.presence).toBe(0);
	});

	test("converts client pixels to screen coordinates with y up", () => {
		const tracker = createPointerTracker();
		tracker.move(200, 100);
		tracker.update(16, 800, 400);
		expect(tracker.position.x).toBeCloseTo(0.25);
		expect(tracker.position.y).toBeCloseTo(0.75);
	});

	test("eases presence in while the pointer is over the page", () => {
		const tracker = createPointerTracker();
		tracker.move(10, 10);
		tracker.update(100, 800, 400);
		expect(tracker.presence).toBeGreaterThan(0.3);
		expect(tracker.presence).toBeLessThan(0.5);
	});

	test("eases presence at the same rate regardless of frame rate", () => {
		const fast = createPointerTracker();
		const slow = createPointerTracker();
		fast.move(10, 10);
		slow.move(10, 10);
		for (let i = 0; i < 6; i++) fast.update(50 / 3, 800, 400);
		for (let i = 0; i < 2; i++) slow.update(50, 800, 400);
		expect(fast.presence).toBeCloseTo(slow.presence, 6);
	});

	test("eases presence out after release", () => {
		const tracker = createPointerTracker();
		tracker.move(10, 10);
		tracker.update(2000, 800, 400);
		tracker.release();
		tracker.update(2000, 800, 400);
		expect(tracker.presence).toBeLessThan(0.01);
	});

	test("snaps the trail to the pointer while it has no presence", () => {
		const tracker = createPointerTracker();
		tracker.move(400, 200);
		tracker.update(0, 800, 400);
		expect(tracker.trail).toEqual(tracker.position);
	});

	test("lags the trail behind a moving pointer", () => {
		const tracker = createPointerTracker();
		tracker.move(0, 200);
		tracker.update(2000, 800, 400);
		tracker.move(800, 200);
		tracker.update(16, 800, 400);
		expect(tracker.trail.x).toBeGreaterThan(0);
		expect(tracker.trail.x).toBeLessThan(0.1);
	});
});
