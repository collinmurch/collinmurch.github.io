const POSTS_DIR = "/posts/";

/**
 * Maps each post folder in `posts/` to its Markdown file, keyed by slug. The file is
 * the first that exists of `<folder>.md`, `README.md`, and `index.md`. A folder holding
 * Markdown but none of those names throws, so a misnamed post fails the build.
 *
 * @param {string[]} paths Paths from `import.meta.glob("/posts/*\/*.md")`.
 * @returns {Map<string, string>}
 */
export function resolvePostEntries(paths) {
	const available = new Set(paths);
	const folders = new Set(
		paths.map((path) => path.slice(POSTS_DIR.length).split("/")[0]),
	);
	const entries = new Map();

	for (const folder of [...folders].sort()) {
		const entry = [`${folder}.md`, "README.md", "index.md"]
			.map((name) => `${POSTS_DIR}${folder}/${name}`)
			.find((path) => available.has(path));
		if (!entry) {
			throw new Error(
				`Post folder "${folder}" needs ${folder}.md, README.md, or index.md`,
			);
		}
		entries.set(folder, entry);
	}

	return entries;
}
