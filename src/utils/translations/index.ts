/**
 * D&D Experiential Learning Platform - Translations Index
 * Central export point for all translation modules
 */

// Character translations
export {
	speciesNames,
	subspeciesNames,
	classNames,
	subclassNames,
	abilityNames,
	skillNames,
	skillDescriptions,
	translateSpeciesName,
	translateSubspeciesName,
	translateClassName,
	translateSubclassName,
	translateAbilityName,
	translateSkillName
} from './character';

// Feature translations
export {
	subclassFeatureNames,
	translateSubclassFeatureName
} from './features';

// Equipment translations
export {
	sizeNames,
	equipmentChoiceLabels,
	translateSize,
	translateEquipmentChoiceId
} from './equipment';

// UI translations
export {
	stepLabels,
	getStepLabel
} from './ui';

// Trait translations
export {
	traitTranslations,
	translateTrait
} from './traits';

// Description translations
export {
	descriptionTranslations,
	translateDescription
} from './descriptions';

// Tool translations
export {
	musicalInstruments,
	artisansTools,
	otherTools,
	allTools,
	translateToolName,
	getToolDescription
} from './tools';

