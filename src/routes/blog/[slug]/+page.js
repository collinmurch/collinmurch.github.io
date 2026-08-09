import { loadPost } from "$lib/data/posts";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
	try {
		const post = await loadPost(params.slug);
		return { post };
	} catch (e) {
		console.error("Error loading post:", e);
		throw error(404, `Post not found: ${params.slug}`);
	}
}
