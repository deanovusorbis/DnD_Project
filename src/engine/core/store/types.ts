import { Character, CharacterCreationState } from '@dnd/types/index';
import { StateCreator } from 'zustand';

// --- Base State Interfaces ---

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

// --- Slice Interfaces ---

export interface UserSlice {
	user: UserState;
	updateUserPreferences: (prefs: Partial<UserState['preferences']>) => void;
	completeTutorial: (tutorialId: string) => void;
}

export interface SystemSlice {
	system: SystemState;
	setLoading: (isLoading: boolean) => void;
	addNotification: (message: string, type?: SystemState['notifications'][0]['type']) => void;
	removeNotification: (id: string) => void;
}

export interface CampaignSlice {
	campaign: CampaignState;
	setActiveCharacter: (character: Character) => void;
}

export interface CharacterCreationSlice {
	characterCreation: CharacterCreationState;
	updateCharacterCreation: (update: Partial<CharacterCreationState>) => void;
}

export interface CombatSlice {
	combat?: any;
	setCombatState: (combatState: any | undefined) => void;
}

// Combine all slices for the main store type
export type GameState =
	UserSlice &
	SystemSlice &
	CampaignSlice &
	CharacterCreationSlice &
	CombatSlice;

// Helper type for defining slices
export type StoreSlice<T> = StateCreator<GameState, [], [], T>;

