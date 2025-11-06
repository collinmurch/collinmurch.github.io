<script>
    import { onMount, tick } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { waveState } from "$lib/stores/wave";
    import { cn } from "$lib/utils.js";
    import { buttonVariants } from "$lib/components/ui/button";

    const links = [
        { href: "/about", text: "About" },
        { href: "/", text: "Home" },
        { href: "/blog", text: "Blog" },
    ];

    const pathname = $derived($page.url.pathname);
    const isHome = $derived(pathname === "/");

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

        const target = navElement.querySelector(`[data-route="${pathname}"]`);

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
        pathname;
        queueIndicatorMeasurement();
    });

    onMount(() => {
        if (!isHome) waveState.set(true);

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

    async function handleNavigation(event, href) {
        event?.preventDefault();

        if (pathname !== href) {
            waveState.set(true);
            await goto(href);
        }
    }
</script>

<nav
    bind:this={navElement}
    class="pointer-events-auto fixed left-1/2 top-6 z-30 flex max-w-[calc(100vw-3rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-[0_15px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[transform,opacity] duration-200 md:max-w-lg md:text-base max-lg:landscape:top-4 max-lg:landscape:max-w-[calc(100vw-2rem)] max-lg:landscape:gap-1 max-lg:landscape:px-2 max-lg:landscape:py-1 max-lg:landscape:text-xs relative overflow-hidden"
>
    <span
        aria-hidden="true"
        data-noslide={disableSlide}
        class="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-primary/80 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[noslide='true']:transition-opacity"
        style={`width:${indicator.width}px;height:${indicator.height}px;transform:translate3d(${indicator.left}px, ${indicator.top}px, 0);opacity:${indicatorVisible ? 1 : 0};`}
    ></span>
    {#each links as link}
        {@const isActive = pathname === link.href}
        <a
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            class={cn(
                buttonVariants({
                    variant: "ghost",
                    size: "sm",
                }),
                "relative z-10 flex-1 rounded-full px-4 text-sm font-medium tracking-wide transition-colors duration-150 md:px-6 md:text-base max-lg:landscape:px-3 max-lg:landscape:py-1 max-lg:landscape:text-xs text-foreground/80 hover:bg-transparent focus-visible:bg-transparent active:bg-transparent",
                isActive
                    ? "pointer-events-none text-primary-foreground [&:hover]:text-primary-foreground [&:hover]:bg-transparent [&:hover]:shadow-none"
                    : "hover:text-primary/80",
            )}
            data-route={link.href}
            onclick={(event) => handleNavigation(event, link.href)}
        >
            {link.text}
        </a>
    {/each}
</nav>
