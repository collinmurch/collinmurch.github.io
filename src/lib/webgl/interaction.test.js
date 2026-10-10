import { describe, expect, test } from "bun:test";
import { createSurfaceInteraction } from "./interaction";
import { SHADER_CONSTANTS } from "./ocean";

const { SPLASH_COUNT } = SHADER_CONSTANTS;

const LEVEL = 0.25;

const move = (interaction, time, x, y, delta = 16) =>
	interaction.update({ time, delta, pointer: { active: true, x, y }, level: LEVEL });

const settle = (interaction, x, y, frames = 180) => {
	for (let i = 0; i < frames; i++) move(interaction, i * 0.016, x, y);
};

const splashAt = (interaction, slot) => {
	const offset = slot * 4;
	return {
		x: interaction.splashes[offset],
		time: interaction.splashes[offset + 1],
		strength: interaction.splashes[offset + 2],
		direction: interaction.splashes[offset + 3],
	};
};

describe("createSurfaceInteraction", () => {
	test("starts with every splash slot expired", () => {
		const interaction = createSurfaceInteraction();
		for (let slot = 0; slot < SPLASH_COUNT; slot++) {
			expect(splashAt(interaction, slot).time).toBeLessThan(-100);
		}
	});

	test("bulges the surface above a pointer just under the water", () => {
		const interaction = createSurfaceInteraction();
		settle(interaction, 0.8, LEVEL - 0.03);
		expect(interaction.bulge.height).toBeGreaterThan(0.01);
	});

	test("bulges more as the pointer nears the surface", () => {
		const shallow = createSurfaceInteraction();
		const deep = createSurfaceInteraction();
		settle(shallow, 0.8, LEVEL - 0.02);
		settle(deep, 0.8, LEVEL - 0.1);
		expect(shallow.bulge.height).toBeGreaterThan(deep.bulge.height);
	});

	test("leaves the surface flat when the pointer is deep underwater", () => {
		const interaction = createSurfaceInteraction();
		settle(interaction, 0.8, LEVEL - 0.3);
		expect(Math.abs(interaction.bulge.height)).toBeLessThan(0.0001);
	});

	test("does not bulge for a pointer above the water", () => {
		const interaction = createSurfaceInteraction();
		settle(interaction, 0.8, LEVEL + 0.03);
		expect(Math.abs(interaction.bulge.height)).toBeLessThan(0.0001);
	});

	test("follows the pointer horizontally", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 1.1, LEVEL - 0.03);
		expect(interaction.bulge.x).toBe(1.1);
	});

	test("snaps back past flat when the pointer breaks through", () => {
		const interaction = createSurfaceInteraction();
		settle(interaction, 0.8, LEVEL - 0.02);
		let lowest = 0;
		for (let i = 0; i < 60; i++) {
			move(interaction, 3 + i * 0.016, 0.8, LEVEL + 0.05);
			lowest = Math.min(lowest, interaction.bulge.height);
		}
		expect(lowest).toBeLessThan(0);
	});

	test("relaxes when the pointer leaves the window", () => {
		const interaction = createSurfaceInteraction();
		settle(interaction, 0.8, LEVEL - 0.02);
		for (let i = 0; i < 180; i++) {
			interaction.update({
				time: 3 + i * 0.016,
				delta: 16,
				pointer: { active: false },
				level: LEVEL,
			});
		}
		expect(Math.abs(interaction.bulge.height)).toBeLessThan(0.0005);
	});

	test("splashes where the pointer dives through the surface", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 0.5, LEVEL + 0.02);
		move(interaction, 0.016, 0.5, LEVEL - 0.02);
		const splash = splashAt(interaction, 0);
		expect(splash.time).toBeCloseTo(0.016);
		expect(splash.x).toBeCloseTo(0.5);
		expect(splash.strength).toBeGreaterThan(0);
	});

	test("places the splash at the interpolated crossing point", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 0.4, LEVEL + 0.01);
		move(interaction, 0.016, 0.6, LEVEL - 0.03);
		expect(splashAt(interaction, 0).x).toBeCloseTo(0.45);
	});

	test("splashes when the pointer breaks out of the water", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 0.5, LEVEL - 0.02);
		move(interaction, 0.016, 0.5, LEVEL + 0.05);
		expect(splashAt(interaction, 0).time).toBeCloseTo(0.016);
	});

	test("holds the surface above a pointer that has just risen out", () => {
		const interaction = createSurfaceInteraction();
		settle(interaction, 0.5, LEVEL - 0.02);
		move(interaction, 3, 0.5, LEVEL + 0.02);
		expect(interaction.bulge.height).toBeGreaterThan(0.02);
		expect(splashAt(interaction, 0).time).toBeLessThan(-100);
	});

	test("pops even when the pointer rises out slowly", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 0.5, LEVEL - 0.02);
		move(interaction, 1, 0.5, LEVEL + 0.05, 1000);
		expect(splashAt(interaction, 0).time).toBeCloseTo(1);
	});

	test("ignores slow drifts across the surface", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 0.5, LEVEL + 0.001);
		move(interaction, 1, 0.5, LEVEL - 0.001, 1000);
		expect(splashAt(interaction, 0).time).toBeLessThan(-100);
	});

	test("ignores fast sideways movement near the surface", () => {
		const interaction = createSurfaceInteraction();
		move(interaction, 0, 0.5, LEVEL + 0.02);
		move(interaction, 0.016, 0.55, LEVEL + 0.02);
		expect(splashAt(interaction, 0).time).toBeLessThan(-100);
	});

	test("does not splash on the first sample after the pointer appears", () => {
		const interaction = createSurfaceInteraction();
		interaction.update({
			time: 0,
			delta: 16,
			pointer: { active: false },
			level: LEVEL,
		});
		move(interaction, 0.016, 0.5, LEVEL - 0.2);
		expect(splashAt(interaction, 0).time).toBeLessThan(-100);
	});

	test("reuses the oldest slot once every slot is used", () => {
		const interaction = createSurfaceInteraction();
		for (let i = 0; i <= SPLASH_COUNT + 1; i++) {
			const y = i % 2 === 0 ? LEVEL + 0.05 : LEVEL - 0.05;
			move(interaction, i * 0.5, 0.5, y, 16);
		}
		expect(splashAt(interaction, 0).time).toBeCloseTo((SPLASH_COUNT + 1) * 0.5);
	});
});
