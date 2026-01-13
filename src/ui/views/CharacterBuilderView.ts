/**
 * D&D Experiential Learning Platform - CharacterBuilderView
 * Manages the character creation walkthrough.
 */

import { useGameStore } from '../../engine/core/store.ts';
import { registry } from '../../engine/core/registry.ts';
import { createProgressBar } from '../components/ProgressBar.ts';
import {
	getStepLabel
} from '../../utils/translations/index.ts';
import { CharacterManager } from '../../engine/character/character-manager.ts';
import { buildCharacter } from '../../entities/character/factory.ts';

// Step Implementations
import { renderGeneralStep } from './builder/steps/GeneralStep.ts';
import { renderSpeciesStep } from './builder/steps/SpeciesStep.ts';
import { renderClassStep } from './builder/steps/ClassStep.ts';
import { renderBackgroundStep } from './builder/steps/BackgroundStep.ts';
import { renderAbilitiesStep } from './builder/steps/AbilitiesStep.ts';
import { renderProficienciesStep } from './builder/steps/ProficienciesStep.ts';
import { renderEquipmentStep } from './builder/steps/EquipmentStep.ts';
import { renderDetailsStep } from './builder/steps/DetailsStep.ts';
import { renderReviewStep } from './builder/steps/ReviewStep.ts';

export class CharacterBuilderView {
	private container: HTMLElement;
	private onNavigate?: (view: string) => void;

	constructor(container: HTMLElement, onNavigate?: (view: string) => void) {
		this.container = container;
		this.onNavigate = onNavigate;
	}

	public render(): void {
		const state = useGameStore.getState();
		let step = state.characterCreation.step || 'general';

		// FORCE RESET if Name is missing but we are deep in the flow
		// This fixes the issue where user starts at "Species" or later without a name
		if (!state.characterCreation.characterName && step !== 'general') {
			// Update state silently to avoid loop if possible, or just render General
			// But we need to update Store so it persists.
			// However, calling update inside render is risky (render loop).
			// Instead, just force local step variable to 'general' for THIS render,
			// and rely on GeneralStep to display.
			step = 'general';
			// We should also sync the store eventually, but for View consistency:
			setTimeout(() => useGameStore.getState().updateCharacterCreation({ step: 'general' }), 0);
		}

		this.container.innerHTML = '';

		const header = document.createElement('div');
		header.className = 'view-header';

		const headerContent = document.createElement('div');
		headerContent.style.display = 'flex';
		headerContent.style.justifyContent = 'space-between';
		headerContent.style.alignItems = 'flex-start';

		const titleSection = document.createElement('div');
		titleSection.innerHTML = `
			<h2>Karakter Oluşturucu</h2>
			<p>D&D dünyasına ilk adımını at. Kendi kahramanını tasarla.</p>
		`;

		headerContent.appendChild(titleSection);

		if (this.onNavigate) {
			const backBtn = document.createElement('button');
			backBtn.innerHTML = '← Karakter Listesi';
			backBtn.className = 'btn btn-secondary';
			backBtn.style.padding = '8px 16px';
			backBtn.onclick = () => this.onNavigate!('list');
			headerContent.appendChild(backBtn);
		}

		header.appendChild(headerContent);
		this.container.appendChild(header);


		// Progress Stepper with Navigation
		const steps = ['general', 'species', 'class', 'background', 'abilities', 'proficiencies', 'equipment', 'details'];
		const currentStepIndex = steps.indexOf(step);

		// Create clickable stepper
		const stepperContainer = document.createElement('div');
		stepperContainer.style.marginBottom = 'var(--space-lg)';

		const stepperNav = document.createElement('div');
		stepperNav.style.display = 'grid';
		stepperNav.style.gridTemplateColumns = `repeat(${steps.length}, 1fr)`;
		stepperNav.style.gap = 'var(--space-xs)';
		stepperNav.style.marginBottom = 'var(--space-sm)';
		stepperNav.style.width = '100%';

		// Determine unlocked steps based on state
		const cState = state.characterCreation;
		const unlockedSteps = [0]; // General always unlocked
		if (cState.characterName) unlockedSteps.push(1); // Species unlocked if name set
		if (cState.selectedSpecies) unlockedSteps.push(2); // Class unlocked
		if (cState.selectedClass) unlockedSteps.push(3); // Background unlocked
		if (cState.selectedBackground) unlockedSteps.push(4); // Abilities unlocked
		if (cState.abilityScores && Object.keys(cState.abilityScores).length > 0) unlockedSteps.push(5); // Proficiencies unlocked
		if (cState.skillChoices && cState.skillChoices.length > 0) unlockedSteps.push(6); // Equipment unlocked
		if (cState.startingGold !== undefined) unlockedSteps.push(7); // Details unlocked
		if (cState.step === 'details' && cState.backstory) unlockedSteps.push(8); // Review unlocked (loose check)


		steps.forEach((s, idx) => {
			const stepBtn = document.createElement('button');
			stepBtn.className = idx === currentStepIndex ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
			stepBtn.style.width = '100%';
			stepBtn.style.whiteSpace = 'nowrap';
			stepBtn.style.overflow = 'hidden';
			stepBtn.style.textOverflow = 'ellipsis';
			stepBtn.style.padding = '6px 4px';

			stepBtn.innerText = `${idx + 1}. ${getStepLabel(s)}`;

			const isUnlocked = idx <= currentStepIndex || unlockedSteps.includes(idx) || idx < unlockedSteps.length;
			stepBtn.disabled = !isUnlocked;

			stepBtn.onclick = () => {
				if (isUnlocked) {
					useGameStore.getState().updateCharacterCreation({ step: s as any });
					this.render();
				}
			};
			stepperNav.appendChild(stepBtn);
		});

		const progress = createProgressBar({
			value: currentStepIndex + 1,
			max: steps.length,
			variant: 'info',
			showValue: false
		});

		stepperContainer.appendChild(stepperNav);
		stepperContainer.appendChild(progress);
		this.container.appendChild(stepperContainer);

		// Active Step Content
		const contentArea = document.createElement('div');
		contentArea.className = 'step-content';

		const onRefresh = () => this.render();

		switch (step) {
			case 'general':
				renderGeneralStep(contentArea, onRefresh);
				break;
			case 'species':
				renderSpeciesStep(contentArea, onRefresh);
				break;
			case 'class':
				renderClassStep(contentArea, onRefresh);
				break;
			case 'background':
				renderBackgroundStep(contentArea, onRefresh);
				break;
			case 'abilities':
				renderAbilitiesStep(contentArea, onRefresh);
				break;
			case 'proficiencies':
				renderProficienciesStep(contentArea, onRefresh);
				break;
			case 'equipment':
				renderEquipmentStep(contentArea, onRefresh);
				break;
			case 'details':
				renderDetailsStep(contentArea, onRefresh);
				break;
			case 'review':
				renderReviewStep(contentArea, onRefresh, () => this.saveCharacter());
				break;
			default:
				contentArea.innerHTML = `<p>${step} aşaması yakında eklenecek...</p>`;
		}

		this.container.appendChild(contentArea);
	}

	private saveCharacter(): void {
		const state = useGameStore.getState();
		const cState = state.characterCreation;

		// Get required data
		const species = registry.getAllSpecies().find(s => s.id === cState.selectedSpecies);
		const characterClass = registry.getAllClasses().find(c => c.id === cState.selectedClass);
		const background = registry.getAllBackgrounds().find(b => b.id === cState.selectedBackground);

		if (!species || !characterClass) {
			state.addNotification('Karakter oluşturulamadı: Tür veya sınıf bulunamadı.', 'error');
			return;
		}

		try {
			// Build full Character object using factory
			const character = buildCharacter(cState, species, characterClass, background, 1);

			// Save using CharacterManager
			CharacterManager.saveCharacter(character);

			// Show success notification
			state.addNotification(`${character.name} başarıyla kaydedildi!`, 'success');

			// Reset creation state
			useGameStore.getState().updateCharacterCreation({
				step: 'species',
				selectedSpecies: undefined,
				selectedSubspecies: undefined,
				selectedClass: undefined,
				selectedSubclass: undefined,
				selectedBackground: undefined,
				abilityScores: undefined,
				abilityAssignments: undefined,
				abilityMethod: undefined,
				startingGold: undefined,
				skillChoices: undefined,
				toolChoices: undefined,
				characterName: undefined,
				playerName: undefined,
				alignment: undefined,
				appearance: undefined,
				backstory: undefined,
				isComplete: false
			});

			// Refresh view or navigate
			if (this.onNavigate) {
				this.onNavigate('list');
			} else {
				this.render();
			}
		} catch (error) {
			console.error('Character save error:', error);
			state.addNotification('Karakter kaydedilemedi. Lütfen tüm alanları doldurun.', 'error');
		}
	}
}
