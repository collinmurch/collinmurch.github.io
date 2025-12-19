<script>
	import { onMount, tick } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { cn } from "$lib/utils.js";
	import { buttonVariants } from "$lib/components/ui/button";
	import { normalizeRoute } from "$lib/seo/meta";

	const links = [
		{ href: "/about", text: "About" },
		{ href: "/", text: "Home" },
		{ href: "/blog", text: "Blog" },
	];

	const pathname = $derived($page.url.pathname);

	function getNavSection(path) {
		const normalized = normalizeRoute(path);
		if (normalized === "/blog" || normalized.startsWith("/blog/")) {
			return "/blog";
		}
		return normalized;
	}

	const activeRoute = $derived(getNavSection(pathname));
	const isHome = $derived(activeRoute === "/");

	let navElement = null;
	let navResizeObserver;
	let indicatorFrame = 0;
	let fadeResetFrame = 0;
	let indicator = $state({ width: 0, height: 0, left: 0, top: 0 });
	let indicatorVisible = $state(false);
	let disableSlide = $state(false);

	function queueIndicatorMeasurement() {
		if (typeof window === "undefined") return;

		if (indicatorFrame) cancelAnimationFrame(indicatorFrame);

		indicatorFrame = requestAnimationFrame(() => {
			indicatorFrame = 0;
			measureIndicator();
		});
	}

	async function measureIndicator() {
		if (!navElement) return;

		await tick();

		const target = navElement.querySelector(`[data-route="${activeRoute}"]`);

		if (!target) {
			indicatorVisible = false;
			return;
		}

		const navRect = navElement.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		const shouldFadeIn = !indicatorVisible;

		indicator = {
			width: targetRect.width,
			height: targetRect.height,
			left: targetRect.left - navRect.left,
			top: targetRect.top - navRect.top,
		};

		indicatorVisible = true;

		if (shouldFadeIn) {
			disableSlide = true;
			if (fadeResetFrame) cancelAnimationFrame(fadeResetFrame);
			fadeResetFrame = requestAnimationFrame(() => {
				fadeResetFrame = 0;
				disableSlide = false;
			});
		}
	}

	function handleResize() {
		queueIndicatorMeasurement();
	}

	$effect(() => {
		queueIndicatorMeasurement(activeRoute);
	});

	onMount(() => {
		if (typeof window !== "undefined") {
			window.addEventListener("resize", handleResize);
		}

		if (typeof ResizeObserver !== "undefined" && navElement) {
			navResizeObserver = new ResizeObserver(() => queueIndicatorMeasurement());
			navResizeObserver.observe(navElement);
		}

		queueIndicatorMeasurement();

		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("resize", handleResize);
			}
			navResizeObserver?.disconnect();
			navResizeObserver = undefined;
			if (indicatorFrame) {
				cancelAnimationFrame(indicatorFrame);
				indicatorFrame = 0;
			}
			if (fadeResetFrame) {
				cancelAnimationFrame(fadeResetFrame);
				fadeResetFrame = 0;
			}
		};
	});

	function shouldSkipClientNavigation(event) {
		if (!event) return false;
		if (event.defaultPrevented) return true;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
		if (typeof event.button === "number" && event.button !== 0) return true;
		return false;
	}

	async function handleNavigation(event, href) {
		if (shouldSkipClientNavigation(event)) return;

		event?.preventDefault();

		if (pathname !== href) {
			await goto(href);
		}
	}

	const isLinkActive = (href) => activeRoute === href;
</script>

<nav
	bind:this={navElement}
	class="pointer-events-auto relative z-30 mx-auto flex w-full max-w-[min(26rem,100%)] items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-[0_15px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-opacity duration-200 sm:max-w-[min(30rem,100%)] md:max-w-lg md:text-base max-lg:landscape:max-w-[min(22rem,100%)] max-lg:landscape:h-10 max-lg:landscape:gap-1 max-lg:landscape:px-2 max-lg:landscape:py-0 max-lg:landscape:text-xs overflow-hidden"
>
	<span
		aria-hidden="true"
		data-noslide={disableSlide}
		class="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-primary/80 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[noslide='true']:transition-opacity"
		style={`width:${indicator.width}px;height:${indicator.height}px;transform:translate3d(${indicator.left}px, ${indicator.top}px, 0);opacity:${indicatorVisible ? 1 : 0};`}
	></span>
	{#each links as link}
		{@const isActive = isLinkActive(link.href)}
		<a
			href={link.href}
			aria-current={isActive ? "page" : undefined}
			class={cn(
				buttonVariants({
					variant: "ghost",
					size: "sm",
				}),
				"relative z-10 flex-1 rounded-full px-4 text-sm font-medium tracking-wide transition-colors duration-150 md:px-6 md:text-base max-lg:landscape:h-[24px] max-lg:landscape:px-3 max-lg:landscape:py-0.5 max-lg:landscape:text-xs text-foreground/80 hover:bg-transparent! focus-visible:bg-transparent active:bg-transparent! hover:text-current! cursor-pointer",
				isActive ? "text-primary-foreground" : "",
			)}
			data-route={link.href}
			onclick={(event) => handleNavigation(event, link.href)}
		>
			{link.text}
		</a>
	{/each}
</nav>
