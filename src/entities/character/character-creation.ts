/**
 * D&D Experiential Learning Platform - Character Creation Logic
 * Manages the state machine for the character builder wizard.
 */

import { AbilityName } from '../../types/core.types';
import { CharacterCreationState } from '../../types/character.types';
import {
	validatePointBuy
} from '../../engine/core/dice';

/**
 * Create initial character creation state
 */
export function createCharacterCreationState(): CharacterCreationState {
	return {
		step: 'species',
		errors: [],
		isComplete: false
	};
}

/**
 * Select species for character
 */
export function selectSpecies(
	state: CharacterCreationState,
	speciesId: string,
	subspeciesId?: string
): CharacterCreationState {
	return {
		...state,
		selectedSpecies: speciesId,
		selectedSubspecies: subspeciesId,
		step: 'class',
		errors: state.errors.filter(e => e.step !== 'species')
	};
}

/**
 * Select class for character
 */
export function selectClass(
	state: CharacterCreationState,
	classId: string
): CharacterCreationState {
	return {
		...state,
		selectedClass: classId,
		step: 'abilities',
		errors: state.errors.filter(e => e.step !== 'class')
	};
}

/**
 * Set ability score generation method
 */
export function setAbilityMethod(
	state: CharacterCreationState,
	method: 'standard_array' | 'point_buy' | 'roll'
): CharacterCreationState {
	return {
		...state,
		abilityMethod: method,
		abilityScores: method === 'point_buy'
			? { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }
			: undefined,
		abilityAssignments: undefined
	};
}

/**
 * Assign ability scores to abilities
 */
export function assignAbilityScores(
	state: CharacterCreationState,
	assignments: Record<AbilityName, number>
): CharacterCreationState {
	// Validate point buy if applicable
	if (state.abilityMethod === 'point_buy') {
		const scores = Object.values(assignments);
		const validation = validatePointBuy(scores);

		if (!validation.valid) {
			return {
				...state,
				errors: [
					...state.errors.filter(e => e.step !== 'abilities'),
					{ step: 'abilities', message: `Point buy limiti aşıldı: ${validation.cost}/27 puan kullanıldı` }
				]
			};
		}
	}

	return {
		...state,
		abilityAssignments: assignments,
		step: 'background',
		errors: state.errors.filter(e => e.step !== 'abilities')
	};
}

/**
 * Select background
 */
export function selectBackground(
	state: CharacterCreationState,
	backgroundId: string
): CharacterCreationState {
	return {
		...state,
		selectedBackground: backgroundId,
		step: 'equipment',
		errors: state.errors.filter(e => e.step !== 'background')
	};
}

/**
 * Set equipment choices
 */
export function setEquipmentChoices(
	state: CharacterCreationState,
	choices: Record<string, number>
): CharacterCreationState {
	return {
		...state,
		equipmentChoices: choices,
		step: 'details',
		errors: state.errors.filter(e => e.step !== 'equipment')
	};
}

/**
 * Set character details
 */
export function setCharacterDetails(
	state: CharacterCreationState,
	name: string,
	playerName?: string
): CharacterCreationState {
	return {
		...state,
		characterName: name,
		playerName,
		step: 'review',
		errors: state.errors.filter(e => e.step !== 'details')
	};
}

/**
 * Validate character creation state
 */
export function validateCreation(state: CharacterCreationState): {
	valid: boolean;
	errors: { step: string; message: string }[];
} {
	const errors: { step: string; message: string }[] = [];

	if (!state.selectedSpecies) {
		errors.push({ step: 'species', message: 'Species seçilmedi' });
	}
	if (!state.selectedClass) {
		errors.push({ step: 'class', message: 'Class seçilmedi' });
	}
	if (!state.abilityAssignments) {
		errors.push({ step: 'abilities', message: 'Ability scores atanmadı' });
	}
	if (!state.selectedBackground) {
		errors.push({ step: 'background', message: 'Background seçilmedi' });
	}
	if (!state.characterName) {
		errors.push({ step: 'details', message: 'Karakter adı girilmedi' });
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
