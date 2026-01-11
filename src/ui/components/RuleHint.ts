/**
 * D&D Experiential Learning Platform - RuleHint Component
 * Provides contextual pedagogical guidance about D&D rules.
 */

export interface RuleHintOptions {
	ruleId: string;
	title: string;
	description: string;
	concept?: string; // e.g., 'Ability Checks', 'D20 System'
	className?: string;
}

export function createRuleHint(options: RuleHintOptions): HTMLElement {
	const hint = document.createElement('div');
	hint.className = `rule-hint ${options.className || ''}`.trim();
	hint.dataset.ruleId = options.ruleId;

	const header = document.createElement('div');
	header.className = 'rule-hint-header';
	header.innerHTML = `
		<span class="rule-hint-icon">💡</span>
		<span class="rule-hint-title">${options.title}</span>
		${options.concept ? `<span class="rule-hint-tag">${options.concept}</span>` : ''}
	`;

	const body = document.createElement('div');
	body.className = 'rule-hint-body';
	body.innerHTML = options.description;

	hint.appendChild(header);
	hint.appendChild(body);

	// Accessibility/Interactive: clicking the title toggles the body
	header.addEventListener('click', () => {
		hint.classList.toggle('collapsed');
	});

	return hint;
}
