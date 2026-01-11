/**
 * D&D Experiential Learning Platform - Mastery Tracking System
 * Tracks user learning progress and concept mastery
 */

import {
	MasteryLevel,
	ConceptMastery,
	UserMasteryProfile,
	DisclosureState,
	LearningConcept
} from '../types';

// Ensure UserMasteryProfile is used from types, not redeclared locally unless necessary.
// Start of file seems to import it. Let's check where it is redeclared.

// ============================================================================
// MASTERY LEVEL MANAGEMENT
// ============================================================================

const MASTERY_ORDER: MasteryLevel[] = [
	'unknown',
	'introduced',
	'practicing',
	'familiar',
	'proficient',
	'mastered'
];

/**
 * Compare mastery levels
 */
export function compareMasteryLevels(a: MasteryLevel, b: MasteryLevel): number {
	return MASTERY_ORDER.indexOf(a) - MASTERY_ORDER.indexOf(b);
}

/**
 * Check if a mastery level meets a minimum requirement
 */
export function meetsMasteryRequirement(
	current: MasteryLevel,
	required: MasteryLevel
): boolean {
	return compareMasteryLevels(current, required) >= 0;
}

/**
 * Get the next mastery level
 */
export function getNextMasteryLevel(current: MasteryLevel): MasteryLevel | null {
	const currentIndex = MASTERY_ORDER.indexOf(current);
	if (currentIndex < MASTERY_ORDER.length - 1) {
		const next = MASTERY_ORDER[currentIndex + 1];
		return next || null;
	}
	return null;
}

// ============================================================================
// MASTERY TRACKER
// ============================================================================

export interface MasteryEvent {
	type: 'introduced' | 'practiced' | 'success' | 'failure' | 'assessed';
	conceptId: string;
	timestamp: string;
	sceneId?: string;
	details?: string;
}

export interface MasteryUpdate {
	conceptId: string;
	previousLevel: MasteryLevel;
	newLevel: MasteryLevel;
	reason: string;
}

/**
 * Create a new concept mastery record
 */
export function createConceptMastery(
	conceptId: string,
	sceneId?: string
): ConceptMastery {
	const now = new Date().toISOString();
	return {
		conceptId,
		level: 'unknown',
		firstSeen: now,
		lastPracticed: now,
		practiceCount: 0,
		successCount: 0,
		failureCount: 0,
		retentionScore: 0,
		learnedInScene: sceneId,
		appliedInScenes: []
	};
}

/**
 * Calculate new mastery level based on performance
 */
export function calculateMasteryLevel(mastery: ConceptMastery): MasteryLevel {
	const { practiceCount, successCount } = mastery;

	if (practiceCount === 0) {
		return 'unknown';
	}

	if (practiceCount === 1 && successCount === 0) {
		return 'introduced';
	}

	const successRate = practiceCount > 0 ? successCount / practiceCount : 0;

	// Mastered: 10+ practices with 90%+ success rate
	if (practiceCount >= 10 && successRate >= 0.9) {
		return 'mastered';
	}

	// Proficient: 6+ practices with 75%+ success rate
	if (practiceCount >= 6 && successRate >= 0.75) {
		return 'proficient';
	}

	// Familiar: 4+ practices with 60%+ success rate
	if (practiceCount >= 4 && successRate >= 0.6) {
		return 'familiar';
	}

	// Practicing: 2+ practices
	if (practiceCount >= 2) {
		return 'practicing';
	}

	return 'introduced';
}

/**
 * Process a mastery event and update the mastery record
 */
export function processMasteryEvent(
	mastery: ConceptMastery,
	event: MasteryEvent
): { mastery: ConceptMastery; update?: MasteryUpdate } {
	const updated = { ...mastery };
	const previousLevel = mastery.level;
	const now = event.timestamp;

	switch (event.type) {
		case 'introduced':
			if (updated.level === 'unknown') {
				updated.level = 'introduced';
				updated.firstSeen = now;
			}
			break;

		case 'practiced':
			updated.practiceCount++;
			updated.lastPracticed = now;
			if (event.sceneId && !updated.appliedInScenes.includes(event.sceneId)) {
				updated.appliedInScenes.push(event.sceneId);
			}
			break;

		case 'success':
			updated.practiceCount++;
			updated.successCount++;
			updated.lastPracticed = now;
			updated.retentionScore = Math.min(1, updated.retentionScore + 0.1);
			if (event.sceneId && !updated.appliedInScenes.includes(event.sceneId)) {
				updated.appliedInScenes.push(event.sceneId);
			}
			break;

		case 'failure':
			updated.practiceCount++;
			updated.failureCount++;
			updated.lastPracticed = now;
			updated.retentionScore = Math.max(0, updated.retentionScore - 0.05);
			break;

		case 'assessed':
			// Direct assessment can set level explicitly
			break;
	}

	// Recalculate mastery level
	updated.level = calculateMasteryLevel(updated);

	// Calculate next review date (spaced repetition)
	updated.nextReviewDate = calculateNextReviewDate(updated);

	const update: MasteryUpdate | undefined =
		updated.level !== previousLevel
			? {
				conceptId: updated.conceptId,
				previousLevel,
				newLevel: updated.level,
				reason: `${event.type} event in ${event.sceneId || 'unknown scene'}`
			}
			: undefined;

	return { mastery: updated, update };
}

/**
 * Calculate next review date based on current mastery
 */
export function calculateNextReviewDate(mastery: ConceptMastery): string {
	const now = new Date();
	let daysUntilReview: number;

	switch (mastery.level) {
		case 'unknown':
		case 'introduced':
			daysUntilReview = 0; // Review immediately
			break;
		case 'practicing':
			daysUntilReview = 1;
			break;
		case 'familiar':
			daysUntilReview = 3;
			break;
		case 'proficient':
			daysUntilReview = 7;
			break;
		case 'mastered':
			daysUntilReview = 14;
			break;
		default:
			daysUntilReview = 0;
	}

	// Adjust based on retention score
	daysUntilReview = Math.floor(daysUntilReview * (0.5 + mastery.retentionScore * 0.5));

	const reviewDate = new Date(now);
	reviewDate.setDate(reviewDate.getDate() + daysUntilReview);
	return reviewDate.toISOString();
}

// ============================================================================
// MASTERY PROFILE MANAGEMENT
// ============================================================================

/**
 * Create a new user mastery profile
 */
export function createUserMasteryProfile(userId: string): UserMasteryProfile {
	return {
		userId,
		concepts: [],
		overallProgress: [],
		preferredLearningStyle: undefined,
		averageSessionDuration: 0,
		strongAreas: [],
		needsWork: []
	};
}

/**
 * Get or create concept mastery for a concept
 */
export function getConceptMastery(
	profile: UserMasteryProfile,
	conceptId: string
): ConceptMastery {
	const existing = profile.concepts.find(c => c.conceptId === conceptId);
	if (existing) {
		return existing;
	}
	return createConceptMastery(conceptId);
}

/**
 * Update a concept's mastery in the profile
 */
export function updateConceptMastery(
	profile: UserMasteryProfile,
	mastery: ConceptMastery
): UserMasteryProfile {
	const updated = { ...profile };
	const index = updated.concepts.findIndex(c => c.conceptId === mastery.conceptId);

	if (index >= 0) {
		updated.concepts[index] = mastery;
	} else {
		updated.concepts.push(mastery);
	}

	// Recalculate analytics
	updated.strongAreas = calculateStrongAreas(updated.concepts);
	updated.needsWork = calculateWeakAreas(updated.concepts);

	return updated;
}

/**
 * Calculate strong areas based on mastery
 */
function calculateStrongAreas(concepts: ConceptMastery[]): string[] {
	return concepts
		.filter(c => meetsMasteryRequirement(c.level, 'proficient'))
		.sort((a, b) => b.successCount - a.successCount)
		.slice(0, 5)
		.map(c => c.conceptId);
}

/**
 * Calculate weak areas based on mastery
 */
function calculateWeakAreas(concepts: ConceptMastery[]): string[] {
	return concepts
		.filter(c => c.failureCount > 0 && !meetsMasteryRequirement(c.level, 'familiar'))
		.sort((a, b) => b.failureCount - a.failureCount)
		.slice(0, 5)
		.map(c => c.conceptId);
}

// ============================================================================
// PROGRESSIVE DISCLOSURE
// ============================================================================

/**
 * Create initial disclosure state
 */
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

/**
 * Check if a concept is unlocked
 */
export function isConceptUnlocked(
	state: DisclosureState,
	conceptId: string
): boolean {
	return state.unlockedConcepts.includes(conceptId);
}

/**
 * Unlock a concept
 */
export function unlockConcept(
	state: DisclosureState,
	conceptId: string
): DisclosureState {
	if (!state.unlockedConcepts.includes(conceptId)) {
		return {
			...state,
			unlockedConcepts: [...state.unlockedConcepts, conceptId]
		};
	}
	return state;
}

/**
 * Check if all prerequisites are met
 */
export function checkPrerequisites(
	profile: UserMasteryProfile,
	concept: LearningConcept,
	requiredLevel: MasteryLevel = 'introduced'
): { met: boolean; missing: string[] } {
	const missing: string[] = [];

	for (const prereqId of concept.prerequisites) {
		const mastery = getConceptMastery(profile, prereqId);
		if (!meetsMasteryRequirement(mastery.level, requiredLevel)) {
			missing.push(prereqId);
		}
	}

	return {
		met: missing.length === 0,
		missing
	};
}

/**
 * Determine complexity tier based on mastered concepts
 */
export function determineComplexityTier(
	profile: UserMasteryProfile
): DisclosureState['complexityTier'] {
	const masteredCount = profile.concepts.filter(
		c => meetsMasteryRequirement(c.level, 'proficient')
	).length;

	const familiarCount = profile.concepts.filter(
		c => meetsMasteryRequirement(c.level, 'familiar')
	).length;

	if (masteredCount >= 20) return 'expert';
	if (masteredCount >= 12) return 'advanced';
	if (familiarCount >= 10) return 'intermediate';
	if (familiarCount >= 5) return 'basic';
	return 'foundation';
}

// ============================================================================
// CONCEPT DEPENDENCY RESOLUTION
// ============================================================================

/**
 * Get all concepts that should be introduced before this one
 */
export function getPrerequisiteChain(
	conceptId: string,
	allConcepts: LearningConcept[],
	visited: Set<string> = new Set()
): string[] {
	if (visited.has(conceptId)) {
		return [];
	}
	visited.add(conceptId);

	const concept = allConcepts.find(c => c.id === conceptId);
	if (!concept) {
		return [];
	}

	const chain: string[] = [];

	for (const prereqId of concept.prerequisites) {
		const prereqChain = getPrerequisiteChain(prereqId, allConcepts, visited);
		chain.push(...prereqChain, prereqId);
	}

	return [...new Set(chain)]; // Remove duplicates
}

/**
 * Get recommended next concepts to learn
 */
export function getRecommendedNextConcepts(
	profile: UserMasteryProfile,
	allConcepts: LearningConcept[],
	maxCount: number = 3
): LearningConcept[] {
	const unlockedIds = new Set(
		profile.concepts
			.filter(c => meetsMasteryRequirement(c.level, 'introduced'))
			.map(c => c.conceptId)
	);

	const candidates = allConcepts.filter(concept => {
		// Not already learned
		if (unlockedIds.has(concept.id)) {
			return false;
		}

		// All prerequisites met
		const prereqCheck = checkPrerequisites(profile, concept);
		return prereqCheck.met;
	});

	// Sort by complexity (prefer simpler concepts first)

	candidates.sort((a, b) => {
		// This is a simplified sort - real implementation would use teaching notes
		return a.prerequisites.length - b.prerequisites.length;
	});

	return candidates.slice(0, maxCount);
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Calculate overall progress percentage
 */
export function calculateOverallProgress(
	profile: UserMasteryProfile,
	allConceptCount: number
): number {
	if (allConceptCount === 0) return 0;

	let totalPoints = 0;
	const maxPoints = allConceptCount * 5; // 5 points for mastered

	for (const concept of profile.concepts) {
		switch (concept.level) {
			case 'introduced': totalPoints += 1; break;
			case 'practicing': totalPoints += 2; break;
			case 'familiar': totalPoints += 3; break;
			case 'proficient': totalPoints += 4; break;
			case 'mastered': totalPoints += 5; break;
		}
	}

	return Math.round((totalPoints / maxPoints) * 100);
}

/**
 * Get concepts needing review (spaced repetition)
 */
export function getConceptsNeedingReview(
	profile: UserMasteryProfile,
	maxCount: number = 5
): ConceptMastery[] {
	const now = new Date();

	return profile.concepts
		.filter(c => {
			if (!c.nextReviewDate) return false;
			return new Date(c.nextReviewDate) <= now;
		})
		.sort((a, b) => {
			const aDate = new Date(a.nextReviewDate!);
			const bDate = new Date(b.nextReviewDate!);
			return aDate.getTime() - bDate.getTime();
		})
		.slice(0, maxCount);
}
