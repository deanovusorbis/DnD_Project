/**
 * ModulesView - Learning Modules Selection Screen
 * Displays available species and class learning modules
 */

import { registry } from '../../engine/core/registry.ts';
import { moduleLoader } from '../../data/modules/module-loader.ts';

export class ModulesView {
	private container: HTMLElement;
	private onNavigate?: (view: string, moduleId?: string) => void;

	constructor(container: HTMLElement, onNavigate?: (view: string, moduleId?: string) => void) {
		this.container = container;
		this.onNavigate = onNavigate;
	}

	public render(): void {
		this.container.innerHTML = '';

		// Header
		const header = document.createElement('div');
		header.className = 'view-header';
		header.innerHTML = `
			<h2>🎓 Eğitim Modülleri</h2>
			<p>D&D dünyasını keşfet ve öğren. Her modül, interaktif senaryolar ile öğrenme deneyimi sunar.</p>
		`;
		this.container.appendChild(header);

		// Category Tabs
		const tabsContainer = document.createElement('div');
		tabsContainer.className = 'module-tabs';
		tabsContainer.style.cssText = `
			display: flex;
			gap: 1rem;
			margin: 2rem 0;
			border-bottom: 2px solid var(--color-border);
		`;

		const basicsTab = this.createTab('Temel Kavramlar', 'basics', true);
		const speciesTab = this.createTab('Tür Modülleri', 'species', false);
		const classTab = this.createTab('Sınıf Modülleri', 'class', false);

		tabsContainer.appendChild(basicsTab);
		tabsContainer.appendChild(speciesTab);
		tabsContainer.appendChild(classTab);
		this.container.appendChild(tabsContainer);

		// Content Area
		const contentArea = document.createElement('div');
		contentArea.className = 'module-content';
		contentArea.id = 'module-content';
		this.container.appendChild(contentArea);

		// Initial render: Basics modules
		this.renderBasicModules(contentArea);

		// Tab click handlers
		basicsTab.addEventListener('click', () => {
			this.setActiveTab(basicsTab, [speciesTab, classTab]);
			this.renderBasicModules(contentArea);
		});

		speciesTab.addEventListener('click', () => {
			this.setActiveTab(speciesTab, [basicsTab, classTab]);
			this.renderSpeciesModules(contentArea);
		});

		classTab.addEventListener('click', () => {
			this.setActiveTab(classTab, [basicsTab, speciesTab]);
			this.renderClassModules(contentArea);
		});
	}

	private createTab(label: string, category: string, active: boolean): HTMLElement {
		const tab = document.createElement('button');
		tab.className = `module-tab ${active ? 'active' : ''}`;
		tab.setAttribute('data-category', category);
		tab.textContent = label;
		tab.style.cssText = `
			padding: 1rem 2rem;
			background: transparent;
			border: none;
			border-bottom: 3px solid ${active ? 'var(--color-accent-gold)' : 'transparent'};
			color: ${active ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)'};
			font-size: 1.1rem;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.3s;
		`;
		return tab;
	}

	private setActiveTab(activeTab: HTMLElement, inactiveTabs: HTMLElement[]): void {
		activeTab.style.borderBottom = '3px solid var(--color-accent-gold)';
		activeTab.style.color = 'var(--color-accent-gold)';
		inactiveTabs.forEach(tab => {
			tab.style.borderBottom = '3px solid transparent';
			tab.style.color = 'var(--color-text-secondary)';
		});
	}

	private renderBasicModules(container: HTMLElement): void {
		container.innerHTML = '';

		const grid = document.createElement('div');
		grid.className = 'module-grid';
		grid.style.cssText = `
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 2rem;
			padding: 0 2rem; /* Added padding as requested by user */
			margin-top: 2rem;
		`;

		// Get basics modules
		const basicModules = moduleLoader.getModulesByCategory('basics');

		basicModules.forEach(module => {
			const card = this.createModuleCard(module);
			grid.appendChild(card);
		});

		if (basicModules.length === 0) {
			const emptyState = document.createElement('div');
			emptyState.style.cssText = `text-align: center; color: var(--color-text-secondary); padding: 2rem;`;
			emptyState.textContent = 'Henüz temel modül bulunmamaktadır.';
			grid.appendChild(emptyState);
		}

		container.appendChild(grid);
	}

	private renderSpeciesModules(container: HTMLElement): void {
		container.innerHTML = '';

		const grid = document.createElement('div');
		grid.className = 'module-grid';
		grid.style.cssText = `
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 2rem;
			padding: 0 2rem; /* Added padding as requested by user */
			margin-top: 2rem;
		`;

		// Get all species from registry
		const allSpecies = registry.getAllSpecies();

		allSpecies.forEach(species => {
			const card = this.createModuleCard({
				id: species.id,
				name: species.name,
				description: species.description,
				icon: this.getSpeciesIcon(species.id),
				difficulty: species.teachingNotes?.complexity || 'intermediate',
				category: 'species'
			});
			grid.appendChild(card);
		});

		container.appendChild(grid);
	}

	private renderClassModules(container: HTMLElement): void {
		container.innerHTML = '';

		const comingSoon = document.createElement('div');
		comingSoon.style.cssText = `
			text-align: center;
			padding: 4rem 2rem;
			color: var(--color-text-secondary);
		`;
		comingSoon.innerHTML = `
			<h3 style="font-size: 2rem; margin-bottom: 1rem;">🔨 Yakında</h3>
			<p>Sınıf modülleri şu anda geliştirilme aşamasında.</p>
		`;
		container.appendChild(comingSoon);
	}

	private createModuleCard(module: {
		id: string;
		name: string;
		description: string;
		icon: string;
		difficulty: string;
		category: string;
	}): HTMLElement {
		const card = document.createElement('div');
		card.className = 'module-card';
		card.style.cssText = `
			background: rgba(20, 20, 25, 0.7);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-lg);
			padding: 1.5rem;
			cursor: pointer;
			transition: all 0.3s;
			backdrop-filter: blur(10px);
		`;

		const difficultyColor =
			module.difficulty === 'beginner' ? '#4ade80' :
				module.difficulty === 'intermediate' ? '#fbbf24' :
					'#f87171';

		card.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
				<div style="font-size: 3rem;">${module.icon}</div>
				<span style="
					padding: 0.35rem 0.85rem;
					background: ${difficultyColor}22;
					color: ${difficultyColor};
					border-radius: var(--radius-sm);
					font-size: 0.85rem;
					font-weight: 700;
					letter-spacing: 0.5px;
					line-height: 1;
					text-transform: uppercase;
				">${this.getDifficultyLabel(module.difficulty)}</span>
			</div>
			<h3 style="margin: 0 0 0.5rem 0; color: var(--color-text-heading);">${module.name}</h3>
			<p style="
				margin: 0;
				font-size: 0.9rem;
				color: var(--color-text-muted);
				line-height: 1.5;
				display: -webkit-box;
				-webkit-line-clamp: 4;
				-webkit-box-orient: vertical;
				overflow: hidden;
				text-overflow: ellipsis;
				height: 6em; /* Fixed height for alignment */
			">
				${module.description}
			</p>
			<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
				<span style="font-size: 0.85rem; color: var(--color-text-secondary);">
					⏱️ ~15-20 dakika
				</span>
			</div>
		`;

		// Hover effects
		card.addEventListener('mouseenter', () => {
			card.style.transform = 'translateY(-5px)';
			card.style.borderColor = 'var(--color-accent-gold)';
			card.style.boxShadow = '0 10px 30px rgba(197, 160, 89, 0.2)';
		});

		card.addEventListener('mouseleave', () => {
			card.style.transform = 'translateY(0)';
			card.style.borderColor = 'var(--color-border)';
			card.style.boxShadow = 'none';
		});

		// Click handler
		card.addEventListener('click', () => {
			// Try to find the corresponding module
			const moduleId = `${module.id}-basics`;
			const learningModule = moduleLoader.getModule(moduleId);

			if (learningModule && this.onNavigate) {
				this.onNavigate('module-play', moduleId);
			} else {
				// Module not yet implemented
				alert(`${module.name} modülü henüz hazır değil. Yakında eklenecek!`);
			}
		});

		return card;
	}

	private getSpeciesIcon(speciesId: string): string {
		const iconMap: Record<string, string> = {
			'human': '👤',
			'elf': '🧝',
			'dwarf': '⛏️',
			'halfling': '🌾',
			'dragonborn': '🐉',
			'gnome': '🎩',
			'tiefling': '😈',
			'aasimar': '👼',
			'goliath': '🏔️',
			'orc': '💪'
		};
		return iconMap[speciesId] || '❓';
	}

	private getDifficultyLabel(difficulty: string): string {
		const labelMap: Record<string, string> = {
			'beginner': 'Başlangıç',
			'intermediate': 'Orta',
			'advanced': 'İleri'
		};
		return labelMap[difficulty] || 'Orta';
	}
}
