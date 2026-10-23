import { getBundle } from "#lib/recipes/data.server";

export const prerender = true;

export function GET() {
	return new Response(getBundle().indexText, {
		headers: { "content-type": "application/json" },
	});
}
