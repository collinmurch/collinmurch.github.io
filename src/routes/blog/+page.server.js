import { getPostMetadata } from "$lib/data/post-metadata.server";

export async function load() {
	return {
		posts: await getPostMetadata(),
	};
}
