<script>
	import { planTitle } from "#lib/recipes/format";

	const { plans } = $props();
</script>

<ul class="space-y-2 text-prose">
	{#each plans as plan (plan.id)}
		<li>
			<a class="capitalize" href={`/recipes/plans/${plan.id}`}>{planTitle(plan)}</a>
		</li>
	{/each}
</ul>
