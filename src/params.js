import { defineParams } from "@sveltejs/kit/params";
import { courseOf } from "#lib/recipes/listing.js";

export const params = defineParams({
	/** A course page's slug, read as the course it names, such as `main` for `mains`. */
	course: courseOf,
});
