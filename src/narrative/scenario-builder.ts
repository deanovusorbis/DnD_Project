/**
 * D&D Experiential Learning Platform - Scenario Builder
 * Tools for creating and validating educational scenarios
 */

import {
	Scene,
	SceneTransition,
	DialogueNode,
	TeachingMoment
} from '@dnd/types/scenario.types';

// ============================================================================
// TYPES
// ============================================================================

export interface ScenarioBlueprint {
	id: string;
	name: string;
	description: string;
	targetAudience: 'beginner' | 'intermediate' | 'advanced';
	estimatedDuration: number;
	scenes: Scene[];
	dialogueNodes: DialogueNode[];
	startSceneId: string;
	endSceneIds: string[];
	conceptsCovered: string[];
	author: string;
	version: string;
	createdAt: string;
	updatedAt: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

export interface ValidationError {
	type: string;
	message: string;
	sceneId?: string;
}

export interface ValidationWarning {
	type: string;
	message: string;
	sceneId?: string;
	suggestion?: string;
}

// ============================================================================
// SCENARIO FACTORY
// ============================================================================

export function createScenario(
	name: string,
	description: string,
	author: string
): ScenarioBlueprint {
	const id = `scenario-${Date.now()}`;
	const now = new Date().toISOString();

	return {
		id,
		name,
		description,
		targetAudience: 'beginner',
		estimatedDuration: 30,
		scenes: [],
		dialogueNodes: [],
		startSceneId: '',
		endSceneIds: [],
		conceptsCovered: [],
		author,
		version: '1.0.0',
		createdAt: now,
		updatedAt: now
	};
}

export function createScene(
	id: string,
	name: string,
	description: string,
	narrativeType: Scene['narrativeType'] = 'exploration'
): Scene {
	return {
		id,
		name,
		description,
		narrativeType,
		setting: 'default',
		openingNarration: description,
		transitions: [],
		teachingMoments: [],
		estimatedDuration: 10,
		difficulty: 'beginner',
		source: 'homebrew'
	};
}

export function createDialogueNode(
	id: string,
	speaker: DialogueNode['speaker'],
	text: string,
	speakerName?: string
): DialogueNode {
	return {
		id,
		name: id,
		speaker,
		speakerName,
		text,
		source: 'homebrew'
	};
}

export function createTeachingMoment(
	id: string,
	conceptId: string,
	headline: string,
	explanation: string,
	timing: TeachingMoment['timing'] = 'after_action'
): TeachingMoment {
	return {
		id,
		name: headline,
		conceptId,
		timing,
		headline,
		explanation,
		dismissible: true,
		showOnlyOnce: false,
		priority: 'medium',
		source: 'homebrew'
	};
}

export function createTransition(
	id: string,
	targetSceneId: string
): SceneTransition {
	return {
		id,
		targetSceneId
	};
}

// ============================================================================
// BUILDER FUNCTIONS
// ============================================================================

export function addSceneToScenario(
	scenario: ScenarioBlueprint,
	scene: Scene
): ScenarioBlueprint {
	return {
		...scenario,
		scenes: [...scenario.scenes, scene],
		updatedAt: new Date().toISOString()
	};
}

export function addDialogueToScenario(
	scenario: ScenarioBlueprint,
	dialogue: DialogueNode
): ScenarioBlueprint {
	return {
		...scenario,
		dialogueNodes: [...scenario.dialogueNodes, dialogue],
		updatedAt: new Date().toISOString()
	};
}

export function addTransitionToScene(
	scene: Scene,
	transition: SceneTransition
): Scene {
	return {
		...scene,
		transitions: [...(scene.transitions || []), transition]
	};
}

export function addTeachingMomentToScene(
	scene: Scene,
	teachingMoment: TeachingMoment
): Scene {
	return {
		...scene,
		teachingMoments: [...(scene.teachingMoments || []), teachingMoment]
	};
}

export function setStartScene(
	scenario: ScenarioBlueprint,
	sceneId: string
): ScenarioBlueprint {
	return {
		...scenario,
		startSceneId: sceneId,
		updatedAt: new Date().toISOString()
	};
}

export function addEndScene(
	scenario: ScenarioBlueprint,
	sceneId: string
): ScenarioBlueprint {
	return {
		...scenario,
		endSceneIds: [...scenario.endSceneIds, sceneId],
		updatedAt: new Date().toISOString()
	};
}

export function addCoveredConcept(
	scenario: ScenarioBlueprint,
	conceptId: string
): ScenarioBlueprint {
	if (scenario.conceptsCovered.includes(conceptId)) return scenario;

	return {
		...scenario,
		conceptsCovered: [...scenario.conceptsCovered, conceptId],
		updatedAt: new Date().toISOString()
	};
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateScenario(scenario: ScenarioBlueprint): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	// Check for start scene
	if (!scenario.startSceneId) {
		errors.push({
			type: 'missing_start',
			message: 'Scenario has no start scene defined'
		});
	} else if (!scenario.scenes.find(s => s.id === scenario.startSceneId)) {
		errors.push({
			type: 'invalid_reference',
			message: `Start scene "${scenario.startSceneId}" does not exist`,
			sceneId: scenario.startSceneId
		});
	}

	// Check for end scenes
	if (scenario.endSceneIds.length === 0) {
		warnings.push({
			type: 'no_end_scene',
			message: 'No end scenes defined',
			suggestion: 'Add at least one end scene for proper closure'
		});
	}

	// Validate each scene
	for (const scene of scenario.scenes) {
		const transitions = scene.transitions || [];
		const teachingMoments = scene.teachingMoments || [];

		// Check for transitions
		if (transitions.length === 0 && !scenario.endSceneIds.includes(scene.id)) {
			errors.push({
				type: 'no_transitions',
				message: `Scene "${scene.name}" has no outgoing transitions and is not an end scene`,
				sceneId: scene.id
			});
		}

		// Validate transition targets
		for (const transition of transitions) {
			if (!scenario.scenes.find(s => s.id === transition.targetSceneId)) {
				errors.push({
					type: 'invalid_reference',
					message: `Transition to non-existent scene "${transition.targetSceneId}"`,
					sceneId: scene.id
				});
			}
		}

		// Check for teaching moments
		if (teachingMoments.length === 0) {
			warnings.push({
				type: 'no_teaching',
				message: `Scene "${scene.name}" has no teaching moments`,
				sceneId: scene.id,
				suggestion: 'Consider adding educational content'
			});
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

export function exportScenario(scenario: ScenarioBlueprint): string {
	return JSON.stringify(scenario, null, 2);
}

export function importScenario(json: string): ScenarioBlueprint | null {
	try {
		const scenario = JSON.parse(json) as ScenarioBlueprint;
		if (!scenario.id || !scenario.name || !Array.isArray(scenario.scenes)) {
			return null;
		}
		return scenario;
	} catch {
		return null;
	}
}

// ============================================================================
// QUICK TEMPLATES
// ============================================================================

export function createTutorialTemplate(title: string, author: string): ScenarioBlueprint {
	let scenario = createScenario(title, 'A tutorial teaching basic D&D concepts', author);

	// Create scenes
	const intro = createScene('intro', 'Introduction', 'Welcome to D&D');
	const dice = createScene('dice', 'Dice Basics', 'Learning the d20', 'exploration');
	const conclusion = createScene('conclusion', 'Well Done!', 'Tutorial complete');

	// Add teaching moments
	const introWithTeaching = addTeachingMomentToScene(intro,
		createTeachingMoment('tm1', 'introduction', 'What is D&D?', 'A tabletop RPG where you create stories together.')
	);
	const diceWithTeaching = addTeachingMomentToScene(dice,
		createTeachingMoment('tm2', 'd20_roll', 'The d20', 'A twenty-sided die used for most checks.')
	);

	// Add transitions
	const introWithTransition = addTransitionToScene(introWithTeaching, createTransition('t1', 'dice'));
	const diceWithTransition = addTransitionToScene(diceWithTeaching, createTransition('t2', 'conclusion'));

	// Build scenario
	scenario = addSceneToScenario(scenario, introWithTransition);
	scenario = addSceneToScenario(scenario, diceWithTransition);
	scenario = addSceneToScenario(scenario, conclusion);
	scenario = setStartScene(scenario, 'intro');
	scenario = addEndScene(scenario, 'conclusion');
	scenario = addCoveredConcept(scenario, 'd20_roll');
	scenario = addCoveredConcept(scenario, 'introduction');

	return { ...scenario, targetAudience: 'beginner', estimatedDuration: 10 };
}
