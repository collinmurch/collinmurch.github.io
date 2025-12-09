<script>
	import ButtonImpl, { buttonVariants } from "./button/button.svelte";

	export { buttonVariants };

	let { children, ...restProps } = $props();
</script>

<ButtonImpl {...restProps}>
	{@render children?.()}
</ButtonImpl>
