/**
 * Character Manager - Save/Load characters using localStorage
 */

import { Character } from '../../types/character.types.ts';

const STORAGE_KEY = 'dnd_characters';

export interface SavedCharacterMeta {
	id: string;
	name: string;
	class: string;
	level: number;
	species: string;
	lastModified: string;
}

export class CharacterManager {
	/**
	 * Save a character to localStorage
	 */
	static saveCharacter(character: Character): void {
		const characters = this.getAllCharacters();
		const existingIndex = characters.findIndex(c => c.id === character.id);

		if (existingIndex >= 0) {
			characters[existingIndex] = character;
		} else {
			characters.push(character);
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
	}

	/**
	 * Load a character by ID
	 */
	static loadCharacter(id: string): Character | null {
		const characters = this.getAllCharacters();
		return characters.find(c => c.id === id) || null;
	}

	/**
	 * Delete a character by ID
	 */
	static deleteCharacter(id: string): boolean {
		const characters = this.getAllCharacters();
		console.log(`[CharacterManager] Attempting to delete character ${id}. Total characters: ${characters.length}`);

		const filtered = characters.filter(c => c.id !== id);
		console.log(`[CharacterManager] Filtered count: ${filtered.length}`);

		if (filtered.length !== characters.length) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
			console.log('[CharacterManager] Saved new character list to localStorage.');
			return true;
		}

		console.warn(`[CharacterManager] Character ${id} not found in storage.`);
		return false;
	}

	/**
	 * Get all saved characters
	 */
	static getAllCharacters(): Character[] {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];

		try {
			return JSON.parse(stored);
		} catch {
			console.error('Failed to parse saved characters');
			return [];
		}
	}

	/**
	 * Get character metadata for listing (lightweight)
	 */
	static listCharacters(): SavedCharacterMeta[] {
		const characters = this.getAllCharacters();
		return characters.map(c => ({
			id: c.id,
			name: c.name,
			class: c.progression?.classes?.[0]?.classId || 'Unknown',
			level: c.progression?.totalLevel || 1,
			species: c.speciesId || 'Unknown',
			lastModified: c.updatedAt || new Date().toISOString()
		}));
	}

	/**
	 * Export character as JSON string (for sharing)
	 */
	static exportCharacter(id: string): string | null {
		const character = this.loadCharacter(id);
		if (!character) return null;
		return JSON.stringify(character, null, 2);
	}

	/**
	 * Import character from JSON string
	 */
	static importCharacter(jsonString: string): Character | null {
		try {
			const character = JSON.parse(jsonString) as Character;
			// Generate new ID to avoid conflicts
			character.id = crypto.randomUUID();
			this.saveCharacter(character);
			return character;
		} catch {
			console.error('Failed to import character');
			return null;
		}
	}

	/**
	 * Generate a unique ID for new characters
	 */
	static generateId(): string {
		return crypto.randomUUID();
	}
}
