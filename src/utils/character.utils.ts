/**
 * D&D Experiential Learning Platform - Character Utilities
 * Helper functions for character creation and management
 */

import {
	AbilityScores, AbilityModifiers, AbilityName, SkillName,
	SKILL_ABILITY_MAP
} from '../types';
import { getAbilityModifier } from '@engine/core/dice';

// ============================================================================
// ABILITY SCORE UTILITIES
// ============================================================================

/**
 * Calculate all ability modifiers from ability scores
 */
export function calculateModifiers(scores: AbilityScores): AbilityModifiers {
	return {
		STR: getAbilityModifier(scores.STR),
		DEX: getAbilityModifier(scores.DEX),
		CON: getAbilityModifier(scores.CON),
		INT: getAbilityModifier(scores.INT),
		WIS: getAbilityModifier(scores.WIS),
		CHA: getAbilityModifier(scores.CHA)
	};
}

/**
 * Apply ability score increases (from species, etc.)
 */
export function applyAbilityBonuses(
	baseScores: AbilityScores,
	bonuses: { ability: AbilityName; bonus: number }[]
): AbilityScores {
	const result = { ...baseScores };
	for (const { ability, bonus } of bonuses) {
		result[ability] = Math.min(20, result[ability] + bonus);
	}
	return result;
}

// ============================================================================
// SKILL UTILITIES
// ============================================================================

/**
 * Calculate skill bonus for a given skill
 */
export function calculateSkillBonus(
	skill: SkillName,
	modifiers: AbilityModifiers,
	proficiencyBonus: number,
	isProficient: boolean,
	hasExpertise: boolean = false
): number {
	const ability = SKILL_ABILITY_MAP[skill];
	const abilityMod = modifiers[ability];

	if (hasExpertise) {
		return abilityMod + (proficiencyBonus * 2);
	} else if (isProficient) {
		return abilityMod + proficiencyBonus;
	}
	return abilityMod;
}

/**
 * Get all skill bonuses for a character
 */
export function calculateAllSkillBonuses(
	modifiers: AbilityModifiers,
	proficiencyBonus: number,
	proficientSkills: SkillName[],
	expertiseSkills: SkillName[] = []
): Record<SkillName, number> {
	const skills = Object.keys(SKILL_ABILITY_MAP) as SkillName[];
	const result = {} as Record<SkillName, number>;

	for (const skill of skills) {
		result[skill] = calculateSkillBonus(
			skill,
			modifiers,
			proficiencyBonus,
			proficientSkills.includes(skill),
			expertiseSkills.includes(skill)
		);
	}

	return result;
}

// ============================================================================
// SAVING THROW UTILITIES
// ============================================================================

/**
 * Calculate saving throw bonus for an ability
 */
export function calculateSavingThrowBonus(
	ability: AbilityName,
	modifiers: AbilityModifiers,
	proficiencyBonus: number,
	proficientSaves: AbilityName[]
): number {
	const abilityMod = modifiers[ability];
	if (proficientSaves.includes(ability)) {
		return abilityMod + proficiencyBonus;
	}
	return abilityMod;
}

/**
 * Get all saving throw bonuses
 */
export function calculateAllSavingThrows(
	modifiers: AbilityModifiers,
	proficiencyBonus: number,
	proficientSaves: AbilityName[]
): Record<AbilityName, number> {
	const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
	const result = {} as Record<AbilityName, number>;

	for (const ability of abilities) {
		result[ability] = calculateSavingThrowBonus(
			ability,
			modifiers,
			proficiencyBonus,
			proficientSaves
		);
	}

	return result;
}

// ============================================================================
// HIT POINTS UTILITIES
// ============================================================================

/**
 * Calculate maximum hit points at level 1
 */
export function calculateLevel1HP(hitDie: number, conModifier: number): number {
	return hitDie + conModifier;
}

/**
 * Calculate hit points gained at level up (average method)
 */
export function calculateLevelUpHPAverage(hitDie: number, conModifier: number): number {
	const dieAverage = Math.floor(hitDie / 2) + 1;
	return dieAverage + conModifier;
}

/**
 * Calculate total max HP for a given level
 */
export function calculateMaxHP(
	level: number,
	hitDie: number,
	conModifier: number,
	useAverage: boolean = true
): number {
	if (level < 1) return 0;

	// Level 1: max hit die + CON
	let hp = calculateLevel1HP(hitDie, conModifier);

	// Additional levels
	for (let i = 2; i <= level; i++) {
		if (useAverage) {
			hp += calculateLevelUpHPAverage(hitDie, conModifier);
		} else {
			// For random, we'd need to track each roll - this returns expected value
			hp += calculateLevelUpHPAverage(hitDie, conModifier);
		}
	}

	return Math.max(1, hp); // Minimum 1 HP
}

// ============================================================================
// ARMOR CLASS UTILITIES
// ============================================================================

export type ArmorFormula =
	| { type: 'unarmored'; base: number; addDex: boolean; maxDex?: number }
	| { type: 'light'; baseAC: number }
	| { type: 'medium'; baseAC: number; maxDex: number }
	| { type: 'heavy'; baseAC: number };

/**
 * Calculate AC based on armor type and DEX modifier
 */
export function calculateAC(
	formula: ArmorFormula,
	dexModifier: number,
	hasShield: boolean = false,
	otherBonuses: number = 0
): number {
	let ac = 0;

	switch (formula.type) {
		case 'unarmored':
			ac = formula.base;
			if (formula.addDex) {
				ac += formula.maxDex !== undefined
					? Math.min(dexModifier, formula.maxDex)
					: dexModifier;
			}
			break;
		case 'light':
			ac = formula.baseAC + dexModifier;
			break;
		case 'medium':
			ac = formula.baseAC + Math.min(dexModifier, formula.maxDex);
			break;
		case 'heavy':
			ac = formula.baseAC;
			break;
	}

	if (hasShield) ac += 2;
	ac += otherBonuses;

	return ac;
}

// ============================================================================
// PROFICIENCY BONUS
// ============================================================================

/**
 * Get proficiency bonus for a given level
 */
export function getProficiencyBonus(level: number): number {
	if (level < 1) return 2;
	if (level <= 4) return 2;
	if (level <= 8) return 3;
	if (level <= 12) return 4;
	if (level <= 16) return 5;
	return 6;
}

// ============================================================================
// SPELL UTILITIES
// ============================================================================

/**
 * Calculate spell save DC
 */
export function calculateSpellSaveDC(
	spellcastingAbility: AbilityName,
	modifiers: AbilityModifiers,
	proficiencyBonus: number
): number {
	return 8 + proficiencyBonus + modifiers[spellcastingAbility];
}

/**
 * Calculate spell attack bonus
 */
export function calculateSpellAttackBonus(
	spellcastingAbility: AbilityName,
	modifiers: AbilityModifiers,
	proficiencyBonus: number
): number {
	return proficiencyBonus + modifiers[spellcastingAbility];
}

// ============================================================================
// ENCUMBRANCE
// ============================================================================

/**
 * Calculate carrying capacity
 */
export function calculateCarryingCapacity(strengthScore: number): number {
	return strengthScore * 15;
}

/**
 * Check encumbrance status (variant rule)
 */
export function checkEncumbrance(
	currentWeight: number,
	strengthScore: number
): 'normal' | 'encumbered' | 'heavily_encumbered' | 'over_capacity' {
	const capacity = calculateCarryingCapacity(strengthScore);

	if (currentWeight > capacity) return 'over_capacity';
	if (currentWeight > strengthScore * 10) return 'heavily_encumbered';
	if (currentWeight > strengthScore * 5) return 'encumbered';
	return 'normal';
}

// ============================================================================
// XP AND LEVELING
// ============================================================================

const XP_THRESHOLDS = [
	0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
	85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

/**
 * Get level from XP total
 */
export function getLevelFromXP(xp: number): number {
	for (let level = 19; level >= 0; level--) {
		if (xp >= (XP_THRESHOLDS[level] ?? 0)) {
			return level + 1;
		}
	}
	return 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
	if (currentLevel >= 20) return 0;
	return XP_THRESHOLDS[currentLevel] ?? 0;
}

/**
 * Calculate XP progress to next level
 */
export function getXPProgress(xp: number): {
	currentLevel: number;
	xpIntoLevel: number;
	xpForNextLevel: number;
	percentComplete: number;
} {
	const currentLevel = getLevelFromXP(xp);
	const currentThreshold = XP_THRESHOLDS[currentLevel - 1] ?? 0;
	const nextThreshold = XP_THRESHOLDS[currentLevel] ?? currentThreshold;

	const xpIntoLevel = xp - currentThreshold;
	const xpForNextLevel = nextThreshold - currentThreshold;
	const percentComplete = xpForNextLevel > 0
		? Math.floor((xpIntoLevel / xpForNextLevel) * 100)
		: 100;

	return {
		currentLevel,
		xpIntoLevel,
		xpForNextLevel,
		percentComplete
	};
}
