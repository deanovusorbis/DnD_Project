/**
 * D&D Experiential Learning Platform - Scenario/Scene Types
 * For narrative and teaching scenario management
 */

// Imports removed as they were unused
import { Identifiable, Describable } from './core.types';

// ============================================================================
// LEARNING CONCEPTS
// ============================================================================

export interface LearningConcept extends Identifiable, Describable {
	// Concept hierarchy
	category: 'core' | 'combat' | 'exploration' | 'social' | 'character' | 'dm';
	prerequisites: string[]; // Concept IDs

	// Mastery tracking
	masteryLevels: {
		level: 'introduced' | 'practiced' | 'applied' | 'mastered';
		criteria: string;
	}[];

	// Teaching content
	explanation: string;
	examples: string[];
	commonMistakes: string[];
}

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

export interface DialogueNode extends Identifiable {
	speaker: 'npc' | 'narrator' | 'system' | 'player_character';
	speakerName?: string;
	text: string;

	// Display options
	emotion?: 'neutral' | 'happy' | 'angry' | 'sad' | 'scared' | 'confused';
	voiceNote?: string; // For DM reference

	// Flow control
	responses?: DialogueResponse[];
	nextNodeId?: string; // If no responses, auto-continue

	// Triggers
	onEnter?: SceneTrigger[];
	onExit?: SceneTrigger[];
}

export interface DialogueResponse extends Identifiable {
	text: string;
	shortText?: string; // For UI display

	// Requirements
	requiresSkillCheck?: {
		skill: string;
		dc: number;
		showDC: boolean;
	};
	requiresConcept?: string;
	requiresItem?: string;

	// Results
	leadsTo: string; // DialogueNode ID
	consequences?: SceneConsequence[];

	// Teaching
	teachingNote?: string; // Explains why this option exists
}

// ============================================================================
// SCENE ELEMENTS
// ============================================================================

export interface SceneTrigger {
	type: 'auto' | 'interaction' | 'combat_start' | 'combat_end' | 'item_use' | 'skill_check' | 'time';
	condition?: string;
	action: SceneAction;
}

export interface SceneAction {
	type: 'dialogue' | 'combat' | 'transition' | 'reward' | 'state_change' | 'teaching_moment' | 'checkpoint';

	// Action-specific data
	dialogueNodeId?: string;
	encounterId?: string;
	nextSceneId?: string;
	rewards?: SceneReward[];
	stateChanges?: { key: string; value: any }[];
	teachingContent?: TeachingMoment;
}

export interface SceneConsequence {
	type: 'reputation' | 'item' | 'state' | 'unlock' | 'xp';
	target?: string;
	value: number | string | boolean;
}

export interface SceneReward {
	type: 'xp' | 'gold' | 'item' | 'unlock';
	value: number | string;
	itemId?: string;
}

// ============================================================================
// TEACHING MOMENT
// ============================================================================

export interface TeachingMoment extends Identifiable {
	conceptId: string;

	// When to show
	timing: 'before_action' | 'during_action' | 'after_action' | 'on_mistake' | 'on_success';

	// Content
	headline: string;
	explanation: string;
	example?: string;

	// Interactive element
	practiceAction?: {
		type: 'dice_roll' | 'choice' | 'calculation';
		prompt: string;
		correctAnswer?: string | number;
		feedback: {
			correct: string;
			incorrect: string;
		};
	};

	// Display options
	dismissible: boolean;
	showOnlyOnce: boolean;
	priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// ENCOUNTER
// ============================================================================

export interface Encounter extends Identifiable, Describable {
	// Combat setup
	monsters: { monsterId: string; count: number; position?: { x: number; y: number } }[];

	// Environment
	terrain?: {
		type: string;
		difficultTerrain?: { x: number; y: number }[];
		cover?: { x: number; y: number; type: 'half' | 'three_quarters' | 'full' }[];
	};
	mapSize?: { width: number; height: number };

	// Difficulty
	calculatedDifficulty?: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
	xpBudget?: number;

	// Objectives (optional)
	objectives?: {
		primary: string;
		secondary?: string[];
		failure?: string;
	};

	// Special rules
	specialConditions?: string[];
	timedRounds?: number;
	reinforcements?: {
		round: number;
		monsters: { monsterId: string; count: number }[];
	}[];

	// Victory/Defeat
	victoryCondition: 'defeat_all' | 'defeat_leader' | 'survive_rounds' | 'reach_location' | 'custom';
	defeatCondition?: 'party_wipe' | 'leader_death' | 'custom';

	// Teaching
	teachingFocus?: string[]; // Concept IDs to emphasize
	hints?: {
		round: number;
		condition: string;
		hint: string;
	}[];
}

// ============================================================================
// SCENE
// ============================================================================

export interface Scene extends Identifiable, Describable {
	// Narrative
	narrativeType: 'exploration' | 'social' | 'combat' | 'puzzle' | 'rest' | 'transition';
	setting: string;
	atmosphere?: string;

	// Opening
	openingNarration: string;
	openingDialogue?: string; // DialogueNode ID

	// Content
	dialogueRoot?: string;
	encounters?: string[]; // Encounter IDs
	puzzles?: PuzzleElement[];
	interactables?: SceneInteractable[];

	// NPCs present
	npcs?: {
		npcId: string;
		attitude: 'friendly' | 'neutral' | 'hostile' | 'unknown';
		dialogue?: string;
	}[];

	// Learning
	conceptsIntroduced?: string[];
	conceptsReinforced?: string[];
	teachingMoments?: TeachingMoment[];

	// Flow
	transitions: SceneTransition[];

	// State requirements
	prerequisites?: {
		conceptMastery?: { conceptId: string; level: string }[];
		stateFlags?: { key: string; value: any }[];
		previousScenes?: string[];
	};

	// Metadata
	estimatedDuration: number; // in minutes
	difficulty: 'tutorial' | 'beginner' | 'intermediate' | 'advanced';
}

export interface SceneInteractable extends Identifiable {
	type: 'object' | 'location' | 'npc' | 'secret';
	description: string;

	// Interaction
	defaultAction?: string;
	actions: {
		name: string;
		skillCheck?: { skill: string; dc: number };
		result: SceneAction;
	}[];

	// Discovery
	hidden?: boolean;
	discoverDC?: number;
	discoverSkill?: string;
}

export interface PuzzleElement extends Identifiable, Describable {
	type: 'riddle' | 'mechanism' | 'pattern' | 'logic';

	// Puzzle content
	clues: string[];
	solution: string;

	// Hints
	hints: {
		trigger: 'attempts' | 'time' | 'request';
		value?: number;
		hint: string;
	}[];

	// Resolution
	onSuccess: SceneAction;
	onFailure?: SceneAction;
	allowRetry: boolean;
}

export interface SceneTransition {
	id: string;
	targetSceneId: string;
	condition?: string;
	transitionText?: string;
	isDefault?: boolean;
}

// ============================================================================
// MODULE (Collection of Scenes)
// ============================================================================

export interface LearningModule extends Identifiable, Describable {
	// Structure
	type: 'tutorial' | 'adventure' | 'practice' | 'assessment';

	// Scenes
	scenes: string[];
	startScene: string;

	// Learning objectives
	targetConcepts: string[];
	prerequisiteConcepts: string[];

	// Character requirements
	recommendedLevel: { min: number; max: number };
	pregenCharacters?: string[];
	allowCustomCharacter: boolean;

	// Progress tracking
	checkpoints: string[]; // Scene IDs that act as save points
	completionCriteria: {
		requiredScenes: string[];
		conceptMastery?: { conceptId: string; level: string }[];
	};

	// Rewards
	completionRewards?: SceneReward[];

	// Metadata
	estimatedDuration: number;
	difficulty: 'tutorial' | 'beginner' | 'intermediate' | 'advanced';
	tags: string[];
}

// ============================================================================
// SCENARIO DATABASE
// ============================================================================

export interface ScenarioDatabase {
	version: string;
	concepts: LearningConcept[];
	modules: LearningModule[];
	scenes: Scene[];
	encounters: Encounter[];
	dialogues: DialogueNode[];
	lastUpdated: string;
}
