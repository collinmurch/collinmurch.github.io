import { assertFrontMatter } from "#lib/data/post-metadata";
import { resolvePostEntries } from "#lib/data/post-paths";

const SOURCE_BASE =
	"https://raw.githubusercontent.com/collinmurch/collinmurch.github.io/main";

const postFiles = import.meta.glob("/posts/*/*.md");
const entries = resolvePostEntries(Object.keys(postFiles));

export const postSlugs = [...entries.keys()];

/**
 * Loads a compiled post by slug, or returns undefined if no post has that slug.
 */
export async function loadPost(slug) {
	const path = entries.get(slug);
	if (!path) return undefined;

	const module = await postFiles[path]();
	assertFrontMatter(slug, module.metadata);
	return {
		slug,
		...module.metadata,
		content: module.default,
		sourceUrl: `${SOURCE_BASE}${path}`,
	};
}
