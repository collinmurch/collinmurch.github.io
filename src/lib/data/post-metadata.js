import { parseDate } from "../utils/dates";

const REQUIRED_FIELDS = ["title", "date", "description"];

/**
 * Throws unless a post's front matter has a title, a description, and a date
 * that parses, so a malformed post fails the build instead of rendering
 * placeholders.
 */
export function assertFrontMatter(slug, metadata) {
	const missing = REQUIRED_FIELDS.filter((field) => !metadata?.[field]);
	if (missing.length) {
		throw new Error(`Post "${slug}" needs ${missing.join(", ")} in its front matter`);
	}
	if (!parseDate(metadata.date)) {
		throw new Error(
			`Post "${slug}" has an invalid date "${metadata.date}"; use MM-DD-YYYY`,
		);
	}
}

/**
 * Checks each post's front matter and lists the posts newest first.
 *
 * @param {[string, object][]} entries Slugs paired with their front matter.
 */
export function buildPostMetadata(entries) {
	return entries
		.map(([slug, metadata]) => {
			assertFrontMatter(slug, metadata);
			return { meta: metadata, path: slug, time: parseDate(metadata.date).getTime() };
		})
		.sort((a, b) => b.time - a.time)
		.map(({ meta, path }) => ({ meta, path }));
}
