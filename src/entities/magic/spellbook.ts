/**
 * D&D Experiential Learning Platform - Spellbook Management
 * Handles spell slots, known spells, and preparation logic
 */

// Bypassing import error by defining local types
// TODO: Fix import resolution for this file
export interface SpellSlot {
	level: number;
	total: number;
	expended: number;
}

export type AbilityName = string;

// ============================================================================
// SPELL SLOT CALCULATION
// ============================================================================

/**
 * Calculate spell slots for a single class at a specific level
 * Based on 2024 PHB Standard Progression
 */
export function getSpellSlots(
	className: string,
	level: number
): SpellSlot[] {
	// Standard full caster progression (Wizard, Sorcerer, Bard, Cleric, Druid)
	if (['wizard', 'sorcerer', 'bard', 'cleric', 'druid'].includes(className)) {
		return getFullCasterSlots(level);
	}
	// Half caster (Paladin, Ranger) - start at level 2
	if (['paladin', 'ranger'].includes(className)) {
		return getHalfCasterSlots(level);
	}
	// Warlock (Pact Magic) is special, handled separately
	if (className === 'warlock') {
		return []; // Warlock slots are distinct from "Spellcasting" slots
	}
	// 1/3 Caster (Eldritch Knight, Arcane Trickster) - start at level 3
	if (['fighter', 'rogue'].includes(className)) {
		// Only if subclass matches, but for base logic we return empty for now
		// This would need subclass context
		return [];
	}

	return [];
}

function getFullCasterSlots(level: number): SpellSlot[] {
	const slots: SpellSlot[] = [];

	// Level 1
	if (level >= 1) slots.push({ level: 1, total: 2, expended: 0 });
	if (level >= 2 && slots[0]) slots[0].total = 3;
	if (level >= 3 && slots[0]) slots[0].total = 4;

	// Level 2
	if (level >= 3) slots.push({ level: 2, total: 2, expended: 0 });
	if (level >= 4 && slots[1]) slots[1].total = 3;

	// Level 3
	if (level >= 5) slots.push({ level: 3, total: 2, expended: 0 });
	if (level >= 6 && slots[2]) slots[2].total = 3;

	// Level 4
	if (level >= 7) slots.push({ level: 4, total: 1, expended: 0 });
	if (level >= 8 && slots[3]) slots[3].total = 2;
	if (level >= 9 && slots[3]) slots[3].total = 3;

	// Level 5
	if (level >= 9) slots.push({ level: 5, total: 1, expended: 0 });
	if (level >= 10 && slots[4]) slots[4].total = 2;
	if (level >= 18 && slots[4]) slots[4].total = 3;

	// Level 6
	if (level >= 11) slots.push({ level: 6, total: 1, expended: 0 });
	if (level >= 19 && slots[5]) slots[5].total = 2;

	// Level 7
	if (level >= 13) slots.push({ level: 7, total: 1, expended: 0 });
	if (level >= 20 && slots[6]) slots[6].total = 2;

	// Level 8
	if (level >= 15) slots.push({ level: 8, total: 1, expended: 0 });

	// Level 9
	if (level >= 17) slots.push({ level: 9, total: 1, expended: 0 });

	return slots;
}

function getHalfCasterSlots(level: number): SpellSlot[] {
	if (level < 2) return [];
	// Half casters roughly follow full caster progression / 2 (rounded up)
	return getFullCasterSlots(Math.ceil(level / 2));
}

// ============================================================================
// KNOWN / PREPARED SPELLS LIMITS
// ============================================================================

export function getCantripsKnownCount(className: string, level: number): number {
	if (['cleric', 'wizard', 'druid'].includes(className)) {
		if (level < 4) return 3;
		if (level < 10) return 4;
		return 5;
	}
	if (['bard', 'sorcerer', 'warlock'].includes(className)) {
		if (level < 4) return 2;
		if (level < 10) return 3;
		return 4;
	}
	// Paladin/Ranger usually 0 (2014) or 2 via fighting style (2024 updates gave Paladins cantrips? No, only specific styles)
	// 2024 PHB: Paladins get spellcasting at level 1, but NO cantrips by default unless Fighting Style.
	return 0;
}

export function getKnownSpellsCount(
	className: string,
	level: number,
	abilityMod: number
): number {
	// Known Casters (Bard, Sorcerer, Warlock, Ranger)
	if (className === 'bard') {
		if (level === 1) return 4;
		if (level === 2) return 5;
		if (level === 3) return 6;
		// Simplified curve
		return Math.min(22, 4 + (level - 1));
	}
	if (className === 'sorcerer') {
		if (level === 1) return 2;
		if (level === 2) return 3;
		return Math.min(15, 1 + level); // Very roughly
	}
	// Prepared Casters (Cleric, Druid, Wizard, Paladin)
	// Return max prepared spells for them
	if (['cleric', 'druid', 'wizard'].includes(className)) {
		return Math.max(1, level + abilityMod);
	}
	if (className === 'paladin') {
		return Math.max(1, Math.floor(level / 2) + abilityMod);
	}

	return 0;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface SpellSelectionResult {
	isValid: boolean;
	errors: string[];
}

export function validateSpellSelection(
	className: string,
	level: number,
	abilityMod: number,
	cantrips: string[],
	spells: string[]
): SpellSelectionResult {
	const errors: string[] = [];
	const maxCantrips = getCantripsKnownCount(className, level);
	const maxSpells = getKnownSpellsCount(className, level, abilityMod);

	if (cantrips.length > maxCantrips) {
		errors.push(`Too many cantrips selected. Max: ${maxCantrips}`);
	}

	// For Wizard, 'known spells' in book start at 6, but prepared is diff.
	// This function assumes "Spells Prepared/Known for the Day" context or "Creation" context?
	// Let's assume Creation Context for Level 1.

	if (className === 'wizard' && level === 1) {
		// Wizard starts with 6 spells in book
		if (spells.length > 6) {
			errors.push(`Wizards start with 6 spells in their spellbook. You selected ${spells.length}.`);
		}
	} else {
		if (spells.length > maxSpells) {
			errors.push(`Too many spells selected. Max: ${maxSpells}`);
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
