<script>
	import { formatDate, toISODate } from "#lib/utils/dates";

	/** A post's publish date, set in italic like the home tagline. */
	const { date, class: className } = $props();
</script>

<time
	datetime={toISODate(date)}
	class={[
		"block text-[calc(var(--text-prose)*0.95)] text-muted-foreground italic",
		className,
	]}
>
	{formatDate(date)}
</time>
