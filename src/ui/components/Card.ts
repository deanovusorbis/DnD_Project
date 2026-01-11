/**
 * D&D Experiential Learning Platform - Card Component
 */

export interface CardOptions {
	title?: string;
	content: string | HTMLElement;
	footer?: string | HTMLElement;
	variant?: 'default' | 'accent' | 'success' | 'danger';
	className?: string;
	id?: string;
	headerActions?: HTMLElement[];
}

export function createCard(options: CardOptions): HTMLElement {
	const card = document.createElement('div');
	card.className = `card ${options.variant ? `card-${options.variant}` : ''} ${options.className || ''}`.trim();
	if (options.id) card.id = options.id;

	// Header
	if (options.title || options.headerActions) {
		const header = document.createElement('div');
		header.className = 'card-header';

		if (options.title) {
			const titleEl = document.createElement('h3');
			titleEl.className = 'card-title';
			titleEl.innerText = options.title;
			header.appendChild(titleEl);
		}

		if (options.headerActions) {
			const actions = document.createElement('div');
			actions.className = 'card-actions';
			options.headerActions.forEach(a => actions.appendChild(a));
			header.appendChild(actions);
		}

		card.appendChild(header);
	}

	// Body
	const body = document.createElement('div');
	body.className = 'card-body';
	if (typeof options.content === 'string') {
		body.innerHTML = options.content;
	} else {
		body.appendChild(options.content);
	}
	card.appendChild(body);

	// Footer
	if (options.footer) {
		const footer = document.createElement('div');
		footer.className = 'card-footer';
		if (typeof options.footer === 'string') {
			footer.innerHTML = options.footer;
		} else {
			footer.appendChild(options.footer);
		}
		card.appendChild(footer);
	}

	return card;
}
