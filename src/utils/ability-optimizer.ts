/**
 * D&D Experiential Learning Platform - Ability Score Optimizer
 * Class-based ability score assignment utilities
 */

import { AbilityName, AbilityScores } from '../types/index';
import { AbilityPriority } from '../types/class.types';

// ============================================================================
// TYPES
// ============================================================================

export type AbilityAssignmentMode = 'auto' | 'suggested' | 'manual';

export interface AbilityAssignmentResult {
	scores: AbilityScores;
	mode: AbilityAssignmentMode;
	explanation: Record<AbilityName, string>;
}

export interface AbilitySuggestion {
	ability: AbilityName;
	suggestedScore: number;
	reason: string;
	priority: 'primary' | 'secondary' | 'dump';
}

// ============================================================================
// DEFAULT PRIORITY MAPPINGS
// ============================================================================

/**
 * Default ability priority for each class
 * Used when class data doesn't have abilityPriority defined
 */
export const DEFAULT_CLASS_PRIORITIES: Record<string, AbilityPriority> = {
	fighter: {
		primary: ['STR', 'CON'],
		secondary: ['DEX', 'WIS'],
		dump: ['INT', 'CHA']
	},
	rogue: {
		primary: ['DEX', 'INT'],
		secondary: ['CHA', 'WIS'],
		dump: ['STR', 'CON']
	},
	cleric: {
		primary: ['WIS', 'CON'],
		secondary: ['STR', 'CHA'],
		dump: ['DEX', 'INT']
	},
	wizard: {
		primary: ['INT', 'CON'],
		secondary: ['DEX', 'WIS'],
		dump: ['STR', 'CHA']
	},
	barbarian: {
		primary: ['STR', 'CON'],
		secondary: ['DEX', 'WIS'],
		dump: ['INT', 'CHA']
	},
	bard: {
		primary: ['CHA', 'DEX'],
		secondary: ['CON', 'WIS'],
		dump: ['STR', 'INT']
	},
	druid: {
		primary: ['WIS', 'CON'],
		secondary: ['DEX', 'INT'],
		dump: ['STR', 'CHA']
	},
	monk: {
		primary: ['DEX', 'WIS'],
		secondary: ['CON', 'STR'],
		dump: ['INT', 'CHA']
	},
	paladin: {
		primary: ['STR', 'CHA'],
		secondary: ['CON', 'WIS'],
		dump: ['DEX', 'INT']
	},
	ranger: {
		primary: ['DEX', 'WIS'],
		secondary: ['CON', 'STR'],
		dump: ['INT', 'CHA']
	},
	sorcerer: {
		primary: ['CHA', 'CON'],
		secondary: ['DEX', 'WIS'],
		dump: ['STR', 'INT']
	},
	warlock: {
		primary: ['CHA', 'CON'],
		secondary: ['DEX', 'WIS'],
		dump: ['STR', 'INT']
	}
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get ability priority for a class
 */
export function getClassPriority(classId: string, customPriority?: AbilityPriority): AbilityPriority {
	if (customPriority) {
		return customPriority;
	}
	return DEFAULT_CLASS_PRIORITIES[classId.toLowerCase()] || DEFAULT_CLASS_PRIORITIES['fighter']!;
}

/**
 * Optimize ability scores based on class priority (auto mode)
 * Assigns highest scores to primary abilities, lowest to dump stats
 */
export function optimizeAbilityScores(
	scores: number[],
	classId: string,
	customPriority?: AbilityPriority
): AbilityAssignmentResult {
	const priority = getClassPriority(classId, customPriority);
	const sortedScores = [...scores].sort((a, b) => b - a); // Highest first

	const assignments: Partial<AbilityScores> = {};
	const explanation: Record<AbilityName, string> = {} as Record<AbilityName, string>;
	let scoreIndex = 0;

	// Assign highest scores to primary abilities
	for (const ability of priority.primary) {
		if (scoreIndex < sortedScores.length) {
			assignments[ability] = sortedScores[scoreIndex]!;
			explanation[ability] = `En yüksek değer (primary stat)`;
			scoreIndex++;
		}
	}

	// Assign middle scores to secondary abilities
	for (const ability of priority.secondary) {
		if (scoreIndex < sortedScores.length) {
			assignments[ability] = sortedScores[scoreIndex]!;
			explanation[ability] = `Orta değer (secondary stat)`;
			scoreIndex++;
		}
	}

	// Assign lowest scores to dump stats
	for (const ability of priority.dump) {
		if (scoreIndex < sortedScores.length) {
			assignments[ability] = sortedScores[scoreIndex]!;
			explanation[ability] = `En düşük değer (dump stat)`;
			scoreIndex++;
		}
	}

	return {
		scores: assignments as AbilityScores,
		mode: 'auto',
		explanation
	};
}

/**
 * Suggest ability score assignments (suggested mode)
 * Returns suggestions that user can modify
 */
export function suggestAbilityScores(
	scores: number[],
	classId: string,
	customPriority?: AbilityPriority
): AbilitySuggestion[] {
	const priority = getClassPriority(classId, customPriority);
	const sortedScores = [...scores].sort((a, b) => b - a);

	const suggestions: AbilitySuggestion[] = [];
	let scoreIndex = 0;

	// Primary suggestions
	for (const ability of priority.primary) {
		if (scoreIndex < sortedScores.length) {
			suggestions.push({
				ability,
				suggestedScore: sortedScores[scoreIndex]!,
				reason: `${classId} için en önemli yetenek`,
				priority: 'primary'
			});
			scoreIndex++;
		}
	}

	// Secondary suggestions
	for (const ability of priority.secondary) {
		if (scoreIndex < sortedScores.length) {
			suggestions.push({
				ability,
				suggestedScore: sortedScores[scoreIndex]!,
				reason: `${classId} için faydalı yetenek`,
				priority: 'secondary'
			});
			scoreIndex++;
		}
	}

	// Dump suggestions
	for (const ability of priority.dump) {
		if (scoreIndex < sortedScores.length) {
			suggestions.push({
				ability,
				suggestedScore: sortedScores[scoreIndex]!,
				reason: `${classId} için düşük öncelikli`,
				priority: 'dump'
			});
			scoreIndex++;
		}
	}

	return suggestions;
}

/**
 * Convert suggestions to AbilityScores
 */
export function suggestionsToScores(suggestions: AbilitySuggestion[]): AbilityScores {
	const scores: Partial<AbilityScores> = {};
	for (const suggestion of suggestions) {
		scores[suggestion.ability] = suggestion.suggestedScore;
	}
	return scores as AbilityScores;
}

/**
 * Validate that all 6 abilities have been assigned
 */
export function validateAbilityAssignment(scores: Partial<AbilityScores>): boolean {
	const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
	return abilities.every(ability =>
		scores[ability] !== undefined && scores[ability]! >= 1 && scores[ability]! <= 20
	);
}

/**
 * Get explanation text for class ability priorities
 */
export function getClassPriorityExplanation(classId: string, customPriority?: AbilityPriority): string {
	const priority = getClassPriority(classId, customPriority);

	const primaryStr = priority.primary.join(', ');
	const secondaryStr = priority.secondary.join(', ');
	const dumpStr = priority.dump.join(', ');

	return `${classId.charAt(0).toUpperCase() + classId.slice(1)} için önerilen öncelik:
• Birincil (en yüksek): ${primaryStr}
• İkincil (orta): ${secondaryStr}  
• Düşük öncelik: ${dumpStr}`;
}
