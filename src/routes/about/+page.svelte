<script>
	import Hero from "#components/Hero.svelte";
</script>

<Hero image="headshot" alt="Headshot of Collin Murch">
	<div class="w-full max-w-152 landscape:flex-1">
		<h1 class="mb-6 text-foreground">About Me</h1>

		<div class="prose-rich space-y-6 text-foreground/90">
			<p>
				Hey! I'm Collin, a software engineer with over a
				<a href="https://github.com/collinmurch/astro-brawl">decade of experience</a>
				building everything from iOS games to AI training pipelines to full stack web apps.
				I currently work at
				<a href="https://www.zillow.com/homeloans">Zillow Home Loans</a> where I help design
				and create the tools that power the mortgage lending process.
			</p>

			<p>
				I'm deeply curious about service architecture, artificial intelligence, and
				information security. Aside from computers I love <a href="/recipes">cooking</a
				>, card games (especially Texas Hold'em), tennis, finding new electronic music,
				and pretty much every water sport under the sun.
			</p>

			<p>
				Feel free to reach out over <a href="https://x.com/collinmurch">X</a> or
				<a href="https://linkedin.com/in/collinmurch">LinkedIn</a> if you'd like to chat!
			</p>
		</div>
	</div>
</Hero>
