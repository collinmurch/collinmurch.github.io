<script>
    import { page } from "$app/stores";
    import Navigation from "$components/Navigation.svelte";
    import WaveCanvas from "../components/WaveCanvas.svelte";
    import { getTransition } from "$lib/animations/transitions";
    import { headerLinks } from "$lib/data/navigation";
    import "../app.css";

    const { children } = $props();

    let previousPath = $state("/");
    let currentTransition = $state(getTransition("/", $page.url.pathname));

    $effect(() => {
        currentTransition = getTransition(previousPath, $page.url.pathname);
        previousPath = $page.url.pathname;
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
        padding: clamp(3rem, 6vw, 8rem) 0 0;
    }

    main {
        position: fixed;
        color: #e6f4f1;
    }
</style>
