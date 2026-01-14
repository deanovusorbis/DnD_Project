import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { renderStandardArray } from './abilities/StandardArray.ts';
import { renderPointBuy } from './abilities/PointBuy.ts';
import { renderDiceRoll } from './abilities/DiceRoll.ts';

export function renderAbilitiesStep(parent: HTMLElement, onStepComplete: () => void): void {
	const state = useGameStore.getState();
	const cState = state.characterCreation;
	const method = cState.abilityMethod || 'standard_array';

	// 1. Method Selection Tabs
	const methodSelector = document.createElement('div');
	methodSelector.style.display = 'flex';
	methodSelector.style.gap = 'var(--space-sm)';
	methodSelector.style.marginBottom = 'var(--space-lg)';
	methodSelector.style.padding = 'var(--space-xs)';
	methodSelector.style.background = 'var(--color-bg-secondary)';
	methodSelector.style.borderRadius = 'var(--radius-md)';
	methodSelector.style.border = '1px solid var(--color-border)';

	const methods: { id: 'standard_array' | 'point_buy' | 'roll'; label: string; icon: string }[] = [
		{ id: 'standard_array', label: 'Standart Dizi', icon: '📋' },
		{ id: 'point_buy', label: 'Point Buy', icon: '⚖️' },
		{ id: 'roll', label: 'Zarla (4d6)', icon: '🎲' }
	];

	methods.forEach(m => {
		const btn = document.createElement('button');
		btn.innerHTML = `${m.icon} ${m.label}`;
		btn.style.flex = '1';
		btn.style.padding = '10px 16px';
		btn.style.border = 'none';
		btn.style.borderRadius = 'var(--radius-sm)';
		btn.style.cursor = 'pointer';
		btn.style.fontSize = '0.9rem';
		btn.style.fontWeight = '600';
		btn.style.transition = 'all 0.2s';
		btn.style.fontFamily = 'inherit';

		if (method === m.id) {
			btn.style.background = 'var(--color-accent-gold)';
			btn.style.color = 'var(--color-bg-primary)';
		} else {
			btn.style.background = 'transparent';
			btn.style.color = 'var(--color-text-secondary)';
			btn.onmouseover = () => btn.style.background = 'var(--color-bg-tertiary)';
			btn.onmouseout = () => btn.style.background = 'transparent';
		}

		btn.onclick = () => {
			useGameStore.getState().updateCharacterCreation({
				abilityMethod: m.id,
				abilityAssignments: {},
				abilityScores: {}
			});
			onStepComplete();
		};

		methodSelector.appendChild(btn);
	});

	parent.appendChild(methodSelector);

	// 2. Render selected method
	const methodContainer = document.createElement('div');
	if (method === 'standard_array') {
		renderStandardArray(methodContainer, onStepComplete);
	} else if (method === 'point_buy') {
		renderPointBuy(methodContainer, onStepComplete);
	} else {
		renderDiceRoll(methodContainer, onStepComplete);
	}
	parent.appendChild(methodContainer);


}

export function renderAbilityFooter(parent: HTMLElement, isComplete: boolean, onStepComplete: () => void): void {
	const actionContainer = document.createElement('div');
	actionContainer.style.marginTop = 'var(--space-xl)';
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'flex-end';
	actionContainer.style.paddingTop = 'var(--space-md)';
	actionContainer.style.borderTop = '1px solid var(--color-border)';

	const nextButton = createButton({
		label: 'Devam Et (Uzmanlıklar) ➡️',
		variant: 'primary',
		size: 'md',
		disabled: !isComplete,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'proficiencies' });
			onStepComplete();
		}
	});

	actionContainer.appendChild(nextButton);
	parent.appendChild(actionContainer);
}
