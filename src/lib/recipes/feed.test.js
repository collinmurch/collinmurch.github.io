import { describe, expect, test } from "bun:test";
import { addedTime, buildFeed, feedOrder, rfc822 } from "./feed";

const channel = {
	title: "Recipes",
	description: "From the kitchen.",
	link: "https://example.com/recipes",
};

function feedOf(recipes) {
	return buildFeed({ ...channel, recipes });
}

describe("rfc822", () => {
	test("formats a time in GMT", () => {
		expect(rfc822(Date.parse("2026-11-04T16:36:45-05:00"))).toBe(
			"Wed, 04 Nov 2026 21:36:45 GMT",
		);
	});
});

describe("addedTime", () => {
	test("prefers the full timestamp", () => {
		expect(
			addedTime({ added: "2026-11-04", added_at: "2026-11-04T16:36:45-05:00" }),
		).toBe(Date.parse("2026-11-04T21:36:45Z"));
	});

	test("falls back to UTC midnight of the date", () => {
		expect(addedTime({ added: "2026-10-12" })).toBe(Date.parse("2026-10-12T00:00:00Z"));
	});

	test("is null for an undated recipe", () => {
		expect(addedTime({})).toBeNull();
	});
});

describe("feedOrder", () => {
	test("puts the newest recipe first", () => {
		const order = feedOrder([
			{ title: "Old", added: "2026-01-01" },
			{ title: "New", added: "2026-10-01" },
		]);
		expect(order.map((r) => r.title)).toEqual(["New", "Old"]);
	});

	test("puts dated recipes before undated ones", () => {
		const order = feedOrder([
			{ title: "Undated" },
			{ title: "Dated", added: "2026-01-01" },
		]);
		expect(order.map((r) => r.title)).toEqual(["Dated", "Undated"]);
	});

	test("orders recipes added the same day by time when known", () => {
		const order = feedOrder([
			{ title: "A", added: "2026-11-04", added_at: "2026-11-04T09:00:00-05:00" },
			{ title: "B", added: "2026-11-04", added_at: "2026-11-04T16:00:00-05:00" },
		]);
		expect(order.map((r) => r.title)).toEqual(["B", "A"]);
	});

	test("orders recipes added the same day by title", () => {
		const order = feedOrder([
			{ title: "B", added: "2026-01-01" },
			{ title: "A", added: "2026-01-01" },
		]);
		expect(order.map((r) => r.title)).toEqual(["A", "B"]);
	});

	test("does not reorder its input", () => {
		const recipes = [{ title: "B" }, { title: "A" }];
		feedOrder(recipes);
		expect(recipes.map((r) => r.title)).toEqual(["B", "A"]);
	});
});

describe("buildFeed", () => {
	test("declares RSS 2.0", () => {
		expect(feedOf([])).toContain('<rss version="2.0">');
	});

	test("describes the channel", () => {
		expect(feedOf([])).toContain(
			"<title>Recipes</title>\n<link>https://example.com/recipes</link>",
		);
	});

	test("has one item per recipe", () => {
		const feed = feedOf([
			{ slug: "a", title: "A" },
			{ slug: "b", title: "B" },
		]);
		expect(feed.match(/<item>/g)).toHaveLength(2);
	});

	test("links an item to its recipe page", () => {
		expect(feedOf([{ slug: "jambalaya", title: "Jambalaya" }])).toContain(
			"<link>https://example.com/recipes/jambalaya</link>",
		);
	});

	test("uses the page url as a permalink guid", () => {
		expect(feedOf([{ slug: "jambalaya", title: "Jambalaya" }])).toContain(
			'<guid isPermaLink="true">https://example.com/recipes/jambalaya</guid>',
		);
	});

	test("dates an item from when it was added", () => {
		expect(feedOf([{ slug: "a", title: "A", added: "2026-10-12" }])).toContain(
			"<pubDate>Mon, 12 Oct 2026 00:00:00 GMT</pubDate>",
		);
	});

	test("dates an item to the second when the time is known", () => {
		const recipe = {
			slug: "a",
			title: "A",
			added: "2026-11-04",
			added_at: "2026-11-04T16:36:45-05:00",
		};
		expect(feedOf([recipe])).toContain(
			"<pubDate>Wed, 04 Nov 2026 21:36:45 GMT</pubDate>",
		);
	});

	test("dates the channel by its newest item", () => {
		const feed = feedOf([
			{ slug: "a", title: "A", added: "2026-10-12" },
			{ slug: "b", title: "B", added_at: "2026-11-04T16:36:45-05:00" },
		]);
		expect(feed).toContain(
			"<lastBuildDate>Wed, 04 Nov 2026 21:36:45 GMT</lastBuildDate>",
		);
	});

	test("leaves out the channel date when nothing is dated", () => {
		expect(feedOf([{ slug: "a", title: "A" }])).not.toContain("<lastBuildDate>");
	});

	test("leaves out the date of an undated item", () => {
		expect(feedOf([{ slug: "a", title: "A" }])).not.toContain("<pubDate>");
	});

	test("includes a description when there is one", () => {
		expect(feedOf([{ slug: "a", title: "A", description: "Crisp." }])).toContain(
			"<description>Crisp.</description>",
		);
	});

	test("escapes markup in titles", () => {
		expect(feedOf([{ slug: "a", title: "Mac & <Cheese>" }])).toContain(
			"<title>Mac &amp; &lt;Cheese&gt;</title>",
		);
	});
});
