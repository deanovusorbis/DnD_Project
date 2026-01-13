/**
 * D&D Experiential Learning Platform - Species Types
 * SRD 5.2.1 Compatible
 */

import { AbilityName, Size, DamageType, ConditionType, Identifiable, Describable } from './core.types';

// ============================================================================
// SPECIES (Race) DEFINITIONS
// ============================================================================

export interface AbilityScoreIncrease {
	ability: AbilityName;
	bonus: number;
}

export interface SpeciesTrait extends Identifiable, Describable {
	// Trait mechanics
	mechanicType: 'passive' | 'active' | 'resource' | 'choice';
	level: number; // Standardized level requirement (User Request)

	// For active abilities
	usesPerRest?: 'short' | 'long';
	usesCount?: number;

	// Effects
	grantsResistance?: DamageType[];
	grantsImmunity?: (DamageType | ConditionType)[];
	grantsAdvantage?: {
		savingThrows?: AbilityName[];
		skillChecks?: string[];
		conditions?: string[];
	};
	grantsProficiency?: {
		skills?: string[];
		weapons?: string[];
		armor?: string[];
		tools?: string[];
	};
	grantsLanguages?: string[];
	grantsSpeed?: {
		type: 'walk' | 'swim' | 'fly' | 'climb' | 'burrow';
		value: number;
	};
	grantsDarkvision?: number; // in feet

	// For spellcasting traits
	grantsSpells?: {
		spellId: string;
		atLevel: number;
		castingAbility: AbilityName;
		usesPerDay?: number;
	}[];
}

export interface Species extends Identifiable, Describable {
	// Base characteristics
	size: Size;
	speed: number; // base walking speed in feet

	// Ability Score Increases
	abilityScoreIncreases?: AbilityScoreIncrease[];

	// OR for 2024 rules: Flexible ASI
	flexibleASI?: {
		total: number; // e.g., +2 to one, +1 to another
		maxPerAbility: number;
	};

	// Age and physical characteristics (flavor)
	ageMaturity: number;
	ageLifespan: number;

	// Languages
	languages: string[];
	extraLanguages?: number;

	// Species traits
	traits: SpeciesTrait[];

	// Subspecies/Lineage options
	subraces?: SubSpecies[];

	// Creature type (default humanoid)
	creatureType?: string;

	// Teaching metadata
	teachingNotes?: {
		complexity: 'beginner' | 'intermediate' | 'advanced';
		recommendedForNewPlayers: boolean;
		keyMechanics: string[];
		flavorHooks: string[];
	};
}

export interface SubSpecies extends Identifiable, Describable {
	parentSpeciesId: string;
	additionalTraits: SpeciesTrait[];
	replacedTraits?: string[]; // IDs of traits to replace
	additionalASI?: AbilityScoreIncrease[];
}

// ============================================================================
// SRD SPECIES DATA STRUCTURE
// ============================================================================

export interface SpeciesDatabase {
	version: string;
	species: Species[];
	lastUpdated: string;
}
