/**
 * D&D Experiential Learning Platform - SidebarView
 * Displays character overview and pedagogy progress.
 */

import { useGameStore } from '../../engine/core/store.ts';
import { createProgressBar } from '../components/ProgressBar.ts';
import { createButton } from '../components/Button.ts';
import { translateClassName } from '../../utils/translations/index.ts';

export class SidebarView {
	private container: HTMLElement;
	private onNavigate: (view: string) => void;

	constructor(container: HTMLElement, onNavigate: (view: string) => void) {
		this.container = container;
		this.onNavigate = onNavigate;
	}

	public render(): void {
		const state = useGameStore.getState();
		const character = state.campaign.activeCharacter;

		this.container.innerHTML = '';

		// 1. Character Overview
		const charSection = document.createElement('div');
		charSection.className = 'character-summary';
		charSection.style.marginBottom = '30px';

		if (character) {
			charSection.innerHTML = `
                <h3 class="ability-name">${character.name}</h3>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 10px;">
                    Seviye ${character.progression?.totalLevel || 1} ${translateClassName(character.progression?.classes?.[0]?.classId || '') || 'Sınıfsız'}
                </div>
            `;

			charSection.appendChild(createProgressBar({
				value: character.health.current,
				max: character.health.max,
				label: 'Can Puanı (HP)',
				variant: 'danger',
				showValue: true
			}));
		} else {
			charSection.innerHTML = '<p style="font-style: italic; font-size: 0.8rem;">Karakter henüz oluşturulmadı.</p>';
		}

		this.container.appendChild(charSection);

		// 2. Navigation
		const navSection = document.createElement('div');
		navSection.style.display = 'flex';
		navSection.style.flexDirection = 'column';
		navSection.style.gap = '8px';
		navSection.style.marginBottom = '30px';


		navSection.appendChild(createButton({
			label: 'Karakterlerim',
			icon: '👥',
			onClick: () => this.onNavigate('list'),
			className: 'nav-btn'
		}));

		navSection.appendChild(createButton({
			label: 'Karakter Oluşturucu',
			icon: '🧙‍♂️',
			onClick: () => this.onNavigate('builder'),
			className: 'nav-btn'
		}));

		navSection.appendChild(createButton({
			label: 'Savaş Deneyimi',
			icon: '⚔️',
			onClick: () => this.onNavigate('combat'),
			className: 'nav-btn'
		}));

		this.container.appendChild(navSection);

		// 3. Concept Mastery (Pedagogy)
		const pedagogySection = document.createElement('div');
		pedagogySection.innerHTML = '<h4 class="card-title" style="font-size: 0.9rem; margin-bottom: 15px;">🎓 Kavram Uzmanlığı</h4>';

		// Mock data for now, real data will come from engine/pedagogy
		const concepts = [
			{ name: 'Zar Sistemi', progress: 85, level: 'Usta' },
			{ name: 'Savaş Kuralları', progress: 40, level: 'Çırak' },
			{ name: 'Büyü Kullanımı', progress: 10, level: 'Acemi' }
		];

		concepts.forEach(c => {
			const conceptDiv = document.createElement('div');
			conceptDiv.style.marginBottom = '15px';
			conceptDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                    <span>${c.name}</span>
                    <span style="color: var(--color-accent-gold);">${c.level}</span>
                </div>
            `;
			conceptDiv.appendChild(createProgressBar({
				value: c.progress,
				max: 100,
				variant: 'success'
			}));
			pedagogySection.appendChild(conceptDiv);
		});

		this.container.appendChild(pedagogySection);
	}
}
