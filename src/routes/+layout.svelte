<script>
    import { page } from "$app/stores";
    import { beforeNavigate } from "$app/navigation";
    import Navigation from "$components/Navigation.svelte";
    import WaveCanvas from "../components/WaveCanvas.svelte";
    import { getTransition } from "$lib/animations/transitions";
    import { headerLinks } from "$lib/data/navigation";
    import "../app.css";

    const { children } = $props();

    let currentTransition = $state(getTransition("/", $page.url.pathname));

    beforeNavigate(({ from, to }) => {
        currentTransition = getTransition(from?.route.id, to?.route.id);
    });
</script>

<main>
    <Navigation location="Header" links={headerLinks} />
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
</style>
