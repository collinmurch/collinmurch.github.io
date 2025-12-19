<section
	class="mx-auto grid w-full max-w-[min(1200px,94vw)] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-24 max-lg:landscape:max-w-[min(960px,90vw)] max-lg:landscape:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] max-lg:landscape:items-center max-lg:landscape:gap-8"
>
	<picture
		class="relative mx-auto aspect-square w-[min(26rem,62vw)] max-w-xl overflow-hidden rounded-[18%] border-4 border-accent/55 shadow-[0_45px_95px_rgba(0,0,0,0.45)] max-lg:landscape:mx-0 max-lg:landscape:w-[clamp(11rem,26vw,13.5rem)] max-lg:landscape:max-w-none max-lg:landscape:border-[3px] max-lg:landscape:shadow-[0_26px_55px_rgba(0,0,0,0.3)]"
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

	<div
		class="flex flex-col items-center gap-4 text-primary lg:items-start lg:gap-6 max-lg:landscape:items-start max-lg:landscape:text-left max-lg:landscape:gap-5 max-lg:landscape:max-w-[min(26rem,50vw)]"
	>
		<h1
			class="text-shadow-soft text-6xl font-light tracking-tight text-primary md:text-7xl lg:text-[5.2rem] xl:text-[6rem] max-lg:landscape:text-[3.2rem]"
		>
			Collin Murch
		</h1>
		<p
			class="text-shadow-soft text-xl font-light italic text-primary md:text-[1.6rem] lg:text-[1.8rem] xl:text-[1.9rem] max-lg:landscape:text-lg max-lg:landscape:leading-snug"
		>
			Full stack software engineer
		</p>
	</div>
</section>
