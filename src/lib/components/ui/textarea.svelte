<script>
	import { cn } from "$lib/utils.js";

	let { class: className, ref = $bindable(null), rows = 4, ...restProps } = $props();
</script>

<textarea
	bind:this={ref}
	{rows}
	class={cn(
		"w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground shadow-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
		className,
	)}
	{...restProps}
/>
