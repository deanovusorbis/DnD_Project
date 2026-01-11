/**
 * D&D Experiential Learning Platform - UI Translations
 * Translations for user interface labels and steps
 */

// Step Labels
export const stepLabels: Record<string, string> = {
	'species': '1. Irk',
	'class': '2. Sınıf',
	'background': '3. Geçmiş',
	'abilities': '4. Yetenekler',
	'equipment': '5. Ekipman',
	'details': '6. Detaylar',
	'review': '7. Özet'
};

export function getStepLabel(step: string): string {
	return stepLabels[step] || step;
}
