<script>
	import { formatDate, toISODate } from "#lib/utils/dates";

	/** A post's publish date, set small and spaced in capitals. */
	const { date, class: className } = $props();
</script>

<time
	datetime={toISODate(date)}
	class={[
		"block text-xs font-semibold tracking-[0.4em] text-muted-foreground uppercase",
		className,
	]}
>
	{formatDate(date)}
</time>
