<script>
    import { fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    const links = [
        {
            src: "/images/x.svg",
            alt: "X logo",
            href: "https://x.com/collinmurch",
        },
        {
            src: "/images/github.svg",
            alt: "GitHub logo",
            href: "https://github.com/collinmurch",
        },
        {
            src: "/images/linkedin.svg",
            alt: "LinkedIn logo",
            href: "https://linkedin.com/in/collinmurch",
        },
    ];
</script>

<nav
    transition:fly={{ y: -56, duration: 240, easing: cubicOut }}
    class="pointer-events-auto fixed bottom-6 left-1/2 z-30 flex max-w-[calc(100vw-3rem)] -translate-x-1/2 items-center justify-center gap-3 rounded-full border border-border/60 bg-background/75 px-3 py-2 text-sm shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl md:max-w-md md:text-base max-lg:landscape:bottom-4 max-lg:landscape:max-w-[calc(100vw-2rem)] max-lg:landscape:gap-2 max-lg:landscape:px-2 max-lg:landscape:py-1 max-lg:landscape:text-xs"
>
    {#each links as link}
        <a
            href={link.href}
            class="group relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-transparent text-muted-foreground transition duration-200 hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-11 max-lg:landscape:size-9"
            target="_blank"
            rel="noopener noreferrer"
        >
            <img
                src={link.src}
                alt={link.alt}
                class="size-5 opacity-90 transition duration-200 group-hover:opacity-100 md:size-6 max-lg:landscape:size-[1.35rem]"
            />
            <span class="sr-only">{link.alt}</span>
        </a>
    {/each}
</nav>
