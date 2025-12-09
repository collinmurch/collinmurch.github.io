<script>
	import Navigation from "$components/Navigation.svelte";

	// Pass through any attrs so existing callers can keep their API surface.
	const props = $props();
</script>

<Navigation {...props} />
