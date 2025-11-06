<script>
import { waveState } from "$lib/stores/wave";
import { onMount } from "svelte";

onMount(() => {
    waveState.set(false);
});
</script>

<section
    class="mx-auto grid w-full max-w-[min(1200px,94vw)] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-24"
>
    <picture
        class="relative mx-auto aspect-square w-[min(26rem,62vw)] max-w-xl overflow-hidden rounded-[18%] border-4 border-accent/55 shadow-[0_45px_95px_rgba(0,0,0,0.45)] lg:mx-0"
    >
        <source srcset="/images/profile.avif" type="image/avif" />
        <source srcset="/images/profile.webp" type="image/webp" />
        <img
            src="/images/profile.jpeg"
            alt="Portrait of Collin Murch"
            width="500"
            height="500"
            sizes="(max-width: 900px) 70vw, 30vw"
            srcset="/images/profile.jpeg 1x"
            fetchpriority="high"
            decoding="async"
            loading="eager"
            class="h-full w-full object-cover"
        />
    </picture>

    <div class="flex flex-col items-center gap-4 text-primary lg:items-start lg:gap-6">
        <h1 class="text-4xl font-light tracking-tight text-primary md:text-6xl lg:text-7xl xl:text-[5.4rem]">
            Collin Murch
        </h1>
        <p class="text-lg font-light italic text-primary md:text-2xl lg:text-[1.65rem] xl:text-[1.7rem]">
            Full stack software engineer
        </p>
    </div>
</section>
