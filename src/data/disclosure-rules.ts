import { DisclosureRule } from '@dnd/types/index';

export const DEFAULT_DISCLOSURE_RULES: DisclosureRule[] = [
	// Rule 1: Unlock Modifiers after understanding d20
	{
		id: 'unlock_modifiers',
		conceptId: 'd20_roll',
		priority: 10,
		unlockCondition: {
			type: 'mastery',
			requirement: 'practicing'
		},
		revealsContent: [
			{ type: 'feature', contentId: 'show_modifiers' },
			{ type: 'concept', contentId: 'ability_scores' }
		]
	},
	// Rule 2: Unlock Advantage/Disadvantage after standard d20 familiarity
	{
		id: 'unlock_advantage',
		conceptId: 'd20_roll',
		priority: 8,
		unlockCondition: {
			type: 'mastery',
			requirement: 'familiar'
		},
		revealsContent: [
			{ type: 'option', contentId: 'roll_advantage' },
			{ type: 'option', contentId: 'roll_disadvantage' }
		]
	},
	// Rule 3: Unlock Damage Types after basics of attack
	{
		id: 'unlock_damage_types',
		conceptId: 'attack_roll',
		priority: 5,
		unlockCondition: {
			type: 'attempt_count',
			requirement: 5 // After 5 attacks
		},
		revealsContent: [
			{ type: 'feature', contentId: 'show_damage_types' },
			{ type: 'concept', contentId: 'resistances' }
		]
	}
];
