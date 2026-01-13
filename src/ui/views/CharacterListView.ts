/**
 * Character List View - Display and manage saved characters
 */

import { CharacterManager, SavedCharacterMeta } from '../../engine/character/character-manager.ts';
import { createButton } from '../components/Button.ts';
import { translateClassName, translateSpeciesName } from '../../utils/translations/index.ts';
import { showModal } from '../components/Modal.ts';

export class CharacterListView {
	private container: HTMLElement;
	private onSelectCharacter: (id: string) => void;
	private onCreateNew: () => void;

	constructor(
		container: HTMLElement,
		onSelectCharacter: (id: string) => void,
		onCreateNew: () => void
	) {
		this.container = container;
		this.onSelectCharacter = onSelectCharacter;
		this.onCreateNew = onCreateNew;
	}

	render(): void {
		const characters = CharacterManager.listCharacters();

		this.container.innerHTML = `
			<div style="max-width: 900px; margin: 0 auto; padding: var(--space-xl);">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl);">
					<h1 style="color: var(--color-accent-gold); margin: 0;">🎭 Karakterlerim</h1>
				</div>
				<div id="character-list-container"></div>
				<div id="character-actions" style="margin-top: var(--space-xl); text-align: center;"></div>
			</div>
		`;

		const listContainer = this.container.querySelector('#character-list-container') as HTMLElement;
		const actionsContainer = this.container.querySelector('#character-actions') as HTMLElement;

		// Render character cards
		if (characters.length === 0) {
			listContainer.innerHTML = `
				<div style="text-align: center; padding: var(--space-xl); color: var(--color-text-dim);">
					<p style="font-size: 1.2rem; margin-bottom: var(--space-md);">Henüz kaydedilmiş karakter yok.</p>
					<p>Yeni bir maceraya başlamak için karakter oluşturun!</p>
				</div>
			`;
		} else {
			const grid = document.createElement('div');
			grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);';

			characters.forEach(char => {
				grid.appendChild(this.renderCharacterCard(char));
			});

			listContainer.appendChild(grid);
		}

		// Create new character button
		const newBtn = createButton({
			label: '➕ Yeni Karakter Oluştur',
			variant: 'primary',
			size: 'lg',
			onClick: () => this.onCreateNew()
		});
		actionsContainer.appendChild(newBtn);
	}

	private handleDelete(id: string): void {
		showModal({
			title: 'Karakteri Sil',
			message: 'Bu karakteri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
			confirmLabel: 'Evet, Sil',
			cancelLabel: 'İptal',
			variant: 'danger',
			onConfirm: () => {
				console.log(`Deleting character ${id}...`);
				const success = CharacterManager.deleteCharacter(id);

				if (success) {
					console.log('Character deleted successfully.');
					this.render(); // Re-render the list
				} else {
					console.error(`Failed to delete character ${id}. Character may not exist.`);
					showModal({
						title: 'Hata',
						message: 'Karakter silinemedi. Lütfen sayfayı yenileyip tekrar deneyin.',
						confirmLabel: 'Tamam',
						onConfirm: () => { }
					});
				}
			}
		});
	}

	private renderCharacterCard(char: SavedCharacterMeta): HTMLElement {
		const className = translateClassName(char.class) || char.class;
		const speciesName = translateSpeciesName(char.species) || char.species;
		const lastModified = new Date(char.lastModified).toLocaleDateString('tr-TR');

		const card = document.createElement('div');
		card.className = 'char-card';
		card.style.cssText = `
			background: var(--color-bg-secondary);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			padding: var(--space-md);
			cursor: pointer;
			transition: all 0.2s;
			position: relative;
		`;

		// Hover effects
		card.onmouseenter = () => card.style.borderColor = 'var(--color-accent-gold)';
		card.onmouseleave = () => card.style.borderColor = 'var(--color-border)';

		// Card Content
		const content = document.createElement('div');
		content.innerHTML = `
			<h3 style="margin: 0 0 8px 0; color: var(--color-accent-gold);">${char.name}</h3>
			<p style="margin: 0; color: var(--color-text-secondary); font-size: 0.9rem;">
				${speciesName} ${className}
			</p>
			<div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 0.85rem; color: var(--color-text-dim);">
				<span>Seviye ${char.level}</span>
				<span>${lastModified}</span>
			</div>
		`;
		card.appendChild(content);

		// Delete Button
		const deleteBtn = document.createElement('button');
		deleteBtn.innerHTML = '✕';
		deleteBtn.className = 'delete-btn';
		deleteBtn.title = 'Karakteri Sil';
		deleteBtn.style.cssText = `
			position: absolute;
			top: 8px;
			right: 8px;
			background: var(--color-danger);
			border: none;
			color: white;
			width: 24px;
			height: 24px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.8rem;
			z-index: 100;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		// Direct event binding - no delegation needed
		deleteBtn.onclick = (e) => {
			e.stopPropagation(); // Prevent card click
			this.handleDelete(char.id);
		};

		// Card click (Selection)
		card.onclick = () => {
			this.onSelectCharacter(char.id);
		};

		card.appendChild(deleteBtn);
		return card;
	}
}
