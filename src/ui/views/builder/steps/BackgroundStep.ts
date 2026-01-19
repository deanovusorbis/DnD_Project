import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';
import { AbilityName } from '../../../../types/core.types.ts';

export function renderBackgroundStep(parent: HTMLElement, onStepComplete: () => void): void {
	const backgrounds = registry.getAllBackgrounds();
	const state = useGameStore.getState();
	const selectedBgId = state.characterCreation.selectedBackground;
	const currentBgAssignments = state.characterCreation.backgroundAbilityAssignments || [];

	const grid = document.createElement('div');
	grid.className = 'concepts-grid';

	backgrounds.forEach(bg => {
		const isSelected = selectedBgId === bg.id;
		const abilityOptions = bg.abilityScores || [];

		let abilityAssignmentUI: HTMLElement | null = null;

		// If selected, show ability assignment UI
		if (isSelected && abilityOptions.length > 0) {
			abilityAssignmentUI = document.createElement('div');
			abilityAssignmentUI.style.marginTop = '16px';
			abilityAssignmentUI.style.padding = '16px';
			abilityAssignmentUI.style.background = 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary))';
			abilityAssignmentUI.style.borderRadius = 'var(--radius-md)';
			abilityAssignmentUI.style.border = '2px solid var(--color-accent-gold)';
			abilityAssignmentUI.style.boxShadow = '0 0 12px rgba(194, 165, 108, 0.3)';

			const title = document.createElement('div');
			title.style.fontWeight = 'bold';
			title.style.marginBottom = '8px';
			title.style.color = 'var(--color-accent-gold)';
			title.innerText = 'Yetenek Bonusları Seçin';
			abilityAssignmentUI.appendChild(title);

			const desc = document.createElement('p');
			desc.style.fontSize = '0.8rem';
			desc.style.color = 'var(--color-text-dim)';
			desc.style.marginBottom = '12px';
			desc.innerText = `Seçenekler: ${abilityOptions.join(', ')}`;
			abilityAssignmentUI.appendChild(desc);

			// Method selection buttons
			const methodRow = document.createElement('div');
			methodRow.style.display = 'flex';
			methodRow.style.gap = '8px';
			methodRow.style.marginBottom = '12px';

			const currentMethod = currentBgAssignments.length === 3 ? 'triple' : 'double';

			[
				{ id: 'double', label: '+2 / +1' },
				{ id: 'triple', label: '+1 / +1 / +1' }
			].forEach(method => {
				const btn = document.createElement('button');
				btn.innerText = method.label;
				btn.style.flex = '1';
				btn.style.padding = '8px';
				btn.style.borderRadius = '4px';
				btn.style.border = currentMethod === method.id ? '2px solid var(--color-accent-gold)' : '1px solid var(--color-border)';
				btn.style.background = currentMethod === method.id ? 'var(--color-accent-gold)' : 'var(--color-bg-secondary)';
				btn.style.color = currentMethod === method.id ? 'var(--color-bg-primary)' : 'var(--color-text-primary)';
				btn.style.cursor = 'pointer';
				btn.style.fontWeight = currentMethod === method.id ? 'bold' : 'normal';
				btn.onclick = () => {
					if (method.id === 'triple') {
						// Initialize with 3 empty slots so 'triple' mode persists
						useGameStore.getState().updateCharacterCreation({
							backgroundAbilityAssignments: [
								{ ability: '' as AbilityName, bonus: 1 },
								{ ability: '' as AbilityName, bonus: 1 },
								{ ability: '' as AbilityName, bonus: 1 }
							]
						});
					} else {
						// Reset for double mode
						useGameStore.getState().updateCharacterCreation({ backgroundAbilityAssignments: [] });
					}
					onStepComplete();
				};
				methodRow.appendChild(btn);
			});
			abilityAssignmentUI.appendChild(methodRow);

			// Show dropdowns based on selected method
			if (currentMethod === 'double') {
				// +2/+1 assignment
				const bonusOptions = [{ bonus: 2, label: '+2' }, { bonus: 1, label: '+1' }];
				bonusOptions.forEach(({ bonus, label }) => {
					const row = document.createElement('div');
					row.style.display = 'flex';
					row.style.alignItems = 'center';
					row.style.gap = '8px';
					row.style.marginBottom = '8px';

					const labelEl = document.createElement('span');
					labelEl.style.minWidth = '40px';
					labelEl.style.color = 'var(--color-text-secondary)';
					labelEl.style.fontWeight = 'bold';
					labelEl.innerText = label;
					row.appendChild(labelEl);

					const select = document.createElement('select');
					select.style.flex = '1';
					select.style.padding = '10px 12px';
					select.style.borderRadius = '6px';
					select.style.border = '2px solid var(--color-accent-gold)';
					select.style.background = 'var(--color-bg-primary)';
					select.style.color = 'var(--color-text-primary)';
					select.style.fontSize = '1rem';
					select.style.fontWeight = '500';
					select.style.cursor = 'pointer';

					const defaultOpt = document.createElement('option');
					defaultOpt.value = '';
					defaultOpt.text = 'Seçin...';
					select.appendChild(defaultOpt);

					// Get already selected abilities
					const selectedAbilities = currentBgAssignments.map(a => a.ability);
					const currentSelection = currentBgAssignments.find(a => a.bonus === bonus);

					abilityOptions.forEach((ab: string) => {
						const opt = document.createElement('option');
						opt.value = ab;
						opt.text = ab;

						// Disable if already selected by another bonus
						if (selectedAbilities.includes(ab as AbilityName) && (!currentSelection || currentSelection.ability !== ab)) {
							opt.disabled = true;
						}

						if (currentSelection && currentSelection.ability === ab) {
							opt.selected = true;
						}
						select.appendChild(opt);
					});

					select.onchange = () => {
						const newAssignments = currentBgAssignments.filter(a => a.bonus !== bonus);
						if (select.value) {
							newAssignments.push({ ability: select.value as AbilityName, bonus });
						}
						useGameStore.getState().updateCharacterCreation({ backgroundAbilityAssignments: newAssignments });
						onStepComplete();
					};

					row.appendChild(select);
					abilityAssignmentUI!.appendChild(row);
				});
			} else {
				// +1/+1/+1 assignment
				for (let i = 0; i < 3; i++) {
					const row = document.createElement('div');
					row.style.display = 'flex';
					row.style.alignItems = 'center';
					row.style.gap = '8px';
					row.style.marginBottom = '8px';

					const labelEl = document.createElement('span');
					labelEl.style.minWidth = '40px';
					labelEl.style.color = 'var(--color-text-secondary)';
					labelEl.style.fontWeight = 'bold';
					labelEl.innerText = '+1';
					row.appendChild(labelEl);

					const select = document.createElement('select');
					select.style.flex = '1';
					select.style.padding = '10px 12px';
					select.style.borderRadius = '6px';
					select.style.border = '2px solid var(--color-accent-gold)';
					select.style.background = 'var(--color-bg-primary)';
					select.style.color = 'var(--color-text-primary)';
					select.style.fontSize = '1rem';
					select.style.fontWeight = '500';
					select.style.cursor = 'pointer';

					const defaultOpt = document.createElement('option');
					defaultOpt.value = '';
					defaultOpt.text = 'Seçin...';
					select.appendChild(defaultOpt);

					// Get already selected abilities
					const selectedAbilities = currentBgAssignments.map(a => a.ability);
					const currentSelection = currentBgAssignments[i];

					abilityOptions.forEach((ab: string) => {
						const opt = document.createElement('option');
						opt.value = ab;
						opt.text = ab;

						// Disable if already selected
						if (selectedAbilities.includes(ab as AbilityName) && (!currentSelection || currentSelection.ability !== ab)) {
							opt.disabled = true;
						}

						if (currentSelection && currentSelection.ability === ab) {
							opt.selected = true;
						}
						select.appendChild(opt);
					});

					select.onchange = () => {
						// Bu slot'un önceki seçimini çıkar
						let newAssignments = currentBgAssignments.filter((_, idx) => idx !== i);

						// Yeni seçim varsa ekle
						if (select.value) {
							newAssignments.push({ ability: select.value as AbilityName, bonus: 1 });
						}

						useGameStore.getState().updateCharacterCreation({ backgroundAbilityAssignments: newAssignments });
						onStepComplete();
					};
					row.appendChild(select);
					abilityAssignmentUI!.appendChild(row);
				}
			}
		}
		const card = createCard({
			title: bg.name,
			content: `
				<p style="font-size: 0.9rem; line-height: 1.5; margin-bottom: 8px; color: var(--color-text-secondary);">
					${bg.description || 'Geçmiş hikayenizi şekillendirir.'}
				</p>
				${abilityOptions.length > 0 ? `<p style="font-size: 0.8rem; color: var(--color-accent-blue);"><strong>Yetenekler:</strong> ${abilityOptions.join(', ')}</p>` : ''}
			`,
			footer: isSelected && abilityAssignmentUI ? abilityAssignmentUI : createButton({
				label: isSelected ? 'Seçildi' : 'Geçmişi Seç',
				variant: isSelected ? 'secondary' : 'primary',
				size: 'sm',
				disabled: isSelected,
				onClick: () => {
					useGameStore.getState().updateCharacterCreation({
						selectedBackground: bg.id,
						backgroundAbilityAssignments: [] // Reset assignments on new selection
					});
					onStepComplete();
				}
			})
		});
		grid.appendChild(card);
	});

	parent.appendChild(grid);

	// Continue Button - check if all assignments are complete
	const isDoubleComplete = currentBgAssignments.length === 2 && currentBgAssignments.some(a => a.bonus === 2);
	const isTripleComplete = currentBgAssignments.length === 3 && currentBgAssignments.every(a => a.bonus === 1);
	const canProceed = selectedBgId && (isDoubleComplete || isTripleComplete);
	const actionContainer = document.createElement('div');
	actionContainer.style.marginTop = 'var(--space-xl)';
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'flex-end';
	actionContainer.style.padding = 'var(--space-lg)';
	actionContainer.style.background = 'linear-gradient(to right, transparent, var(--color-bg-secondary))';
	actionContainer.style.borderTop = '2px solid var(--color-accent-gold)';
	actionContainer.style.borderRadius = 'var(--radius-md)';
	actionContainer.style.position = 'sticky';
	actionContainer.style.bottom = '0';
	actionContainer.style.zIndex = '10';

	const nextButton = createButton({
		label: 'Devam Et (Yetenek Puanları) ➡️',
		variant: 'primary',
		size: 'md',
		disabled: !canProceed,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'abilities' });
			onStepComplete();
		}
	});

	actionContainer.appendChild(nextButton);
	parent.appendChild(actionContainer);

	const hint = createRuleHint({
		ruleId: 'background-choice',
		title: 'Geçmiş (Background) Nedir?',
		concept: 'Karakter Hikayesi',
		description: '2024 kurallarına göre, yetenek bonuslarınız artık ırk yerine geçmişten gelir. Geçmişinizin sunduğu 3 yetenek arasından +2/+1 veya +1/+1/+1 dağıtabilirsiniz.'
	});
	parent.insertBefore(hint, parent.firstChild);
}
