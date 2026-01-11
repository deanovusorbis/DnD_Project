import {
	DisclosureRule, DisclosureState, UserMasteryProfile
} from '@dnd/types/index';
import { UserProfile } from '@dnd/types/pedagogy.types';

// ============================================================================
// STATE FACTORY
// ============================================================================

export function createDisclosureState(userId: string): DisclosureState {
	return {
		userId,
		unlockedConcepts: [],
		unlockedFeatures: [],
		unlockedOptions: [],
		pendingDisclosures: [],
		complexityTier: 'foundation'
	};
}

// ============================================================================
// CHECK LOGIC
// ============================================================================

/**
 * Check if a feature is unlocked
 */
export function isFeatureUnlocked(state: DisclosureState, featureId: string): boolean {
	return state.unlockedFeatures.includes(featureId);
}

/**
 * Check if a specific disclosure option is available
 */
export function isOptionUnlocked(state: DisclosureState, optionId: string): boolean {
	return state.unlockedOptions.includes(optionId);
}

/**
 * Check which complexity tier implies
 */
export function isTierAtLeast(state: DisclosureState, tier: DisclosureState['complexityTier']): boolean {
	const tiers = ['foundation', 'basic', 'intermediate', 'advanced', 'expert'];
	return tiers.indexOf(state.complexityTier) >= tiers.indexOf(tier);
}

// ============================================================================
// UPDATE LOGIC
// ============================================================================

/**
 * Process rules against current user state to unlock new content
 */
export function checkDisclosureUpdates(
	profile: UserProfile,
	rules: DisclosureRule[]
): {
	updatedState: DisclosureState;
	newUnlocks: string[];
} {
	let state = { ...profile.disclosureState };
	const newUnlocks: string[] = [];
	const mastery = profile.masteryProfile;

	// Sort rules by priority
	const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

	for (const rule of sortedRules) {
		if (checkRule(rule, profile, mastery)) {
			// Apply reveals
			for (const reveal of rule.revealsContent) {
				const id = reveal.contentId;
				let unlocked = false;

				if (reveal.type === 'feature' && !state.unlockedFeatures.includes(id)) {
					state.unlockedFeatures.push(id);
					unlocked = true;
				} else if (reveal.type === 'option' && !state.unlockedOptions.includes(id)) {
					state.unlockedOptions.push(id);
					unlocked = true;
				} else if (reveal.type === 'concept' && !state.unlockedConcepts.includes(id)) {
					state.unlockedConcepts.push(id);
					unlocked = true;
				}

				if (unlocked) {
					newUnlocks.push(`${reveal.type}:${id}`);
					// Add to pending for UI notification
					if (!state.pendingDisclosures.includes(id)) {
						state.pendingDisclosures.push(id);
					}
				}
			}
		}
	}

	return { updatedState: state, newUnlocks };
}

function checkRule(
	rule: DisclosureRule,
	profile: UserProfile,
	mastery: UserMasteryProfile
): boolean {
	const condition = rule.unlockCondition;

	switch (condition.type) {
		case 'mastery':
			const concept = mastery.concepts.find(c => c.conceptId === rule.conceptId);
			if (!concept) return false;
			// Simple check: is level >= requirement?
			// Assumption requirement is like 'familiar', 'mastered'
			// We need a helper to compare levels, but for now exact match or better
			return isMasteryAtLeast(concept.level, condition.requirement as string);

		case 'attempt_count':
			const stats = mastery.concepts.find(c => c.conceptId === rule.conceptId);
			return (stats?.practiceCount || 0) >= (condition.requirement as number);

		case 'scene_complete':
			return profile.completedModules.includes(condition.requirement as string) ||
				(profile.masteryProfile.concepts.find(c => c.conceptId === rule.conceptId)?.appliedInScenes.includes(condition.requirement as string) || false);

		// Add other cases as needed
		default:
			return false;
	}
}

function isMasteryAtLeast(current: string, required: string): boolean {
	const levels = ['unknown', 'introduced', 'practicing', 'familiar', 'proficient', 'mastered'];
	return levels.indexOf(current) >= levels.indexOf(required);
}
