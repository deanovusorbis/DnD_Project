/**
 * D&D Experiential Learning Platform - Game Store
 * Centralized state management using Zustand (Consolidated Modular)
 */

import { create } from 'zustand';
import { GameState } from './store/types';
import { createUserSlice, createSystemSlice } from './store/app-slices';
import { createCampaignSlice, createCharacterCreationSlice, createCombatSlice } from './store/game-slices';

/**
 * The main game store, re-assembled from grouped slices.
 * This pattern avoids "God Objects" while keeping the file count manageable.
 */
export const useGameStore = create<GameState>()((...a) => ({
	...createUserSlice(...a),
	...createSystemSlice(...a),
	...createCampaignSlice(...a),
	...createCharacterCreationSlice(...a),
	...createCombatSlice(...a),
}));

// Export all types and interfaces
export * from './store/types';


