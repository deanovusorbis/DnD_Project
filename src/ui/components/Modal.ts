/**
 * D&D Experiential Learning Platform - Modal Component
 * Simple utility to show verification modals and alerts
 */

import { createButton } from './Button.ts';

interface ModalOptions {
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel?: () => void;
	variant?: 'danger' | 'info' | 'success';
}

export function showModal(options: ModalOptions): void {
	// 1. Create Overlay
	const overlay = document.createElement('div');
	overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.2s ease;
    `;

	// 2. Create Modal Box
	const modal = document.createElement('div');
	modal.style.cssText = `
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        transform: translateY(20px);
        transition: transform 0.2s ease;
    `;

	// 3. Content
	const titleColor = options.variant === 'danger' ? 'var(--color-danger)' : 'var(--color-accent-gold)';

	modal.innerHTML = `
        <h2 style="margin: 0 0 var(--space-md) 0; color: ${titleColor}; font-size: 1.5rem;">${options.title}</h2>
        <p style="margin: 0 0 var(--space-xl) 0; color: var(--color-text-primary); line-height: 1.5;">${options.message}</p>
    `;

	// 4. Buttons
	const btnContainer = document.createElement('div');
	btnContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: var(--space-md);
    `;

	const cancelBtn = createButton({
		label: options.cancelLabel || 'İptal',
		variant: 'secondary',
		onClick: () => close()
	});

	const confirmBtn = createButton({
		label: options.confirmLabel || 'Onayla',
		variant: options.variant === 'danger' ? 'danger' : 'primary',
		onClick: () => {
			options.onConfirm();
			close();
		}
	});

	// Add buttons (Cancel first)
	btnContainer.appendChild(cancelBtn);
	btnContainer.appendChild(confirmBtn);
	modal.appendChild(btnContainer);
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	// Animation in
	requestAnimationFrame(() => {
		overlay.style.opacity = '1';
		modal.style.transform = 'translateY(0)';
	});

	function close() {
		overlay.style.opacity = '0';
		modal.style.transform = 'translateY(20px)';
		setTimeout(() => {
			if (document.body.contains(overlay)) {
				document.body.removeChild(overlay);
			}
			if (options.onCancel) options.onCancel();
		}, 200);
	}
}
