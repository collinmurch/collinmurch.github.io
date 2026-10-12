/**
 * Copy button shared by code blocks and diagram sources. `code-copy.js`
 * copies the code in the nearest `.code-block` or `.diagram` when it is
 * clicked.
 */
export const COPY_BUTTON =
	'<button type="button" class="block-btn code-copy-btn" aria-live="polite" aria-label="Copy code" title="Copy code" data-copy-btn data-default-label="Copy code" data-success-label="Copied!" data-error-label="Copy failed"><span class="copy-icon" aria-hidden="true"><svg class="copy-icon-default" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2.4" ry="2.4"></rect><path d="M5 15H4.2A2.2 2.2 0 0 1 2 12.8V4.2A2.2 2.2 0 0 1 4.2 2h8.6A2.2 2.2 0 0 1 15 4.2V5"></path></svg><svg class="copy-icon-success" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 10.5 16.5 6 12"></path></svg></span><span class="sr-only copy-announce">Copy code</span></button>';
