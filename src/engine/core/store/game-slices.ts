import { StoreSlice, CampaignSlice, CharacterCreationSlice, CombatSlice } from './types';
import { createCharacterCreationState } from '../../../entities/character/character-creation.ts';

export const createCampaignSlice: StoreSlice<CampaignSlice> = (set) => ({
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
	setActiveCharacter: (character) => set((state) => ({
		campaign: { ...state.campaign, activeCharacter: character }
	})),
});

export const createCharacterCreationSlice: StoreSlice<CharacterCreationSlice> = (set) => ({
	characterCreation: createCharacterCreationState(),
	updateCharacterCreation: (update) => set((state) => ({
		characterCreation: { ...state.characterCreation, ...update }
	})),
});

export const createCombatSlice: StoreSlice<CombatSlice> = (set) => ({
	combat: undefined,
	setCombatState: (combatState) => set(() => ({
		combat: combatState
	})),
});
