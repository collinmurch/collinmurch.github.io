<script module>
	const PATHS = {
		check: ["M20 6 10.5 16.5 6 12"],
		code: ["m8 7-5 5 5 5M16 7l5 5-5 5"],
		copy: [
			"M11.4 9h8.2a2.4 2.4 0 0 1 2.4 2.4v8.2a2.4 2.4 0 0 1-2.4 2.4h-8.2A2.4 2.4 0 0 1 9 19.6v-8.2A2.4 2.4 0 0 1 11.4 9Z",
			"M5 15h-.8A2.2 2.2 0 0 1 2 12.8V4.2A2.2 2.2 0 0 1 4.2 2h8.6A2.2 2.2 0 0 1 15 4.2V5",
		],
		diagram: [
			"M4.5 3h4A1.5 1.5 0 0 1 10 4.5v3A1.5 1.5 0 0 1 8.5 9h-4A1.5 1.5 0 0 1 3 7.5v-3A1.5 1.5 0 0 1 4.5 3Z",
			"M15.5 15h4a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5Z",
			"M6.5 9v4.5a2 2 0 0 0 2 2H14",
		],
		link: [
			"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
			"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
		],
		recenter: ["M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", "M12 2v3M12 19v3M2 12h3M19 12h3"],
		"zoom-in": ["M12 5v14M5 12h14"],
		"zoom-out": ["M5 12h14"],
	};
</script>

<script>
	/**
	 * A stroke icon on a 24-unit grid. It sizes from `class` and draws in the
	 * current text color.
	 */
	const { name, class: className } = $props();
</script>

<svg
	class={["shrink-0", className]}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#each PATHS[name] as d (d)}
		<path {d} />
	{/each}
</svg>
