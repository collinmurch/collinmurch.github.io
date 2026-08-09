import { buildPostMetadata } from "$lib/data/post-metadata";

const postMetadataFiles = import.meta.glob("/src/posts/*.md", {
	eager: true,
	import: "metadata",
	query: "?metadata",
});

export function getPostMetadata() {
	return buildPostMetadata(Object.entries(postMetadataFiles));
}
