/**
 * D&D Experiential Learning Platform - Spell Types
 * SRD 5.2.1 Compatible
 */

import {
	SpellSchool, AbilityName, DamageType, ConditionType,
	Identifiable, Describable, DiceExpression
} from './core.types';

// ============================================================================
// SPELL COMPONENTS
// ============================================================================

export interface SpellComponents {
	verbal: boolean;
	somatic: boolean;
	material: boolean;
	materialDesc?: string;
	materialConsumed?: boolean;
	materialCost?: number; // in gp
}

export type CastingTime =
	| '1 action'
	| '1 bonus action'
	| '1 reaction'
	| '1 minute'
	| '10 minutes'
	| '1 hour'
	| '8 hours'
	| '12 hours'
	| '24 hours'
	| string; // For special cases

export type SpellRange =
	| 'self'
	| 'touch'
	| number // feet
	| 'sight'
	| 'unlimited'
	| 'special';

export type SpellDuration =
	| 'instantaneous'
	| '1 round'
	| '1 minute'
	| '10 minutes'
	| '1 hour'
	| '8 hours'
	| '24 hours'
	| 'until dispelled'
	| 'special'
	| string;

export interface SpellAreaOfEffect {
	type: 'cone' | 'cube' | 'cylinder' | 'line' | 'sphere' | 'emanation';
	size: number; // feet
	centered?: 'self' | 'point';
}

// ============================================================================
// SPELL EFFECTS
// ============================================================================

export interface SpellEffect {
	type: 'damage' | 'healing' | 'buff' | 'debuff' | 'utility' | 'summon' | 'control';

	// Damage/Healing
	dice?: DiceExpression;
	damageType?: DamageType;

	// Saving throw
	savingThrow?: {
		ability: AbilityName;
		onSuccess: 'no_effect' | 'half_damage' | 'ends_effect' | 'special';
	};

	// Attack roll
	spellAttack?: 'melee' | 'ranged';

	// Conditions
	appliesCondition?: ConditionType;
	conditionDuration?: string;

	// Other effects
	movementEffect?: string;
	terrainEffect?: string;
	createsLight?: { radius: number; dimRadius: number };
}

export interface SpellUpcast {
	perSlotLevel: number; // How many levels above base
	additionalDice?: DiceExpression;
	additionalTargets?: number;
	increasedDuration?: string;
	otherBenefit?: string;
}

// ============================================================================
// SPELL DEFINITION
// ============================================================================

export interface Spell extends Identifiable, Describable {
	// Core properties
	level: number; // 0 for cantrips
	school: SpellSchool;
	ritual: boolean;
	concentration: boolean;

	// Casting
	castingTime: CastingTime;
	reactionTrigger?: string; // If reaction spell
	components: SpellComponents;

	// Targeting
	range: SpellRange;
	rangeValue?: number; // If numeric
	areaOfEffect?: SpellAreaOfEffect;
	targets?: number | 'self' | 'creature' | 'object' | 'point';

	// Duration
	duration: SpellDuration;
	durationValue?: number; // If numeric rounds/minutes

	// Effects
	effects: SpellEffect[];
	atHigherLevels?: SpellUpcast;

	// Class lists
	classes: string[]; // Class IDs that have this spell

	// Teaching metadata
	teachingNotes?: {
		complexity: 'simple' | 'moderate' | 'complex';
		commonUses: string[];
		combosWellWith: string[];
		newPlayerFriendly: boolean;
		conceptsTaught: string[]; // e.g., "concentration", "saving throws"
	};
}

// ============================================================================
// SPELL LISTS
// ============================================================================

export interface ClassSpellList {
	classId: string;
	cantrips: string[];
	spellsByLevel: {
		level: number;
		spells: string[];
	}[];
}

// ============================================================================
// SPELL DATABASE
// ============================================================================

export interface SpellDatabase {
	version: string;
	spells: Spell[];
	spellLists: ClassSpellList[];
	lastUpdated: string;
}
