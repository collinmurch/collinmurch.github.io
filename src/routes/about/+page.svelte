<div class="image-container">
    <picture class="headshot">
        <source srcset="/images/headshot.avif" type="image/avif" />
        <source srcset="/images/headshot.webp" type="image/webp" />
        <img
            src="/images/headshot.jpeg"
            alt="Headshot of Collin Murch"
            width="500"
            height="500"
            sizes="(max-width: 900px) 70vw, 30vw"
            srcset="/images/headshot.jpeg 1x"
            decoding="async"
            loading="lazy"
            class="headshot-image"
        />
    </picture>
</div>

<div class="container">
    <h1>About Me</h1>

    Hey! I'm Collin, a software engineer with over a
    <a href="https://github.com/collinmurch">decade of experience</a>
    building everything from iOS games to full stack web apps. I currently work at
    <a href="https://www.zillow.com/homeloans">Zillow Home Loans</a>
    where I help design and create backend tools that power the mortgage lending
    process.

    <br />
    <br />

    I'm deeply curious about service architecture, artificial intelligence, and
    information security. Outside of computers, I love card games (especially
    Texas Hold'em), tennis, finding new electronic music, and pretty much every
    water sport under the sun.

    <br />
    <br />

    Feel free to reach out over
    <a href="https://x.com/collinmurch">X</a>
    or <a href="https://linkedin.com/in/collinmurch">LinkedIn</a> if you'd like to
    chat!
</div>

<style>
    .image-container {
        display: flex;
        justify-content: center;
        margin-top: 2.5rem;
        margin-bottom: 2.5rem;
    }

    .headshot {
        height: clamp(10em, 30vmin, 35em);
        width: clamp(10em, 30vmin, 35em);
        border-radius: 4vmin;
        border: 0.75vmin solid #cde8e5;
        filter: drop-shadow(0.25rem 0.25rem 0.15rem #000000a0);
        pointer-events: none;
        overflow: hidden;
        display: block;
    }

    .headshot-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .container {
        margin-bottom: 2.5rem;
    }
</style>
