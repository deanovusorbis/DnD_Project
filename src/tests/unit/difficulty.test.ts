import { describe, it, expect } from 'vitest';
import {
	createDifficultyProfile,
	recordPerformance,
	analyzeDifficulty,
	applyAdjustment,
	getDCModifier
} from '../../pedagogy/difficulty-manager';

describe('Difficulty Manager', () => {
	it('should create default profile with normal difficulty', () => {
		const profile = createDifficultyProfile('user-1');
		expect(profile.currentDifficulty).toBe('normal');
		expect(profile.combatSuccessRate).toBe(0.5);
		expect(profile.forgivingCombat).toBe(true);
	});

	it('should update success rate on performance events', () => {
		let profile = createDifficultyProfile('user-1');

		// Record some successes
		for (let i = 0; i < 10; i++) {
			profile = recordPerformance(profile, { type: 'combat', success: true });
		}

		// Success rate should have increased
		expect(profile.combatSuccessRate).toBeGreaterThan(0.5);
	});

	it('should suggest easier difficulty when player is struggling', () => {
		const profile = createDifficultyProfile('user-1');
		// Simulate struggling player
		const strugglingProfile = {
			...profile,
			combatSuccessRate: 0.2,
			skillCheckSuccessRate: 0.2,
			puzzleSolveRate: 0.2
		};

		const adjustment = analyzeDifficulty(strugglingProfile);
		expect(adjustment).not.toBeNull();
		expect(adjustment?.type).toBe('decrease');
	});

	it('should suggest harder difficulty when player is mastering', () => {
		const profile = createDifficultyProfile('user-1');
		// Simulate skilled player
		const masteringProfile = {
			...profile,
			combatSuccessRate: 0.9,
			skillCheckSuccessRate: 0.9,
			puzzleSolveRate: 0.9
		};

		const adjustment = analyzeDifficulty(masteringProfile);
		expect(adjustment).not.toBeNull();
		expect(adjustment?.type).toBe('increase');
	});

	it('should apply adjustments to profile', () => {
		const profile = createDifficultyProfile('user-1');
		const adjustment = {
			type: 'decrease' as const,
			area: 'overall' as const,
			reason: 'Test adjustment',
			changes: [
				{ parameter: 'hintFrequency', from: 'sometimes', to: 'often' }
			]
		};

		const updated = applyAdjustment(profile, adjustment);
		expect(updated.hintFrequency).toBe('often');
		expect(updated.difficultyHistory).toHaveLength(1);
	});

	it('should return correct DC modifiers', () => {
		const easyProfile = { ...createDifficultyProfile('user-1'), currentDifficulty: 'easy' as const };
		const hardProfile = { ...createDifficultyProfile('user-1'), currentDifficulty: 'hard' as const };

		expect(getDCModifier(easyProfile)).toBe(-2);
		expect(getDCModifier(hardProfile)).toBe(4);
	});
});
