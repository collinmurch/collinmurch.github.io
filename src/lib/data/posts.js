const postFiles = import.meta.glob("/src/posts/*.md");
const moduleCache = new Map();

const POSTS_DIR_PREFIX = "/src/posts/";
const POSTS_SUFFIX = ".md";

function getPostResolver(path) {
	const resolver = postFiles[path];
	if (!resolver) throw new Error(`Post not found: ${path}`);
	return resolver;
}

async function loadPostModule(path) {
	if (!moduleCache.has(path)) {
		const resolver = getPostResolver(path);
		moduleCache.set(path, resolver());
	}

	return moduleCache.get(path);
}

export const loadPost = async (slug) => {
	const path = `${POSTS_DIR_PREFIX}${slug}${POSTS_SUFFIX}`;
	const module = await loadPostModule(path);

	return {
		slug,
		...module.metadata,
		content: module.default,
	};
};
