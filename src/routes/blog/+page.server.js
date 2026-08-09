import { getPostMetadata } from "$lib/data/post-metadata.server";

export function load() {
	return {
		posts: getPostMetadata(),
	};
}
