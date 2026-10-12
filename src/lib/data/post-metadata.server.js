import { buildPostMetadata } from "$lib/data/post-metadata";
import { resolvePostEntries } from "$lib/data/post-paths";

const postMetadataFiles = import.meta.glob("/src/posts/*/*.md", {
	import: "metadata",
	query: "?metadata",
});
const entries = resolvePostEntries(Object.keys(postMetadataFiles));

export async function getPostMetadata() {
	const metadata = await Promise.all(
		[...entries].map(async ([slug, path]) => [slug, await postMetadataFiles[path]()]),
	);
	return buildPostMetadata(metadata);
}
