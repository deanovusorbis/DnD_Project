import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';
import {
	translateSpeciesName,
	translateSubspeciesName,
	translateSize,
	translateDescription
} from '../../../../utils/translations/index.ts';

export function renderSpeciesStep(parent: HTMLElement, onStepComplete: () => void): void {
	const speciesList = registry.getAllSpecies().sort((a, b) =>
		translateSpeciesName(a.name).localeCompare(translateSpeciesName(b.name), 'tr')
	);

	const grid = document.createElement('div');
	grid.className = 'concepts-grid';

	speciesList.forEach(species => {
		// Check for subraces
		const hasSubraces = species.subraces && species.subraces.length > 0;
		let subraceSelect: HTMLSelectElement | undefined;

		if (hasSubraces) {
			subraceSelect = document.createElement('select');
			subraceSelect.className = 'subrace-selector';
			subraceSelect.style.width = '100%';
			subraceSelect.style.marginTop = '10px';
			subraceSelect.style.fontSize = '0.8rem';

			subraceSelect.innerHTML = species.subraces!.map(sr =>
				`<option value="${sr.id}">${translateSubspeciesName(sr.name)}</option>`
			).join('');
		}

		const cardContent = document.createElement('div');
		cardContent.style.minHeight = hasSubraces ? '200px' : 'auto';
		cardContent.style.display = 'flex';
		cardContent.style.flexDirection = 'column';
		cardContent.style.height = '100%';
		cardContent.innerHTML = `
            <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 8px;">
                <div>
                    <strong style="color: var(--color-accent-blue);">Hız:</strong> ${species.speed} ft
                </div>
                <div>
                    <strong style="color: var(--color-accent-blue);">Boyut:</strong> ${translateSize(species.size)}
                </div>
            </div>
            <p style="font-size: 0.9rem; line-height: 1.5; color: var(--color-text-secondary); margin: 0;">
                ${translateDescription(species.description)}
            </p>
        `;
		if (subraceSelect) {
			const subraceWrapper = document.createElement('div');
			subraceWrapper.style.marginTop = 'auto';
			subraceWrapper.style.marginBottom = '4px';
			subraceWrapper.style.paddingTop = '12px';

			const subraceLabel = document.createElement('label');
			subraceLabel.style.fontSize = '0.75rem';
			subraceLabel.style.color = 'var(--color-accent-gold)';
			subraceLabel.style.display = 'block';
			subraceLabel.style.marginBottom = '6px';
			subraceLabel.style.fontWeight = '500';
			subraceLabel.innerText = 'Alt Tür Seçin:';

			subraceSelect.style.background = 'var(--color-bg-tertiary)';
			subraceSelect.style.border = '1px solid var(--color-border)';
			subraceSelect.style.borderRadius = 'var(--radius-sm)';
			subraceSelect.style.padding = '8px';
			subraceSelect.style.color = 'var(--color-text-primary)';

			subraceWrapper.appendChild(subraceLabel);
			subraceWrapper.appendChild(subraceSelect);
			cardContent.appendChild(subraceWrapper);
		}

		const card = createCard({
			title: translateSpeciesName(species.name),

			content: cardContent,
			footer: createButton({
				label: 'Seç',
				variant: 'primary',
				size: 'sm',
				onClick: () => {
					const selectedSub = subraceSelect ? subraceSelect.value : undefined;
					useGameStore.getState().updateCharacterCreation({
						selectedSpecies: species.id,
						selectedSubspecies: selectedSub
					});
					onStepComplete(); // Notify view to re-render
				}
			})
		});
		grid.appendChild(card);
	});

	parent.appendChild(grid);

	// Pedagogy Hint
	const hint = createRuleHint({
		ruleId: 'species-choice',
		title: 'Neden Tür (Species) Seçiyoruz?',
		concept: 'Temel Mekanikler',
		description: 'D&D\'de tür seçiminiz karakterinizin temel yeteneklerini, hızını ve bazı özel güçlerini belirler. Örneğin, bir Elf doğal olarak daha çeviktir ve karanlıkta görebilir.'
	});
	parent.appendChild(hint);

	// Next Step Action
	const state = useGameStore.getState();
	const canProceed = !!state.characterCreation.selectedSpecies;

	const actionContainer = document.createElement('div');
	actionContainer.style.marginTop = 'var(--space-xl)';
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'flex-end';
	actionContainer.style.paddingTop = 'var(--space-md)';
	actionContainer.style.borderTop = '1px solid var(--color-border)';

	const nextButton = createButton({
		label: 'Devam Et (Sınıf Seçimi) ➡️',
		variant: 'primary',
		size: 'md',
		disabled: !canProceed,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'class' });
			onStepComplete();
		}
	});

	actionContainer.appendChild(nextButton);
	parent.appendChild(actionContainer);
}
