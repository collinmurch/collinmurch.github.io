const POSTS_DIR_PREFIX = "/src/posts/";
const POSTS_SUFFIX = ".md";

function normalizeDateValue(value) {
	if (!value) return 0;
	const date = value instanceof Date ? value : new Date(value);
	const timestamp = date.getTime();
	return Number.isFinite(timestamp) ? timestamp : 0;
}

function toSlug(path) {
	if (!path.startsWith(POSTS_DIR_PREFIX)) return path;
	return path.slice(POSTS_DIR_PREFIX.length, -POSTS_SUFFIX.length);
}

export function buildPostMetadata(entries) {
	return entries
		.map(([path, metadata]) => ({
			metadata: metadata ?? {},
			path: toSlug(path),
			sortTime: normalizeDateValue(metadata?.date),
		}))
		.sort((a, b) => b.sortTime - a.sortTime)
		.map(({ metadata, path }) => ({ meta: metadata, path }));
}
