/**
 * D&D Experiential Learning Platform - Character Simulator
 * Character creation, management, and simulation
 * 
 * @deprecated This file is being refactored. Use factory.ts and logic.ts instead.
 */

export * from './logic';
export * from './factory';

import {
	createCharacterCreationState as _createState,
	selectSpecies as _selectSpecies,
	selectClass as _selectClass,
	setAbilityMethod as _setAbilityMethod,
	assignAbilityScores as _assignScores,
	selectBackground as _selectBackground,
	setEquipmentChoices as _setEquipment,
	setCharacterDetails as _setDetails,
	validateCreation as _validate
} from './character-creation.ts';

export const createCharacterCreationState = _createState;
export const selectSpecies = _selectSpecies;
export const selectClass = _selectClass;
export const setAbilityMethod = _setAbilityMethod;
export const assignAbilityScores = _assignScores;
export const selectBackground = _selectBackground;
export const setEquipmentChoices = _setEquipment;
export const setCharacterDetails = _setDetails;
export const validateCreation = _validate;
