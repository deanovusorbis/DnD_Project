/**
 * D&D Experiential Learning Platform - Dice System
 * Core dice rolling mechanics with full D&D 5E support
 */

import { DieType, DiceExpression, DiceRollResult, RollType } from '@dnd/types/index';

// ============================================================================
// CONSTANTS
// ============================================================================

const DIE_VALUES: Record<DieType, number> = {
	d4: 4,
	d6: 6,
	d8: 8,
	d10: 10,
	d12: 12,
	d20: 20,
	d100: 100
};

// ============================================================================
// RANDOM NUMBER GENERATION
// ============================================================================

/**
 * Cryptographically secure random integer between min and max (inclusive)
 */
function secureRandomInt(min: number, max: number): number {
	const range = max - min + 1;
	const bytesNeeded = Math.ceil(Math.log2(range) / 8);
	const maxValid = Math.floor(256 ** bytesNeeded / range) * range - 1;

	let randomValue: number;
	do {
		const bytes = new Uint8Array(bytesNeeded);
		crypto.getRandomValues(bytes);
		randomValue = bytes.reduce((acc, byte, i) => acc + byte * (256 ** i), 0);
	} while (randomValue > maxValid);

	return min + (randomValue % range);
}

/**
 * Roll a single die
 */
function rollDie(die: DieType): number {
	return secureRandomInt(1, DIE_VALUES[die]);
}

// ============================================================================
// DICE EXPRESSION PARSER
// ============================================================================

/**
 * Parse a dice expression string (e.g., "2d6+3", "1d20-1", "4d8")
 */
export function parseDiceExpression(expression: string): DiceExpression {
	const regex = /^(\d+)?d(\d+)([+-]\d+)?$/i;
	const match = (expression || '').trim().match(regex);

	if (!match || !match[2]) {
		throw new Error(`Invalid dice expression: ${expression}`);
	}

	const count = match && match[1] ? parseInt(match[1], 10) : 1;
	const dieValue = parseInt((match[2] || '6'), 10); // Simplified logic as we parsed int earlier
	const modifier = match && match[3] ? parseInt(match[3], 10) : 0;

	// Validate die type
	const dieType = `d${dieValue}` as unknown as DieType;
	if (!DIE_VALUES[dieType]) {
		throw new Error(`Invalid die type: d${dieValue}`);
	}

	return { count, die: dieType, modifier };
}

/**
 * Convert DiceExpression back to string
 */
export function diceExpressionToString(expr: DiceExpression): string {
	let result = `${expr.count}${expr.die}`;
	if (expr.modifier && expr.modifier !== 0) {
		result += expr.modifier > 0 ? `+${expr.modifier}` : `${expr.modifier}`;
	}
	return result;
}

// ============================================================================
// CORE ROLL FUNCTIONS
// ============================================================================

/**
 * Roll dice according to a DiceExpression
 */
export function rollDice(expression: DiceExpression): DiceRollResult {
	const rolls: number[] = [];

	for (let i = 0; i < expression.count; i++) {
		rolls.push(rollDie(expression.die));
	}

	const diceTotal = rolls.reduce((sum, roll) => sum + roll, 0);
	const total = diceTotal + (expression.modifier || 0);

	return {
		expression,
		rolls,
		total
	};
}

/**
 * Roll a single d20 with advantage/disadvantage support
 */
export function rollD20(
	rollType: RollType = 'normal',
	modifier: number = 0
): DiceRollResult {
	const expression: DiceExpression = { count: 1, die: 'd20', modifier };

	if (rollType === 'normal') {
		const roll = rollDie('d20');
		return {
			expression,
			rolls: [roll],
			total: roll + modifier,
			criticalHit: roll === 20,
			criticalMiss: roll === 1
		};
	}

	// Advantage or Disadvantage: roll twice
	const roll1 = rollDie('d20');
	const roll2 = rollDie('d20');
	const selectedRoll = rollType === 'advantage'
		? Math.max(roll1, roll2)
		: Math.min(roll1, roll2);

	return {
		expression,
		rolls: [roll1, roll2],
		total: selectedRoll + modifier,
		criticalHit: selectedRoll === 20,
		criticalMiss: selectedRoll === 1
	};
}

/**
 * Roll multiple dice and keep highest/lowest N
 */
export function rollAndKeep(
	count: number,
	die: DieType,
	keep: number,
	keepHighest: boolean = true
): DiceRollResult {
	const rolls: number[] = [];

	for (let i = 0; i < count; i++) {
		rolls.push(rollDie(die));
	}

	const sortedRolls = [...rolls].sort((a, b) =>
		keepHighest ? b - a : a - b
	);

	const keptRolls = sortedRolls.slice(0, keep);
	const total = keptRolls.reduce((sum, roll) => sum + roll, 0);

	return {
		expression: { count, die },
		rolls,
		total
	};
}

// ============================================================================
// ABILITY SCORE GENERATION
// ============================================================================

/**
 * Roll 4d6 drop lowest for ability score generation
 */
export function rollAbilityScore(): { rolls: number[]; dropped: number; total: number } {
	const result = rollAndKeep(4, 'd6', 3, true);
	const allRolls = result.rolls;
	const dropped = Math.min(...allRolls);

	return {
		rolls: allRolls,
		dropped,
		total: result.total
	};
}

/**
 * Generate a full set of ability scores (4d6 drop lowest × 6)
 */
export function rollAbilityScoreSet(): {
	scores: number[];
	details: { rolls: number[]; dropped: number; total: number }[]
} {
	const details = [];
	const scores = [];

	for (let i = 0; i < 6; i++) {
		const result = rollAbilityScore();
		details.push(result);
		scores.push(result.total);
	}

	return { scores, details };
}

// ============================================================================
// STANDARD ARRAY & POINT BUY
// ============================================================================

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COSTS: Record<number, number> = {
	8: 0,
	9: 1,
	10: 2,
	11: 3,
	12: 4,
	13: 5,
	14: 7,
	15: 9
};

export const POINT_BUY_TOTAL = 27;

/**
 * Calculate point buy cost for a set of ability scores
 */
export function calculatePointBuyCost(scores: number[]): number {
	return scores.reduce((total, score) => {
		if (score < 8 || score > 15) {
			throw new Error(`Score ${score} is outside point buy range (8-15)`);
		}
		return total + POINT_BUY_COSTS[score]!;
	}, 0);
}

/**
 * Validate a point buy configuration
 */
export function validatePointBuy(scores: number[]): { valid: boolean; cost: number; remaining: number } {
	const cost = calculatePointBuyCost(scores);
	return {
		valid: cost <= POINT_BUY_TOTAL,
		cost,
		remaining: POINT_BUY_TOTAL - cost
	};
}

// ============================================================================
// ATTACK & DAMAGE ROLLS
// ============================================================================

export interface AttackRollResult {
	d20Roll: number;
	secondRoll?: number; // For advantage/disadvantage
	modifier: number;
	total: number;
	rollType: RollType;
	isCriticalHit: boolean;
	isCriticalMiss: boolean;
	hits: (targetAC: number) => boolean;
}

/**
 * Make an attack roll
 */
export function rollAttack(
	attackBonus: number,
	rollType: RollType = 'normal'
): AttackRollResult {
	const result = rollD20(rollType, attackBonus);
	const d20Roll = rollType === 'normal'
		? (result.rolls[0] ?? 0)
		: (rollType === 'advantage'
			? Math.max(result.rolls[0] ?? 0, result.rolls[1] ?? 0)
			: Math.min(result.rolls[0] ?? 0, result.rolls[1] ?? 0));

	return {
		d20Roll,
		secondRoll: rollType !== 'normal' ? (d20Roll === result.rolls[0] ? result.rolls[1] : result.rolls[0]) : undefined,
		modifier: attackBonus,
		total: result.total,
		rollType,
		isCriticalHit: result.criticalHit || false,
		isCriticalMiss: result.criticalMiss || false,
		hits: (targetAC: number) => result.criticalHit || (!result.criticalMiss && result.total >= targetAC)
	};
}

export interface DamageRollResult {
	rolls: number[];
	modifier: number;
	total: number;
	isCritical: boolean;
	damageType?: string;
}

/**
 * Roll damage dice
 */
export function rollDamage(
	diceExpression: DiceExpression,
	isCritical: boolean = false,
	damageType?: string
): DamageRollResult {
	// Critical hits double the dice
	const count = isCritical ? diceExpression.count * 2 : diceExpression.count;
	const modifiedExpression = { ...diceExpression, count };

	const result = rollDice(modifiedExpression);

	return {
		rolls: result.rolls,
		modifier: diceExpression.modifier || 0,
		total: result.total,
		isCritical,
		damageType
	};
}

// ============================================================================
// SAVING THROWS & ABILITY CHECKS
// ============================================================================

export interface CheckResult {
	d20Roll: number;
	secondRoll?: number;
	modifier: number;
	total: number;
	rollType: RollType;
	success: (dc: number) => boolean;
	margin: (dc: number) => number;
}

/**
 * Make an ability check or saving throw
 */
export function rollCheck(
	modifier: number,
	rollType: RollType = 'normal'
): CheckResult {
	const result = rollD20(rollType, modifier);
	const d20Roll = rollType === 'normal'
		? (result.rolls[0] ?? 0)
		: (rollType === 'advantage'
			? Math.max(result.rolls[0] ?? 0, result.rolls[1] ?? 0)
			: Math.min(result.rolls[0] ?? 0, result.rolls[1] ?? 0));

	return {
		d20Roll,
		secondRoll: rollType !== 'normal' ? (d20Roll === result.rolls[0] ? result.rolls[1] : result.rolls[0]) : undefined,
		modifier,
		total: result.total,
		rollType,
		success: (dc: number) => result.total >= dc,
		margin: (dc: number) => result.total - dc
	};
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate average for a dice expression
 */
export function calculateAverage(expression: DiceExpression): number {
	const dieAverage = (DIE_VALUES[expression.die] + 1) / 2;
	return expression.count * dieAverage + (expression.modifier || 0);
}

/**
 * Calculate min and max for a dice expression
 */
export function calculateRange(expression: DiceExpression): { min: number; max: number } {
	const modifier = expression.modifier || 0;
	return {
		min: expression.count + modifier,
		max: expression.count * DIE_VALUES[expression.die] + modifier
	};
}

/**
 * Calculate ability modifier from score
 */
export function getAbilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

/**
 * Format modifier for display (e.g., +3, -1)
 */
export function formatModifier(modifier: number): string {
	return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}
