/**
 * D&D Experiential Learning Platform - Character Types
 * SRD 5.2.1 Compatible
 */

import {
	AbilityScores, AbilityModifiers, AbilityName, SkillName,
	DamageType, ConditionType
} from './core.types';
import { CharacterInventory } from './inventory.types';
// Imports removed as they were unused

// ============================================================================
// CHARACTER STATE
// ============================================================================

export interface CharacterAbilities {
	scores: AbilityScores;
	modifiers: AbilityModifiers;
	savingThrows: {
		proficient: AbilityName[];
		bonuses: Partial<Record<AbilityName, number>>;
	};
}

export interface CharacterSkills {
	proficiencies: SkillName[];
	expertise: SkillName[];
	bonuses: Partial<Record<SkillName, number>>;
}

export interface CharacterHitPoints {
	maximum: number;
	current: number;
	temporary: number;
	hitDice: {
		total: number;
		remaining: number;
		dieType: string;
	}[];
}

export interface DeathSaves {
	successes: number;
	failures: number;
	stable: boolean;
}

export interface CharacterDefenses {
	armorClass: number;
	acCalculation: {
		base: number;
		armor?: number;
		shield?: number;
		dexBonus: number;
		otherBonuses: { source: string; value: number }[];
	};
	resistances: DamageType[];
	immunities: (DamageType | ConditionType)[];
	vulnerabilities: DamageType[];
}

export interface CharacterSpeed {
	walk: number;
	swim?: number;
	fly?: number;
	climb?: number;
	burrow?: number;
}

// ============================================================================
// INVENTORY
// ============================================================================

// Inventory types are now defined in inventory.types.ts
// Import CharacterInventory from there when needed

// ============================================================================
// SPELLCASTING
// ============================================================================

export interface SpellSlot {
	level: number;
	total: number;
	expended: number;
}

export interface PreparedSpell {
	spellId: string;
	prepared: boolean;
	alwaysPrepared: boolean;
	source: string; // class, race, item, etc.
}

export interface CharacterSpellcasting {
	spellcastingClasses: {
		classId: string;
		ability: AbilityName;
		spellSaveDC: number;
		spellAttackBonus: number;
	}[];
	spellSlots: SpellSlot[];
	pactSlots?: {
		level: number;
		total: number;
		expended: number;
	};
	knownSpells: string[];
	preparedSpells: PreparedSpell[];
	cantripsKnown: string[];
	concentration?: {
		spellId: string;
		duration: number;
		remainingRounds?: number;
	};
}

// ============================================================================
// CONDITIONS & EFFECTS
// ============================================================================

export interface ActiveCondition {
	condition: ConditionType;
	source: string;
	duration?: number; // in rounds, or undefined for permanent
	remainingRounds?: number;
	level?: number; // for exhaustion
}

export interface ActiveEffect {
	id: string;
	name: string;
	source: string;
	duration?: number;
	effects: {
		type: string;
		value: number | string;
	}[];
}

// ============================================================================
// CLASS PROGRESSION
// ============================================================================

export interface ClassLevel {
	classId: string;
	subclassId?: string;
	level: number;
}

export interface CharacterProgression {
	totalLevel: number;
	classes: ClassLevel[];
	experiencePoints: number;
	proficiencyBonus: number;
	featuresUnlocked: string[];
	choicesMade: {
		featureId: string;
		choiceId: string;
	}[];
}

// ============================================================================
// BACKGROUND
// ============================================================================

export interface CharacterBackground {
	backgroundId: string;
	feature: string;
	personality: string[];
	ideals: string[];
	bonds: string[];
	flaws: string[];
	customizations?: {
		skills?: SkillName[];
		languages?: string[];
		tools?: string[];
	};
}

// ============================================================================
// FULL CHARACTER
// ============================================================================

import { Actor } from './actor.types';

export interface Character extends Actor {
	type: 'player'; // Enforce type

	// Actor overrides/specifics
	// Note: Actor defines 'stats', 'health', 'defense' which group existing properties.
	// We will map these in the implementation or refactor usage gradually.

	// Player info
	playerName?: string;

	// Core identity
	speciesId: string;
	subspeciesId?: string;
	background: CharacterBackground;
	alignment?: string;

	// Progression
	progression: CharacterProgression;

	// Combat stats (Detailed breakdown kept for UI/Logic specifics)
	abilities: CharacterAbilities; // Helper to sync with Actor.stats
	skills: CharacterSkills;
	hitPoints: CharacterHitPoints; // Helper to sync with Actor.health
	deathSaves?: DeathSaves;
	defenses: CharacterDefenses; // Helper to sync with Actor.defense

	// Aliased for backward compat or ease of access, but should ideally come from Actor base
	initiative: number;

	// Resources
	spellcasting?: CharacterSpellcasting;
	classResources: {
		resourceId: string;
		name: string;
		current: number;
		maximum: number;
	}[];

	// Inventory
	inventory: CharacterInventory;

	// Flavor
	appearance?: {
		age: number;
		height: string;
		weight: string;
		eyes: string;
		skin: string;
		hair: string;
		description: string;
	};
	backstory?: string;
	notes?: string;

	// Metadata
	createdAt: string;
	updatedAt: string;
	isPregen: boolean;
}

// ============================================================================
// CHARACTER CREATION STATE
// ============================================================================

export interface CharacterCreationState {
	step: 'species' | 'class' | 'abilities' | 'background' | 'equipment' | 'details' | 'review';

	// Selected options
	selectedSpecies?: string;
	selectedSubspecies?: string;
	selectedClass?: string;
	selectedSubclass?: string;
	// Background choices
	selectedBackground?: string;
	backgroundAbilityAssignments?: { ability: AbilityName; bonus: number }[]; // +2/+1 or +1/+1/+1 logic


	// Ability score method
	abilityMethod?: 'standard_array' | 'point_buy' | 'roll';
	abilityScores?: Partial<AbilityScores>;
	abilityAssignments?: Partial<Record<AbilityName, number>>;
	diceRollPool?: number[]; // Used for 'roll' method transiently

	// Choices made
	skillChoices?: SkillName[];
	languageChoices?: string[];
	toolChoices?: string[];
	equipmentChoices?: Record<string, number>;
	startingGold?: number;

	// Magic
	spellChoices?: {
		classId: string;
		cantrips: string[];
		level1: string[];
	}[];

	// Details
	characterName?: string;
	playerName?: string;
	appearance?: {
		age?: string;
		height?: string;
		weight?: string;
		eyes?: string;
		skin?: string;
		hair?: string;
	};
	backstory?: string;
	alignment?: string;

	// Validation
	errors: { step: string; message: string }[];
	isComplete: boolean;
}

// ============================================================================
// PREGEN CHARACTERS
// ============================================================================

export interface PregenCharacter {
	character: Character;
	purpose: 'tutorial' | 'demo' | 'quickstart';
	difficulty: 'simple' | 'moderate' | 'complex';
	description: string;
	recommendedScenarios: string[];
}
