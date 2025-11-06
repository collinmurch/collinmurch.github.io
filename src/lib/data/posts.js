export const fetchMarkdownPosts = async () => {
    const allPostFiles = import.meta.glob("/src/posts/*.md");
    const iterablePostFiles = Object.entries(allPostFiles);

    const allPosts = await Promise.all(
        iterablePostFiles.map(async ([path, resolver]) => {
            const { metadata } = await resolver();
            const postPath = path.slice("/src/posts/".length, -".md".length);

            return {
                meta: metadata,
                path: postPath,
            };
        }),
    );

    return allPosts.slice().sort((a, b) => {
        const dateA = a.meta?.date ? new Date(a.meta.date) : 0;
        const dateB = b.meta?.date ? new Date(b.meta.date) : 0;
        return dateB - dateA;
    });
};

export const fetchSinglePost = async (slug) => {
    const allPostFiles = import.meta.glob("/src/posts/*.md");
    const matchingPost = allPostFiles[`/src/posts/${slug}.md`];

    if (!matchingPost) {
        throw new Error(`Post not found: ${slug}`);
    }

    const post = await matchingPost();

    return {
        slug,
        ...post.metadata,
        content: post.default,
    };
};
