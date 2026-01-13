/**
 * D&D Experiential Learning Platform - Character Sheet View
 * Comprehensive view of a character's stats, inventory, spells, and features.
 */

import { Character } from '../../types/character.types.ts';
import { createButton } from '../components/Button.ts';
import { createProgressBar } from '../components/ProgressBar.ts';
import {
	translateClassName,
	translateSpeciesName,
	translateAbilityName
} from '../../utils/translations/index.ts';

type SheetTab = 'stats' | 'inventory' | 'features' | 'spells' | 'bio';

export class CharacterSheetView {
	private container: HTMLElement;
	private character: Character;
	private activeTab: SheetTab = 'stats';
	private onBack: () => void;

	constructor(
		container: HTMLElement,
		character: Character,
		onBack: () => void
	) {
		this.container = container;
		this.character = character;
		this.onBack = onBack;
	}

	render(): void {
		this.container.innerHTML = '';
		this.container.style.padding = 'var(--space-md)';
		this.container.style.maxWidth = '1200px';
		this.container.style.margin = '0 auto';

		// 1. Header (Name, Class, Level, Resources)
		this.renderHeader();

		// 2. Navigation Tabs
		this.renderTabs();

		// 3. Tab Content
		const contentContainer = document.createElement('div');
		contentContainer.id = 'sheet-content';
		contentContainer.style.marginTop = 'var(--space-lg)';
		this.container.appendChild(contentContainer);

		this.renderActiveTab(contentContainer);
	}

	private renderHeader(): void {
		const header = document.createElement('div');
		header.className = 'sheet-header';
		header.style.display = 'flex';
		header.style.justifyContent = 'space-between';
		header.style.alignItems = 'flex-start';
		header.style.marginBottom = 'var(--space-lg)';
		header.style.padding = 'var(--space-lg)';
		header.style.background = 'var(--color-surface)';
		header.style.borderRadius = 'var(--radius-lg)';
		header.style.border = '1px solid var(--color-border)';

		// Left: Character Info
		const info = document.createElement('div');
		const className = translateClassName(this.character.progression?.classes?.[0]?.classId || '') || 'Sınıfsız';
		const speciesName = translateSpeciesName(this.character.speciesId) || 'Bilinmeyen Tür';

		info.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
                <h1 style="margin: 0; color: var(--color-accent-gold); font-size: 2rem;">${this.character.name}</h1>
                <span style="background: var(--color-bg-tertiary); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid var(--color-border);">
                    Level ${this.character.progression.totalLevel}
                </span>
            </div>
            <div style="color: var(--color-text-secondary); font-size: 1.1rem;">
                ${speciesName} ${className}
            </div>
        `;

		// Right: Actions & Current Vitality
		const actions = document.createElement('div');
		actions.style.display = 'flex';
		actions.style.flexDirection = 'column';
		actions.style.alignItems = 'flex-end';
		actions.style.gap = 'var(--space-md)';

		// Back Button
		const backBtn = createButton({
			label: '← Listeye Dön',
			variant: 'secondary',
			size: 'sm',
			onClick: () => this.onBack()
		});

		// HP Bar Display (Mini)
		const hpDisplay = document.createElement('div');
		hpDisplay.style.width = '200px';
		hpDisplay.appendChild(createProgressBar({
			value: this.character.health.current,
			max: this.character.health.max,
			label: `${this.character.health.current} / ${this.character.health.max} HP`,
			variant: 'danger',
			showValue: false
		}));

		actions.appendChild(backBtn);
		actions.appendChild(hpDisplay);

		header.appendChild(info);
		header.appendChild(actions);
		this.container.appendChild(header);
	}

	private renderTabs(): void {
		const tabsContainer = document.createElement('div');
		tabsContainer.style.display = 'flex';
		tabsContainer.style.gap = 'var(--space-xs)';
		tabsContainer.style.borderBottom = '1px solid var(--color-border)';

		const tabs: { id: SheetTab; label: string; icon: string }[] = [
			{ id: 'stats', label: 'Genel Bakış', icon: '📊' },
			{ id: 'inventory', label: 'Ekipman', icon: '🎒' },
			{ id: 'features', label: 'Özellikler', icon: '✨' },
			{ id: 'bio', label: 'Notlar', icon: '📝' }
		];

		// Add Spells tab only if character is a spellcaster
		if (this.character.spellcasting) {
			tabs.splice(3, 0, { id: 'spells', label: 'Büyüler', icon: '🔮' });
		}

		tabs.forEach(tab => {
			const btn = document.createElement('button');
			const isActive = this.activeTab === tab.id;

			btn.innerHTML = `${tab.icon} ${tab.label}`;
			btn.className = `sheet-tab ${isActive ? 'active' : ''}`;
			btn.style.padding = '12px 24px';
			btn.style.background = isActive ? 'var(--color-surface)' : 'transparent';
			btn.style.border = '1px solid var(--color-border)';
			btn.style.borderBottom = isActive ? '1px solid var(--color-surface)' : '1px solid var(--color-border)';
			btn.style.borderRadius = 'var(--radius-md) var(--radius-md) 0 0';
			btn.style.color = isActive ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)';
			btn.style.cursor = 'pointer';
			btn.style.marginBottom = '-1px'; // Overlap border
			btn.style.transition = 'all 0.2s';
			btn.style.fontWeight = isActive ? '600' : '400';

			btn.onclick = () => {
				this.activeTab = tab.id;
				this.render();
			};

			tabsContainer.appendChild(btn);
		});

		this.container.appendChild(tabsContainer);
	}

	private renderActiveTab(container: HTMLElement): void {
		switch (this.activeTab) {
			case 'stats':
				this.renderStatsTab(container);
				break;
			case 'inventory':
				container.innerHTML = '<div style="padding: 20px; text-align: center;">Inventory implementation coming soon...</div>';
				break;
			case 'features':
				container.innerHTML = '<div style="padding: 20px; text-align: center;">Features implementation coming soon...</div>';
				break;
			case 'spells':
				container.innerHTML = '<div style="padding: 20px; text-align: center;">Spells implementation coming soon...</div>';
				break;
			case 'bio':
				container.innerHTML = '<div style="padding: 20px; text-align: center;">Bio implementation coming soon...</div>';
				break;
		}
	}

	private renderStatsTab(container: HTMLElement): void {
		container.style.display = 'grid';
		container.style.gridTemplateColumns = '300px 1fr';
		container.style.gap = 'var(--space-lg)';
		container.style.alignItems = 'start';

		// LEFT COLUMN: Ability Scores & Skills
		const leftCol = document.createElement('div');
		leftCol.style.display = 'flex';
		leftCol.style.flexDirection = 'column';
		leftCol.style.gap = 'var(--space-lg)';

		// 1. Ability Scores
		const scoresCard = this.createCard('Yetenek Puanları');
		const scoresGrid = document.createElement('div');
		scoresGrid.style.display = 'grid';
		scoresGrid.style.gap = 'var(--space-sm)';

		Object.entries(this.character.stats.abilities).forEach(([key, val]) => {
			const mod = this.character.stats.modifiers[key as keyof typeof this.character.stats.modifiers];
			const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

			const row = document.createElement('div');
			row.style.display = 'flex';
			row.style.justifyContent = 'space-between';
			row.style.alignItems = 'center';
			row.style.background = 'var(--color-bg-tertiary)';
			row.style.padding = '8px 12px';
			row.style.borderRadius = 'var(--radius-sm)';

			row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 700; color: var(--color-text-primary); width: 40px;">${key}</span>
                    <span style="font-size: 0.9rem; color: var(--color-text-secondary);">(${translateAbilityName(key)})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: 700; font-size: 1.1rem; color: var(--color-accent-gold);">${val}</span>
                    <span style="background: var(--color-bg-primary); padding: 2px 6px; borderRadius: 4px; font-size: 0.9rem; min-width: 30px; text-align: center;">${modStr}</span>
                </div>
            `;
			scoresGrid.appendChild(row);
		});
		scoresCard.appendChild(scoresGrid);
		leftCol.appendChild(scoresCard);

		container.appendChild(leftCol);

		// RIGHT COLUMN: Combat Stats & Details
		const rightCol = document.createElement('div');
		rightCol.style.display = 'flex';
		rightCol.style.flexDirection = 'column';
		rightCol.style.gap = 'var(--space-lg)';

		// 1. Vitality & Combat Stats Grid
		const combatGrid = document.createElement('div');
		combatGrid.style.display = 'grid';
		combatGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
		combatGrid.style.gap = 'var(--space-md)';

		// AC
		combatGrid.appendChild(this.createStatBox('Zırh Sınıfı (AC)', this.character.defense.armorClass.toString(), '🛡️'));
		// Initiative
		const init = this.character.initiativeModifier >= 0 ? `+${this.character.initiativeModifier}` : `${this.character.initiativeModifier}`;
		combatGrid.appendChild(this.createStatBox('İnisiyatif', init, '⚡'));
		// Speed
		combatGrid.appendChild(this.createStatBox('Hız', `${this.character.speed.walk} ft`, '🦶'));

		rightCol.appendChild(combatGrid);

		// 2. Hit Points Detail Card
		const hpCard = this.createCard('Can Durumu');
		hpCard.innerHTML = `
            <div style="display: flex; gap: var(--space-xl); justify-content: space-around; text-align: center;">
                <div>
                    <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 4px;">Mevcut</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${this.character.health.current}</div>
                </div>
                 <div>
                    <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 4px;">Maksimum</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${this.character.health.max}</div>
                </div>
                 <div>
                    <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 4px;">Geçici</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-accent-blue);">${this.character.health.temp}</div>
                </div>
                <div>
                    <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 4px;">Hit Dice</div>
                    <div style="font-size: 1.2rem; font-weight: 600;">${this.character.progression.totalLevel}${this.character.health.hitDice?.[0]?.size || 'd8'}</div>
                </div>
            </div>
        `;
		rightCol.appendChild(hpCard);

		container.appendChild(rightCol);
	}

	private createCard(title: string): HTMLElement {
		const card = document.createElement('div');
		card.style.background = 'var(--color-surface)';
		card.style.border = '1px solid var(--color-border)';
		card.style.borderRadius = 'var(--radius-md)';
		card.style.padding = 'var(--space-md)';

		const header = document.createElement('h3');
		header.innerText = title;
		header.style.margin = '0 0 var(--space-md) 0';
		header.style.fontSize = '1.1rem';
		header.style.color = 'var(--color-text-primary)';
		header.style.borderBottom = '1px solid var(--color-border)';
		header.style.paddingBottom = '8px';

		card.appendChild(header);
		return card;
	}

	private createStatBox(label: string, value: string, icon: string): HTMLElement {
		const box = document.createElement('div');
		box.style.background = 'var(--color-surface)';
		box.style.border = '1px solid var(--color-border)';
		box.style.borderRadius = 'var(--radius-md)';
		box.style.padding = 'var(--space-md)';
		box.style.display = 'flex';
		box.style.flexDirection = 'column';
		box.style.alignItems = 'center';
		box.style.textAlign = 'center';

		box.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 4px;">${icon}</div>
            <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 4px;">${label}</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary);">${value}</div>
        `;
		return box;
	}
}
