const postFiles = import.meta.glob("/src/posts/*.md");
const moduleCache = new Map();

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
    if (!moduleCache.has(path)) {
        const resolver = getPostResolver(path);
        moduleCache.set(path, resolver());
    }

    return moduleCache.get(path);
}

export const fetchMarkdownPosts = async () => {
    const entries = Object.keys(postFiles);

    const posts = await Promise.all(
        entries.map(async (path) => {
            const module = await loadPostModule(path);
            const meta = module?.metadata ?? {};

            return {
                meta,
                path: toSlug(path),
                sortTime: normalizeDateValue(meta.date),
            };
        }),
    );

    return posts
        .sort((a, b) => b.sortTime - a.sortTime)
        .map(({ meta, path }) => ({ meta, path }));
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
