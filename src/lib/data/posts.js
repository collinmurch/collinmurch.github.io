import { resolvePostEntries } from "$lib/data/post-paths";

const postFiles = import.meta.glob("/src/posts/*/*.md");
const entries = resolvePostEntries(Object.keys(postFiles));

export const postSlugs = [...entries.keys()];

/**
 * Loads a compiled post by slug, or returns undefined if no post has that slug.
 */
export async function loadPost(slug) {
	const path = entries.get(slug);
	if (!path) return undefined;

	const module = await postFiles[path]();
	return {
		slug,
		...module.metadata,
		content: module.default,
	};
}
