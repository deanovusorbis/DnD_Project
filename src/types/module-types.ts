/**
 * Module System Type Definitions
 * Defines the structure for learning modules
 */

export type ModuleCategory = 'basics' | 'species' | 'class';

export type ModuleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ModuleChoice {
	id: string;
	text: string;
	nextStep: string;
	feedback?: string;
}

export interface ModuleStep {
	id: string;
	type: 'dialogue' | 'choice' | 'info' | 'challenge';
	speaker?: string; // "mascot", "narrator", etc.
	content: string;
	choices?: ModuleChoice[];
	nextStep?: string; // For linear progression
	image?: string; // Optional image path
	backgroundImage?: string; // Optional background override
}

export interface ModuleScenario {
	title: string;
	description: string;
	backgroundImage?: string; // Default background for the scenario
	steps: ModuleStep[];
	learningObjectives: string[];
	estimatedTime: number; // in minutes
}

export interface LearningModule {
	id: string;
	category: ModuleCategory;
	name: string;
	icon: string; // emoji or icon identifier
	difficulty: ModuleDifficulty;
	description: string;
	scenario: ModuleScenario;
	relatedDataId: string; // Links to species/class ID in SRD data
}

export interface ModuleProgress {
	moduleId: string;
	completed: boolean;
	currentStep: string;
	startedAt?: Date;
	completedAt?: Date;
	score?: number;
}

export interface ModuleState {
	availableModules: LearningModule[];
	userProgress: Record<string, ModuleProgress>;
	currentModule: LearningModule | null;
	currentStep: string | null;
}
