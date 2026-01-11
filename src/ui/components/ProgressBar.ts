/**
 * D&D Experiential Learning Platform - ProgressBar Component
 */

export interface ProgressBarOptions {
	value: number;
	max: number;
	label?: string;
	variant?: 'default' | 'success' | 'danger' | 'info';
	showValue?: boolean;
	className?: string;
}

export function createProgressBar(options: ProgressBarOptions): HTMLElement {
	const percentage = Math.min(100, Math.max(0, (options.value / options.max) * 100));

	const container = document.createElement('div');
	container.className = `progress-container ${options.className || ''}`.trim();

	if (options.label || options.showValue) {
		const labelRow = document.createElement('div');
		labelRow.className = 'progress-label';

		if (options.label) {
			const labelSpan = document.createElement('span');
			labelSpan.innerText = options.label;
			labelRow.appendChild(labelSpan);
		}

		if (options.showValue) {
			const valueSpan = document.createElement('span');
			valueSpan.innerText = `${options.value}/${options.max}`;
			labelRow.appendChild(valueSpan);
		}

		container.appendChild(labelRow);
	}

	const barBg = document.createElement('div');
	barBg.className = 'progress-bar-bg';

	const barFill = document.createElement('div');
	barFill.className = `progress-bar-fill ${options.variant ? options.variant : ''}`.trim();
	barFill.style.width = `${percentage}%`;

	barBg.appendChild(barFill);
	container.appendChild(barBg);

	return container;
}
