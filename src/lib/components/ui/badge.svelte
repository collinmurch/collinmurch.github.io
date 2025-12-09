<script>
	import { cn } from "$lib/utils.js";

	let { class: className, variant = "default", children, ...restProps } = $props();

	const variantClasses = {
		default: "bg-secondary/80 text-secondary-foreground border border-border/70",
		outline: "border border-border/70 text-foreground bg-background/60",
		subtle: "bg-accent/30 text-accent-foreground border border-accent/30",
	};

	const badgeClass = $derived(
		cn(
			"inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.18em] shadow-xs transition-colors",
			variantClasses[variant] ?? variantClasses.default,
			className,
		),
	);
</script>

<span class={badgeClass} {...restProps}>
	{@render children?.()}
</span>
