import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';
import {
	translateClassName,
	translateSubclassName,
	translateDescription
} from '../../../../utils/translations/index.ts';

export function renderClassStep(parent: HTMLElement, onStepComplete: () => void): void {
	const classes = registry.getAllClasses();

	const grid = document.createElement('div');
	grid.className = 'concepts-grid';

	classes.forEach(cls => {
		const isSelected = useGameStore.getState().characterCreation.selectedClass === cls.id;
		let subclassSelect: HTMLSelectElement | null = null;

		// Check for Subclass Choice - always show if subclasses exist
		if (isSelected && cls.subclasses && cls.subclasses.length > 0) {
			subclassSelect = document.createElement('select');
			subclassSelect.style.width = '100%';
			subclassSelect.style.marginTop = '12px';
			subclassSelect.style.padding = '8px';
			subclassSelect.style.borderRadius = '4px';
			subclassSelect.style.border = '1px solid var(--color-border)';
			subclassSelect.style.background = 'var(--color-bg-secondary)';
			subclassSelect.style.color = 'var(--color-text-primary)';

			const defaultOption = document.createElement('option');
			defaultOption.value = '';
			defaultOption.text = `${cls.subclassName} Seçin...`;
			if (subclassSelect) {
				const sSelect = subclassSelect;
				sSelect.appendChild(defaultOption);

				cls.subclasses.forEach(sub => {
					const option = document.createElement('option');
					option.value = sub.id;
					option.text = translateSubclassName(sub.name);
					if (useGameStore.getState().characterCreation.selectedSubclass === sub.id) {
						option.selected = true;
					}
					sSelect.appendChild(option);
				});

				sSelect.onchange = (e) => {
					const target = e.target as HTMLSelectElement;
					useGameStore.getState().updateCharacterCreation({
						selectedSubclass: target.value || undefined
					});
					onStepComplete(); // Re-render to show update
				};
			}
		}

		const card = createCard({
			title: translateClassName(cls.name),
			content: `
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--color-bg-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: var(--color-accent-red); border: 1px solid var(--color-border);">
                        Can Zarı: ${cls.hitDie}
                    </span>
                </div>
                <p style="font-size: 0.9rem; line-height: 1.5; color: var(--color-text-secondary); min-height: 60px;">
                    ${translateDescription(cls.description)}
                </p>
            `,
			footer: isSelected && subclassSelect ? subclassSelect : createButton({
				label: isSelected ? 'Seçildi' : 'Sınıfı Seç',
				variant: isSelected ? 'secondary' : 'primary',
				size: 'sm',
				disabled: isSelected,
				onClick: () => {
					useGameStore.getState().updateCharacterCreation({
						selectedClass: cls.id,
						selectedSubclass: undefined // Reset subclass on new class selection
					});
					onStepComplete();
				}
			})
		});

		grid.appendChild(card);
	});

	parent.appendChild(grid);

	// Next Step Action (Class -> Background)
	const state = useGameStore.getState();
	const canProceed = !!state.characterCreation.selectedClass;

	const actionContainer = document.createElement('div');
	actionContainer.style.marginTop = 'var(--space-xl)';
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'flex-end';
	actionContainer.style.paddingTop = 'var(--space-md)';
	actionContainer.style.borderTop = '1px solid var(--color-border)';

	const nextButton = createButton({
		label: 'Devam Et (Geçmiş Seçimi) ➡️',
		variant: 'primary',
		size: 'md',
		disabled: !canProceed,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'background' });
			onStepComplete();
		}
	});

	actionContainer.appendChild(nextButton);
	parent.appendChild(actionContainer);

	const hint = createRuleHint({
		ruleId: 'class-mechanics',
		title: 'Sınıf (Class) Ne İşe Yarar?',
		concept: 'Karakter Gelişimi',
		description: 'Sınıfınız, karakterinizin dünyadaki mesleğidir. Hangi silahları kullanabileceğinizi, büyü yapıp yapamayacağınızı ve savaş alanındaki rolünüzü sınıfınız belirler.'
	});
	parent.appendChild(hint);
}
