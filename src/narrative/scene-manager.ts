/**
 * D&D Experiential Learning Platform - Scene Manager
 * Handles scene navigation, state, and event processing
 */

import {
	Scene, LearningModule, DialogueNode,
	SceneTransition, TeachingMoment, LearningConcept,
	UserMasteryProfile
} from '@dnd/types/index';
import { MasteryEvent, getConceptMastery } from '@pedagogy/mastery-tracker';

// ============================================================================
// SCENE STATE
// ============================================================================

export interface SceneState {
	moduleId: string;
	currentSceneId: string;
	previousSceneIds: string[];

	// State variables set by scene actions
	stateVariables: Record<string, boolean | number | string>;

	// Dialogue state
	currentDialogueNodeId?: string;
	dialogueHistory: { nodeId: string; responseId?: string }[];

	// Interaction state
	interactedWith: string[];

	// Teaching moments
	shownTeachingMoments: string[];
	pendingTeachingMoment?: TeachingMoment;

	// Encounter state
	activeEncounterId?: string;
	completedEncounters: string[];

	// Progress
	checkpointsReached: string[];
	startedAt: string;
	lastUpdated: string;
}

export interface SceneContext {
	module: LearningModule;
	scenes: Map<string, Scene>;
	dialogues: Map<string, DialogueNode>;
	concepts: Map<string, LearningConcept>;
	masteryProfile: UserMasteryProfile;
}

// ============================================================================
// SCENE MANAGER
// ============================================================================

/**
 * Initialize scene state for a module
 */
export function initializeSceneState(module: LearningModule): SceneState {
	const now = new Date().toISOString();

	return {
		moduleId: module.id,
		currentSceneId: module.startScene,
		previousSceneIds: [],
		stateVariables: {},
		dialogueHistory: [],
		interactedWith: [],
		shownTeachingMoments: [],
		completedEncounters: [],
		checkpointsReached: [],
		startedAt: now,
		lastUpdated: now
	};
}

/**
 * Get current scene
 */
export function getCurrentScene(
	state: SceneState,
	context: SceneContext
): Scene | undefined {
	return context.scenes.get(state.currentSceneId);
}

/**
 * Check if a condition is met
 */
export function checkCondition(
	condition: string,
	state: SceneState
): boolean {
	// Parse simple conditions like "talked_to_hooded" or "!has_key"
	if (condition.startsWith('!')) {
		return !state.stateVariables[condition.slice(1)];
	}
	return !!state.stateVariables[condition];
}

/**
 * Set a state variable
 */
export function setStateVariable(
	state: SceneState,
	key: string,
	value: boolean | number | string
): SceneState {
	return {
		...state,
		stateVariables: {
			...state.stateVariables,
			[key]: value
		},
		lastUpdated: new Date().toISOString()
	};
}

// ============================================================================
// SCENE TRANSITIONS
// ============================================================================

export interface TransitionResult {
	state: SceneState;
	transitionText?: string;
	newScene?: Scene;
	masteryUpdates?: { conceptId: string; event: MasteryEvent }[];
}

/**
 * Get available transitions from current scene
 */
export function getAvailableTransitions(
	state: SceneState,
	context: SceneContext
): SceneTransition[] {
	const scene = getCurrentScene(state, context);
	if (!scene?.transitions) return [];

	return scene.transitions.filter(transition => {
		if (!transition.condition) return true;
		return checkCondition(transition.condition, state);
	});
}

/**
 * Transition to a new scene
 */
export function transitionToScene(
	state: SceneState,
	targetSceneId: string,
	context: SceneContext
): TransitionResult {
	const currentScene = getCurrentScene(state, context);
	const targetScene = context.scenes.get(targetSceneId);

	if (!targetScene) {
		throw new Error(`Scene not found: ${targetSceneId}`);
	}

	// Find matching transition for text
	const transition = currentScene?.transitions?.find(t => t.targetSceneId === targetSceneId);

	// Track concepts introduced in new scene
	const masteryUpdates: { conceptId: string; event: MasteryEvent }[] = [];

	if (targetScene.conceptsIntroduced) {
		for (const conceptId of targetScene.conceptsIntroduced) {
			masteryUpdates.push({
				conceptId,
				event: {
					type: 'introduced',
					conceptId,
					timestamp: new Date().toISOString(),
					sceneId: targetSceneId
				}
			});
		}
	}

	// Check if this is a checkpoint
	let checkpointsReached = [...state.checkpointsReached];
	if (context.module.checkpoints?.includes(targetSceneId)) {
		if (!checkpointsReached.includes(targetSceneId)) {
			checkpointsReached.push(targetSceneId);
		}
	}

	return {
		state: {
			...state,
			currentSceneId: targetSceneId,
			previousSceneIds: [...state.previousSceneIds, state.currentSceneId],
			currentDialogueNodeId: targetScene.dialogueRoot,
			checkpointsReached,
			lastUpdated: new Date().toISOString()
		},
		transitionText: transition?.transitionText,
		newScene: targetScene,
		masteryUpdates
	};
}

/**
 * Go back to previous scene
 */
export function goBack(state: SceneState): SceneState {
	if (state.previousSceneIds.length === 0) {
		return state;
	}

	const previousId = state.previousSceneIds[state.previousSceneIds.length - 1];
	if (!previousId) return state;

	return {
		...state,
		currentSceneId: previousId,
		previousSceneIds: state.previousSceneIds.slice(0, -1),
		lastUpdated: new Date().toISOString()
	};
}

// ============================================================================
// DIALOGUE MANAGEMENT
// ============================================================================

export interface DialogueResult {
	state: SceneState;
	nextNode?: DialogueNode;
	consequences?: { type: string; value: any }[];
	masteryUpdates?: { conceptId: string; event: MasteryEvent }[];
}

/**
 * Get current dialogue node
 */
export function getCurrentDialogue(
	state: SceneState,
	context: SceneContext
): DialogueNode | undefined {
	if (!state.currentDialogueNodeId) return undefined;
	return context.dialogues.get(state.currentDialogueNodeId);
}

/**
 * Select a dialogue response
 */
export function selectDialogueResponse(
	state: SceneState,
	responseId: string,
	context: SceneContext
): DialogueResult {
	const currentNode = getCurrentDialogue(state, context);
	if (!currentNode) {
		throw new Error('No active dialogue');
	}

	const response = currentNode.responses?.find(r => r.id === responseId);
	if (!response) {
		throw new Error(`Response not found: ${responseId}`);
	}

	let updatedState: SceneState = {
		...state,
		dialogueHistory: [
			...state.dialogueHistory,
			{ nodeId: state.currentDialogueNodeId!, responseId }
		],
		lastUpdated: new Date().toISOString()
	};

	// Process consequences
	const consequences: { type: string; value: any }[] = [];

	if (response.consequences) {
		for (const consequence of response.consequences) {
			consequences.push(consequence);

			if (consequence.type === 'state') {
				updatedState = setStateVariable(
					updatedState,
					consequence.target as string,
					consequence.value as boolean
				);
			}
		}
	}

	// Get next node
	let nextNode: DialogueNode | undefined;

	if (response.leadsTo) {
		if (response.leadsTo === 'end-conversation') {
			updatedState = {
				...updatedState,
				currentDialogueNodeId: undefined
			};
		} else {
			nextNode = context.dialogues.get(response.leadsTo);
			updatedState = {
				...updatedState,
				currentDialogueNodeId: response.leadsTo
			};
		}
	} else if (currentNode.nextNodeId) {
		nextNode = context.dialogues.get(currentNode.nextNodeId);
		updatedState = {
			...updatedState,
			currentDialogueNodeId: currentNode.nextNodeId
		};
	}

	return {
		state: updatedState,
		nextNode,
		consequences
	};
}

/**
 * Start a dialogue
 */
export function startDialogue(
	state: SceneState,
	dialogueId: string
): SceneState {
	return {
		...state,
		currentDialogueNodeId: dialogueId,
		lastUpdated: new Date().toISOString()
	};
}

/**
 * End current dialogue
 */
export function endDialogue(state: SceneState): SceneState {
	return {
		...state,
		currentDialogueNodeId: undefined,
		lastUpdated: new Date().toISOString()
	};
}

// ============================================================================
// TEACHING MOMENTS
// ============================================================================

export interface TeachingMomentResult {
	state: SceneState;
	shouldShow: boolean;
	teachingMoment?: TeachingMoment;
}

/**
 * Check if a teaching moment should be shown
 */
export function checkTeachingMoment(
	state: SceneState,
	momentId: string,
	scene: Scene
): TeachingMomentResult {
	// Find the teaching moment
	const teachingMoment = scene.teachingMoments?.find(tm => tm.id === momentId);

	if (!teachingMoment) {
		return { state, shouldShow: false };
	}

	// Check if already shown (and showOnlyOnce is true)
	if (teachingMoment.showOnlyOnce && state.shownTeachingMoments.includes(momentId)) {
		return { state, shouldShow: false };
	}

	// Check prerequisites
	// Teaching moments don't have prerequisites in this version
	// if (moment.prerequisiteConcepts) { ... }
	// Would check mastery profile here

	return {
		state: {
			...state,
			pendingTeachingMoment: teachingMoment
		},
		shouldShow: true,
		teachingMoment
	};
}

/**
 * Dismiss a teaching moment
 */
export function dismissTeachingMoment(
	state: SceneState,
	completed: boolean = true
): SceneState {
	if (!state.pendingTeachingMoment) {
		return state;
	}

	const momentId = state.pendingTeachingMoment.id;

	return {
		...state,
		pendingTeachingMoment: undefined,
		shownTeachingMoments: completed
			? [...state.shownTeachingMoments, momentId]
			: state.shownTeachingMoments,
		lastUpdated: new Date().toISOString()
	};
}

// ============================================================================
// INTERACTIONS
// ============================================================================

export interface InteractionResult {
	state: SceneState;
	description?: string;
	dialogueToStart?: string;
	teachingMoment?: TeachingMoment;
	skillCheck?: { skill: string; dc: number };
	stateChanges?: { key: string; value: any }[];
	masteryUpdates?: { conceptId: string; event: MasteryEvent }[];
}

/**
 * Interact with a scene object
 */
export function interactWith(
	state: SceneState,
	interactableId: string,
	actionName: string,
	context: SceneContext
): InteractionResult {
	const scene = getCurrentScene(state, context);
	if (!scene?.interactables) {
		throw new Error('Scene has no interactables');
	}

	const interactable = scene.interactables.find(i => i.id === interactableId);
	if (!interactable) {
		throw new Error(`Interactable not found: ${interactableId}`);
	}

	const action = interactable.actions?.find(a => a.name === actionName);
	if (!action) {
		// Use default action
		return {
			state: {
				...state,
				interactedWith: state.interactedWith.includes(interactableId)
					? state.interactedWith
					: [...state.interactedWith, interactableId],
				lastUpdated: new Date().toISOString()
			},
			description: interactable.description
		};
	}

	let updatedState: SceneState = {
		...state,
		interactedWith: state.interactedWith.includes(interactableId)
			? state.interactedWith
			: [...state.interactedWith, interactableId],
		lastUpdated: new Date().toISOString()
	};

	const result: InteractionResult = { state: updatedState };

	// Handle skill check requirement
	if (action.skillCheck) {
		result.skillCheck = action.skillCheck;
	}

	// Handle result
	if (action.result) {
		switch (action.result.type) {
			case 'dialogue':
				result.dialogueToStart = action.result.dialogueNodeId;
				break;
			case 'teaching_moment':
				result.teachingMoment = action.result.teachingContent;
				break;
			case 'state_change':
				if (action.result.stateChanges) {
					result.stateChanges = action.result.stateChanges;
					for (const change of action.result.stateChanges) {
						updatedState = setStateVariable(updatedState, change.key, change.value);
					}
					result.state = updatedState;
				}
				break;
		}
	}

	return result;
}

// ============================================================================
// MODULE COMPLETION
// ============================================================================

export interface CompletionStatus {
	isComplete: boolean;
	requiredScenesVisited: { required: string[]; visited: string[] };
	masteryMet: { required: { conceptId: string; level: string }[]; met: boolean[] };
	percentComplete: number;
}

/**
 * Check module completion status
 */
export function checkModuleCompletion(
	state: SceneState,
	context: SceneContext
): CompletionStatus {
	const criteria = context.module.completionCriteria;

	// Check required scenes
	const visitedScenes = [state.currentSceneId, ...state.previousSceneIds];
	const requiredScenes = criteria?.requiredScenes || [];
	const scenesVisited = requiredScenes.filter(s => visitedScenes.includes(s));

	// Check concept mastery
	const masteryReqs = criteria?.conceptMastery || [];
	const masteryMet = masteryReqs.map(req => {
		const mastery = getConceptMastery(context.masteryProfile, req.conceptId);
		// Simplified check - would need proper level comparison
		return mastery.level !== 'unknown' && mastery.level !== 'introduced';
	});

	// Calculate overall completion
	const scenesComplete = scenesVisited.length / Math.max(1, requiredScenes.length);
	const masteryComplete = masteryMet.filter(Boolean).length / Math.max(1, masteryReqs.length);
	const percentComplete = Math.round((scenesComplete * 0.6 + masteryComplete * 0.4) * 100);

	const isComplete = scenesVisited.length === requiredScenes.length &&
		masteryMet.every(Boolean);

	return {
		isComplete,
		requiredScenesVisited: {
			required: requiredScenes,
			visited: scenesVisited
		},
		masteryMet: {
			required: masteryReqs,
			met: masteryMet
		},
		percentComplete
	};
}

// ============================================================================
// SAVE/LOAD
// ============================================================================

/**
 * Serialize scene state for saving
 */
export function serializeSceneState(state: SceneState): string {
	return JSON.stringify(state);
}

/**
 * Deserialize scene state from saved data
 */
export function deserializeSceneState(data: string): SceneState {
	return JSON.parse(data);
}

/**
 * Create a save point
 */
export function createSavePoint(state: SceneState): {
	saveId: string;
	timestamp: string;
	moduleId: string;
	sceneId: string;
	data: string;
} {
	const saveId = `save-${Date.now()}`;

	return {
		saveId,
		timestamp: new Date().toISOString(),
		moduleId: state.moduleId,
		sceneId: state.currentSceneId,
		data: serializeSceneState(state)
	};
}
