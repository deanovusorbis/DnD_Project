/**
 * D&D Experiential Learning Platform - Background Types
 * SRD 5.2.1 / 2024 PHB Compatible
 */

import { AbilityName, SkillName, Identifiable, Describable } from './core.types';

export interface BackgroundData extends Omit<Identifiable, 'source'>, Describable {
	source: string;
	// The three abilities available for increase (Player chooses +2/+1 or +1/+1/+1 from these)
	abilityScores: AbilityName[];

	// Origin Feat granted by the background
	feat: {
		id: string;
		name: string;
	};

	// Proficiencies
	skills: SkillName[];
	toolProficiency?: string; // e.g. "Thieves' Tools" or "Artisan's Tools (one type)"

	// Equipment package
	equipment: string[];
}

export interface BackgroundDatabase {
	version: string;
	backgrounds: BackgroundData[];
	lastUpdated: string;
}
