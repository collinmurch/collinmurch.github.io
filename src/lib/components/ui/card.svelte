<script>
	import { cn } from "$lib/utils.js";

	let { class: className, padding = "p-6", children, ...restProps } = $props();

	const cardClass = $derived(
		cn(
			"rounded-[1.1rem] border border-border/80 bg-card/80 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md",
			padding,
			className,
		),
	);
</script>

<div class={cardClass} {...restProps}>
	{@render children?.()}
</div>
