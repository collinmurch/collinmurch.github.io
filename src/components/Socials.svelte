<script>
    const { links } = $props();
</script>

<nav class="Footer">
    {#each links as link}
        <a href={link.href}>
            <img src={link.src} alt={link.alt} class="social" />
            <span class="background"></span>
        </a>
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

    a {
        position: relative;
        padding: 0.5em;
        overflow: hidden;
        border-radius: 50%;
        display: inline-block;
    }

    .social {
        width: clamp(1em, 2vw, 3em);
        display: block;
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
        background-color: #ffffff1a;
    }

    a:hover .background {
        transform: translate(-50%, -50%) scale(1);
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
