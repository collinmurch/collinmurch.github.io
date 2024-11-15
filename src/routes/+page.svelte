<script>
    import NavBar from "$components/NavBar.svelte";
    import WaveCanvas from "$components/WaveCanvas.svelte";
    import { headerLinks, footerLinks } from "$lib/data/navigation";
</script>

<div class="Home">
    <WaveCanvas />

    <NavBar location="Header" links={headerLinks} />

    <div class="intro">
        <h1 class="name">Collin Murch</h1>
        <p class="about">Full stack software engineer.</p>
    </div>

    <img src="/images/profile.jpeg" class="logo" alt="profile" />

    <NavBar location="Footer" links={footerLinks} />
</div>

<style>
    .Home {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        text-align: center;
        align-items: center;
    }

    .logo {
        position: absolute;
        justify-content: flex-start;
        height: clamp(10em, 30vmin, 35em);
        border-radius: 4vmin;
        border: 0.75vmin solid #1f3746;
        filter: drop-shadow(0.33vw 0.33vmin 0.25vmin #000000a0);
        pointer-events: none;
        right: 10dvw;
        top: 40vh;
        transform: translate(-50%, -50%);
    }

    .intro {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        color: #ad6600;
        font-family: "Josefin Sans", sans-serif;
        top: 40dvh;
        left: 30dvw;
        transform: translate(-50%, -50%);
        width: 50dvw;
        pointer-events: none;
    }

    .name {
        font-size: clamp(3em, 8vmin, 9em);
        filter: drop-shadow(0.33vw 0.33vmin 0.25vmin #000000a0);
        white-space: nowrap;
        margin-bottom: 2dvh;
    }

    .about {
        font-weight: lighter;
        font-size: clamp(1em, 4vmin, 3em);
        margin-top: 0;
    }

    :global(.social) {
        width: clamp(1em, 2vw, 3em);
    }

    @media (max-aspect-ratio: 1.33/1) {
        .logo {
            transform: none;
            top: 15dvh;
            left: 50dvw;
            transform: translateX(-50%);
        }

        .intro {
            position: absolute;
            top: 60dvh;
            left: 50dvw;
            width: 90dvw;
        }
    }
</style>
