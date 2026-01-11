/**
 * D&D Experiential Learning Platform - Adaptive Difficulty Manager
 * Dynamically adjusts game difficulty based on player performance
 */

import {
	DifficultyProfile,
	AdaptiveAdjustment
} from '@dnd/types/pedagogy.types';

// ============================================================================
// PROFILE FACTORY
// ============================================================================

export function createDifficultyProfile(userId: string): DifficultyProfile {
	return {
		userId,
		combatSuccessRate: 0.5, // Start at 50%
		skillCheckSuccessRate: 0.5,
		puzzleSolveRate: 0.5,
		averageAttempts: 1,
		currentDifficulty: 'normal',
		hintFrequency: 'sometimes',
		autoExplainRules: true,
		showDCValues: false, // Hide initially for immersion
		forgivingCombat: true, // Extra chances for beginners
		difficultyHistory: []
	};
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

export interface PerformanceEvent {
	type: 'combat' | 'skill_check' | 'puzzle' | 'save';
	success: boolean;
	attempts?: number;
	dc?: number;
	roll?: number;
}

/**
 * Update profile based on a performance event
 */
export function recordPerformance(
	profile: DifficultyProfile,
	event: PerformanceEvent
): DifficultyProfile {
	const updated = { ...profile };
	const weight = 0.1; // Learning rate for moving average

	switch (event.type) {
		case 'combat':
			updated.combatSuccessRate = movingAverage(
				profile.combatSuccessRate,
				event.success ? 1 : 0,
				weight
			);
			break;
		case 'skill_check':
		case 'save':
			updated.skillCheckSuccessRate = movingAverage(
				profile.skillCheckSuccessRate,
				event.success ? 1 : 0,
				weight
			);
			break;
		case 'puzzle':
			updated.puzzleSolveRate = movingAverage(
				profile.puzzleSolveRate,
				event.success ? 1 : 0,
				weight
			);
			if (event.attempts) {
				updated.averageAttempts = movingAverage(
					profile.averageAttempts,
					event.attempts,
					weight
				);
			}
			break;
	}

	return updated;
}

function movingAverage(current: number, newValue: number, weight: number): number {
	return current * (1 - weight) + newValue * weight;
}

// ============================================================================
// DIFFICULTY ADJUSTMENT
// ============================================================================

const THRESHOLDS = {
	struggling: 0.3,  // Below 30% success = struggling
	comfortable: 0.7, // Above 70% success = comfortable
	mastering: 0.85   // Above 85% = mastering
};

/**
 * Analyze performance and suggest difficulty adjustments
 */
export function analyzeDifficulty(profile: DifficultyProfile): AdaptiveAdjustment | null {
	const overallRate = (
		profile.combatSuccessRate +
		profile.skillCheckSuccessRate +
		profile.puzzleSolveRate
	) / 3;

	// Determine if adjustment is needed
	if (overallRate < THRESHOLDS.struggling) {
		return createAdjustment('decrease', 'overall', profile, 'Player struggling - reducing difficulty');
	}

	if (overallRate > THRESHOLDS.mastering && profile.currentDifficulty !== 'hard') {
		return createAdjustment('increase', 'overall', profile, 'Player mastering content - increasing challenge');
	}

	// Check specific areas
	if (profile.combatSuccessRate < THRESHOLDS.struggling) {
		return createAdjustment('decrease', 'combat', profile, 'Combat too difficult');
	}

	if (profile.skillCheckSuccessRate < THRESHOLDS.struggling) {
		return createAdjustment('decrease', 'skills', profile, 'Skill checks too difficult');
	}

	return null; // No adjustment needed
}

function createAdjustment(
	type: 'increase' | 'decrease' | 'maintain',
	area: 'combat' | 'skills' | 'puzzles' | 'overall',
	profile: DifficultyProfile,
	reason: string
): AdaptiveAdjustment {
	const changes: AdaptiveAdjustment['changes'] = [];

	if (type === 'decrease') {
		// Make things easier
		if (profile.hintFrequency !== 'always') {
			changes.push({
				parameter: 'hintFrequency',
				from: profile.hintFrequency,
				to: increaseHintFrequency(profile.hintFrequency)
			});
		}
		if (!profile.autoExplainRules) {
			changes.push({
				parameter: 'autoExplainRules',
				from: 'false',
				to: 'true'
			});
		}
		if (!profile.forgivingCombat && area === 'combat') {
			changes.push({
				parameter: 'forgivingCombat',
				from: 'false',
				to: 'true'
			});
		}
	} else if (type === 'increase') {
		// Make things harder
		if (profile.hintFrequency !== 'never') {
			changes.push({
				parameter: 'hintFrequency',
				from: profile.hintFrequency,
				to: decreaseHintFrequency(profile.hintFrequency)
			});
		}
		if (profile.forgivingCombat) {
			changes.push({
				parameter: 'forgivingCombat',
				from: 'true',
				to: 'false'
			});
		}
	}

	return { type, area, reason, changes };
}

function increaseHintFrequency(current: DifficultyProfile['hintFrequency']): DifficultyProfile['hintFrequency'] {
	const levels: DifficultyProfile['hintFrequency'][] = ['never', 'rarely', 'sometimes', 'often', 'always'];
	const idx = levels.indexOf(current);
	return levels[Math.min(idx + 1, levels.length - 1)] ?? 'always';
}

function decreaseHintFrequency(current: DifficultyProfile['hintFrequency']): DifficultyProfile['hintFrequency'] {
	const levels: DifficultyProfile['hintFrequency'][] = ['never', 'rarely', 'sometimes', 'often', 'always'];
	const idx = levels.indexOf(current);
	return levels[Math.max(idx - 1, 0)] ?? 'never';
}

// ============================================================================
// APPLY ADJUSTMENTS
// ============================================================================

/**
 * Apply an adjustment to a profile
 */
export function applyAdjustment(
	profile: DifficultyProfile,
	adjustment: AdaptiveAdjustment
): DifficultyProfile {
	const updated = { ...profile };

	for (const change of adjustment.changes) {
		(updated as any)[change.parameter] = change.to;
	}

	// Record in history
	updated.difficultyHistory = [
		...profile.difficultyHistory,
		{
			timestamp: new Date().toISOString(),
			difficulty: updated.currentDifficulty,
			reason: adjustment.reason
		}
	];

	return updated;
}

// ============================================================================
// DC MODIFIERS
// ============================================================================

/**
 * Get DC modifier based on current difficulty settings
 */
export function getDCModifier(profile: DifficultyProfile): number {
	switch (profile.currentDifficulty) {
		case 'easy': return -2;
		case 'normal': return 0;
		case 'challenging': return 2;
		case 'hard': return 4;
		default: return 0;
	}
}

/**
 * Should we show the DC value to the player?
 */
export function shouldShowDC(profile: DifficultyProfile): boolean {
	return profile.showDCValues;
}

/**
 * Should we auto-explain rules after this event?
 */
export function shouldAutoExplain(profile: DifficultyProfile, eventSuccess: boolean): boolean {
	// Always explain on failure if auto-explain is on
	if (!eventSuccess && profile.autoExplainRules) {
		return true;
	}
	return false;
}
