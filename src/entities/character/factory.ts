/**
 * D&D Experiential Learning Platform - Character Factory
 * Handles creation of new characters and pre-generated templates.
 */

import {
	Character, CharacterCreationState, AbilityScores, AbilityName, SkillName
} from '@dnd/types/index';
import { Species } from '@dnd/types/species.types';
import { Class } from '@dnd/types/class.types';
import { BackgroundData } from '@dnd/types/background.types';

import {
	calculateModifiers,
	applyAbilityBonuses,
	calculateMaxHP,
	getProficiencyBonus,
} from '@utils/character.utils';
import { getSpellSlots } from '../../entities/magic/spellbook';

import {
	createDefaultInventory,
	getItem,
	getUnlockedFeatures,
	getClassResources,
	applySpeciesTrait
} from './logic';

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function buildCharacter(
	state: CharacterCreationState,
	species: Species,
	characterClass: Class,
	backgroundData?: BackgroundData,
	level: number = 1
): Character {
	if (!state.abilityAssignments || !state.characterName) {
		throw new Error('Character creation state is incomplete');
	}

	// 1. Ability Scores
	const baseScores: AbilityScores = state.abilityAssignments as AbilityScores;
	let finalScores = applyAbilityBonuses(baseScores, species.abilityScoreIncreases || []);

	if (state.backgroundAbilityAssignments) {
		finalScores = applyAbilityBonuses(finalScores, state.backgroundAbilityAssignments);
	}

	const modifiers = calculateModifiers(finalScores);

	// 2. Progression & Stats
	const proficiencyBonus = getProficiencyBonus(level);
	const proficientSaves = characterClass.proficiencies.savingThrows;

	// 3. Skills
	const backgroundSkills = backgroundData?.skills || [];
	const classSkillChoices: SkillName[] = state.skillChoices || [];
	const proficientSkills: SkillName[] = Array.from(new Set([...backgroundSkills, ...classSkillChoices]));

	// 4. Health
	const hitDieValue = parseInt(characterClass.hitDie.slice(1));
	const maxHP = calculateMaxHP(level, hitDieValue, modifiers.CON);

	// 5. Magic (Phase 1)
	let spellcastingData: Character['spellcasting'] = undefined;
	if (characterClass.spellcasting?.hasSpellcasting && characterClass.spellcasting.spellcastingAbility) {
		const ability = characterClass.spellcasting.spellcastingAbility;
		const slots = getSpellSlots(characterClass.id, level);
		const baseDc = 8 + proficiencyBonus;
		const mod = modifiers[ability] || 0;
		const dc = baseDc + mod;
		const attack = proficiencyBonus + mod;

		const choices = state.spellChoices?.find(c => c.classId === characterClass.id);
		const knownSpells = choices ? [...choices.cantrips, ...choices.level1] : [];
		const cantripsKnown = choices ? choices.cantrips : [];

		const preparedSpells = knownSpells.map(sid => ({
			spellId: sid, prepared: true, alwaysPrepared: false, source: 'class'
		}));

		spellcastingData = {
			spellcastingClasses: [{
				classId: characterClass.id,
				ability,
				spellSaveDC: dc,
				spellAttackBonus: attack
			}],
			spellSlots: slots,
			knownSpells,
			preparedSpells,
			cantripsKnown
		};
	}

	// 6. Build Object (Including Actor Interface)
	const character: Character = {
		id: `char-${Date.now()}`,
		name: state.characterName,
		type: 'player',
		size: species.size || 'medium', // Default to medium if missing
		source: 'srd',
		playerName: state.playerName,

		speciesId: state.selectedSpecies!,
		subspeciesId: state.selectedSubspecies,

		// Actor Implementation
		stats: {
			abilities: finalScores,
			modifiers,
			proficiencyBonus
		},

		health: {
			current: maxHP,
			max: maxHP,
			temp: 0,
			hitDice: [{
				total: level,
				current: level,
				size: characterClass.hitDie
			}],
			deathSaves: { successes: 0, failures: 0 }
		},

		defense: {
			armorClass: 10 + modifiers.DEX,
			resistances: [],
			immunities: [],
			vulnerabilities: []
		},

		speed: {
			walk: species.speed
		},
		conditions: [],
		effects: [],
		initiativeModifier: modifiers.DEX,
		tags: ['player'],

		// Character Specifics
		background: {
			backgroundId: state.selectedBackground!,
			feature: backgroundData?.feat?.name || '',
			personality: [],
			ideals: [],
			bonds: [],
			flaws: [],
			customizations: {
				tools: backgroundData?.toolProficiency ? [backgroundData.toolProficiency] : []
			}
		},

		progression: {
			totalLevel: level,
			classes: [{ classId: state.selectedClass!, level }],
			experiencePoints: 0,
			proficiencyBonus,
			featuresUnlocked: getUnlockedFeatures(characterClass, level),
			choicesMade: []
		},

		abilities: {
			scores: finalScores,
			modifiers,
			savingThrows: {
				proficient: proficientSaves,
				bonuses: {}
			}
		},

		spellcasting: spellcastingData,

		skills: {
			proficiencies: proficientSkills,
			expertise: [],
			bonuses: {}
		},

		hitPoints: {
			maximum: maxHP,
			current: maxHP,
			temporary: 0,
			hitDice: [{
				total: level,
				remaining: level,
				dieType: characterClass.hitDie
			}]
		},

		defenses: {
			armorClass: 10 + modifiers.DEX,
			acCalculation: {
				base: 10,
				dexBonus: modifiers.DEX,
				otherBonuses: []
			},
			resistances: [],
			immunities: [],
			vulnerabilities: []
		},

		initiative: modifiers.DEX,
		classResources: getClassResources(characterClass, level, modifiers),
		inventory: createDefaultInventory(),

		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		isPregen: false
	};

	// Apply species traits
	for (const trait of species.traits) {
		applySpeciesTrait(character, trait);
	}

	return character;
}

// ============================================================================
// PREGEN GENERATORS
// ============================================================================

export function createPregenFighter(): Character {
	const now = new Date().toISOString();

	// Stats
	const abilities = {
		scores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 8 },
		modifiers: { STR: 3, DEX: 2, CON: 2, INT: 0, WIS: 1, CHA: -1 },
		savingThrows: {
			proficient: ['STR', 'CON'] as AbilityName[],
			bonuses: {}
		}
	};

	return {
		id: 'pregen-fighter-1',
		name: 'Aldric',
		type: 'player',
		size: 'medium',
		source: 'srd',
		playerName: undefined,

		speciesId: 'human',

		// Actor Implementation
		stats: {
			abilities: abilities.scores,
			modifiers: { STR: 3, DEX: 2, CON: 2, INT: 0, WIS: 1, CHA: -1 },
			proficiencyBonus: 2
		},
		health: {
			current: 12,
			max: 12,
			temp: 0,
			hitDice: [{ total: 1, current: 1, size: 'd10' }],
			deathSaves: { successes: 0, failures: 0 }
		},
		defense: {
			armorClass: 18,
			resistances: [],
			immunities: [],
			vulnerabilities: []
		},
		speed: { walk: 30 },
		conditions: [],
		effects: [],
		initiativeModifier: 2,
		tags: ['pregen', 'fighter'],

		// Character Specifics
		background: {
			backgroundId: 'soldier',
			feature: 'Military Rank',
			personality: ['I face problems head-on.'],
			ideals: ['Greater Good.'],
			bonds: ['I fight for those who cannot fight for themselves.'],
			flaws: ['I have little respect for anyone who is not a warrior.']
		},

		progression: {
			totalLevel: 1,
			classes: [{ classId: 'fighter', level: 1 }],
			experiencePoints: 0,
			proficiencyBonus: 2,
			featuresUnlocked: ['fighting-style-fighter', 'second-wind'],
			choicesMade: [{ featureId: 'fighting-style-fighter', choiceId: 'defense' }]
		},

		abilities,
		skills: {
			proficiencies: ['athletics', 'intimidation'],
			expertise: [],
			bonuses: {}
		},
		hitPoints: {
			maximum: 12,
			current: 12,
			temporary: 0,
			hitDice: [{ total: 1, remaining: 1, dieType: 'd10' }]
		},
		defenses: {
			armorClass: 18,
			acCalculation: { base: 16, shield: 2, dexBonus: 0, otherBonuses: [] },
			resistances: [],
			immunities: [],
			vulnerabilities: []
		},
		initiative: 2,

		classResources: [{
			resourceId: 'second-wind',
			name: 'Second Wind',
			current: 1,
			maximum: 1
		}],

		inventory: {
			items: [
				{ item: getItem('chain_mail'), quantity: 1, equipped: true },
				{ item: getItem('shield'), quantity: 1, equipped: true },
				{ item: getItem('longsword'), quantity: 1, equipped: true },
				{ item: getItem('handaxe'), quantity: 2, equipped: false }
			],
			currency: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
			maxCarryWeight: 240,
			currentWeight: 92,
			encumbranceLevel: 'none'
		},

		createdAt: now,
		updatedAt: now,
		isPregen: true
	};
}

export function createPregenRogue(): Character {
	const now = new Date().toISOString();

	const abilities = {
		scores: { STR: 8, DEX: 17, CON: 12, INT: 14, WIS: 10, CHA: 14 },
		modifiers: { STR: -1, DEX: 3, CON: 1, INT: 2, WIS: 0, CHA: 2 },
		savingThrows: {
			proficient: ['DEX', 'INT'] as AbilityName[],
			bonuses: {}
		}
	};

	return {
		id: 'pregen-rogue-1',
		name: 'Lyra',
		type: 'player',
		size: 'medium',
		source: 'srd',
		playerName: undefined,
		speciesId: 'elf',
		subspeciesId: 'high-elf',

		// Actor Implementation
		stats: {
			abilities: abilities.scores,
			modifiers: { STR: -1, DEX: 3, CON: 1, INT: 2, WIS: 0, CHA: 2 },
			proficiencyBonus: 2
		},
		health: {
			current: 9,
			max: 9,
			temp: 0,
			hitDice: [{ total: 1, current: 1, size: 'd8' }],
			deathSaves: { successes: 0, failures: 0 }
		},
		defense: {
			armorClass: 14,
			resistances: [],
			immunities: [],
			vulnerabilities: []
		},
		speed: { walk: 30 },
		conditions: [],
		effects: [],
		initiativeModifier: 3,
		tags: ['pregen', 'rogue'],

		background: {
			backgroundId: 'criminal',
			feature: 'Criminal Contact',
			personality: ['I always have a plan.'],
			ideals: ['Freedom.'],
			bonds: ['Someone I loved died because of a mistake I made.'],
			flaws: ['When I see something valuable...']
		},

		progression: {
			totalLevel: 1,
			classes: [{ classId: 'rogue', level: 1 }],
			experiencePoints: 0,
			proficiencyBonus: 2,
			featuresUnlocked: ['expertise-rogue', 'sneak-attack', 'thieves-cant'],
			choicesMade: []
		},

		abilities,
		skills: {
			proficiencies: ['acrobatics', 'deception', 'perception', 'stealth', 'sleight_of_hand'],
			expertise: ['stealth', 'sleight_of_hand'],
			bonuses: {}
		},
		hitPoints: {
			maximum: 9,
			current: 9,
			temporary: 0,
			hitDice: [{ total: 1, remaining: 1, dieType: 'd8' }]
		},
		defenses: {
			armorClass: 14,
			acCalculation: { base: 11, armor: 11, dexBonus: 3, otherBonuses: [] },
			resistances: [],
			immunities: [],
			vulnerabilities: []
		},
		initiative: 3,

		classResources: [{
			resourceId: 'sneak-attack',
			name: 'Sneak Attack',
			current: 1,
			maximum: 1
		}],

		inventory: {
			items: [
				{ item: getItem('leather_armor'), quantity: 1, equipped: true },
				{ item: getItem('rapier'), quantity: 1, equipped: true },
				{ item: getItem('shortbow'), quantity: 1, equipped: false },
				{ item: getItem('arrow'), quantity: 20, equipped: false },
				{ item: getItem('dagger'), quantity: 2, equipped: false },
				{ item: getItem('thieves_tools'), quantity: 1, equipped: false }
			],
			currency: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
			maxCarryWeight: 120,
			currentWeight: 45,
			encumbranceLevel: 'none'
		},

		createdAt: now,
		updatedAt: now,
		isPregen: true
	};
}

export function createPregenCleric(): Character {
	const now = new Date().toISOString();

	const abilities = {
		scores: { STR: 14, DEX: 8, CON: 16, INT: 10, WIS: 16, CHA: 12 },
		modifiers: { STR: 2, DEX: -1, CON: 3, INT: 0, WIS: 3, CHA: 1 },
		savingThrows: {
			proficient: ['WIS', 'CHA'] as AbilityName[],
			bonuses: {}
		}
	};

	return {
		id: 'pregen-cleric-1',
		name: 'Brother Marcus',
		type: 'player',
		size: 'medium',
		source: 'srd',
		playerName: undefined,
		speciesId: 'dwarf',
		subspeciesId: 'hill-dwarf',

		// Actor Implementation
		stats: {
			abilities: abilities.scores,
			modifiers: { STR: 2, DEX: -1, CON: 3, INT: 0, WIS: 3, CHA: 1 },
			proficiencyBonus: 2
		},
		health: {
			current: 12,
			max: 12,
			temp: 0,
			hitDice: [{ total: 1, current: 1, size: 'd8' }],
			deathSaves: { successes: 0, failures: 0 }
		},
		defense: {
			armorClass: 18,
			resistances: ['poison'] as any[],
			immunities: [],
			vulnerabilities: []
		},
		speed: { walk: 25 },
		conditions: [],
		effects: [],
		initiativeModifier: -1,
		tags: ['pregen', 'cleric'],

		background: {
			backgroundId: 'acolyte',
			feature: 'Shelter of the Faithful',
			personality: ['I see omens in every event and action.'],
			ideals: ['Charity.'],
			bonds: ['I owe my life to the priest who took me in.'],
			flaws: ['I am inflexible in my thinking.']
		},

		progression: {
			totalLevel: 1,
			classes: [{ classId: 'cleric', subclassId: 'life-domain', level: 1 }],
			experiencePoints: 0,
			proficiencyBonus: 2,
			featuresUnlocked: ['spellcasting-cleric', 'divine-domain', 'bonus-proficiency-life', 'disciple-of-life'],
			choicesMade: []
		},

		abilities,
		skills: {
			proficiencies: ['history', 'insight', 'medicine', 'religion'],
			expertise: [],
			bonuses: {}
		},
		hitPoints: {
			maximum: 12,
			current: 12,
			temporary: 0,
			hitDice: [{ total: 1, remaining: 1, dieType: 'd8' }]
		},
		defenses: {
			armorClass: 18,
			acCalculation: { base: 16, shield: 2, dexBonus: 0, otherBonuses: [] },
			resistances: ['poison'] as any[],
			immunities: [],
			vulnerabilities: []
		},
		initiative: -1,

		classResources: [{
			resourceId: 'channel-divinity',
			name: 'Channel Divinity',
			current: 1,
			maximum: 1
		}],

		inventory: {
			items: [
				{ item: getItem('chain_mail'), quantity: 1, equipped: true },
				{ item: getItem('shield'), quantity: 1, equipped: true },
				{ item: getItem('mace'), quantity: 1, equipped: true },
				{ item: getItem('holy_symbol'), quantity: 1, equipped: true }
			],
			currency: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
			maxCarryWeight: 210,
			currentWeight: 78,
			encumbranceLevel: 'none'
		},

		spellcasting: {
			spellcastingClasses: [{
				classId: 'cleric',
				ability: 'WIS',
				spellSaveDC: 13,
				spellAttackBonus: 5
			}],
			spellSlots: [{ level: 1, total: 2, expended: 0 }],
			knownSpells: [],
			preparedSpells: [
				{ spellId: 'bless', prepared: true, alwaysPrepared: true, source: 'domain' },
				{ spellId: 'cure-wounds', prepared: true, alwaysPrepared: true, source: 'domain' },
				{ spellId: 'healing-word', prepared: true, alwaysPrepared: false, source: 'class' },
				{ spellId: 'guiding-bolt', prepared: true, alwaysPrepared: false, source: 'class' },
				{ spellId: 'sanctuary', prepared: true, alwaysPrepared: false, source: 'class' }
			],
			cantripsKnown: ['sacred-flame', 'spare-the-dying', 'thaumaturgy']
		},

		createdAt: now,
		updatedAt: now,
		isPregen: true
	};
}
