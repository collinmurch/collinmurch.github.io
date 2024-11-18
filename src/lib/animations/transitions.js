import { fly, fade, scale } from "svelte/transition";
import { cubicOut } from "svelte/easing";

export const transitions = {
    flyUp: {
        transition: fly,
        params: { y: 1000, duration: 300 },
    },
    flyDown: {
        transition: fly,
        params: { y: -1000, duration: 300 },
    },
    fadeScale: {
        transition: (node, params) => {
            return {
                duration: 300,
                css: (t) => {
                    return `
                            opacity: ${t};
                            transform: scale(${0.95 + 0.05 * t});
                        `;
                },
                easing: cubicOut,
            };
        },
        params: {},
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

const defaultAnimation = transitions.fadeScale;

export function getTransition(fromPath, toPath) {
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
