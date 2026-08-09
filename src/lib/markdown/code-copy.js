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

function setButtonState(button, state, label) {
	button.dataset.state = state;
	button.setAttribute("aria-label", label);
	const announcement = button.querySelector(".copy-announce");
	if (announcement) announcement.textContent = label;
}

export function setupCodeCopy() {
	const resetTimers = new Set();

	const handleCopyClick = async (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const button = target.closest("[data-copy-btn]");
		if (!(button instanceof HTMLElement)) return;

		const code = button.closest(".code-block")?.querySelector("pre code");
		const text = code?.innerText ?? code?.textContent ?? "";
		if (!text) return;

		const defaultLabel = button.dataset.defaultLabel ?? "Copy";
		const successLabel = button.dataset.successLabel ?? "Copied!";
		const errorLabel = button.dataset.errorLabel ?? "Copy failed";
		const reset = () => {
			setButtonState(button, "", defaultLabel);
		};

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
			} else if (!legacyCopy(text)) {
				throw new Error("execCommand copy failed");
			}

			setButtonState(button, "copied", successLabel);
			button.blur();
			const timer = setTimeout(() => {
				resetTimers.delete(timer);
				reset();
			}, 1500);
			resetTimers.add(timer);
		} catch (error) {
			console.error("Unable to copy code block", error);
			setButtonState(button, "error", errorLabel);
			const timer = setTimeout(() => {
				resetTimers.delete(timer);
				reset();
			}, 1600);
			resetTimers.add(timer);
		}
	};

	document.addEventListener("click", handleCopyClick);
	return () => {
		document.removeEventListener("click", handleCopyClick);
		for (const timer of resetTimers) clearTimeout(timer);
	};
}
