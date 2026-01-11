/**
 * D&D Experiential Learning Platform - Game Store
 * Centralized state management using Zustand
 */

import { create } from 'zustand';
import { Character, CharacterCreationState } from '@dnd/types/index';
// import { CombatState } from '../combat/combat-engine';
import { createCharacterCreationState } from '../../entities/character/character-creation.ts';

// ============================================================================
// STATE INTERFACES
// ============================================================================

export interface UserState {
	preferences: {
		theme: 'dark' | 'light' | 'auto';
		dice3D: boolean;
		autoRoll: boolean;
	};
	progression: {
		tutorialsCompleted: string[];
		conceptsMastered: string[];
		currentScenarioId?: string;
	};
}

export interface CampaignState {
	activeCharacter?: Character;
	party: Character[];
	inventory: {
		gold: number;
		items: string[];
	};
	questLog: {
		active: string[];
		completed: string[];
	};
}

export interface SystemState {
	isLoading: boolean;
	activeModal?: string;
	notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];
}

export interface GameState {
	// Sub-states
	user: UserState;
	campaign: CampaignState;
	system: SystemState;
	characterCreation: CharacterCreationState;
	combat?: any; // Active combat state if any

	// Actions
	setLoading: (isLoading: boolean) => void;
	setActiveCharacter: (character: Character) => void;
	updateUserPreferences: (prefs: Partial<UserState['preferences']>) => void;
	completeTutorial: (tutorialId: string) => void;
	addNotification: (message: string, type?: SystemState['notifications'][0]['type']) => void;
	removeNotification: (id: string) => void;
	updateCharacterCreation: (update: Partial<CharacterCreationState>) => void;

	// Combat Actions
	setCombatState: (combatState: any | undefined) => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGameStore = create<GameState>((set) => ({
	// Initial State
	user: {
		preferences: {
			theme: 'dark',
			dice3D: true,
			autoRoll: false
		},
		progression: {
			tutorialsCompleted: [],
			conceptsMastered: [],
		}
	},
	campaign: {
		party: [],
		inventory: {
			gold: 0,
			items: []
		},
		questLog: {
			active: [],
			completed: []
		}
	},
	system: {
		isLoading: false,
		notifications: []
	},
	characterCreation: createCharacterCreationState(),
	combat: undefined,

	// Actions
	setLoading: (isLoading) => set((state) => ({
		system: { ...state.system, isLoading }
	})),

	setActiveCharacter: (character) => set((state) => ({
		campaign: { ...state.campaign, activeCharacter: character }
	})),

	updateUserPreferences: (prefs) => set((state) => ({
		user: {
			...state.user,
			preferences: { ...state.user.preferences, ...prefs }
		}
	})),

	completeTutorial: (tutorialId) => set((state) => {
		if (state.user.progression.tutorialsCompleted.includes(tutorialId)) {
			return state;
		}
		return {
			user: {
				...state.user,
				progression: {
					...state.user.progression,
					tutorialsCompleted: [...state.user.progression.tutorialsCompleted, tutorialId]
				}
			}
		};
	}),

	addNotification: (message, type = 'info') => set((state) => {
		const id = `notif-${Date.now()}`;
		return {
			system: {
				...state.system,
				notifications: [...state.system.notifications, { id, message, type }]
			}
		};
	}),

	removeNotification: (id) => set((state) => ({
		system: {
			...state.system,
			notifications: state.system.notifications.filter(n => n.id !== id)
		}
	})),

	updateCharacterCreation: (update) => set((state) => ({
		characterCreation: { ...state.characterCreation, ...update }
	})),

	setCombatState: (combatState) => set(() => ({
		combat: combatState
	}))
}));
