<script>
    import { beforeNavigate } from "$app/navigation";
    import { page } from "$app/stores";
    import Navigation from "$components/Navigation.svelte";
    import { getTransition } from "$lib/animations/transitions";
    import "../app.css";
    import WaveCanvas from "../components/WaveCanvas.svelte";

    const { children } = $props();

    let currentTransition = $state(getTransition("/", $page.url.pathname));

    beforeNavigate(({ from, to }) => {
        currentTransition = getTransition(from?.route.id, to?.route.id);
    });
</script>

<main>
    <Navigation />
    <WaveCanvas />

    {#key $page.url.pathname}
        <div
            class="content"
            in:currentTransition.transition={currentTransition.params}
        >
            {@render children()}
        </div>
    {/key}
</main>

<style>
    .content {
        inset: 0;
        position: fixed;
        overflow-y: auto;
        margin-top: clamp(3rem, 6vh, 10rem);
        padding-right: 1rem;
    }

    main {
        position: fixed;
        color: #e6f4f1;
    }

    :global(body) {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    @media screen and (orientation: portrait) {
        :global(html) {
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
        }
    }

    @media screen and (orientation: landscape) {
        :global(html) {
            font-size: 16px;
        }
    }
</style>
