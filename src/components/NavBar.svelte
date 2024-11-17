<script>
    import { page } from "$app/stores";
    const { location, links } = $props();
</script>

<div class={location}>
    {#each links as link}
        <a href={link.href} class:active={$page.url.pathname === link.href}>
            <span class="text">
                {#if link.type === "image"}
                    <img src={link.src} alt={link.alt} class="social" />
                {:else}
                    {link.text}
                {/if}
            </span>
            <span class="background"></span>
        </a>
    {/each}
</div>

<style>
    .Header,
    .Footer {
        text-align: center;
        position: absolute;
        display: inline-flex;
        flex-direction: row;
        justify-content: space-evenly;
        font-weight: regular;
        width: 30dvw;
        right: calc(10dvw + 30vmin);
        transform: translateX(50%);
        font-size: clamp(1em, 2vw, 3em);
        z-index: 10;
    }

    .Header {
        top: 1dvh;
    }
    .Footer {
        bottom: 2dvh;
    }

    a {
        flex: 1;
        display: inline-block;
        position: relative;
        text-decoration: none;
        color: currentColor;
        text-align: center;
        padding: 0.2em 0.8em;
        overflow: hidden;
        border-radius: 0.5em;
    }

    .Header a {
        color: #ad6600;
    }
    .Footer a {
        color: #ffffff;
    }

    .text {
        position: relative;
        z-index: 1;
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
    }

    .Header .background {
        background-color: rgba(173, 102, 0, 0.1);
    }

    .Footer .background {
        background-color: rgba(255, 255, 255, 0.1);
    }

    a:hover .background {
        transform: translate(-50%, -50%) scale(1);
    }

    a.active .background {
        transform: translate(-50%, -50%) scale(1);
    }

    @media (max-aspect-ratio: 1.33/1) {
        .Header,
        .Footer {
            transform: none;
            width: 80dvw;
            right: 10dvw;
            font-size: clamp(1.5em, 2vw, 3em);
        }
    }
</style>
