import { describe, expect, test } from "bun:test";
import { createFramePacer, createQualityController } from "./render-budget";

const renderedFrames = (refreshRate, interval, seconds = 1) => {
	const pacer = createFramePacer();
	let frames = 0;
	for (let i = 0; i < refreshRate * seconds; i++) {
		if (pacer.shouldRender((i * 1000) / refreshRate, interval)) frames++;
	}
	return frames;
};

const runWindow = (controller, start, framesPerSecond) => {
	const frames = Math.round(framesPerSecond * 1.5);
	for (let i = 1; i <= frames; i++) controller.recordFrame(start + (i * 1500) / frames);
	return start + 1500;
};

const createController = (overrides = {}) =>
	createQualityController({
		initialQuality: 1,
		desiredPixelRatio: 1.5,
		minimumPixelRatio: 0.75,
		allowHighQuality: true,
		...overrides,
	});

describe("createFramePacer", () => {
	test("renders every frame on a 60Hz display at 60fps", () => {
		expect(renderedFrames(60, 1000 / 60)).toBe(60);
	});

	test("halves a 120Hz display to 60fps", () => {
		expect(renderedFrames(120, 1000 / 60)).toBe(60);
	});

	test("averages close to 60fps on a 90Hz display", () => {
		expect(Math.abs(renderedFrames(90, 1000 / 60) - 60)).toBeLessThanOrEqual(2);
	});

	test("renders every third 60Hz frame at 20fps", () => {
		expect(renderedFrames(60, 1000 / 20)).toBe(20);
	});
});

describe("createQualityController", () => {
	test("lowers quality and pixel ratio after a slow window", () => {
		const controller = createController();
		runWindow(controller, 0, 40);
		expect(controller.quality).toBe(0);
		expect(controller.pixelRatio).toBeCloseTo(1.35);
	});

	test("never drops below the lowest quality or minimum pixel ratio", () => {
		const controller = createController();
		let time = 0;
		for (let i = 0; i < 10; i++) time = runWindow(controller, time, 20);
		expect(controller.quality).toBe(-1);
		expect(controller.pixelRatio).toBe(0.75);
	});

	test("keeps settings during smooth windows at full quality", () => {
		const controller = createController();
		runWindow(controller, 0, 60);
		expect(controller.quality).toBe(1);
		expect(controller.pixelRatio).toBe(1.5);
	});

	test("recovers quality after sustained smooth windows", () => {
		const controller = createController({ initialQuality: -1 });
		let time = 0;
		for (let i = 0; i < 3; i++) time = runWindow(controller, time, 60);
		expect(controller.quality).toBe(0);
	});

	test("withholds high quality when it is not allowed", () => {
		const controller = createController({ initialQuality: 0, allowHighQuality: false });
		let time = 0;
		for (let i = 0; i < 10; i++) time = runWindow(controller, time, 60);
		expect(controller.quality).toBe(0);
	});

	test("ignores frames recorded before the window ends", () => {
		const controller = createController();
		for (let i = 1; i < 10; i++) controller.recordFrame(i * 100);
		expect(controller.quality).toBe(1);
	});
});
