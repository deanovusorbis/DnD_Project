/**
 * D&D Experiential Learning Platform - TraitsView
 * Displays species and class traits based on character selections.
 */

import { useGameStore } from '../../engine/core/store.ts';
import { registry } from '../../engine/core/registry.ts';
import {
	translateSpeciesName,
	translateSubspeciesName,
	translateClassName,
	translateSubclassName,
	translateTrait
} from '../../utils/translations/index.ts';


export class TraitsView {
	private container: HTMLElement;
	private currentSelection: { speciesId: string | null; subspeciesId: string | null; classId: string | null; level: number; };

	constructor(container: HTMLElement) {
		this.container = container;
		this.container.classList.add('traits-panel'); // Add class for styling

		this.currentSelection = {
			speciesId: null,
			subspeciesId: null,
			classId: null,
			level: 1
		};

		// Subscribe to state changes - use single listener pattern compatible with all Zustand versions
		useGameStore.subscribe((state) => {
			const creationState = state.characterCreation;
			// Simple check to avoid loops if needed, but for now direct update is fine
			this.currentSelection = {
				speciesId: creationState.selectedSpecies ?? null,
				subspeciesId: creationState.selectedSubspecies ?? null,
				classId: creationState.selectedClass ?? null,
				level: creationState.level ?? 1
			};
			this.render();
		});

		// Set initial transition styles
		this.container.style.transition = 'width 0.3s ease, min-width 0.3s ease';
		this.container.style.overflow = 'hidden';

		// Initial render to set up structure
		this.render();
	}

	private isCollapsed = false;

	public render(): void {
		this.container.innerHTML = '';

		// Header with Toggle
		const header = document.createElement('div');
		header.className = 'traits-header';
		header.style.cursor = 'pointer';
		header.style.display = 'flex';
		header.style.justifyContent = 'space-between';
		header.style.alignItems = 'center';
		header.style.padding = 'var(--space-md)';
		header.style.borderBottom = '1px solid var(--color-border)';
		header.style.background = 'var(--color-bg-secondary)';
		header.style.whiteSpace = 'nowrap'; // Prevent wrapping when collapsed

		header.innerHTML = `
            <h3 style="margin:0; font-family: var(--font-display); color: var(--color-accent-gold); display: ${this.isCollapsed ? 'none' : 'block'};">
                🛡️ Özellikler
            </h3>
            <span class="toggle-icon" style="font-size: 1.2rem;">${this.isCollapsed ? '◀' : '▶'}</span>
        `;

		const content = document.createElement('div');
		content.className = 'traits-content';
		content.style.padding = 'var(--space-md)';
		content.style.maxHeight = 'calc(100vh - 200px)';
		content.style.overflowY = 'auto';
		content.style.display = this.isCollapsed ? 'none' : 'block';
		content.style.opacity = this.isCollapsed ? '0' : '1';
		content.style.transition = 'opacity 0.2s ease';

		// Toggle functionality
		header.onclick = () => {
			this.isCollapsed = !this.isCollapsed;

			// Toggle Layout class on #app for grid resizing
			const app = document.getElementById('app');
			if (app) {
				if (this.isCollapsed) app.classList.add('traits-collapsed');
				else app.classList.remove('traits-collapsed');
			}

			if (this.isCollapsed) {
				this.container.style.width = '100%'; // Full width of the small grid cell
				this.container.style.minWidth = '0';
				content.style.display = 'none';
				content.style.opacity = '0';
				(header.querySelector('h3') as HTMLElement).style.display = 'none';
				header.querySelector('.toggle-icon')!.textContent = '◀';
				header.style.justifyContent = 'center'; // Center icon
			} else {
				this.container.style.width = ''; // Reset to default
				this.container.style.minWidth = '300px';
				content.style.display = 'block';
				// Small timeout to allow display block to apply before opacity transition
				setTimeout(() => { content.style.opacity = '1'; }, 10);
				(header.querySelector('h3') as HTMLElement).style.display = 'block';
				header.querySelector('.toggle-icon')!.textContent = '▶';
				header.style.justifyContent = 'space-between';
			}
		};

		this.container.appendChild(header);
		this.container.appendChild(content);

		const { speciesId, subspeciesId, classId, level } = this.currentSelection;

		if (!speciesId && !classId) {
			content.innerHTML = `
				<div style="text-align: center; color: var(--color-text-secondary); padding: 20px;">
					<p>Henüz bir tür veya sınıf seçmediniz.</p>
					<p style="font-size: 0.9em; margin-top: 10px;">Seçimlerinizi yaptıkça, karakterinizin özellikleri burada görünecek.</p>
				</div>
			`;
			return;
		}

		// Species Traits
		if (speciesId) {
			const species = registry.getAllSpecies().find(s => s.id === speciesId);
			if (species) {
				const speciesSection = document.createElement('div');
				speciesSection.style.marginBottom = 'var(--space-lg)';

				// Base traits
				let hasContent = false;
				if (species.traits && species.traits.length > 0) {
					const visibleTraits = species.traits.filter(t => (t.level || 1) <= level);
					visibleTraits.forEach(trait => {
						const traitCard = this.createTraitCard(trait.name, trait.description);
						speciesSection.appendChild(traitCard);
					});
					if (visibleTraits.length > 0) hasContent = true;
				}

				// Subrace traits
				if (subspeciesId && species.subraces) {
					const subrace = species.subraces.find(sr => sr.id === subspeciesId);
					if (subrace && subrace.additionalTraits) {
						const visibleAdditionalTraits = subrace.additionalTraits.filter(t => (t.level || 1) <= level);
						if (visibleAdditionalTraits.length > 0) {
							const subraceTitle = document.createElement('h5');
							subraceTitle.style.color = 'var(--color-accent-gold)';
							subraceTitle.style.fontSize = '0.85rem';
							subraceTitle.style.marginTop = 'var(--space-md)';
							subraceTitle.style.marginBottom = 'var(--space-sm)';
							subraceTitle.innerText = `${translateSubspeciesName(subrace.name || '')} Ek Özellikleri`;
							speciesSection.appendChild(subraceTitle);

							visibleAdditionalTraits.forEach(trait => {
								const traitCard = this.createTraitCard(trait.name, trait.description);
								speciesSection.appendChild(traitCard);
							});
							hasContent = true;
						}
					}
				}

				if (hasContent) {
					// Prepend title only if we have content
					const speciesTitle = document.createElement('h4');
					speciesTitle.style.color = 'var(--color-accent-blue)';
					speciesTitle.style.fontSize = '0.9rem';
					speciesTitle.style.marginBottom = 'var(--space-sm)';
					speciesTitle.innerText = `${translateSpeciesName(species.name)} Özellikleri`;
					speciesSection.prepend(speciesTitle);

					content.appendChild(speciesSection);
				}
			}
		}

		// Class Features
		if (classId) {
			const classData = registry.getAllClasses().find(c => c.id === classId);
			if (classData) {
				const classSection = document.createElement('div');
				classSection.style.marginBottom = 'var(--space-lg)';

				const classTitle = document.createElement('h4');
				classTitle.style.color = 'var(--color-accent-red)';
				classTitle.style.fontSize = '0.9rem';
				classTitle.style.marginBottom = 'var(--space-sm)';
				classTitle.innerText = `${translateClassName(classData.name)} Özellikleri (Seviye ${level})`;
				classSection.appendChild(classTitle);

				// Hit Die
				const hitDieInfo = this.createTraitCard(
					'Can Zarı (Hit Die)',
					`Her seviyede ${classData.hitDie} zar atarak can puanı kazanırsın. Bu, sınıfının ne kadar dayanıklı olduğunu gösterir.`
				);
				classSection.appendChild(hitDieInfo);

				// Primary Ability (if available)
				if (classData.primaryAbility && classData.primaryAbility.length > 0) {
					const abilityInfo = this.createTraitCard(
						'Ana Yetenekler',
						`${classData.primaryAbility.join(', ')} - Bu sınıf için en önemli yetenek skorlarıdır.`
					);
					classSection.appendChild(abilityInfo);
				}

				// Saving Throws
				if (classData.proficiencies?.savingThrows && classData.proficiencies.savingThrows.length > 0) {
					const savesInfo = this.createTraitCard(
						'Kurtarma Atışları',
						`${classData.proficiencies.savingThrows.join(', ')} kurtarma atışlarında uzmansın.`
					);
					classSection.appendChild(savesInfo);
				}

				// Features up to current level
				if (classData.features && classData.features.length > 0) {
					const visibleFeatures = classData.features.filter(f => f.level <= level);

					if (visibleFeatures.length > 0) {
						visibleFeatures.forEach(feature => {
							const card = this.createTraitCard(feature.name, feature.description);
							classSection.appendChild(card);
						});
					}
				}

				// Subclass Features (if selected)
				const { selectedSubclass } = useGameStore.getState().characterCreation;
				if (selectedSubclass && classData.subclasses) {
					const subclass = classData.subclasses.find(s => s.id === selectedSubclass);
					if (subclass && subclass.features) {
						const visibleSubclassFeatures = subclass.features.filter(f => f.level <= level);

						if (visibleSubclassFeatures.length > 0) {
							const subclassTitle = document.createElement('h5');
							subclassTitle.style.color = 'var(--color-accent-gold)';
							subclassTitle.style.fontSize = '0.85rem';
							subclassTitle.style.marginTop = 'var(--space-md)';
							subclassTitle.style.marginBottom = 'var(--space-sm)';
							subclassTitle.innerText = `${translateSubclassName(subclass.name)} Özellikleri`;
							classSection.appendChild(subclassTitle);

							visibleSubclassFeatures.forEach(feature => {
								const card = this.createTraitCard(feature.name, feature.description);
								classSection.appendChild(card);
							});
						}
					}
				}

				content.appendChild(classSection);
			}
		}
	}


	private createTraitCard(name: string, description: string): HTMLElement {
		const { name: translatedName, description: translatedDesc } = translateTrait(name, description);

		const card = document.createElement('div');
		card.style.background = 'rgba(212, 175, 55, 0.05)';
		card.style.border = '1px solid rgba(212, 175, 55, 0.2)';
		card.style.borderRadius = 'var(--radius-sm)';
		card.style.padding = 'var(--space-sm)';
		card.style.marginBottom = 'var(--space-sm)';

		card.innerHTML = `
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-accent-gold); margin-bottom: 4px;">
                ${translatedName}
            </div>
            <div style="font-size: 0.75rem; line-height: 1.4; color: var(--color-text-secondary);">
                ${translatedDesc}
            </div>
        `;

		return card;
	}
}
