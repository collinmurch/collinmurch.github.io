import { getBundle } from "#lib/recipes/data.server";
import { listPlans } from "#lib/recipes/listing";

export function load() {
	return { plans: listPlans(getBundle().index.plans) };
}
