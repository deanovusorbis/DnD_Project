/**
 * D&D Experiential Learning Platform - Actor Model
 * Base interface for all entities that can act in the game world (PC, NPC, Monster)
 */

import {
	AbilityScores,
	AbilityModifiers,
	ConditionType,
	DamageType,
	Size,
	Identifiable
} from './core.types';

export type ActorType = 'player' | 'monster' | 'npc';

export interface ActorStats {
	abilities: AbilityScores;
	modifiers: AbilityModifiers;
	proficiencyBonus: number;
}

export interface ActorDefense {
	armorClass: number;
	resistances: DamageType[];
	immunities: (DamageType | ConditionType)[];
	vulnerabilities: DamageType[];
}

export interface ActorHealth {
	current: number;
	max: number;
	temp: number;
	hitDice?: {
		total: number;
		current: number;
		size: string;
	}[];
	deathSaves?: {
		successes: number;
		failures: number;
	};
}

/**
 * The core interface for any active entity in the game
 */
export interface Actor extends Identifiable {
	type: ActorType;
	size: Size;

	// Core Data
	stats: ActorStats;
	health: ActorHealth;
	defense: ActorDefense;

	// Movement
	speed: {
		walk: number;
		fly?: number;
		swim?: number;
		climb?: number;
		burrow?: number;
	};

	// State
	conditions: {
		condition: ConditionType;
		source: string;
		duration?: number; // Rounds
	}[];

	// Generic active effects (buffs/debuffs not covered by conditions)
	effects?: {
		id: string;
		name: string;
		source: string;
		duration?: number;
	}[];

	initiativeModifier: number;

	// Tags/Flags
	tags?: string[];
}
