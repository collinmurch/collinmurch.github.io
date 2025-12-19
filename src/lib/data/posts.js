const hot = import.meta.hot;
const shouldCacheModules = !hot;

const postMetadataFiles = import.meta.glob("/src/posts/*.md", {
	eager: true,
	import: "metadata",
});
const postFiles = import.meta.glob("/src/posts/*.md");
const moduleCache = new Map();
let postsCache = null;

if (hot) {
	hot.accept();
	hot.dispose(() => {
		moduleCache.clear();
		postsCache = null;
	});
}

const POSTS_DIR_PREFIX = "/src/posts/";
const POSTS_SUFFIX = ".md";

function normalizeDateValue(value) {
	if (!value) return 0;
	const dateObj = value instanceof Date ? value : new Date(value);
	const timestamp = dateObj.getTime();
	return Number.isFinite(timestamp) ? timestamp : 0;
}

function toSlug(path) {
	if (!path.startsWith(POSTS_DIR_PREFIX)) return path;
	return path.slice(POSTS_DIR_PREFIX.length, -POSTS_SUFFIX.length);
}

function getPostResolver(path) {
	const resolver = postFiles[path];
	if (!resolver) throw new Error(`Post not found: ${path}`);
	return resolver;
}

async function loadPostModule(path) {
	if (!shouldCacheModules) {
		const resolver = getPostResolver(path);
		return resolver();
	}

	if (!moduleCache.has(path)) {
		const resolver = getPostResolver(path);
		moduleCache.set(path, resolver());
	}

	return moduleCache.get(path);
}

function buildPosts() {
	const posts = Object.entries(postMetadataFiles).map(([path, meta]) => {
		const safeMeta = meta ?? {};

		return {
			meta: safeMeta,
			path: toSlug(path),
			sortTime: normalizeDateValue(safeMeta.date),
		};
	});

	return posts
		.sort((a, b) => b.sortTime - a.sortTime)
		.map(({ meta, path }) => ({ meta, path }));
}

export const fetchMarkdownPosts = async () => {
	if (!postsCache) {
		postsCache = buildPosts();
	}
	return postsCache;
};

export const fetchSinglePost = async (slug) => {
	const path = `${POSTS_DIR_PREFIX}${slug}${POSTS_SUFFIX}`;
	const module = await loadPostModule(path);

	return {
		slug,
		...module.metadata,
		content: module.default,
	};
};
