<script>
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		ref = $bindable(null),
		type = "text",
		...restProps
	} = $props();
</script>

<input
	bind:this={ref}
	{type}
	class={cn(
		"flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground shadow-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		className,
	)}
	{...restProps}
/>
