/**
 * D&D Experiential Learning Platform - Equipment Translations
 * Translations for equipment choices and sizes
 */

// Size Names
export const sizeNames: Record<string, string> = {
	'tiny': 'Minik',
	'small': 'Küçük',
	'medium': 'Orta',
	'large': 'Büyük',
	'huge': 'Devasa',
	'gargantuan': 'Kocaman'
};

// Equipment Choice Labels
export const equipmentChoiceLabels: Record<string, string> = {
	'armor-choice': 'Zırh Seçimi',
	'weapon-choice': 'Silah Seçimi',
	'ranged-choice': 'Uzak Mesafe Seçimi',
	'pack-choice': 'Paket Seçimi',
	'focus-choice': 'Odak Seçimi',
	'holy-symbol-choice': 'Kutsal Sembol Seçimi',
	'instrument-choice': 'Enstrüman Seçimi',
	'arcane-focus-choice': 'Arkan Odak Seçimi'
};

// Helper Functions
export function translateSize(size: string): string {
	return sizeNames[size.toLowerCase()] || size;
}

export function translateEquipmentChoiceId(id: string): string {
	return equipmentChoiceLabels[id] || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
