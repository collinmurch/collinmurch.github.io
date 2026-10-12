const POSTS_DIR_PREFIX = "/src/posts/";
const POSTS_SUFFIX = ".md";

const postFiles = import.meta.glob("/src/posts/*.md");

export const postSlugs = Object.keys(postFiles).map((path) =>
	path.slice(POSTS_DIR_PREFIX.length, -POSTS_SUFFIX.length),
);

/**
 * Loads a compiled post by slug, or returns undefined if no post has that slug.
 */
export async function loadPost(slug) {
	const resolver = postFiles[`${POSTS_DIR_PREFIX}${slug}${POSTS_SUFFIX}`];
	if (!resolver) return undefined;

	const module = await resolver();
	return {
		slug,
		...module.metadata,
		content: module.default,
	};
}
