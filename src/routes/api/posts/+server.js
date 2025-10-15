import { fetchMarkdownPosts } from "$lib/data/posts";
import { json, error } from "@sveltejs/kit";

export const prerender = true;

// Really we could do this just by calling the function this endpoint serves
// But I want to see how servers work and ensure they work in a static site :)
export const GET = async () => {
    try {
        const allPosts = await fetchMarkdownPosts();

        if (!Array.isArray(allPosts)) {
            throw new Error("Posts data is not in expected format");
        }

        return json(allPosts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        throw error(500, {
            message: "Failed to load blog posts",
        });
    }
};
