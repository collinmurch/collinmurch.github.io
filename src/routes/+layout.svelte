<script>
	import { beforeNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import Navigation from "$components/Navigation.svelte";
	import Socials from "$components/Socials.svelte";
	import { getTransition } from "$lib/animations/transitions";
	import { getRouteMeta, normalizeRoute } from "$lib/seo/meta";
	import "../app.css";
	import WaveCanvas from "../components/WaveCanvas.svelte";

	const { children } = $props();

	let currentTransition = $state(getTransition("/", $page.url.pathname));

	const normalizedPath = $derived(normalizeRoute($page.url.pathname));
	const isHome = $derived(normalizedPath === "/");
	const meta = $derived(getRouteMeta(normalizedPath));

	onMount(() => {
		const legacyCopy = (text) => {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.setAttribute("readonly", "");
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			const ok = document.execCommand("copy");
			document.body.removeChild(textarea);
			return ok;
		};

		const handleCopyClick = async (event) => {
			const target = event?.target;
			if (!(target instanceof Element)) return;

			const button = target.closest("[data-copy-btn]");
			if (!(button instanceof HTMLElement)) return;

			const wrapper = button.closest(".code-block");
			const codeEl = wrapper?.querySelector("pre code");
			const text = codeEl?.innerText ?? codeEl?.textContent ?? "";

			if (!text) return;

			const defaultLabel = button.dataset?.defaultLabel ?? "Copy";
			const successLabel = button.dataset?.successLabel ?? "Copied!";
			const errorLabel = button.dataset?.errorLabel ?? "Copy failed";
			const announceEl = button.querySelector(".copy-announce");

			const setState = (state, label) => {
				button.dataset.state = state;
				button.setAttribute("aria-label", label);
				if (announceEl) {
					announceEl.textContent = label;
				}
			};

			const resetState = () => {
				setState("", defaultLabel);
			};

			try {
				if (navigator?.clipboard?.writeText) {
					await navigator.clipboard.writeText(text);
				} else {
					const fallbackWorked = legacyCopy(text);
					if (!fallbackWorked) throw new Error("execCommand copy failed");
				}

				setState("copied", successLabel);
				button.blur();
				setTimeout(resetState, 1500);
			} catch (error) {
				console.error("Unable to copy code block", error);
				setState("error", errorLabel);
				setTimeout(resetState, 1600);
			}
		};

		document.addEventListener("click", handleCopyClick);

		return () => {
			document.removeEventListener("click", handleCopyClick);
		};
	});

	beforeNavigate(({ from, to }) => {
		currentTransition = getTransition(from?.route.id, to?.route.id);
	});
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
</svelte:head>

<div
	class="relative isolate min-h-[calc(100*var(--page-shell-viewport-unit))] overflow-hidden text-foreground"
>
	<WaveCanvas />

	<div
		class="relative z-20 flex min-h-[calc(100*var(--page-shell-viewport-unit))] flex-col"
	>
		<header
			class="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center px-4 pt-2"
		>
			<Navigation />
		</header>

		<main class="flex-1 min-h-0 scrollbar-reserve pt-12 md:pt-20">
			{#key $page.url.pathname}
				<section
					class="page-shell max-lg:landscape:pb-12 max-lg:landscape:pt-16 md:pb-16"
					in:currentTransition.transition={currentTransition.params}
				>
					{@render children()}
				</section>
			{/key}
		</main>

		{#if isHome}
			<Socials />
		{/if}
	</div>
</div>
