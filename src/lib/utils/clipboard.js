function legacyCopy(text) {
	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	document.body.appendChild(textarea);
	textarea.select();
	const copied = document.execCommand("copy");
	document.body.removeChild(textarea);
	return copied;
}

/**
 * Copies text to the clipboard, falling back to `execCommand` where the
 * Clipboard API is missing. Rejects when nothing was copied.
 */
export async function copyText(text) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
	} else if (!legacyCopy(text)) {
		throw new Error("execCommand copy failed");
	}
}
