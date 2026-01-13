/**
 * D&D Experiential Learning Platform - CharacterBuilderView
 * Manages the character creation walkthrough.
 */

import { useGameStore } from '../../engine/core/store.ts';
import { createProgressBar } from '../components/ProgressBar.ts';
import {
	getStepLabel
} from '../../utils/translations/index.ts';

// Step Implementations
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

	constructor(container: HTMLElement) {
		this.container = container;
	}

	public render(): void {
		const state = useGameStore.getState();
		const step = state.characterCreation.step || 'species';

		this.container.innerHTML = '';

		const header = document.createElement('div');
		header.className = 'view-header';
		header.innerHTML = `
            <h2>Karakter Oluşturucu</h2>
            <p>D&D dünyasına ilk adımını at. Kendi kahramanını tasarla.</p>
        `;
		this.container.appendChild(header);

		// Progress Stepper with Navigation
		const steps = ['species', 'class', 'background', 'abilities', 'proficiencies', 'equipment', 'details'];
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
		const unlockedSteps = [0]; // Species always unlocked
		if (cState.selectedSpecies) unlockedSteps.push(1); // Class unlocked
		if (cState.selectedClass) unlockedSteps.push(2); // Background unlocked
		if (cState.selectedBackground) unlockedSteps.push(3); // Abilities unlocked
		if (cState.abilityScores && Object.keys(cState.abilityScores).length > 0) unlockedSteps.push(4); // Proficiencies unlocked
		if (cState.skillChoices && cState.skillChoices.length > 0) unlockedSteps.push(5); // Equipment unlocked
		if (cState.startingGold !== undefined) unlockedSteps.push(6); // Details unlocked

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

		// Build character object
		const character = {
			id: `char-${Date.now()}`,
			name: cState.characterName || 'Adsız Kahraman',
			playerName: cState.playerName,
			speciesId: cState.selectedSpecies,
			subspeciesId: cState.selectedSubspecies,
			classId: cState.selectedClass,
			subclassId: cState.selectedSubclass,
			backgroundId: cState.selectedBackground,
			abilityScores: cState.abilityScores,
			alignment: cState.alignment,
			appearance: cState.appearance,
			backstory: cState.backstory,
			createdAt: new Date().toISOString()
		};

		// Save to localStorage
		const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '[]');
		savedCharacters.push(character);
		localStorage.setItem('dnd-characters', JSON.stringify(savedCharacters));

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
			characterName: undefined,
			playerName: undefined,
			alignment: undefined,
			appearance: undefined,
			backstory: undefined,
			isComplete: false
		});

		// Go back to character list or home (for now just refresh)
		this.render();
	}
}
