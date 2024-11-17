<script>
    const { location, links } = $props();
</script>

<div class={location}>
    {#each links as link}
        <a href={link.href}>
            {#if link.type === "image"}
                <img src={link.src} alt={link.alt} class="social" />
            {:else}
                {link.text}
            {/if}
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
    }

    .Header {
        top: 1vh;
    }
    .Footer {
        bottom: 2vh;
    }

    a {
        flex: 1;
        display: inline-block;
        position: relative;
        text-decoration: none;
        color: currentColor;
        text-align: center;
    }

    a:after {
        content: "";
        height: 1px;
        position: absolute;
        pointer-events: none;
        bottom: -1dvh;
        left: 33%;
        right: 33%;
        opacity: 0;
        background: currentColor;
        transform: scale(0, 1);
        transition: all 200ms;
    }

    .Header a {
        color: #ad6600;
    }
    .Footer a {
        color: #ffffff;
    }

    a:hover:after {
        opacity: 1;
        transform: scale(1, 1);
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
