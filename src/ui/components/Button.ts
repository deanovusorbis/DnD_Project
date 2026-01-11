/**
 * D&D Experiential Learning Platform - Button Component
 */

export interface ButtonOptions {
	label: string;
	variant?: 'primary' | 'secondary' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	icon?: string;
	onClick?: (e: MouseEvent) => void;
	className?: string;
	disabled?: boolean;
	id?: string;
}

export function createButton(options: ButtonOptions): HTMLButtonElement {
	const btn = document.createElement('button');

	// Classes
	btn.className = `btn btn-${options.variant || 'secondary'} ${options.size ? `btn-${options.size}` : ''} ${options.className || ''}`.trim();

	// Content
	let content = '';
	if (options.icon) {
		content += `<span class="btn-icon">${options.icon}</span>`;
	}
	content += `<span class="btn-label">${options.label}</span>`;
	btn.innerHTML = content;

	// Props
	if (options.id) btn.id = options.id;
	if (options.disabled) btn.disabled = true;

	// Event
	if (options.onClick) {
		btn.addEventListener('click', options.onClick);
	}

	return btn;
}
