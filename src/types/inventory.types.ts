import type { DamageType } from './core.types';

export type ItemType = 'weapon' | 'armor' | 'potion' | 'scroll' | 'wand' | 'ring' | 'rod' | 'staff' | 'wondrous item' | 'adventuring gear' | 'tool' | 'mount' | 'vehicle' | 'trade good' | 'gemstone' | 'art object';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';

export interface Currency {
	platinum: number;
	gold: number;
	electrum: number;
	silver: number;
	copper: number;
}

export interface Cost {
	quantity: number;
	unit: 'cp' | 'sp' | 'ep' | 'gp' | 'pp';
}

export interface Item {
	id: string;
	name: string;
	type: ItemType;
	rarity: Rarity;
	weight: number; // in lbs
	cost?: Cost;
	description?: string;
	source?: string; // e.g. "PHB'24", "DMG"
}

export interface WeaponPropertyDefinition {
	id: string;
	name: string;
	description?: string;
}

export interface Weapon extends Item {
	type: 'weapon';
	weaponCategory: 'simple' | 'martial';
	weaponRange: 'melee' | 'ranged';
	damage: {
		dice: string; // e.g. "1d8"
		type: DamageType;
		versatileDice?: string; // e.g. "1d10"
	};
	range?: {
		normal: number;
		long?: number;
	};
	properties: string[]; // List of property IDs (e.g. "light", "finesse")
}

export interface Armor extends Item {
	type: 'armor';
	armorCategory: 'light' | 'medium' | 'heavy' | 'shield';
	ac: {
		base: number;
		modifier?: 'dex'; // Some medium armors limit dex, heavy assumes none
		maxModifier?: number; // e.g. 2 for medium armor
	};
	strengthRequirement?: number;
	stealthDisadvantage?: boolean;
}

export interface InventoryItem {
	item: Item | Weapon | Armor;
	quantity: number;
	equipped: boolean;
	attuned?: boolean;
}

export interface CharacterInventory {
	items: InventoryItem[];
	currency: Currency;
	maxCarryWeight: number; // Calculated based on STR
	currentWeight: number;
	encumbranceLevel: 'none' | 'encumbered' | 'heavily encumbered';
}
