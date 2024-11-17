<script>
    const { links } = $props();
</script>

<nav class="Footer">
    {#each links as link}
        <div class="link-container">
            <a href={link.href}>
                <img src={link.src} alt={link.alt} class="social" />
            </a>
        </div>
    {/each}
</nav>

<style>
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
        z-index: 1;
        bottom: 2dvh;
    }

    .link-container {
        flex: 1;
        display: flex;
        justify-content: center;
    }

    a {
        display: inline-block;
        position: relative;
        text-decoration: none;
        color: #ffffff;
        padding: 0.2em;
    }

    .social {
        width: clamp(1em, 2vw, 3em);
    }

    @media (max-aspect-ratio: 1.33/1) {
        .Footer {
            transform: none;
            width: 80dvw;
            right: 10dvw;
            font-size: clamp(1.5em, 2vw, 3em);
        }
    }
</style>
