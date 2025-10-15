import { fetchMarkdownPosts } from "$lib/data/posts";

export async function load() {
    const posts = await fetchMarkdownPosts();

    return {
        posts,
    };
}
