import { describe, it, expect } from 'vitest';
import {
	createDisclosureState,
	checkDisclosureUpdates,
	isFeatureUnlocked
} from '../../pedagogy/disclosure-manager';
import { DEFAULT_DISCLOSURE_RULES } from '../../data/disclosure-rules';
import { UserProfile } from '../../types/pedagogy.types';

describe('Disclosure Manager', () => {
	// Mock Profile
	const mockProfile: UserProfile = {
		id: 'user-1',
		name: 'Test User',
		source: 'homebrew',
		displayName: 'Tester',
		createdAt: '',
		lastActiveAt: '',
		disclosureState: createDisclosureState('user-1'),
		masteryProfile: {
			userId: 'user-1',
			concepts: [],
			overallProgress: [],
			averageSessionDuration: 0,
			strongAreas: [],
			needsWork: []
		},
		difficultyProfile: {} as any,
		enrolledPaths: [],
		preferences: {} as any,
		characters: [],
		completedModules: [],
		assessmentResults: [],
		achievements: []
	};

	it('should create initial empty state', () => {
		const state = createDisclosureState('user-1');
		expect(state.unlockedFeatures).toHaveLength(0);
		expect(state.complexityTier).toBe('foundation');
	});

	it('should not unlock anything if conditions are not met', () => {
		const { updatedState, newUnlocks } = checkDisclosureUpdates(
			mockProfile,
			DEFAULT_DISCLOSURE_RULES
		);
		expect(newUnlocks).toHaveLength(0);
		expect(updatedState.unlockedFeatures).toHaveLength(0);
	});

	it('should unlock content when mastery condition is met', () => {
		// Simulate user mastering d20_roll
		const profileWithMastery = { ...mockProfile };
		profileWithMastery.masteryProfile.concepts = [
			{
				conceptId: 'd20_roll',
				level: 'practicing', // Requirement for rule 1
				firstSeen: '',
				lastPracticed: '',
				practiceCount: 5,
				successCount: 5,
				failureCount: 0,
				retentionScore: 1,
				appliedInScenes: []
			} as any
		];

		const { updatedState, newUnlocks } = checkDisclosureUpdates(
			profileWithMastery,
			DEFAULT_DISCLOSURE_RULES
		);

		// Rule 1 unlocks 'show_modifiers' (feature) and 'ability_scores' (concept)
		expect(newUnlocks).toContain('feature:show_modifiers');
		expect(updatedState.unlockedFeatures).toContain('show_modifiers');
		expect(isFeatureUnlocked(updatedState, 'show_modifiers')).toBe(true);
	});

	it('should handle attempt_count condition', () => {
		const profileWithAttempts = { ...mockProfile };
		profileWithAttempts.masteryProfile.concepts = [
			{
				conceptId: 'attack_roll',
				level: 'introduced',
				practiceCount: 6, // Requirement is 5 for rule 3
				appliedInScenes: []
			} as any
		];

		const { updatedState, newUnlocks } = checkDisclosureUpdates(
			profileWithAttempts,
			DEFAULT_DISCLOSURE_RULES
		);

		// Rule 3 unlocks 'show_damage_types'
		expect(newUnlocks).toContain('feature:show_damage_types');
		expect(updatedState.unlockedFeatures).toContain('show_damage_types');
	});
});
