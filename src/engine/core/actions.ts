/**
 * D&D Experiential Learning Platform - Action System
 * Command pattern implementation for game actions.
 */

// import { Actor } from '../../types/actor.types';
import { DiceRollResult } from '../../types/core.types';

export type ActionCategory = 'attack' | 'spell' | 'item' | 'skill' | 'movement' | 'interaction';

export interface BaseAction {
	type: ActionCategory;
	actorId: string;
	timestamp: number;
}

// ============================================================================
// CONCRETE ACTIONS
// ============================================================================

export interface AttackAction extends BaseAction {
	type: 'attack';
	weaponId: string;
	targetId?: string; // Optional if targeting a location or self
	attackType: 'melee' | 'ranged';
}

export interface CastSpellAction extends BaseAction {
	type: 'spell';
	spellId: string;
	targetId?: string;
	level?: number; // For upcasting
	slotLevel?: number;
}

export interface UseItemAction extends BaseAction {
	type: 'item';
	itemId: string;
	targetId?: string;
}

export interface SkillCheckAction extends BaseAction {
	type: 'skill';
	skillId: string;
	targetId?: string;
}

export type GameAction = AttackAction | CastSpellAction | UseItemAction | SkillCheckAction;

// ============================================================================
// ACTION RESULTS
// ============================================================================

export interface ActionResult {
	success: boolean;
	action: GameAction;
	rolls: {
		attack?: DiceRollResult;
		damage?: DiceRollResult;
		save?: DiceRollResult;
		check?: DiceRollResult;
	};
	outcomes: {
		damage?: { amount: number; type: string; targetId: string }[];
		healing?: { amount: number; targetId: string }[];
		conditions?: { type: string; targetId: string; duration: number }[];
		effects?: string[]; // Narrative descriptions
		resourceCost?: { resourceId: string; amount: number }[];
	};
	narration: string; // "Aldric swings his Longsword at the Goblin..."
}
