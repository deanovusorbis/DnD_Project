/**
 * D&D Experiential Learning Platform - SRD Registry
 * Centralized data management for game content (Items, Spells, Classes, etc.)
 */

import { Item, Weapon, Armor } from '../../types/inventory.types';
import { Spell } from '../../types/spell.types';
import { Class } from '../../types/class.types';
import { Species } from '../../types/species.types';
import { BackgroundData } from '../../types/background.types';

// JSON Data Imports
import itemsData from '../../data/srd/items.json';
import spellsData from '../../data/srd/spells.json';
import classesData from '../../data/srd/classes.json';
import speciesData from '../../data/srd/species.json';
import backgroundsData from '../../data/srd/backgrounds.json';

class SRDRegistry {
	private items = new Map<string, Item>();
	private spells = new Map<string, Spell>();
	private classes = new Map<string, Class>();
	private species = new Map<string, Species>();
	private backgrounds = new Map<string, BackgroundData>();

	private initialized = false;

	constructor() {
		// Auto-initialize for now, or could be lazy
		this.initialize();
	}

	public initialize() {
		if (this.initialized) return;

		// Load Items (with normalization)
		(itemsData.items as any[]).forEach(raw => {
			const item = this.normalizeItem(raw);
			this.items.set(item.id, item);
		});

		// Load Spells
		(spellsData.spells as any[]).forEach(raw => {
			this.spells.set(raw.id, raw as Spell);
		});

		// Load Classes
		(classesData.classes as any[]).forEach(raw => {
			this.classes.set(raw.id, raw as Class);
		});

		// Load Species
		(speciesData.species as any[]).forEach(raw => {
			this.species.set(raw.id, raw as Species);
		});

		// Load Backgrounds
		(backgroundsData.backgrounds as any[]).forEach(raw => {
			this.backgrounds.set(raw.id, raw as BackgroundData);
		});

		this.initialized = true;
		console.log(`[Registry] Loaded ${this.items.size} items, ${this.spells.size} spells.`);
	}

	private normalizeItem(raw: any): Item {
		// Map Turkish types to English ItemType
		const typeMap: Record<string, any> = {
			'Silah': 'weapon',
			'Zırh': 'armor',
			'Tüketilebilir': 'adventuring gear', // Simplification
			'Eşya': 'adventuring gear',
			'other': 'wondrous item'
		};

		const type = typeMap[raw.type] || 'adventuring gear';

		if (type === 'weapon' && raw.weapon) {
			const weapon: Weapon = {
				id: raw.id,
				name: raw.name,
				type: 'weapon',
				rarity: this.normalizeRarity(raw.rarity),
				weight: raw.weight,
				cost: raw.cost,
				description: raw.description,
				weaponCategory: raw.weapon.category || 'simple',
				weaponRange: raw.weapon.properties?.includes('Ammunition') || raw.weapon.properties?.includes('Thrown') ? 'ranged' : 'melee',
				damage: {
					dice: raw.weapon.damage,
					type: raw.weapon.damageType || 'bludgeoning'
				},
				properties: raw.weapon.properties || []
			};
			return weapon;
		}

		if (type === 'armor' && raw.armor) {
			const armor: Armor = {
				id: raw.id,
				name: raw.name,
				type: 'armor',
				rarity: this.normalizeRarity(raw.rarity),
				weight: raw.weight,
				cost: raw.cost,
				description: raw.description,
				armorCategory: raw.armor.type || 'light',
				ac: {
					base: raw.armor.ac,
					modifier: raw.armor.dexBonus ? 'dex' : undefined,
					maxModifier: raw.armor.type === 'medium' ? 2 : undefined
				}
			};
			return armor;
		}

		return {
			id: raw.id,
			name: raw.name,
			type: type,
			rarity: this.normalizeRarity(raw.rarity),
			weight: raw.weight,
			cost: raw.cost,
			description: raw.description
		};
	}

	private normalizeRarity(rarity: string): any {
		const map: Record<string, string> = {
			'Yaygın': 'common',
			'Sıra Dışı': 'uncommon',
			'Nadir': 'rare',
			'Çok Nadir': 'very rare',
			'Efsanevi': 'legendary',
			'Common': 'common',
			'Uncommon': 'uncommon',
			'Rare': 'rare'
		};
		return map[rarity] || 'common';
	}

	// ACCESSORS
	public getItem(id: string): Item | undefined { return this.items.get(id); }
	public getWeapon(id: string): Weapon | undefined {
		const item = this.items.get(id);
		return item?.type === 'weapon' ? item as Weapon : undefined;
	}
	public getArmor(id: string): Armor | undefined {
		const item = this.items.get(id);
		return item?.type === 'armor' ? item as Armor : undefined;
	}

	public getSpell(id: string): Spell | undefined { return this.spells.get(id); }
	public getClass(id: string): Class | undefined { return this.classes.get(id); }
	public getSpecies(id: string): Species | undefined { return this.species.get(id); }
	public getBackground(id: string): BackgroundData | undefined { return this.backgrounds.get(id); }

	public getAllItems(): Item[] { return Array.from(this.items.values()); }
	public getAllSpells(): Spell[] { return Array.from(this.spells.values()); }
	public getAllClasses(): Class[] { return Array.from(this.classes.values()); }
	public getAllSpecies(): Species[] { return Array.from(this.species.values()); }
	public getAllBackgrounds(): BackgroundData[] { return Array.from(this.backgrounds.values()); }
}

export const registry = new SRDRegistry();
