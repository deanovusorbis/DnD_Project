/**
 * D&D Experiential Learning Platform - Character Logic
 * Rules, calculations, and utility functions for character management.
 */

import { Character } from '../../types/character.types';
import { AbilityName, SkillName } from '../../types/core.types';
import { CharacterInventory, Item } from '../../types/inventory.types';
import { SpeciesTrait } from '../../types/species.types';
import { Class, ClassFeature } from '../../types/class.types';
// import { getAbilityModifier, validatePointBuy } from '@engine/core/dice';
import {
	getProficiencyBonus,
} from '@utils/character.utils';

import { items as itemsData } from '../../data/srd/items/index';
const itemsDb = itemsData as unknown as Item[];

// ============================================================================
// DATA ACCESS & UTILS
// ============================================================================

export function getItem(id: string): Item {
	const item = itemsDb.find(i => i.id === id);
	if (!item) {
		console.warn(`Item not found: ${id}`);
		return {
			id,
			name: 'Unknown Item',
			type: 'adventuring gear',
			rarity: 'common',
			weight: 0
		} as Item;
	}
	return item;
}

export function createDefaultInventory(): CharacterInventory {
	return {
		items: [],
		currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
		maxCarryWeight: 150, // Will be calculated based on STR
		currentWeight: 0,
		encumbranceLevel: 'none'
	};
}

// ============================================================================
// RULE CALCULATIONS
// ============================================================================

export function getUnlockedFeatures(characterClass: Class, level: number): string[] {
	return characterClass.features
		.filter((f: ClassFeature) => f.level <= level)
		.map((f: ClassFeature) => f.id);
}

export function getClassResources(
	characterClass: Class,
	level: number,
	modifiers: Record<AbilityName, number>
): Character['classResources'] {
	const resources: Character['classResources'] = [];

	for (const feature of characterClass.features) {
		if (feature.level > level) continue;
		if (!feature.resource) continue;

		let maxCount: number;

		if (typeof feature.resource.maxCount === 'number') {
			maxCount = feature.resource.maxCount;
		} else if (feature.resource.maxCount === 'proficiency') {
			maxCount = getProficiencyBonus(level);
		} else if (feature.resource.maxCount === 'ability_mod' && feature.resource.abilityModifier) {
			const mod = modifiers[feature.resource.abilityModifier];
			maxCount = Math.max(1, mod !== undefined ? mod : 0);
		} else {
			maxCount = 1;
		}

		resources.push({
			resourceId: feature.id,
			name: feature.resource.name,
			current: maxCount,
			maximum: maxCount
		});
	}

	return resources;
}

export function applySpeciesTrait(character: Character, trait: SpeciesTrait): void {
	// Apply darkvision
	if (trait.grantsDarkvision) {
		// Would add to senses
	}

	// Apply resistances
	if (trait.grantsResistance) {
		character.defenses.resistances.push(...trait.grantsResistance);
		// Sync with Actor interface
		if (character.defense) {
			character.defense.resistances.push(...trait.grantsResistance);
		}
	}

	// Apply skill proficiencies
	if (trait.grantsProficiency?.skills) {
		for (const skill of trait.grantsProficiency.skills) {
			if (!character.skills.proficiencies.includes(skill as SkillName)) {
				character.skills.proficiencies.push(skill as SkillName);
			}
		}
	}

	// Apply speed bonuses
	if (trait.grantsSpeed) {
		const speedType = trait.grantsSpeed.type;
		if (speedType === 'walk') {
			// Modify base speed
		} else {
			character.speed[speedType as keyof typeof character.speed] = trait.grantsSpeed.value;
			// Sync with Actor interface
			if (character.speed) {
				character.speed[speedType as keyof typeof character.speed] = trait.grantsSpeed.value;
			}
		}
	}
}

// ============================================================================
// STATE MUTATIONS
// ============================================================================

export function hasResource(
	character: Character,
	resourceId: string,
	amount: number = 1
): boolean {
	const resource = character.classResources.find(r => r.resourceId === resourceId);
	return resource ? resource.current >= amount : false;
}

export function useResource(
	character: Character,
	resourceId: string,
	amount: number = 1
): Character {
	const updated = { ...character };

	updated.classResources = character.classResources.map(resource => {
		if (resource.resourceId !== resourceId) return resource;

		return {
			...resource,
			current: Math.max(0, resource.current - amount)
		};
	});

	updated.updatedAt = new Date().toISOString();
	return updated;
}

export function takeShortRest(character: Character): Character {
	const updated = { ...character };

	updated.classResources = character.classResources.map(resource => {
		// Check if this resource recovers on short rest
		// Would need to look up the feature definition
		return resource;
	});

	updated.updatedAt = new Date().toISOString();
	return updated;
}

export function takeLongRest(character: Character): Character {
	const updated = { ...character };

	// Restore HP to maximum
	updated.hitPoints = {
		...character.hitPoints,
		current: character.hitPoints.maximum,
		temporary: 0
	};
	if (updated.health) {
		updated.health.current = updated.hitPoints.maximum;
		updated.health.temp = 0;
	}

	// Restore hit dice
	updated.hitPoints.hitDice = character.hitPoints.hitDice.map(hd => ({
		...hd,
		remaining: Math.min(hd.total, hd.remaining + Math.max(1, Math.floor(hd.total / 2)))
	}));

	// Restore all class resources
	updated.classResources = character.classResources.map(resource => ({
		...resource,
		current: resource.maximum
	}));

	// Restore spell slots
	if (updated.spellcasting) {
		updated.spellcasting = {
			...character.spellcasting!,
			spellSlots: character.spellcasting!.spellSlots.map(slot => ({
				...slot,
				expended: 0
			}))
		};
	}

	updated.updatedAt = new Date().toISOString();
	return updated;
}
