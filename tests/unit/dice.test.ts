/**
 * D&D Experiential Learning Platform - Dice System Tests
 */

import { describe, it, expect } from 'vitest';
import {
	parseDiceExpression,
	diceExpressionToString,
	rollDice,
	rollD20,
	rollAbilityScore,
	rollAbilityScoreSet,
	rollAttack,
	rollDamage,
	rollCheck,
	calculateAverage,
	calculateRange,
	getAbilityModifier,
	formatModifier,
	validatePointBuy,
	STANDARD_ARRAY,
	POINT_BUY_TOTAL
} from '@core/dice';
// import { DiceExpression } from '@dnd/types/index';

describe('Dice Expression Parser', () => {
	it('should parse simple dice expressions', () => {
		const expr = parseDiceExpression('2d6');
		expect(expr.count).toBe(2);
		expect(expr.die).toBe('d6');
		expect(expr.modifier).toBe(0);
	});

	it('should parse dice with positive modifier', () => {
		const expr = parseDiceExpression('1d20+5');
		expect(expr.count).toBe(1);
		expect(expr.die).toBe('d20');
		expect(expr.modifier).toBe(5);
	});

	it('should parse dice with negative modifier', () => {
		const expr = parseDiceExpression('3d8-2');
		expect(expr.count).toBe(3);
		expect(expr.die).toBe('d8');
		expect(expr.modifier).toBe(-2);
	});

	it('should default to 1 die if count omitted', () => {
		const expr = parseDiceExpression('d12');
		expect(expr.count).toBe(1);
		expect(expr.die).toBe('d12');
	});

	it('should throw on invalid expression', () => {
		expect(() => parseDiceExpression('invalid')).toThrow();
		expect(() => parseDiceExpression('2d7')).toThrow(); // d7 not valid
	});
});

describe('Dice Expression to String', () => {
	it('should convert expression back to string', () => {
		expect(diceExpressionToString({ count: 2, die: 'd6' })).toBe('2d6');
		expect(diceExpressionToString({ count: 1, die: 'd20', modifier: 5 })).toBe('1d20+5');
		expect(diceExpressionToString({ count: 3, die: 'd8', modifier: -2 })).toBe('3d8-2');
	});
});

describe('Roll Dice', () => {
	it('should return results within valid range', () => {
		for (let i = 0; i < 100; i++) {
			const result = rollDice({ count: 2, die: 'd6' });
			expect(result.total).toBeGreaterThanOrEqual(2);
			expect(result.total).toBeLessThanOrEqual(12);
			expect(result.rolls).toHaveLength(2);
		}
	});

	it('should apply modifier correctly', () => {
		for (let i = 0; i < 100; i++) {
			const result = rollDice({ count: 1, die: 'd6', modifier: 3 });
			expect(result.total).toBeGreaterThanOrEqual(4);
			expect(result.total).toBeLessThanOrEqual(9);
		}
	});
});

describe('Roll D20', () => {
	it('should roll normal d20 correctly', () => {
		for (let i = 0; i < 100; i++) {
			const result = rollD20('normal', 5);
			expect(result.total).toBeGreaterThanOrEqual(6);
			expect(result.total).toBeLessThanOrEqual(25);
			expect(result.rolls).toHaveLength(1);
		}
	});

	it('should roll with advantage (2 dice, take higher)', () => {
		for (let i = 0; i < 100; i++) {
			const result = rollD20('advantage');
			expect(result.rolls).toHaveLength(2);
			expect(result.total).toBeGreaterThanOrEqual(Math.max(...result.rolls));
		}
	});

	it('should roll with disadvantage (2 dice, take lower)', () => {
		for (let i = 0; i < 100; i++) {
			const result = rollD20('disadvantage');
			expect(result.rolls).toHaveLength(2);
			expect(result.total).toBeLessThanOrEqual(Math.min(...result.rolls) + 0); // No modifier
		}
	});

	it('should detect critical hits and misses', () => {
		// Run enough times to likely hit both
		let seenCrit = false;
		let seenMiss = false;
		for (let i = 0; i < 1000 && (!seenCrit || !seenMiss); i++) {
			const result = rollD20('normal');
			if (result.criticalHit) seenCrit = true;
			if (result.criticalMiss) seenMiss = true;
		}
		expect(seenCrit).toBe(true);
		expect(seenMiss).toBe(true);
	});
});

describe('Ability Score Generation', () => {
	it('should generate 4d6 drop lowest correctly', () => {
		for (let i = 0; i < 50; i++) {
			const result = rollAbilityScore();
			expect(result.rolls).toHaveLength(4);
			expect(result.total).toBeGreaterThanOrEqual(3);
			expect(result.total).toBeLessThanOrEqual(18);
			expect(result.dropped).toBe(Math.min(...result.rolls));
		}
	});

	it('should generate 6 ability scores', () => {
		const result = rollAbilityScoreSet();
		expect(result.scores).toHaveLength(6);
		expect(result.details).toHaveLength(6);
		result.scores.forEach(score => {
			expect(score).toBeGreaterThanOrEqual(3);
			expect(score).toBeLessThanOrEqual(18);
		});
	});
});

describe('Attack and Damage Rolls', () => {
	it('should make attack rolls with correct structure', () => {
		const attack = rollAttack(5, 'normal');
		expect(attack.modifier).toBe(5);
		expect(attack.total).toBe(attack.d20Roll + attack.modifier);
		expect(typeof attack.hits).toBe('function');
	});

	it('should correctly determine hits', () => {
		const attack = rollAttack(5, 'normal');
		if (attack.isCriticalHit) {
			expect(attack.hits(999)).toBe(true); // Crit always hits
		} else if (attack.isCriticalMiss) {
			expect(attack.hits(1)).toBe(false); // Nat 1 always misses
		} else {
			expect(attack.hits(attack.total)).toBe(true);
			expect(attack.hits(attack.total + 1)).toBe(false);
		}
	});

	it('should double dice on critical damage', () => {
		const normalDamage = rollDamage({ count: 2, die: 'd6', modifier: 3 }, false);
		expect(normalDamage.rolls).toHaveLength(2);
		expect(normalDamage.isCritical).toBe(false);

		const critDamage = rollDamage({ count: 2, die: 'd6', modifier: 3 }, true);
		expect(critDamage.rolls).toHaveLength(4); // Doubled
		expect(critDamage.isCritical).toBe(true);
	});
});

describe('Saving Throws and Ability Checks', () => {
	it('should make checks with correct structure', () => {
		const check = rollCheck(3, 'normal');
		expect(check.modifier).toBe(3);
		expect(check.total).toBe(check.d20Roll + check.modifier);
		expect(typeof check.success).toBe('function');
		expect(typeof check.margin).toBe('function');
	});

	it('should calculate margin correctly', () => {
		const check = rollCheck(0, 'normal');
		expect(check.margin(10)).toBe(check.total - 10);
	});
});

describe('Utility Functions', () => {
	it('should calculate average correctly', () => {
		expect(calculateAverage({ count: 1, die: 'd6' })).toBe(3.5);
		expect(calculateAverage({ count: 2, die: 'd6', modifier: 2 })).toBe(9);
		expect(calculateAverage({ count: 1, die: 'd20' })).toBe(10.5);
	});

	it('should calculate range correctly', () => {
		const range = calculateRange({ count: 2, die: 'd6', modifier: 3 });
		expect(range.min).toBe(5);  // 2 + 3
		expect(range.max).toBe(15); // 12 + 3
	});

	it('should calculate ability modifiers correctly', () => {
		expect(getAbilityModifier(1)).toBe(-5);
		expect(getAbilityModifier(8)).toBe(-1);
		expect(getAbilityModifier(10)).toBe(0);
		expect(getAbilityModifier(11)).toBe(0);
		expect(getAbilityModifier(14)).toBe(2);
		expect(getAbilityModifier(18)).toBe(4);
		expect(getAbilityModifier(20)).toBe(5);
	});

	it('should format modifiers correctly', () => {
		expect(formatModifier(-2)).toBe('-2');
		expect(formatModifier(0)).toBe('+0');
		expect(formatModifier(3)).toBe('+3');
	});
});

describe('Point Buy Validation', () => {
	it('should validate standard array as valid', () => {
		const result = validatePointBuy(STANDARD_ARRAY);
		expect(result.valid).toBe(true);
		expect(result.cost).toBe(POINT_BUY_TOTAL);
		expect(result.remaining).toBe(0);
	});

	it('should detect over-budget point buy', () => {
		const result = validatePointBuy([15, 15, 15, 15, 8, 8]); // Way over budget
		expect(result.valid).toBe(false);
		expect(result.cost).toBeGreaterThan(POINT_BUY_TOTAL);
	});

	it('should calculate remaining points', () => {
		const result = validatePointBuy([10, 10, 10, 10, 10, 10]); // 12 points
		expect(result.valid).toBe(true);
		expect(result.remaining).toBe(POINT_BUY_TOTAL - 12);
	});
});
