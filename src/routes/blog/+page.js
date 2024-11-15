export const prerender = true;

export async function load() {
    const posts = await import.meta.glob("../../posts/*.md", { eager: true });

    const loadedPosts = Object.entries(posts).map(([path, post]) => {
        const slug = path.split("/").pop().slice(0, -3);

        return {
            slug,
            title: post.metadata?.title || "Untitled",
            date: post.metadata?.date || new Date(),
        };
    });

    return {
        posts: loadedPosts,
    };
}
