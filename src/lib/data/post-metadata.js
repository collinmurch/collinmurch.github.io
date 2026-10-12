function normalizeDateValue(value) {
	if (!value) return 0;
	const date = value instanceof Date ? value : new Date(value);
	const timestamp = date.getTime();
	return Number.isFinite(timestamp) ? timestamp : 0;
}

export function buildPostMetadata(entries) {
	return entries
		.map(([slug, metadata]) => ({
			metadata: metadata ?? {},
			path: slug,
			sortTime: normalizeDateValue(metadata?.date),
		}))
		.sort((a, b) => b.sortTime - a.sortTime)
		.map(({ metadata, path }) => ({ meta: metadata, path }));
}
