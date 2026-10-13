<script>
	import { onDestroy } from "svelte";
	import { copyText } from "$lib/utils/clipboard";
	import Button from "./Button.svelte";

	/**
	 * A button that copies `text()` and confirms with a check. `text` is read at
	 * click time, so it can come from the page.
	 */
	const {
		text,
		label = "Copy",
		copiedLabel = "Copied",
		icon = "copy",
		variant,
	} = $props();

	let status = $state("");
	let resetTimer;

	const currentLabel = $derived(
		status === "success" ? copiedLabel : status === "error" ? "Copy failed" : label,
	);

	async function copy() {
		clearTimeout(resetTimer);
		try {
			await copyText(text());
			status = "success";
		} catch (error) {
			console.error("Unable to copy", error);
			status = "error";
		}
		resetTimer = setTimeout(() => (status = ""), 1500);
	}

	onDestroy(() => clearTimeout(resetTimer));
</script>

<Button {variant} {icon} label={currentLabel} {status} onclick={copy} />
