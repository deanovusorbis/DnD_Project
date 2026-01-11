/**
 * D&D Experiential Learning Platform - Class Types
 * SRD 5.2.1 Compatible
 */

import {
	AbilityName, SkillName, DieType, SpellSchool,
	ArmorType, WeaponCategory, Identifiable, Describable,
	DiceExpression
} from './core.types';

// ============================================================================
// CLASS DEFINITIONS
// ============================================================================

/**
 * Ability score priority for class-based optimization
 * Primary: receives highest scores, Secondary: middle scores, Dump: lowest scores
 */
export interface AbilityPriority {
	primary: AbilityName[];
	secondary: AbilityName[];
	dump: AbilityName[];
}

export interface ClassProficiencies {
	armor: ArmorType[];
	weapons: (WeaponCategory | string)[];
	tools: string[];
	savingThrows: AbilityName[];
	skills: {
		choices: SkillName[];
		count: number;
	};
}

export interface SpellcastingProgression {
	hasSpellcasting: boolean;
	spellcastingAbility?: AbilityName;
	spellcastingType?: 'full' | 'half' | 'third' | 'pact';
	cantripsKnown?: number[];    // indexed by level-1
	spellsKnown?: number[];      // indexed by level-1, null if prepared caster
	spellSlots?: number[][];     // [level-1][spell level-1]
	ritualCasting?: boolean;
	spellcastingFocus?: string[];
}

export interface ClassFeature extends Identifiable, Describable {
	level: number;

	// Feature type
	featureType: 'passive' | 'active' | 'resource' | 'choice' | 'improvement';

	// For choice features (like Fighting Style)
	choices?: {
		id: string;
		name: string;
		description: string;
		effect: string;
	}[];

	// Resource-based features
	resource?: {
		name: string;
		maxCount: number | 'proficiency' | 'ability_mod';
		abilityModifier?: AbilityName;
		recoversOn: 'short' | 'long';
	};

	// Mechanical effects
	grantsAction?: {
		name: string;
		actionType: 'action' | 'bonus_action' | 'reaction';
		effect: string;
	};

	modifiesAbilityCheck?: {
		skill?: SkillName;
		ability?: AbilityName;
		bonus: number | 'proficiency' | 'expertise';
	};

	// Replaces or improves previous feature
	replacesFeature?: string;
	improvesFeature?: string;

	// Prerequisites
	prerequisite?: {
		level?: number;
		feature?: string;
		subclass?: boolean;
	};

	// Teaching metadata
	teachingNotes?: {
		conceptsTaught: string[];
		practiceScenario?: string;
	};
}

export interface Subclass extends Identifiable, Describable {
	parentClassId: string;
	subclassFeatureLevel: number; // When subclass is chosen

	features: ClassFeature[];

	// Additional spellcasting (like Eldritch Knight)
	additionalSpellcasting?: {
		spellList: string; // e.g., 'wizard', 'cleric'
		spellcastingAbility: AbilityName;
		progression: 'third' | 'half' | 'full';
		restrictedSchools?: SpellSchool[];
	};

	// Teaching metadata
	teachingNotes?: {
		playstyle: string;
		complexity: 'beginner' | 'intermediate' | 'advanced';
		synergies: string[];
	};
}

export interface StartingEquipmentChoice {
	id: string;
	options: {
		description: string;
		items: { itemId: string; quantity: number }[];
	}[];
}

export interface Class extends Identifiable, Describable {
	// Core attributes
	hitDie: DieType;
	primaryAbility: AbilityName[];

	// Ability score priority for optimization
	abilityPriority?: AbilityPriority;

	// Proficiencies
	proficiencies: ClassProficiencies;

	// Starting equipment
	startingEquipment: {
		guaranteed: { itemId: string; quantity: number }[];
		choices: StartingEquipmentChoice[];
	};

	// Starting wealth alternative
	startingWealth?: DiceExpression;

	// Spellcasting
	spellcasting: SpellcastingProgression;

	// Class features by level
	features: ClassFeature[];

	// Subclasses
	subclasses: Subclass[];
	subclassName: string; // e.g., "Martial Archetype", "Divine Domain"
	subclassLevel: number;

	// Multiclassing requirements
	multiclassRequirements?: {
		ability: AbilityName;
		minimum: number;
	}[];
	multiclassProficiencies?: Partial<ClassProficiencies>;

	// ASI/Feat levels
	asiLevels: number[];

	// Teaching metadata
	teachingNotes?: {
		complexity: 'beginner' | 'intermediate' | 'advanced';
		recommendedForNewPlayers: boolean;
		playstyleKeywords: string[];
		roleInParty: string[];
		keyDecisionPoints: { level: number; decision: string }[];
	};
}

// ============================================================================
// LEVEL PROGRESSION
// ============================================================================

export interface LevelProgression {
	level: number;
	proficiencyBonus: number;
	experienceRequired: number;
	features: string[]; // Feature IDs unlocked at this level
}

export const PROFICIENCY_BY_LEVEL: number[] = [
	2, 2, 2, 2,     // 1-4
	3, 3, 3, 3,     // 5-8
	4, 4, 4, 4,     // 9-12
	5, 5, 5, 5,     // 13-16
	6, 6, 6, 6      // 17-20
];

export const XP_BY_LEVEL: number[] = [
	0, 300, 900, 2700, 6500,           // 1-5
	14000, 23000, 34000, 48000, 64000, // 6-10
	85000, 100000, 120000, 140000, 165000, // 11-15
	195000, 225000, 265000, 305000, 355000  // 16-20
];

// ============================================================================
// CLASS DATABASE
// ============================================================================

export interface ClassDatabase {
	version: string;
	classes: Class[];
	lastUpdated: string;
}
