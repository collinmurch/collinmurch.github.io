<script module>
	const STATUS_COLORS = {
		success: "border-accent/65 bg-accent/20",
		error: "border-destructive/65 bg-destructive/22",
	};

	const SWAP =
		"col-start-1 row-start-1 transition-[opacity,translate,scale] duration-150";
</script>

<script>
	import { FRAME, FRAME_COLORS, getButtonGroup } from "./ButtonGroup.svelte";
	import Icon from "./Icon.svelte";

	/**
	 * The site's icon button. `framed` is the rectangle that floats over code
	 * and diagrams; `quiet` is a soft circle for controls in a page's chrome.
	 * With `href` it renders a link.
	 *
	 * Passing `status` makes the button confirm its action: "success" swaps the
	 * icon for a check, and "error" tints a framed button. An empty status is
	 * the resting state. `element` binds the rendered link or button.
	 */
	const group = getButtonGroup();
	let {
		variant = group?.variant ?? "framed",
		icon,
		label,
		href,
		status,
		onclick,
		element = $bindable(),
	} = $props();

	const confirms = $derived(status !== undefined);
	const succeeded = $derived(status === "success");
	const iconSize = $derived(variant === "framed" ? "size-4" : "size-[1.125rem]");
	const classes = $derived([
		"inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center transition-colors duration-150 focus-visible:outline-2",
		variant === "framed" && [
			"size-8 text-foreground focus-visible:outline-accent/75",
			group
				? "not-first:border-s not-first:border-accent/14 hover:bg-accent/12 focus-visible:-outline-offset-2"
				: [
						FRAME,
						STATUS_COLORS[status] ?? FRAME_COLORS,
						"focus-visible:outline-offset-2",
					],
		],
		variant === "quiet" &&
			"size-9 rounded-full text-muted-foreground hover:bg-accent/10 hover:text-foreground focus-visible:bg-accent/10 focus-visible:text-foreground focus-visible:outline-accent/55 focus-visible:outline-offset-2",
	]);
</script>

{#snippet content()}
	{#if confirms}
		<span class="grid">
			<Icon
				name={icon}
				class={[iconSize, SWAP, succeeded && "-translate-y-1 scale-90 opacity-0"]}
			/>
			<Icon
				name="check"
				class={[iconSize, SWAP, !succeeded && "translate-y-1 scale-90 opacity-0"]}
			/>
		</span>
		<span class="sr-only" aria-live="polite">{status ? label : ""}</span>
	{:else}
		<Icon name={icon} class={iconSize} />
	{/if}
{/snippet}

{#if href}
	<a
		bind:this={element}
		{href}
		class={classes}
		aria-label={label}
		title={label}
		data-button
	>
		{@render content()}
	</a>
{:else}
	<button
		bind:this={element}
		type="button"
		class={classes}
		aria-label={label}
		title={label}
		{onclick}
	>
		{@render content()}
	</button>
{/if}
