/**
 * Escapes text for HTML attributes and content. Braces are escaped too, so
 * the result is also safe in Svelte markup, where they would start an
 * expression.
 */
export function escapeHtml(value) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\{/g, "&#123;")
		.replace(/\}/g, "&#125;");
}

/**
 * Wraps markup in a Svelte `{@html}` tag so the compiler treats it as opaque,
 * leaving braces in inline CSS and text untouched.
 */
export function toSvelteHtml(html) {
	return `{@html ${JSON.stringify(html)}}`;
}

/**
 * Renders a block figure. A `size` exposes the content's natural dimensions
 * as custom properties so `app.css` can scale it with the surrounding text.
 */
export function figure(body, { className, size, caption } = {}) {
	const classes = ["figure", className].filter(Boolean).join(" ");
	const style = size
		? ` style="--figure-width:${size.width};--figure-height:${size.height}"`
		: "";
	const figcaption = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
	return `<figure class="${classes}"${style}>${body}${figcaption}</figure>`;
}
