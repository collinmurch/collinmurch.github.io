import { fly } from "svelte/transition";
import { cubicOut } from "svelte/easing";

export const transitions = {
	instant: {
		transition: () => ({ duration: 0 }),
		params: {},
	},
	flyUp: {
		transition: fly,
		params: { y: 1000, duration: 300 },
	},
	flyDown: {
		transition: fly,
		params: { y: -1000, duration: 300 },
	},
	// A fixed rise, so long pages don't swing their top edge the way scaling them would.
	fadeRise: {
		transition: fly,
		params: { y: 12, duration: 300, easing: cubicOut },
	},
};

export const transitionMappings = {
	"/": {
		"*": transitions.flyUp,
	},
	"*": {
		"/": transitions.flyDown,
	},
};

const defaultAnimation = transitions.fadeRise;

export function getTransition(fromPath, toPath, prefersReducedMotion = false) {
	if (prefersReducedMotion) return transitions.instant;

	const fromMapping = transitionMappings[fromPath];
	if (fromMapping) {
		const exactMatch = fromMapping[toPath];
		if (exactMatch) return exactMatch;

		const wildcardMatch = fromMapping["*"];
		if (wildcardMatch) return wildcardMatch;
	}

	const wildcardMapping = transitionMappings["*"];
	if (wildcardMapping) {
		const wildcardMatch = wildcardMapping[toPath];
		if (wildcardMatch) return wildcardMatch;
	}

	return defaultAnimation;
}
