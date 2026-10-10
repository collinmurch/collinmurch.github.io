<script>
	const { image, alt, children } = $props();

	const widths = [256, 384];
	const sizes = "(orientation: portrait) 64vw, 26rem";

	const srcset = (format) =>
		[
			...widths.map((w) => `/images/${image}-${w}.${format} ${w}w`),
			`/images/${image}.${format} 500w`,
		].join(", ");
</script>

<svelte:head>
	<link
		rel="preload"
		as="image"
		href="/images/{image}.avif"
		type="image/avif"
		imagesrcset={srcset("avif")}
		imagesizes={sizes}
		fetchpriority="high"
	/>
</svelte:head>

<section
	class="flex min-h-(--sky) flex-col items-center justify-center gap-[calc(var(--portrait)*0.1)] landscape:flex-row landscape:gap-[calc(var(--portrait)*0.25)]"
>
	<picture
		class="size-(--portrait) shrink-0 overflow-hidden rounded-[18%] border-4 border-accent/55 shadow-portrait"
	>
		<source srcset={srcset("avif")} {sizes} type="image/avif" />
		<source srcset={srcset("webp")} {sizes} type="image/webp" />
		<img
			src="/images/{image}.jpeg"
			{alt}
			width="500"
			height="500"
			fetchpriority="high"
			decoding="async"
			loading="eager"
			class="size-full object-cover"
		/>
	</picture>

	{@render children()}
</section>
