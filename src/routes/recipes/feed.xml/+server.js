import { getBundle } from "#lib/recipes/data.server";
import { buildFeed } from "#lib/recipes/feed";
import { getRouteMeta, SITE_ORIGIN } from "#lib/seo/meta";

export const prerender = true;

export function GET() {
	const { title, description } = getRouteMeta("/recipes");
	const feed = buildFeed({
		title,
		description,
		link: `${SITE_ORIGIN}/recipes`,
		recipes: getBundle().index.recipes,
	});
	return new Response(feed, {
		headers: { "content-type": "application/rss+xml; charset=utf-8" },
	});
}
