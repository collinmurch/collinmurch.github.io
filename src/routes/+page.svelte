<script>
    import Socials from "$components/Socials.svelte";
    import { waveState } from "$lib/stores/wave";
    import { onMount } from "svelte";

    onMount(() => {
        waveState.set(false);
    });
</script>

<div class="Home">
    <div class="intro">
        <h1 class="name">Collin Murch</h1>
        <p class="about">Full stack software engineer</p>
    </div>

    <img src="/images/profile.jpeg" class="logo" alt="profile" />

    <Socials />
</div>

<style>
    .Home {
        inset: 0;
        text-align: center;
        overflow: hidden;
    }

    .logo {
        top: 30dvh;
        position: absolute;
        height: clamp(10em, 30vmin, 35em);
        border-radius: 4vmin;
        border: 0.75vmin solid #1f3746;
        filter: drop-shadow(0.25rem 0.25rem 0.15rem #000000a0);
        pointer-events: none;
        right: calc(10dvw + 30vmin);
        transform: translateX(50%) translateY(-50%);
        will-change: transform;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }

    .intro {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        color: #ad6600;
        top: 30dvh;
        left: 30dvw;
        transform: translate(-50%, -50%);
        width: 50dvw;
        pointer-events: none;
    }

    .name {
        font-weight: lighter;
        font-size: clamp(3em, 9vmin, 9em);
        margin-bottom: 0;
        text-shadow: 1px 1px 1px #ad6600;
    }

    .about {
        font-weight: lighter;
        font-style: italic;
        font-size: clamp(1em, 3vmin, 3em);
    }

    :global(.social) {
        width: clamp(1em, 2vw, 3em);
    }

    @media (max-aspect-ratio: 1.33/1) {
        .logo {
            top: min(15dvh, calc(55dvh - 45vmin));
            left: 50dvw;
            transform: translateX(-50%);
        }

        .intro {
            top: max(55dvh, calc(10dvh + 40vmin + 5dvh));
            left: 50dvw;
            width: 90dvw;
        }
    }
</style>
