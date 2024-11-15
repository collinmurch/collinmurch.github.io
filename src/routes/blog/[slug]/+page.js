import { error } from "@sveltejs/kit";

export async function load({ params }) {
    try {
        const post = await import(`../../../posts/${params.slug}.md`);

        return {
            post: {
                slug: params.slug,
                ...post.metadata,
                content: post.default,
            },
        };
    } catch (e) {
        console.error("Error loading post:", e);
        throw error(404, `Post not found: ${params.slug}`);
    }
}
