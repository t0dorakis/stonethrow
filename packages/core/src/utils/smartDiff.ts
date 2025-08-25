/**
 * Smart DOM diffing utility that handles all types of changes efficiently
 * - Template-aware updates (fastest path - only update elements with state)
 * - Text content changes (fast path)
 * - Attribute changes (medium path)
 * - Structural changes (elaborate diff)
 */

export interface DiffOptions {
	preserveEventListeners?: boolean;
	preserveFocus?: boolean;
	debugMode?: boolean;
}

export interface DiffResult {
	type: "template-aware" | "text" | "attributes" | "structure" | "none";
	changesCount: number;
	performance: {
		startTime: number;
		endTime: number;
		duration: number;
	};
}

/**
 * Template-aware update function that directly updates elements containing state
 */
export function smartUpdateElement(
	element: HTMLElement,
	newHTML: string,
	options: DiffOptions = {},
): DiffResult {
	const startTime = performance.now();
	const opts = {
		preserveEventListeners: true,
		preserveFocus: true,
		debugMode: false,
		...options,
	};

	if (opts.debugMode) {
		console.log(
			"🧠 Smart Diff: Starting template-aware analysis for",
			element.tagName,
		);
	}

	// Parse new HTML
	const newElement = createElementFromHTML(newHTML);

	// Try template-aware update first (fastest)
	const templateResult = tryTemplateAwareUpdate(element, newElement, opts);
	if (templateResult.changesCount > 0) {
		templateResult.performance.endTime = performance.now();
		templateResult.performance.duration =
			templateResult.performance.endTime - startTime;

		if (opts.debugMode) {
			console.log(
				`🧠 Smart Diff: Completed template-aware update in ${templateResult.performance.duration.toFixed(
					2,
				)}ms with ${templateResult.changesCount} changes`,
			);
		}

		return templateResult;
	}

	// Fallback to previous logic if template-aware update didn't work
	const changeAnalysis = analyzeChanges(element, newElement, opts);
	let result: DiffResult;

	switch (changeAnalysis.type) {
		case "text":
			result = applyTextOnlyChanges(element, newElement, opts);
			break;
		case "attributes":
			result = applyAttributeChanges(element, newElement, opts);
			break;
		case "structure":
			result = applyStructuralChanges(element, newElement, opts);
			break;
		default:
			result = {
				type: "none",
				changesCount: 0,
				performance: { startTime, endTime: performance.now(), duration: 0 },
			};
	}

	result.performance.endTime = performance.now();
	result.performance.duration = result.performance.endTime - startTime;

	if (opts.debugMode) {
		console.log(
			`🧠 Smart Diff: Completed ${
				result.type
			} update in ${result.performance.duration.toFixed(2)}ms with ${
				result.changesCount
			} changes`,
		);
	}

	return result;
}

/**
 * Template-aware update: Find elements with data-watch and update their content directly
 * This is the fastest path since we know exactly which elements contain dynamic state
 */
function tryTemplateAwareUpdate(
	element: HTMLElement,
	newElement: Element,
	options: DiffOptions,
): DiffResult {
	const startTime = performance.now();
	let changesCount = 0;

	// Find all elements with data-watch in both old and new elements
	const oldWatchElements = element.querySelectorAll("[data-watch]");
	const newWatchElements = newElement.querySelectorAll("[data-watch]");

	if (options.debugMode) {
		console.log(
			`🎯 Template-aware: Found ${oldWatchElements.length} old and ${newWatchElements.length} new [data-watch] elements`,
		);
	}

	// Update watch elements by position (they should match 1:1)
	const maxLength = Math.min(oldWatchElements.length, newWatchElements.length);
	for (let i = 0; i < maxLength; i++) {
		const oldEl = oldWatchElements[i];
		const newEl = newWatchElements[i];

		if (options.debugMode) {
			console.log(`🎯 Checking [data-watch] element ${i}:`);
			console.log(`🎯   Old content: "${oldEl.textContent}"`);
			console.log(`🎯   New content: "${newEl.textContent}"`);
		}

		// Update text content if different
		if (oldEl.textContent !== newEl.textContent) {
			if (options.debugMode) {
				console.log(
					`🎯 Auto-update: "${oldEl.textContent}" -> "${newEl.textContent}" in [data-watch] element ${i}`,
				);
			}
			oldEl.textContent = newEl.textContent;
			changesCount++;
		}

		// Update attributes if different (but preserve event listeners)
		const attributeChanges = updateElementAttributesIfNeeded(
			oldEl,
			newEl,
			options,
		);
		changesCount += attributeChanges;
	}

	return {
		type: "template-aware",
		changesCount,
		performance: { startTime, endTime: performance.now(), duration: 0 },
	};
}

/**
 * Update element attributes only if they've actually changed
 */
function updateElementAttributesIfNeeded(
	oldElement: Element,
	newElement: Element,
	options: DiffOptions,
): number {
	let changesCount = 0;

	// Get all attributes from both elements
	const oldAttrs = new Map<string, string>();
	const newAttrs = new Map<string, string>();

	for (const attr of Array.from(oldElement.attributes)) {
		oldAttrs.set(attr.name, attr.value);
	}

	for (const attr of Array.from(newElement.attributes)) {
		newAttrs.set(attr.name, attr.value);
	}

	// Update changed attributes
	for (const [name, value] of newAttrs) {
		if (oldAttrs.get(name) !== value) {
			if (options.debugMode) {
				console.log(`🎯 Updating attribute ${name}="${value}"`);
			}
			oldElement.setAttribute(name, value);
			changesCount++;
		}
	}

	// Remove attributes that no longer exist
	for (const [name] of oldAttrs) {
		if (!newAttrs.has(name)) {
			if (options.debugMode) {
				console.log(`🎯 Removing attribute ${name}`);
			}
			oldElement.removeAttribute(name);
			changesCount++;
		}
	}

	return changesCount;
}

/**
 * Analyze what types of changes are needed
 */
function analyzeChanges(
	oldElement: HTMLElement,
	newElement: Element,
	options: DiffOptions,
): { type: "text" | "attributes" | "structure" | "none" } {
	// Check if structure changed (different number of children or child types)
	if (hasStructuralChanges(oldElement, newElement)) {
		return { type: "structure" };
	}

	// Check if attributes changed
	if (hasAttributeChanges(oldElement, newElement)) {
		return { type: "attributes" };
	}

	// Check if only text content changed
	if (hasTextChanges(oldElement, newElement)) {
		return { type: "text" };
	}

	return { type: "none" };
}

/**
 * Fast path: Only update text content
 */
function applyTextOnlyChanges(
	element: HTMLElement,
	newElement: Element,
	options: DiffOptions,
): DiffResult {
	const startTime = performance.now();
	let changesCount = 0;

	// Find all text-only elements and update them
	const oldTextElements = findTextOnlyElements(element);
	const newTextElements = findTextOnlyElements(newElement);

	if (options.debugMode) {
		console.log(
			`⚡ Found ${oldTextElements.length} old text elements and ${newTextElements.length} new text elements`,
		);
	}

	for (
		let i = 0;
		i < Math.min(oldTextElements.length, newTextElements.length);
		i++
	) {
		const oldEl = oldTextElements[i];
		const newEl = newTextElements[i];

		if (options.debugMode) {
			console.log(`⚡ Comparing elements at index ${i}:`);
			console.log(`⚡   Old: ${oldEl.tagName} = "${oldEl.textContent}"`);
			console.log(`⚡   New: ${newEl.tagName} = "${newEl.textContent}"`);
			console.log(`⚡   Elements match: ${elementsMatch(oldEl, newEl)}`);
			console.log(
				`⚡   Text different: ${oldEl.textContent !== newEl.textContent}`,
			);
		}

		if (
			elementsMatch(oldEl, newEl) &&
			oldEl.textContent !== newEl.textContent
		) {
			if (options.debugMode) {
				console.log(
					`⚡ Fast text update: "${oldEl.textContent}" -> "${newEl.textContent}"`,
				);
			}
			oldEl.textContent = newEl.textContent;
			changesCount++;
		} else if (options.debugMode) {
			console.log(`⚡ Skipping element ${i} - no match or no text change`);
		}
	}

	return {
		type: "text",
		changesCount,
		performance: { startTime, endTime: performance.now(), duration: 0 },
	};
}

/**
 * Medium path: Update attributes and text content
 */
function applyAttributeChanges(
	element: HTMLElement,
	newElement: Element,
	options: DiffOptions,
): DiffResult {
	const startTime = performance.now();
	let changesCount = 0;

	// Update attributes on the root element
	changesCount += updateElementAttributes(element, newElement, options);

	// Recursively update children
	const oldChildren = Array.from(element.children);
	const newChildren = Array.from(newElement.children);

	for (let i = 0; i < Math.min(oldChildren.length, newChildren.length); i++) {
		const oldChild = oldChildren[i] as HTMLElement;
		const newChild = newChildren[i];

		if (elementsMatch(oldChild, newChild)) {
			// Update attributes
			changesCount += updateElementAttributes(oldChild, newChild, options);

			// Update text content if it's a text-only element
			if (
				isTextOnlyElement(oldChild) &&
				oldChild.textContent !== newChild.textContent
			) {
				if (options.debugMode) {
					console.log(
						`🔧 Attribute path text update: "${oldChild.textContent}" -> "${newChild.textContent}"`,
					);
				}
				oldChild.textContent = newChild.textContent;
				changesCount++;
			}
		}
	}

	return {
		type: "attributes",
		changesCount,
		performance: { startTime, endTime: performance.now(), duration: 0 },
	};
}

/**
 * Slow path: Full structural diffing
 */
function applyStructuralChanges(
	element: HTMLElement,
	newElement: Element,
	options: DiffOptions,
): DiffResult {
	const startTime = performance.now();
	let changesCount = 0;

	if (options.debugMode) {
		console.log("🏗️ Structural diff: Full DOM diffing required");
	}

	// Remember focused element
	const activeElement = options.preserveFocus ? document.activeElement : null;
	const wasFocused = activeElement && element.contains(activeElement);
	const focusPath = wasFocused
		? getElementPath(activeElement as Element, element, options)
		: null;

	// Perform full DOM diffing
	changesCount = performFullDiff(element, newElement, options);

	// Restore focus if needed
	if (wasFocused && focusPath) {
		const newFocusTarget = findElementByPath(focusPath, element);
		if (newFocusTarget && newFocusTarget !== document.activeElement) {
			(newFocusTarget as HTMLElement).focus();
		}
	}

	return {
		type: "structure",
		changesCount,
		performance: { startTime, endTime: performance.now(), duration: 0 },
	};
}

/**
 * Check if elements have structural changes
 */
function hasStructuralChanges(
	oldElement: HTMLElement,
	newElement: Element,
): boolean {
	const oldChildren = Array.from(oldElement.children);
	const newChildren = Array.from(newElement.children);

	// Different number of children
	if (oldChildren.length !== newChildren.length) {
		return true;
	}

	// Different child types
	for (let i = 0; i < oldChildren.length; i++) {
		if (oldChildren[i].tagName !== newChildren[i].tagName) {
			return true;
		}
	}

	return false;
}

/**
 * Check if elements have attribute changes
 */
function hasAttributeChanges(
	oldElement: HTMLElement,
	newElement: Element,
): boolean {
	// Check root element attributes
	if (elementAttributesChanged(oldElement, newElement)) {
		return true;
	}

	// Check children attributes
	const oldChildren = Array.from(oldElement.children);
	const newChildren = Array.from(newElement.children);

	for (let i = 0; i < Math.min(oldChildren.length, newChildren.length); i++) {
		if (elementAttributesChanged(oldChildren[i], newChildren[i])) {
			return true;
		}
	}

	return false;
}

/**
 * Check if elements have text changes
 */
function hasTextChanges(oldElement: HTMLElement, newElement: Element): boolean {
	const oldTextElements = findTextOnlyElements(oldElement);
	const newTextElements = findTextOnlyElements(newElement);

	if (oldTextElements.length !== newTextElements.length) {
		return false; // This would be a structural change
	}

	for (let i = 0; i < oldTextElements.length; i++) {
		if (oldTextElements[i].textContent !== newTextElements[i].textContent) {
			return true;
		}
	}

	return false;
}

/**
 * Helper functions
 */

function createElementFromHTML(html: string): Element {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html.trim();
	const element = tempDiv.firstElementChild;

	if (!element) {
		throw new Error("Invalid HTML provided");
	}

	return element;
}

function findTextOnlyElements(element: Element): Element[] {
	const textElements: Element[] = [];

	function traverse(el: Element) {
		const hasChildElements = el.children.length > 0;
		const hasTextContent =
			el.textContent?.trim().length && el.textContent.trim().length > 0;

		if (!hasChildElements && hasTextContent) {
			textElements.push(el);
		} else {
			for (const child of Array.from(el.children)) {
				traverse(child);
			}
		}
	}

	traverse(element);
	return textElements;
}

function isTextOnlyElement(element: Element): boolean {
	return (
		element.children.length === 0 &&
		(element.textContent?.trim().length || 0) > 0
	);
}

function elementsMatch(oldEl: Element, newEl: Element): boolean {
	// Simply match by tag name since we use data-watch for identification
	return oldEl.tagName === newEl.tagName;
}

function elementAttributesChanged(oldEl: Element, newEl: Element): boolean {
	const oldAttrs = Array.from(oldEl.attributes);
	const newAttrs = Array.from(newEl.attributes);

	// Different number of attributes
	if (oldAttrs.length !== newAttrs.length) {
		return true;
	}

	// Check each attribute
	for (const attr of oldAttrs) {
		if (newEl.getAttribute(attr.name) !== attr.value) {
			return true;
		}
	}

	return false;
}

function updateElementAttributes(
	element: Element,
	newElement: Element,
	options: DiffOptions,
): number {
	let changesCount = 0;

	// Remove old attributes
	const oldAttrs = Array.from(element.attributes);
	for (const attr of oldAttrs) {
		if (!newElement.hasAttribute(attr.name)) {
			if (options.debugMode) {
				console.log(`🔧 Removing attribute: ${attr.name}`);
			}
			element.removeAttribute(attr.name);
			changesCount++;
		}
	}

	// Add/update new attributes
	const newAttrs = Array.from(newElement.attributes);
	for (const attr of newAttrs) {
		if (element.getAttribute(attr.name) !== attr.value) {
			if (options.debugMode) {
				console.log(`🔧 Setting attribute: ${attr.name}="${attr.value}"`);
			}
			element.setAttribute(attr.name, attr.value);
			changesCount++;
		}
	}

	return changesCount;
}

function getElementPath(
	element: Element,
	root: Element,
	options: DiffOptions,
): string[] {
	const path: string[] = [];
	let current: Element | null = element;

	while (current && current !== root) {
		const parent = current.parentElement;
		if (parent) {
			const index = Array.from(parent.children).indexOf(current);
			path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index + 1})`);
		}
		current = current.parentElement;
	}

	return path;
}

function findElementByPath(path: string[], root: Element): Element | null {
	let current = root;

	for (const selector of path) {
		const found = current.querySelector(selector);
		if (!found) return null;
		current = found;
	}

	return current;
}

function performFullDiff(
	element: HTMLElement,
	newElement: Element,
	options: DiffOptions,
): number {
	// This is a simplified version - in practice, you'd want a more sophisticated algorithm
	// For now, we'll use a basic approach that preserves event listeners where possible

	let changesCount = 0;

	// Update attributes
	changesCount += updateElementAttributes(element, newElement, options);

	// Update children with a simple approach
	const oldChildren = Array.from(element.childNodes);
	const newChildren = Array.from(newElement.childNodes);

	const maxLength = Math.max(oldChildren.length, newChildren.length);

	for (let i = 0; i < maxLength; i++) {
		const oldChild = oldChildren[i];
		const newChild = newChildren[i];

		if (!oldChild && newChild) {
			// Add new child
			element.appendChild(newChild.cloneNode(true));
			changesCount++;
		} else if (oldChild && !newChild) {
			// Remove old child
			element.removeChild(oldChild);
			changesCount++;
		} else if (oldChild && newChild) {
			// Update existing child
			if (
				oldChild.nodeType === Node.TEXT_NODE &&
				newChild.nodeType === Node.TEXT_NODE
			) {
				if (oldChild.textContent !== newChild.textContent) {
					oldChild.textContent = newChild.textContent;
					changesCount++;
				}
			} else if (
				oldChild.nodeType === Node.ELEMENT_NODE &&
				newChild.nodeType === Node.ELEMENT_NODE
			) {
				// Recursively diff elements
				const childElement = newChild as Element;
				const childResult = smartUpdateElement(
					oldChild as HTMLElement,
					childElement.outerHTML,
					options,
				);
				changesCount += childResult.changesCount;
			} else {
				// Different node types, replace
				element.replaceChild(newChild.cloneNode(true), oldChild);
				changesCount++;
			}
		}
	}

	return changesCount;
}
