<script>
import { beforeNavigate } from "$app/navigation";
import { page } from "$app/stores";
import Navigation from "$components/Navigation.svelte";
import Socials from "$components/Socials.svelte";
import { getTransition } from "$lib/animations/transitions";
import "../app.css";
import WaveCanvas from "../components/WaveCanvas.svelte";

const { children } = $props();

let currentTransition = $state(getTransition("/", $page.url.pathname));

const DEFAULT_META = {
    title: "Collin Murch | Software Engineer",
    description:
        "Collin Murch is a full stack software engineer exploring web, AI, and systems design.",
};

const META_BY_ROUTE = {
    "/": {
        title: "Collin Murch | Software Engineer",
        description:
            "Welcome to Collin Murch's personal site featuring experience, writing, and contact links.",
    },
    "/about": {
        title: "About | Collin Murch",
        description:
            "Learn more about Collin Murch's background, interests, and current work at Zillow Home Loans.",
    },
    "/blog": {
        title: "Blog | Collin Murch",
        description:
            "Articles and notes from Collin Murch on engineering, architecture, AI, and more.",
    },
};

function normalizePath(pathname) {
    if (!pathname) return "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
        return pathname.slice(0, -1);
    }
    return pathname;
}

let meta = $state(DEFAULT_META);

$effect(() => {
    const path = normalizePath($page.url.pathname);
    meta = META_BY_ROUTE[path] ?? DEFAULT_META;
});

beforeNavigate(({ from, to }) => {
    currentTransition = getTransition(from?.route.id, to?.route.id);
});
</script>

<svelte:head>
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={meta.title} />
    <meta name="twitter:description" content={meta.description} />
</svelte:head>

<div class="relative isolate min-h-dvh overflow-hidden text-foreground">
    <WaveCanvas />

    <div class="fixed inset-0 z-20 flex flex-col">
        <Navigation />

        <main class="flex-1 overflow-y-auto scrollbar-reserve">
            {#key $page.url.pathname}
                <section
                    class="page-shell"
                    in:currentTransition.transition={currentTransition.params}
                >
                    {@render children()}
                </section>
            {/key}
        </main>

        {#if normalizePath($page.url.pathname) === "/"}
            <Socials />
        {/if}
    </div>
</div>
