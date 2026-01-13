import { StoreSlice, UserSlice, SystemSlice } from './types';

export const createUserSlice: StoreSlice<UserSlice> = (set) => ({
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
});

export const createSystemSlice: StoreSlice<SystemSlice> = (set) => ({
	system: {
		isLoading: false,
		notifications: []
	},
	setLoading: (isLoading) => set((state) => ({
		system: { ...state.system, isLoading }
	})),
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
});
