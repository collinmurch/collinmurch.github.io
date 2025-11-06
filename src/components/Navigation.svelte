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

    onMount(() => {
        if (!isHome) waveState.set(true);
    });

    async function handleNavigation(event, href) {
        event?.preventDefault();

        if ($page.url.pathname !== href) {
            waveState.set(true);
            await goto(href);
        }
    }
</script>

<nav
    class="pointer-events-auto fixed left-1/2 top-6 z-30 flex max-w-[calc(100vw-3rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm shadow-[0_15px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[transform,opacity] duration-200 md:max-w-lg md:text-base max-lg:landscape:top-4 max-lg:landscape:max-w-[calc(100vw-2rem)] max-lg:landscape:gap-1 max-lg:landscape:px-2 max-lg:landscape:py-1 max-lg:landscape:text-xs"
>
    {#each links as link}
        {@const isActive = $page.url.pathname === link.href}
        <a
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            class={cn(
                buttonVariants({
                    variant: isActive ? "default" : "ghost",
                    size: "sm",
                }),
                "flex-1 rounded-full px-4 text-sm font-medium tracking-wide transition-colors duration-150 md:px-6 md:text-base max-lg:landscape:px-3 max-lg:landscape:py-1 max-lg:landscape:text-xs",
            )}
            onclick={(event) => handleNavigation(event, link.href)}
        >
            {link.text}
        </a>
    {/each}
</nav>
