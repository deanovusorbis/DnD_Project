/**
 * D&D Experiential Learning Platform - Pedagogy Types
 * For learning tracking, adaptive systems, and user progress
 */

import { Identifiable } from './core.types';

// ============================================================================
// MASTERY TRACKING
// ============================================================================

export type MasteryLevel =
	| 'unknown'      // Never encountered
	| 'introduced'   // Seen but not practiced
	| 'practicing'   // Currently learning
	| 'familiar'     // Can apply with hints
	| 'proficient'   // Can apply independently
	| 'mastered';    // Can apply and teach

export interface ConceptMastery {
	conceptId: string;
	level: MasteryLevel;

	// Tracking
	firstSeen: string;
	lastPracticed: string;
	practiceCount: number;
	successCount: number;
	failureCount: number;

	// Decay modeling
	retentionScore: number; // 0-1
	nextReviewDate?: string;

	// Context
	learnedInScene?: string;
	appliedInScenes: string[];
}

export interface UserMasteryProfile {
	userId: string;
	concepts: ConceptMastery[];

	// Aggregate stats
	overallProgress: {
		category: string;
		masteredCount: number;
		totalCount: number;
	}[];

	// Learning patterns
	preferredLearningStyle?: 'visual' | 'reading' | 'kinesthetic';
	averageSessionDuration: number;
	strongAreas: string[];
	needsWork: string[];
}

// ============================================================================
// PROGRESSIVE DISCLOSURE
// ============================================================================

export interface DisclosureRule {
	id: string;
	conceptId: string;

	// When to reveal
	unlockCondition: {
		type: 'mastery' | 'scene_complete' | 'attempt_count' | 'time_played' | 'manual';
		requirement: string | number;
	};

	// What to reveal
	revealsContent: {
		type: 'concept' | 'feature' | 'option' | 'hint' | 'advanced_info';
		contentId: string;
	}[];

	// Priority
	priority: number;
}

export interface DisclosureState {
	userId: string;
	unlockedConcepts: string[];
	unlockedFeatures: string[];
	unlockedOptions: string[];
	pendingDisclosures: string[]; // Ready to show

	// Current complexity level
	complexityTier: 'foundation' | 'basic' | 'intermediate' | 'advanced' | 'expert';
}

// ============================================================================
// ADAPTIVE DIFFICULTY
// ============================================================================

export interface DifficultyProfile {
	userId: string;

	// Performance metrics
	combatSuccessRate: number;
	skillCheckSuccessRate: number;
	puzzleSolveRate: number;
	averageAttempts: number;

	// Current settings
	currentDifficulty: 'easy' | 'normal' | 'challenging' | 'hard';

	// Adjustments
	hintFrequency: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';
	autoExplainRules: boolean;
	showDCValues: boolean;
	forgivingCombat: boolean; // Extra chances, etc.

	// History
	difficultyHistory: {
		timestamp: string;
		difficulty: string;
		reason: string;
	}[];
}

export interface AdaptiveAdjustment {
	type: 'increase' | 'decrease' | 'maintain';
	area: 'combat' | 'skills' | 'puzzles' | 'overall';
	reason: string;

	// Specific changes
	changes: {
		parameter: string;
		from: number | string;
		to: number | string;
	}[];
}

// ============================================================================
// HINT SYSTEM
// ============================================================================

export interface Hint extends Identifiable {
	conceptId: string;
	context: string; // Scene/situation type

	// Escalating hints
	levels: {
		level: 1 | 2 | 3 | 4 | 5;
		text: string;
		revealsAnswer: boolean;
	}[];

	// Trigger conditions
	showAfterAttempts?: number;
	showAfterSeconds?: number;
	showOnRequest: boolean;
}

export interface HintState {
	hintId: string;
	currentLevel: number;
	timesShown: number;
	lastShown: string;
	wasHelpful?: boolean;
}

// ============================================================================
// LEARNING PATH
// ============================================================================

export interface LearningPathNode {
	id: string;
	moduleId: string;

	// Dependencies
	prerequisites: string[];
	unlocks: string[];

	// Status
	status: 'locked' | 'available' | 'in_progress' | 'completed' | 'skipped';

	// Optional/Required
	required: boolean;

	// Branching
	alternatives?: string[]; // Other nodes that satisfy same requirement
}

export interface LearningPath {
	id: string;
	name: string;
	description: string;

	// Target
	targetRole: 'player' | 'dm' | 'both';

	// Structure
	nodes: LearningPathNode[];
	startNodes: string[];
	completionNodes: string[];

	// Estimated time
	estimatedHours: number;

	// Branching paths
	branches?: {
		id: string;
		name: string;
		description: string;
		nodes: string[];
	}[];
}

export interface UserLearningProgress {
	userId: string;
	pathId: string;

	// Overall
	currentNode?: string;
	completedNodes: string[];
	skippedNodes: string[];

	// Time tracking
	startedAt: string;
	lastActivityAt: string;
	totalTimeSpent: number;

	// Completion
	completionPercentage: number;
	estimatedTimeRemaining: number;
}

// ============================================================================
// FEEDBACK SYSTEM
// ============================================================================

export interface FeedbackMessage {
	type: 'success' | 'encouragement' | 'correction' | 'hint' | 'explanation';

	// Content
	headline: string;
	body: string;

	// Context
	relatedConcept?: string;
	relatedAction?: string;

	// Tone
	tone: 'celebratory' | 'encouraging' | 'neutral' | 'gentle_correction';

	// Actions
	suggestedAction?: string;
	learnMoreLink?: string;
}

export interface FeedbackRule {
	id: string;

	// Trigger
	trigger: {
		event: 'success' | 'failure' | 'first_attempt' | 'repeated_failure' | 'milestone';
		context?: string;
		conceptId?: string;
	};

	// Response
	feedbackTemplates: FeedbackMessage[];

	// Conditions
	maxTimesShown?: number;
	cooldownMinutes?: number;
}

// ============================================================================
// ASSESSMENT
// ============================================================================

export interface AssessmentQuestion {
	id: string;
	conceptId: string;

	// Question
	type: 'multiple_choice' | 'practical' | 'calculation' | 'scenario';
	prompt: string;

	// For multiple choice
	options?: { id: string; text: string }[];
	correctOptionId?: string;

	// For practical
	scenarioId?: string;
	successCriteria?: string;

	// For calculation
	correctAnswer?: number | string;
	tolerance?: number;

	// Feedback
	explanationCorrect: string;
	explanationIncorrect: string;

	// Difficulty
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface Assessment {
	id: string;
	name: string;
	description: string;

	// Structure
	type: 'knowledge_check' | 'practical_test' | 'mixed';
	questions: AssessmentQuestion[];

	// Passing
	passingScore: number; // percentage

	// Gating
	prerequisiteConcepts: string[];
	unlocksOnPass: string[];

	// Options
	allowRetake: boolean;
	showFeedbackImmediately: boolean;
}

export interface AssessmentResult {
	assessmentId: string;
	userId: string;

	// Results
	score: number;
	passed: boolean;

	// Details
	questionResults: {
		questionId: string;
		correct: boolean;
		userAnswer: string;
		timeSpent: number;
	}[];

	// Timing
	startedAt: string;
	completedAt: string;
	attempt: number;
}

// ============================================================================
// USER PROFILE
// ============================================================================

export interface UserProfile extends Identifiable {
	// Basic info
	displayName: string;
	createdAt: string;
	lastActiveAt: string;

	// Progress
	masteryProfile: UserMasteryProfile;
	disclosureState: DisclosureState;
	difficultyProfile: DifficultyProfile;

	// Paths
	enrolledPaths: UserLearningProgress[];

	// Settings
	preferences: {
		tutorialStyle: 'guided' | 'exploratory';
		feedbackVerbosity: 'minimal' | 'normal' | 'detailed';
		autoAdvance: boolean;
		soundEnabled: boolean;
		theme: 'light' | 'dark' | 'parchment';
	};

	// Characters
	characters: string[]; // Character IDs
	activeCharacterId?: string;

	// History
	completedModules: string[];
	assessmentResults: AssessmentResult[];

	// Achievements
	achievements: {
		achievementId: string;
		unlockedAt: string;
	}[];
}
