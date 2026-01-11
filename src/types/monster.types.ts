/**
 * D&D Experiential Learning Platform - Monster Types
 * SRD 5.2.1 Compatible
 */

import {
	AbilityScores, Size, DamageType, ConditionType,
	SkillName, Identifiable, Describable, CombatAction, DiceExpression
} from './core.types';

// ============================================================================
// MONSTER TYPES
// ============================================================================

export type CreatureType =
	| 'aberration' | 'beast' | 'celestial' | 'construct'
	| 'dragon' | 'elemental' | 'fey' | 'fiend'
	| 'giant' | 'humanoid' | 'monstrosity' | 'ooze'
	| 'plant' | 'undead';

export type MonsterTag =
	| 'shapechanger' | 'swarm' | 'titan'
	| string; // For specific subtypes like "goblinoid", "demon"

// ============================================================================
// CHALLENGE RATING
// ============================================================================

export interface ChallengeRating {
	cr: number | string; // 0, 1/8, 1/4, 1/2, 1-30
	xp: number;
	proficiencyBonus: number;
}

export const CR_XP_MAP: Record<string, number> = {
	'0': 10,
	'1/8': 25,
	'1/4': 50,
	'1/2': 100,
	'1': 200,
	'2': 450,
	'3': 700,
	'4': 1100,
	'5': 1800,
	'6': 2300,
	'7': 2900,
	'8': 3900,
	'9': 5000,
	'10': 5900,
	// ... continues to 30
};

// ============================================================================
// MONSTER ABILITIES
// ============================================================================

export interface MonsterSenses {
	blindsight?: number;
	darkvision?: number;
	tremorsense?: number;
	truesight?: number;
	passivePerception: number;
}

export interface MonsterSpeed {
	walk: number;
	burrow?: number;
	climb?: number;
	fly?: number;
	hover?: boolean;
	swim?: number;
}

export interface MonsterTrait extends Identifiable, Describable {
	// For teaching purposes
	mechanic?: {
		type: 'damage' | 'healing' | 'condition' | 'movement' | 'special';
		trigger?: string;
		effect: string;
	};
}

// ============================================================================
// MONSTER ACTIONS
// ============================================================================

export interface MonsterAttack extends Omit<CombatAction, 'damage' | 'damageType'> {
	attackType: 'melee_weapon' | 'ranged_weapon' | 'melee_spell' | 'ranged_spell';
	reach?: number;
	targets: number | 'all_in_range';
	damage: {
		dice: DiceExpression;
		type: DamageType;
	}[];
	additionalEffects?: {
		condition?: ConditionType;
		savingThrow?: {
			ability: string;
			dc: number;
		};
		duration?: string;
	};
}

export interface MultiattackAction {
	description: string;
	attacks: {
		actionId: string;
		count: number;
	}[];
	orOptions?: {
		actionId: string;
		count: number;
	}[][];
}

export interface LegendaryAction extends Identifiable, Describable {
	cost: number; // 1-3 legendary actions
	action: CombatAction;
}

export interface LairAction extends Identifiable, Describable {
	initiativeCount: number;
	action: CombatAction;
	regionalEffect?: boolean;
}

// ============================================================================
// MONSTER DEFINITION
// ============================================================================

export interface Monster extends Identifiable, Describable {
	// Classification
	size: Size;
	type: CreatureType;
	tags?: MonsterTag[];
	alignment: string;

	// Challenge
	challengeRating: ChallengeRating;

	// Defense
	armorClass: {
		value: number;
		type?: string; // "natural armor", "leather armor", etc.
	};
	hitPoints: {
		average: number;
		formula: DiceExpression;
	};

	// Movement
	speed: MonsterSpeed;

	// Abilities
	abilityScores: AbilityScores;
	savingThrows?: Partial<Record<string, number>>;
	skills?: Partial<Record<SkillName, number>>;

	// Resistances & Immunities
	damageVulnerabilities?: DamageType[];
	damageResistances?: DamageType[];
	damageImmunities?: DamageType[];
	conditionImmunities?: ConditionType[];

	// Senses & Languages
	senses: MonsterSenses;
	languages: string[];
	telepathy?: number;

	// Traits
	traits: MonsterTrait[];

	// Actions
	actions: (MonsterAttack | CombatAction)[];
	multiattack?: MultiattackAction;
	bonusActions?: CombatAction[];
	reactions?: CombatAction[];

	// Legendary/Mythic/Lair
	legendaryActions?: {
		count: number;
		actions: LegendaryAction[];
	};
	mythicActions?: {
		triggerCondition: string;
		actions: LegendaryAction[];
	};
	lairActions?: LairAction[];
	regionalEffects?: Describable[];

	// Spellcasting
	spellcasting?: {
		ability: string;
		spellSaveDC: number;
		spellAttackBonus: number;
		spellsAtWill?: string[];
		spellsPerDay?: {
			count: number;
			spells: string[];
		}[];
		spellSlots?: {
			level: number;
			slots: number;
			spells: string[];
		}[];
	};

	// For teaching
	teachingNotes?: {
		recommendedPartyLevel: number;
		recommendedPartySize: number;
		tacticsNotes: string;
		commonMistakes: string[];
		teachingOpportunities: string[]; // What rules this monster demonstrates
	};

	// Environment
	environments?: string[];

	// Metadata
	isLegendary: boolean;
	isMythic: boolean;
	hasLair: boolean;
}

// ============================================================================
// MONSTER GROUPS
// ============================================================================

export interface MonsterGroup {
	id: string;
	name: string;
	monsters: { monsterId: string; count: number; role?: string }[];
	tactics?: string;
	difficulty?: 'easy' | 'medium' | 'hard' | 'deadly';
}

// ============================================================================
// MONSTER DATABASE
// ============================================================================

export interface MonsterDatabase {
	version: string;
	monsters: Monster[];
	groups: MonsterGroup[];
	lastUpdated: string;
}
