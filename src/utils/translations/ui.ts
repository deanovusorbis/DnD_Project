/**
 * D&D Experiential Learning Platform - UI Translations
 * Translations for user interface labels and steps
 */

// Step Labels
export const stepLabels: Record<string, string> = {
	'species': 'Irk',
	'class': 'Sınıf',
	'background': 'Geçmiş',
	'abilities': 'Yetenekler',
	'proficiencies': 'Uzmanlıklar',
	'equipment': 'Ekipman',
	'details': 'Detaylar',
	'review': 'Özet'
};

export function getStepLabel(step: string): string {
	return stepLabels[step] || step;
}
