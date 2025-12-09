<script>
	const { children } = $props();
</script>

<div
	class="mx-auto flex-1 max-w-[80ch] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
>
	{@render children()}
</div>
