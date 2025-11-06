<script>
    import { onMount } from "svelte";
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

    const isHome = $derived($page.url.pathname === "/");

    let pathname = $state("");
    let navElement = null;
    let indicatorFrame = 0;
    let slideResetFrame = 0;
    let indicator = $state({ width: 0, height: 0, left: 0, top: 0 });
    let indicatorVisible = $state(false);
    let disableSlide = $state(false);
    const linkRefs = new Map();

    $effect(() => {
        pathname = $page.url.pathname;
        scheduleIndicatorUpdate();
    });

    onMount(() => {
        if (!isHome) waveState.set(true);

        let resizeObserver;

        if (navElement) {
            resizeObserver = new ResizeObserver(() => scheduleIndicatorUpdate());
            resizeObserver.observe(navElement);
        }

        scheduleIndicatorUpdate();

        return () => {
            resizeObserver?.disconnect();
            if (indicatorFrame) {
                cancelAnimationFrame(indicatorFrame);
                indicatorFrame = 0;
            }
            if (slideResetFrame) {
                cancelAnimationFrame(slideResetFrame);
                slideResetFrame = 0;
            }
        };
    });

    function suppressSlideUntilNextFrame() {
        if (typeof window === "undefined") return;

        disableSlide = true;
        if (slideResetFrame) cancelAnimationFrame(slideResetFrame);

        slideResetFrame = requestAnimationFrame(() => {
            slideResetFrame = 0;
            disableSlide = false;
        });
    }

    function scheduleIndicatorUpdate() {
        if (typeof window === "undefined") return;

        if (indicatorFrame) cancelAnimationFrame(indicatorFrame);

        indicatorFrame = requestAnimationFrame(() => {
            indicatorFrame = 0;
            updateIndicator();
        });
    }

    function updateIndicator() {
        if (!navElement) return;

        const activeLink = links.find((link) => pathname === link.href);

        if (!activeLink) {
            indicatorVisible = false;
            return;
        }

        const target = linkRefs.get(activeLink.href);
        if (!target) return;

        const navRect = navElement.getBoundingClientRect();
        const linkRect = target.getBoundingClientRect();

        const shouldFadeIn = !indicatorVisible;

        indicator = {
            width: linkRect.width,
            height: linkRect.height,
            left: linkRect.left - navRect.left,
            top: linkRect.top - navRect.top,
        };

        indicatorVisible = true;

        if (shouldFadeIn) suppressSlideUntilNextFrame();
    }

    function trackLink(node, href) {
        if (!href) return;

        linkRefs.set(href, node);
        scheduleIndicatorUpdate();

        return {
            update(newHref) {
                if (newHref === href) return;

                linkRefs.delete(href);
                href = newHref;

                if (href) linkRefs.set(href, node);
                scheduleIndicatorUpdate();
            },
            destroy() {
                linkRefs.delete(href);
                scheduleIndicatorUpdate();
            },
        };
    }

    async function handleNavigation(event, href) {
        event?.preventDefault();

        if ($page.url.pathname !== href) {
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
        {@const isActive = $page.url.pathname === link.href}
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
            use:trackLink={link.href}
            onclick={(event) => handleNavigation(event, link.href)}
        >
            {link.text}
        </a>
    {/each}
</nav>
