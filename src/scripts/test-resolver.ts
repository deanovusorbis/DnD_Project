import { resolveAction } from '../engine/rules/resolver';
import { /* GameAction, */ AttackAction } from '../engine/core/actions';
import { Actor } from '../types/actor.types';
// import { Character } from '../types/character.types';

// Mock Actor
const mockActor: Actor = {
	id: 'hero',
	name: 'Hero',
	type: 'player',
	size: 'medium',
	source: 'official',
	stats: {
		abilities: { STR: 18, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 10 },
		modifiers: { STR: 4, DEX: 2, CON: 2, INT: 0, WIS: 0, CHA: 0 },
		proficiencyBonus: 2
	},
	health: { current: 10, max: 10, temp: 0 },
	defense: { armorClass: 15, resistances: [], immunities: [], vulnerabilities: [] },
	speed: { walk: 30 },
	conditions: [],
	initiativeModifier: 2
};

const mockTarget: Actor = {
	id: 'goblin',
	name: 'Goblin',
	type: 'monster',
	size: 'small',
	source: 'official',
	stats: {
		abilities: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 10, CHA: 10 },
		modifiers: { STR: -1, DEX: 2, CON: 0, INT: 0, WIS: 0, CHA: 0 },
		proficiencyBonus: 2
	},
	health: { current: 7, max: 7, temp: 0 },
	defense: { armorClass: 15, resistances: [], immunities: [], vulnerabilities: [] },
	speed: { walk: 30 },
	conditions: [],
	initiativeModifier: 2
};

const action: AttackAction = {
	type: 'attack',
	actorId: 'hero',
	timestamp: Date.now(),
	weaponId: 'longsword',
	targetId: 'goblin',
	attackType: 'melee'
};

const context = {
	actors: new Map([['hero', mockActor], ['goblin', mockTarget]])
};

try {
	const result = resolveAction(action, context);
	console.log('Action Resolved:', result.narration);
	console.log('Success:', result.success);
} catch (error) {
	console.error('Error:', error);
}
