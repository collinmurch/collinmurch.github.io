---
title: Open Receipt
date: "10-12-2026"
description: "Open Receipt: Scan. Split. Settle."
---

## The What

Open Receipt is the side project I've been working on for the past month or two, and as of last week it's officially been submitted to the App Store for review!
More importantly, I think it's time I wrote my first blog post here.

The sales pitch for Open Receipt is pretty straightforward. I regularly go out to eat and attend events with friends, and usually one person picks up the check. Afterwards, we have different ways of splitting the receipt; a few people use dedicated apps, some use an LLM, others just do the math by hand each time. Honestly, I've tried each of these, and they're all frustrating for one reason or another:

- Every dedicated app I've tried either can barely read receipts (because it uses some OCR library under the hood which has poor semantic understanding) or requires a subscription (likely due to phoning an LLM for receipt comprehension, which requires both a server and API pricing)
  - _I am not paying $5 a month to split receipts!_
- LLMs require typing out a prompt each time and, unless specifically prompted to use Python or other tools, are prone to mistakes
- Doing it by hand takes too long for longer receipts such as groceries

I was pretty excited when [Apple announced their own receipt-splitting integration](https://support.apple.com/en-us/127565) in Wallet, but sadly it is buried deep in the Wallet app, requires using Apple Cash for payments, and lacks features I want.

So I set out building my own with these principles in mind:

1. No servers or API connections to OpenAI/Anthropic/other providers
2. Absolutely no subscriptions
3. Native feel (no React Native)

I'm pretty happy with the result! We use Apple's cloud model via Private Cloud Compute (PCC) for all the receipt reading, everything is native SwiftUI, and, most importantly, it's both accurate and doesn't require a subscription to use. And as the name suggests, it's [open source](https://github.com/collinmurch/open-receipt/) too. Here are some screenshots:

<div style="display: flex; gap: 0.75em">
<a href="https://raw.githubusercontent.com/collinmurch/open-receipt/refs/heads/main/Assets/Previews/light/01-library.png" style="flex: 1; min-width: 0"><img src="https://raw.githubusercontent.com/collinmurch/open-receipt/refs/heads/main/Assets/Previews/light/01-library.png" alt="Open Receipt library of scanned receipts" style="display: block; width: 100%; border-radius: 0.5rem" /></a>
<a href="https://raw.githubusercontent.com/collinmurch/open-receipt/refs/heads/main/Assets/Previews/light/03-split.png" style="flex: 1; min-width: 0"><img src="https://raw.githubusercontent.com/collinmurch/open-receipt/refs/heads/main/Assets/Previews/light/03-split.png" alt="Splitting a receipt between people in Open Receipt" style="display: block; width: 100%; border-radius: 0.5rem" /></a>
<a href="https://raw.githubusercontent.com/collinmurch/open-receipt/refs/heads/main/Assets/Previews/light/05-share.png" style="flex: 1; min-width: 0"><img src="https://raw.githubusercontent.com/collinmurch/open-receipt/refs/heads/main/Assets/Previews/light/05-share.png" alt="Sharing a receipt split from Open Receipt" style="display: block; width: 100%; border-radius: 0.5rem" /></a>
</div>

Please download it and try it out! The first 5 receipt reads are free, and then it's a one-time payment to unlock unlimited reads. This is mostly to offset the $99-a-year Apple Developer cost, and of course it's [open source](https://github.com/collinmurch/open-receipt/), so you can install it on your own device if you want.

I won't go into detail on all of the features. Instead, let's discuss how I built it.

## The How

First and foremost, I didn't write or even (for the most part) look at a single line of code for this project. I haven't typed a line of Swift in over 10 years, and I wasn't planning on playing catch-up for this project. Any modern LLM will be much more of a subject-matter expert than I would be.

> Some exceptions to this were: schema for data persistence, model instructions in `AGENTS.md`/`CLAUDE.md`, PCC prompt, organization, tooling, etc.

With that being said, E2E testing was and is a massive part of the development process for Open Receipt. Many of my friends and I use beta builds to split receipts and otherwise stress-test the app. And not focusing on line-by-line implementation details cleared the way for me to spend time on higher-level abstractions that seriously enable what software engineering is becoming today.

### Tooling

I prefer working with CLIs wherever possible. Xcode does not spark joy. To that end, I've centralized all of the tooling around `make` commands, which allow me to do everything from my terminal. I haven't opened Xcode once since I started this project.

> _Note: For both Codex and Claude Code, I exclude `make *` from the sandbox so they can still talk to the Simulator, hit the internet, etc. But they both trip sandbox restrictions on chained commands like `make blah && head -n 10`, so you have to tell them to avoid doing so in `CLAUDE.md`/`AGENTS.md`._

Some examples:

```bash
make lint; make test; make build # Self-explanatory.

make run-device release=1 # Run on the plugged-in device (or connected via personal hotspot... did you know that works?!) in release mode (real calls to PCC).

make receipts of=whole-foods-1/2 # Run the second image of our first Whole Foods receipt fixture through PCC, and check the result against our ground-truth data. More on this later.

make receipts reasoning=deep max_pixels=2048 # Same as above, but for every receipt fixture we have, using deep reasoning and a maximum side length of 2048 pixels for the image.

make screenshot of=review appearance=both # Take a screenshot of the review scenario, in both light and dark modes.

make icons # Export all of our Icon Composer renditions. We use Icon Composer (https://developer.apple.com/icon-composer) because it's easy to make Liquid Glass icons.

make previews # Generate all App Store previews. More on this in Preview Generation below.
```

All of these make it nearly seamless for my agents to iterate and collaborate across worktrees -- sometimes for hours -- until the desired result has been achieved.

### Harness Engineering

It's been understood for a while that verification loops are one of the most powerful constructs for productivity with modern agents. Put simply: give the agent a way to verify its own work. It helps pluck the rough feathers of the stochastic parrot (yes, I know I'm not using that metaphor entirely correctly).

Talented engineers are already using this everywhere: running and recording unit/integration/E2E tests, rendering generated PowerPoints with LibreOffice, [discovering and proving new math with Lean](https://openai.com/index/sharing-ai-progress-in-mathematics), hell, even linting kind of fell into this category before the models got so good at writing formatted code.

I'll share two examples I used in Open Receipt below.

#### LLM Pipeline

Initially, I wanted Apple's local model to work. I really did. Unfortunately, it (at least the iOS 26 3-billion-parameter model) just didn't have the requisite IQ to do the receipt semantic understanding. I was feeding it relatively clean OCR data (it was/is a text-only model), and at the time it just wasn't able to turn that into usable JSON. Guided generation helped but didn't fix the model classifying items as tax or deciding the merchant name was an item. I'm not interested in playing regex edge-case whack-a-mole.

But what I did get out of that exploration was a pretty sweet harness for prompt development (engineering?) and image processing. To iterate on the prompt and pipeline, I built a receipt parser that both the app proper and the test harness call. Same prompt, same image processing, same receipt reading quality.

> `make receipts of=whole-foods-1 cached=1`: Runs every image of the first Whole Foods receipt through PCC using caching (SHA-256 of config, prompt, image data, etc.).

More importantly, this allowed me to use `/goal` with Claude Code/Codex and go to bed. Give it a target accuracy to hit, instructions to "train" on a select few receipts, then "test" on another set, and an explicit rule to not overfit to one given receipt or otherwise bloat the generated prompt, and it's off. Genuinely, after one to two hours of iterating (looping!), I had a pipeline that was accurate for almost any new receipt I threw at it.

#### Development Screenshots

For UI work, I included a `make screenshot` command the LLM uses to verify its changes. Modern LLMs largely understand SwiftUI shockingly well, but for newer features or quirky sizing (I'm looking at you, [iPhone Duo](https://apple.com/iphone-duo)), they need a way to verify their work.

For frontend work, this sort of tool/skill often uses [Playwright](https://playwright.dev) browser capture, where the agent can navigate to a page in a browser and capture it. Unfortunately, Apple's Simulator doesn't really allow agent-controlled navigation.

Instead, we allow the agent to write a new "scenario" where pull up the app state to the page we want to view. Then, using the `make` command, the agent can take a screenshot on a specific device in either light or dark mode. The agent then views the image, determines whether it wrote the correct SwiftUI, and there you have your self-verification loop.

### Preview Generation

_Note: I don't know if this is a common technique in the iOS world, but I've really loved leveraging it!_

Spending a ton of time in Photoshop every time I changed a page's feel on a version didn't sound super appealing to me. But I wanted professional-looking previews for both the app screenshots and the newer [headers](https://developer.apple.com/app-store/asset-best-practices/#header) / [search results](https://developer.apple.com/app-store/asset-best-practices/#search-results) that were more than basic screenshots. Think: focused elements, stylized text, rounded corners, the works. To do this, I implemented an end-to-end preview generation pipeline. One command creates all the needed stylized assets.

> Running `make previews` takes screenshots in the Simulator (using the same process explained in [Development Screenshots](#development-screenshots)), then draws gradients, adds text, and blows up desired elements, all using Swift.

Here's how it works:

```mermaid
---
title: make previews
config:
  look: handDrawn
---
flowchart LR
  subgraph capture["1 · Capture"]
    direction TB
    app["A test opens<br/>each screen<br />in the Simulator"]
    shot["Capture screenshot"]
    frame["Record where the<br/>highlighted component is"]
    app --> shot
    app --> frame
  end

  subgraph compose["2 · Compose"]
    direction TB
    backdrop["Add gradient background"]
    headline["Add headline text"]
    card["Add screenshot"]
    lifted["Cut out highlighted component<br />and scale it up"]
    backdrop --> headline --> card --> lifted
  end

  out(["App Store image"])

  shot --> compose
  frame --> compose
  compose ==> out

  classDef step fill:var(--color-secondary),stroke:var(--color-accent),stroke-width:1.5px
  classDef data fill:var(--color-card),stroke:var(--color-border)
  classDef layer fill:var(--color-muted),stroke:var(--color-accent)
  classDef hero fill:var(--color-primary),stroke:var(--color-primary-foreground),color:var(--color-primary-foreground),stroke-width:2px
  classDef done fill:var(--color-accent),stroke:var(--color-accent),color:var(--color-accent-foreground),stroke-width:2px
  class app step
  class shot,frame data
  class backdrop,headline,card layer
  class lifted hero
  class out done
```

The search artwork works largely the same as the previews, but instead of highlighting a component, it draws additional shapes / text on the captured SwiftUI screenshots from the Simulator.

Instead of taking a screenshot, the header artwork renders the same SwiftUI views (via `ImageRenderer`) that we use for the split-receipt share cards, which are then adjusted for opacity and orientation during a similar composition step.

### Other Cool Things

#### Background Reading

`BGContinuedProcessingTask` lets PCC keep reading receipts in the background (even if the app is backgrounded!).

#### Metal Shader

A GPU-efficient shader seeded from the receipt's UUID causes each receipt's background gradient to be unique and "breathe".

#### Build Channels

No need for `#if DEBUG` branches. It also lets us build for the Simulator using example data (the Simulator can't hit PCC). The value is set at compile time (release builds are further split between TestFlight and App Store at launch) and then read from a shared `BuildChannel` service.
