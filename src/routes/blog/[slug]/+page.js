import { loadPost, postSlugs } from "$lib/data/posts";
import { error } from "@sveltejs/kit";

export function entries() {
	return postSlugs.map((slug) => ({ slug }));
}

export async function load({ params }) {
	const post = await loadPost(params.slug);
	if (!post) error(404, `Post not found: ${params.slug}`);
	return { post };
}
