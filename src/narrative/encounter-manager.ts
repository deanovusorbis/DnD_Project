/**
 * D&D Experiential Learning Platform - Encounter Manager
 * Generates and manages combat encounters
 */

// import { rollDice } from '@core/dice';

// ============================================================================
// TYPES
// ============================================================================

export interface Monster {
	id: string;
	name: string;
	size: string;
	type: string;
	challengeRating: number;
	armorClass: number;
	hitPoints: { average: number; formula: string };
	speed: { walk?: number; fly?: number; swim?: number; climb?: number };
	abilityScores: { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number };
	actions: MonsterAction[];
	traits?: { name: string; description: string }[];
	description: string;
}

export interface MonsterAction {
	name: string;
	type?: string;
	toHit?: number;
	reach?: number;
	range?: { normal: number; long: number };
	damage?: { dice: string; type: string };
	special?: string;
	description?: string;
}

export interface EncounterTemplate {
	id: string;
	name: string;
	difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
	environment: string;
	monsters: { monsterId: string; count: { min: number; max: number } }[];
	description: string;
	tactics: string;
	treasure: { gold: { min: number; max: number }; items: string[] };
	roleplayOption?: string;
}

export interface EncounterInstance {
	id: string;
	templateId: string;
	name: string;
	monsters: { monster: Monster; count: number; currentHP: number[] }[];
	difficulty: string;
	isActive: boolean;
	round: number;
	description: string;
	tactics: string;
	treasure: { gold: number; items: string[] };
}

// ============================================================================
// CHALLENGE RATING TO XP
// ============================================================================

const CR_XP_TABLE: Record<number, number> = {
	0: 10,
	0.125: 25,
	0.25: 50,
	0.5: 100,
	1: 200,
	2: 450,
	3: 700,
	4: 1100,
	5: 1800,
	6: 2300,
	7: 2900,
	8: 3900,
	9: 5000,
	10: 5900
};

export function getXPForCR(cr: number): number {
	return CR_XP_TABLE[cr] || 0;
}

// ============================================================================
// DIFFICULTY CALCULATION
// ============================================================================

const PARTY_THRESHOLDS: Record<number, { easy: number; medium: number; hard: number; deadly: number }> = {
	1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
	2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
	3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
	4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
	5: { easy: 250, medium: 500, hard: 750, deadly: 1100 }
};

export function calculateEncounterDifficulty(
	monsterCRs: number[],
	partyLevels: number[]
): 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' {
	// Calculate total XP
	let totalXP = monsterCRs.reduce((sum, cr) => sum + getXPForCR(cr), 0);

	// Apply multiplier based on monster count
	const count = monsterCRs.length;
	const multiplier = count === 1 ? 1 : count === 2 ? 1.5 : count <= 6 ? 2 : count <= 10 ? 2.5 : 3;
	const adjustedXP = totalXP * multiplier;

	// Calculate party thresholds
	let partyThresholds = { easy: 0, medium: 0, hard: 0, deadly: 0 };
	for (const level of partyLevels) {
		const levelThreshold = PARTY_THRESHOLDS[Math.min(level, 5)] ?? PARTY_THRESHOLDS[5];
		if (levelThreshold) {
			partyThresholds.easy += levelThreshold.easy;
			partyThresholds.medium += levelThreshold.medium;
			partyThresholds.hard += levelThreshold.hard;
			partyThresholds.deadly += levelThreshold.deadly;
		}
	}

	// Determine difficulty
	if (adjustedXP >= partyThresholds.deadly) return 'deadly';
	if (adjustedXP >= partyThresholds.hard) return 'hard';
	if (adjustedXP >= partyThresholds.medium) return 'medium';
	if (adjustedXP >= partyThresholds.easy) return 'easy';
	return 'trivial';
}

// ============================================================================
// ENCOUNTER GENERATION
// ============================================================================

export function generateEncounter(
	template: EncounterTemplate,
	monsterDatabase: Monster[]
): EncounterInstance {
	const encounterMonsters: EncounterInstance['monsters'] = [];

	for (const monsterSpec of template.monsters) {
		const monster = monsterDatabase.find(m => m.id === monsterSpec.monsterId);
		if (!monster) continue;

		// Roll for count
		const count = Math.floor(
			Math.random() * (monsterSpec.count.max - monsterSpec.count.min + 1)
		) + monsterSpec.count.min;

		// Roll HP for each monster
		const currentHP: number[] = [];
		for (let i = 0; i < count; i++) {
			// Use average HP for simplicity, could roll formula
			currentHP.push(monster.hitPoints.average);
		}

		encounterMonsters.push({ monster, count, currentHP });
	}

	// Roll treasure
	const goldAmount = Math.floor(
		Math.random() * (template.treasure.gold.max - template.treasure.gold.min + 1)
	) + template.treasure.gold.min;

	return {
		id: `encounter-${Date.now()}`,
		templateId: template.id,
		name: template.name,
		monsters: encounterMonsters,
		difficulty: template.difficulty,
		isActive: false,
		round: 0,
		description: template.description,
		tactics: template.tactics,
		treasure: {
			gold: goldAmount,
			items: [...template.treasure.items]
		}
	};
}

// ============================================================================
// RANDOM ENCOUNTER TABLE
// ============================================================================

export interface RandomEncounterTable {
	environment: string;
	encounters: { weight: number; templateId: string }[];
}

export function rollRandomEncounter(
	table: RandomEncounterTable,
	templates: EncounterTemplate[],
	monsters: Monster[]
): EncounterInstance | null {
	// Calculate total weight
	const totalWeight = table.encounters.reduce((sum, e) => sum + e.weight, 0);

	// Roll
	let roll = Math.random() * totalWeight;
	let selectedTemplateId: string | null = null;

	for (const entry of table.encounters) {
		roll -= entry.weight;
		if (roll <= 0) {
			selectedTemplateId = entry.templateId;
			break;
		}
	}

	if (!selectedTemplateId) return null;

	const template = templates.find(t => t.id === selectedTemplateId);
	if (!template) return null;

	return generateEncounter(template, monsters);
}

// ============================================================================
// ENCOUNTER STATE MANAGEMENT
// ============================================================================

export function startEncounter(encounter: EncounterInstance): EncounterInstance {
	return {
		...encounter,
		isActive: true,
		round: 1
	};
}

export function damageMonster(
	encounter: EncounterInstance,
	monsterIndex: number,
	instanceIndex: number,
	damage: number
): EncounterInstance {
	const newMonsters = encounter.monsters.map((mg, idx) => {
		if (idx !== monsterIndex) return mg;
		const newHP = mg.currentHP.map((hp, hpIdx) =>
			hpIdx === instanceIndex ? Math.max(0, hp - damage) : hp
		);
		return { monster: mg.monster, count: mg.count, currentHP: newHP };
	});

	return { ...encounter, monsters: newMonsters };
}

export function isEncounterOver(encounter: EncounterInstance): boolean {
	return encounter.monsters.every(mg =>
		mg.currentHP.every(hp => hp <= 0)
	);
}

export function getAliveMonstersCount(encounter: EncounterInstance): number {
	return encounter.monsters.reduce((sum, mg) =>
		sum + mg.currentHP.filter(hp => hp > 0).length, 0
	);
}

export function getTotalXP(encounter: EncounterInstance): number {
	return encounter.monsters.reduce((sum, mg) =>
		sum + getXPForCR(mg.monster.challengeRating) * mg.count, 0
	);
}
