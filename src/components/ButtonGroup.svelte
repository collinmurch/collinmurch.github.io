<script module>
	import { getContext, setContext } from "svelte";

	const GROUP = Symbol("button-group");

	/** The enclosing group's settings, or undefined for a lone button. */
	export const getButtonGroup = () => getContext(GROUP);

	/** The rectangle a framed button, or a group of them, sits in. */
	export const FRAME =
		"rounded-[0.45rem] border backdrop-blur-[6px] transition-colors duration-150";

	/** The frame's resting colors. */
	export const FRAME_COLORS = "border-accent/18 bg-control hover:border-accent/45";
</script>

<script>
	/**
	 * Joins related buttons. Framed buttons become segments of one frame, split
	 * by hairlines; quiet buttons sit side by side. Buttons inside take the
	 * group's variant.
	 */
	const { variant = "framed", label, children } = $props();

	setContext(GROUP, {
		get variant() {
			return variant;
		},
	});
</script>

<div
	role="group"
	aria-label={label}
	class={[
		"inline-flex",
		variant === "framed" ? ["overflow-hidden", FRAME, FRAME_COLORS] : "gap-1",
	]}
>
	{@render children()}
</div>
