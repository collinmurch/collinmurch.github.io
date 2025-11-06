<script>
    import { fade, fly } from "svelte/transition";
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
    in:fly={{ y: -56, duration: 260, easing: cubicOut }}
    out:fade={{ duration: 160 }}
    class="pointer-events-auto fixed bottom-6 left-1/2 z-30 flex max-w-[calc(100vw-3rem)] -translate-x-1/2 items-center justify-center gap-3 rounded-full border border-border/60 bg-background/75 px-3 py-2 text-sm shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl md:max-w-md md:text-base"
>
    {#each links as link}
        <a
            href={link.href}
            class="group relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-transparent text-muted-foreground transition duration-200 hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:size-11"
            target="_blank"
            rel="noreferrer"
        >
            <img
                src={link.src}
                alt={link.alt}
                class="size-5 opacity-90 transition duration-200 group-hover:opacity-100 md:size-6"
            />
            <span class="sr-only">{link.alt}</span>
        </a>
    {/each}
</nav>
