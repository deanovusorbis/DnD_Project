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
		tabsContainer.className = 'module-tabs-container';
		// Removed inline styles, using CSS class

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
		// Removed inline styles, using CSS class
		return tab;
	}

	private setActiveTab(activeTab: HTMLElement, inactiveTabs: HTMLElement[]): void {
		activeTab.classList.add('active');
		// Removed inline style overrides
		inactiveTabs.forEach(tab => {
			tab.classList.remove('active');
			// Removed inline style overrides
		});
	}

	private renderBasicModules(container: HTMLElement): void {
		container.innerHTML = '';

		const title = document.createElement('h3');
		title.className = 'module-section-title';
		title.textContent = 'Temel Kavramlar';
		title.style.color = 'var(--color-accent-gold)';
		title.style.marginBottom = '1.5rem';
		container.appendChild(title);

		const grid = document.createElement('div');
		grid.className = 'module-grid-responsive';

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

		const title = document.createElement('h3');
		title.className = 'module-section-title';
		title.textContent = 'Tür Modülleri';
		title.style.color = 'var(--color-accent-gold)';
		title.style.marginBottom = '1.5rem';
		container.appendChild(title);

		const grid = document.createElement('div');
		grid.className = 'module-grid-responsive';

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

		const title = document.createElement('h3');
		title.className = 'module-section-title';
		title.textContent = 'Sınıf Modülleri';
		title.style.color = 'var(--color-accent-gold)';
		title.style.marginBottom = '1.5rem';
		container.appendChild(title);

		const grid = document.createElement('div');
		grid.className = 'module-grid-responsive';

		// Get all classes from registry
		const allClasses = registry.getAllClasses();

		allClasses.forEach(cls => {
			const card = this.createModuleCard({
				id: cls.id,
				name: cls.name,
				description: cls.description,
				icon: '', // Removed emoji
				difficulty: cls.teachingNotes?.complexity || 'intermediate',
				category: 'class'
			});
			grid.appendChild(card);
		});

		container.appendChild(grid);
	}

	private createModuleCard(module: {
		id: string;
		name: string;
		description: string;
		icon: string;
		difficulty: string;
		category: string;
		scenario?: { estimatedTime?: number };
	}): HTMLElement {
		// Check completion status
		const completedKey = 'dnd_completed_modules';
		const completedList = JSON.parse(localStorage.getItem(completedKey) || '[]');
		// Check both raw ID and potential '-basics' variant
		const isCompleted = completedList.includes(module.id) || completedList.includes(`${module.id}-basics`);

		// Determine duration
		const duration = module.scenario?.estimatedTime
			? `${module.scenario.estimatedTime}`
			: '5-10';

		const card = document.createElement('div');
		card.className = 'module-card';

		// Keeping dynamic background check inline or utilizing class 'completed'
		card.style.background = isCompleted ? 'rgba(30, 40, 30, 0.8)' : 'rgba(20, 20, 25, 0.7)';
		card.style.border = `1px solid ${isCompleted ? '#4ade80' : 'var(--color-border)'}`;
		// All other static styles moved to CSS

		const difficultyColor =
			module.difficulty === 'beginner' ? '#4ade80' :
				module.difficulty === 'intermediate' ? '#fbbf24' :
					'#f87171';

		let badgeHTML = document.createElement('span');
		badgeHTML.innerHTML = `
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
		`;

		if (isCompleted) {
			badgeHTML.innerHTML = `
				<span style="
					padding: 0.35rem 0.85rem;
					background: rgba(74, 222, 128, 0.2);
					color: #4ade80;
					border: 1px solid #4ade80;
					border-radius: var(--radius-sm);
					font-size: 0.85rem;
					font-weight: 700;
					letter-spacing: 0.5px;
					line-height: 1;
					text-transform: uppercase;
					display: flex;
					align-items: center;
					gap: 0.5rem;
				">✓ TAMAMLANDI</span>
			`;
		}

		card.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
				${badgeHTML.innerHTML}
			</div>
			<h3 style="margin: 0 0 0.5rem 0; color: ${isCompleted ? '#4ade80' : 'var(--color-text-heading)'};">${module.name}</h3>
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
				height: 6em;
			">
				${module.description}
			</p>
			<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
				<span style="font-size: 0.85rem; color: var(--color-text-secondary);">
					⏱️ ~${duration} dakika ${isCompleted ? '(Tamamlandı)' : ''}
				</span>
			</div>
		`;

		// Add subtle glow for completed items
		if (isCompleted) {
			const glow = document.createElement('div');
			glow.style.cssText = `
				position: absolute;
				top: 0; left: 0; width: 100%; height: 100%;
				background: radial-gradient(circle at top right, rgba(74, 222, 128, 0.1), transparent 60%);
				pointer-events: none;
			`;
			card.appendChild(glow);
		}

		// Hover effects
		card.addEventListener('mouseenter', () => {
			card.style.transform = 'translateY(-5px)';
			card.style.borderColor = 'var(--color-accent-gold)';
			card.style.boxShadow = '0 10px 30px rgba(197, 160, 89, 0.2)';
		});

		card.addEventListener('mouseleave', () => {
			card.style.transform = 'translateY(0)';
			card.style.borderColor = isCompleted ? '#4ade80' : 'var(--color-border)';
			card.style.boxShadow = 'none';
		});

		// Click handler
		card.addEventListener('click', () => {
			let moduleId = module.id;

			// For species modules, we append '-basics' to find the learning module
			// For basic concept modules, the ID is already correct (e.g. 'game-intro')
			if (module.category !== 'basics') {
				moduleId = `${module.id}-basics`;
			}

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
