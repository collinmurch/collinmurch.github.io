<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { waveState } from "$lib/stores/wave";

    const links = [
        { href: "/about", text: "About" },
        { href: "/", text: "Home" },
        { href: "/blog", text: "Blog" },
    ];

    const isHome = $derived($page.url.pathname === "/");

    onMount(() => {
        if (!isHome) waveState.set(true);
    });

    async function handleNavigation(href) {
        if ($page.url.pathname !== href) {
            waveState.set(true);
            await goto(href);
        }
    }
</script>

<nav class="Header">
    {#each links as link}
        <a
            href={link.href}
            class:active={$page.url.pathname === link.href}
            class:home={isHome}
            onclick={(e) => {
                e.preventDefault();
                handleNavigation(link.href);
            }}
        >
            <span class="text">{link.text}</span>
            <span class="background"></span>
        </a>
    {/each}
</nav>

<style>
    .Header {
        text-align: center;
        position: absolute;
        display: inline-flex;
        flex-direction: row;
        justify-content: space-evenly;
        font-weight: regular;
        width: 29dvw;
        right: calc(10dvw + 30vmin);
        transform: translateX(50%);
        font-size: clamp(1em, 1.675vw, 2.4em);
        top: 1dvh;
        z-index: 1;
    }

    a {
        flex: 1;
        display: inline-block;
        position: relative;
        text-decoration: none;
        color: #cde8e5;
        text-align: center;
        padding: 0.175em 0.725em;
        overflow: hidden;
        border-radius: 0.5em;
    }

    a.home {
        color: #ad6600;
    }

    a.home .background {
        background-color: #ad66001a;
    }

    .text {
        position: relative;
    }

    .background {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        padding-bottom: 200%;
        transform: translate(-50%, -50%) scale(0);
        border-radius: 50%;
        transition: transform 0.4s ease-out;
        background-color: #cde8e51a;
    }

    a:hover .background,
    a.active .background {
        transform: translate(-50%, -50%) scale(1);
    }

    :global(body.transitioning) a {
        opacity: 0;
    }

    @media (max-aspect-ratio: 1.33/1) {
        .Header {
            transform: none;
            width: 80dvw;
            right: 10dvw;
            font-size: clamp(1.5em, 2vw, 3em);
        }
    }

    @media (min-width: 1440px) {
        .Header {
            font-size: clamp(0.97em, 1.2vw, 1.6em);
            width: 27dvw;
        }

        a {
            padding: 0.125em 0.6em;
        }
    }
</style>
