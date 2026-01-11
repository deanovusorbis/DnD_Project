/**
 * D&D Experiential Learning Platform - CharacterBuilderView
 * Manages the character creation walkthrough.
 */

import { registry } from '../../engine/core/registry.ts';
import { useGameStore } from '../../engine/core/store.ts';
import * as DiceCore from '../../engine/core/dice.ts';
import { createButton } from '../components/Button.ts';
import { createCard } from '../components/Card.ts';
import { createRuleHint } from '../components/RuleHint.ts';
import { createProgressBar } from '../components/ProgressBar.ts';
import { AbilityName, AbilityScores } from '../../types/core.types.ts';
import {
	translateSpeciesName,
	translateSubspeciesName,
	translateClassName,
	translateSubclassName,
	translateSize,
	translateEquipmentChoiceId,
	getStepLabel,
	translateAbilityName,
	translateDescription
} from '../../utils/translations/index.ts';

export class CharacterBuilderView {
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	public render(): void {
		const state = useGameStore.getState();
		const step = state.characterCreation.step || 'species';

		this.container.innerHTML = '';

		const header = document.createElement('div');
		header.className = 'view-header';
		header.innerHTML = `
            <h2>Karakter Oluşturucu</h2>
            <p>D&D dünyasına ilk adımını at. Kendi kahramanını tasarla.</p>
        `;
		this.container.appendChild(header);

		// Progress Stepper with Navigation
		const steps = ['species', 'class', 'background', 'abilities', 'equipment', 'details'];
		const currentStepIndex = steps.indexOf(step);

		// Create clickable stepper
		const stepperContainer = document.createElement('div');
		stepperContainer.style.marginBottom = 'var(--space-lg)';

		const stepperNav = document.createElement('div');
		stepperNav.style.display = 'grid';
		stepperNav.style.gridTemplateColumns = `repeat(${steps.length}, 1fr)`;
		stepperNav.style.gap = 'var(--space-xs)';
		stepperNav.style.marginBottom = 'var(--space-sm)';
		stepperNav.style.width = '100%';

		// Determine unlocked steps based on state
		const cState = state.characterCreation;
		const unlockedSteps = [0]; // Species always unlocked
		if (cState.selectedSpecies) unlockedSteps.push(1); // Class unlocked
		if (cState.selectedClass) unlockedSteps.push(2); // Background unlocked
		if (cState.selectedBackground) unlockedSteps.push(3); // Abilities unlocked
		if (cState.abilityScores && Object.keys(cState.abilityScores).length > 0) unlockedSteps.push(4);

		steps.forEach((s, idx) => {
			const stepBtn = document.createElement('button');
			stepBtn.className = idx === currentStepIndex ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
			// Ensure button takes full width of grid cell and text is centered but not overflowing badly
			stepBtn.style.width = '100%';
			stepBtn.style.whiteSpace = 'nowrap';
			stepBtn.style.overflow = 'hidden';
			stepBtn.style.textOverflow = 'ellipsis';
			stepBtn.style.padding = '6px 4px';

			stepBtn.innerText = `${idx + 1}. ${getStepLabel(s)}`;

			// Enable if it's the current step OR if it's in the unlocked list OR if it's a previous step
			const isUnlocked = idx <= currentStepIndex || unlockedSteps.includes(idx) || idx < unlockedSteps.length;
			stepBtn.disabled = !isUnlocked;

			stepBtn.onclick = () => {
				if (isUnlocked) {
					useGameStore.getState().updateCharacterCreation({ step: s as any });
					this.render();
				}
			};
			stepperNav.appendChild(stepBtn);
		});

		const progress = createProgressBar({
			value: currentStepIndex + 1,
			max: steps.length,
			variant: 'info',
			showValue: false
		});

		stepperContainer.appendChild(stepperNav);
		stepperContainer.appendChild(progress);
		this.container.appendChild(stepperContainer);

		// Active Step Content
		const contentArea = document.createElement('div');
		contentArea.className = 'step-content';

		switch (step) {
			case 'species':
				this.renderSpeciesStep(contentArea);
				break;
			case 'class':
				this.renderClassStep(contentArea);
				break;
			case 'background':
				this.renderBackgroundStep(contentArea);
				break;
			case 'abilities':
				this.renderAbilitiesStep(contentArea);
				break;
			case 'equipment':
				this.renderEquipmentStep(contentArea);
				break;
			case 'details':
				this.renderDetailsStep(contentArea);
				break;
			case 'review':
				this.renderReviewStep(contentArea);
				break;
			default:
				contentArea.innerHTML = `<p>${step} aşaması yakında eklenecek...</p>`;
		}

		this.container.appendChild(contentArea);
	}

	private renderSpeciesStep(parent: HTMLElement): void {
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
						this.render();
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
				this.render();
			}
		});

		actionContainer.appendChild(nextButton);
		parent.appendChild(actionContainer);
	}

	private renderClassStep(parent: HTMLElement): void {
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
						this.render(); // Re-render to show update
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
						this.render();
					}
				})
			});

			// If we have a subclass select and it's not in the footer (because we used footer for it),
			// actually we put it IN the footer if selected.
			// But wait, if we select, we might want to change it. 
			// Better UI: If selected, show "Selected" button AND the dropdown below it?
			// Or just replace the button with the dropdown? 
			// The code above replaces the button with the dropdown if selected and applicable.

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
				this.render();
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

	private renderBackgroundStep(parent: HTMLElement): void {
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
				abilityAssignmentUI.style.marginTop = '12px';
				abilityAssignmentUI.style.padding = '12px';
				abilityAssignmentUI.style.background = 'var(--color-bg-tertiary)';
				abilityAssignmentUI.style.borderRadius = 'var(--radius-sm)';
				abilityAssignmentUI.style.border = '1px solid var(--color-border-dim)';

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
						this.render();
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
						select.style.padding = '6px';
						select.style.borderRadius = '4px';
						select.style.border = '1px solid var(--color-border)';
						select.style.background = 'var(--color-bg-secondary)';
						select.style.color = 'var(--color-text-primary)';

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
							this.render();
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
						select.style.padding = '6px';
						select.style.borderRadius = '4px';
						select.style.border = '1px solid var(--color-border)';
						select.style.background = 'var(--color-bg-secondary)';
						select.style.color = 'var(--color-text-primary)';

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
							this.render();
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
						this.render();
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
		actionContainer.style.paddingTop = 'var(--space-md)';
		actionContainer.style.borderTop = '1px solid var(--color-border)';

		const nextButton = createButton({
			label: 'Devam Et (Yetenek Puanları) ➡️',
			variant: 'primary',
			size: 'md',
			disabled: !canProceed,
			onClick: () => {
				useGameStore.getState().updateCharacterCreation({ step: 'abilities' });
				this.render();
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
		parent.appendChild(hint);
	}

	private renderAbilitiesStep(parent: HTMLElement): void {
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
				this.render();
			};

			methodSelector.appendChild(btn);
		});

		parent.appendChild(methodSelector);

		// 2. Render selected method
		const methodContainer = document.createElement('div');
		if (method === 'standard_array') {
			this.renderStandardArray(methodContainer);
		} else if (method === 'point_buy') {
			this.renderPointBuy(methodContainer);
		} else {
			this.renderDiceRoll(methodContainer);
		}
		parent.appendChild(methodContainer);
	}

	private renderStandardArray(parent: HTMLElement): void {
		const state = useGameStore.getState();
		const currentAssignments: Partial<Record<AbilityName, number>> = state.characterCreation.abilityAssignments || {};
		const standardArray = [15, 14, 13, 12, 10, 8];
		const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

		const container = document.createElement('div');
		container.style.display = 'grid';
		container.style.gridTemplateColumns = '1fr 320px';
		container.style.gap = 'var(--space-md)';

		// Left: Assignment Table
		const rowsContainer = document.createElement('div');
		rowsContainer.style.background = 'var(--color-bg-secondary)';
		rowsContainer.style.padding = 'var(--space-md)';
		rowsContainer.style.borderRadius = 'var(--radius-md)';
		rowsContainer.style.border = '1px solid var(--color-border)';

		// Table Header
		rowsContainer.innerHTML = `
			<div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; font-weight: bold; margin-bottom: 12px; font-size: 0.85rem; color: var(--color-text-secondary);">
				<div>Yetenek</div>
				<div style="text-align: center">Atanan</div>
				<div style="text-align: center">Bonus</div>
				<div style="text-align: center">Toplam</div>
				<div style="text-align: center">Mod</div>
			</div>
		`;

		let bonuses: Partial<Record<AbilityName, number>> = {};
		const bgAssignments = state.characterCreation.backgroundAbilityAssignments;
		if (bgAssignments) {
			bgAssignments.forEach(a => bonuses[a.ability] = (bonuses[a.ability] || 0) + a.bonus);
		}

		abilities.forEach(ability => {
			const assignedValue = currentAssignments[ability];
			const bonus = bonuses[ability] || 0;
			const total = (assignedValue || 0) + bonus;
			const modifier = assignedValue ? Math.floor((total - 10) / 2) : 0;
			const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

			const row = document.createElement('div');
			row.style.display = 'grid';
			row.style.gridTemplateColumns = '1.5fr 1fr 1fr 1fr 1fr';
			row.style.alignItems = 'center';
			row.style.padding = '12px 0';
			row.style.borderBottom = '1px solid var(--color-border-dim)';

			row.innerHTML = `
				<div>
					<div style="font-weight: bold;">${ability}</div>
					<div style="font-size: 0.75rem; color: var(--color-text-dim);">${translateAbilityName(ability)}</div>
				</div>
			`;

			const selectWrap = document.createElement('div');
			selectWrap.style.padding = '0 8px';
			const select = document.createElement('select');
			select.style.padding = '6px';
			select.style.borderRadius = '4px';
			select.style.border = '1px solid var(--color-border)';
			select.style.background = 'var(--color-bg-tertiary)';
			select.style.color = 'var(--color-text-primary)';
			select.style.width = '100%';

			const emptyOpt = document.createElement('option');
			emptyOpt.value = '';
			emptyOpt.text = '-';
			select.appendChild(emptyOpt);

			standardArray.forEach(val => {
				const opt = document.createElement('option');
				opt.value = val.toString();
				opt.text = val.toString();

				// DEBUG: Check values explicitly
				const isUsed = Object.entries(currentAssignments).some(([a, v]) => {
					return a !== ability && Number(v) === val;
				});

				if (isUsed) {
					opt.disabled = true;
				}

				if (Number(assignedValue) === val) opt.selected = true;
				select.appendChild(opt);
			});

			select.onchange = () => {
				const val = parseInt(select.value);
				const freshAssignments = useGameStore.getState().characterCreation.abilityAssignments || {};
				const newAssignments = { ...freshAssignments };

				if (isNaN(val)) delete newAssignments[ability];
				else newAssignments[ability] = val;

				const finalScores: Partial<AbilityScores> = {};
				abilities.forEach(a => {
					if (newAssignments[a]) {
						finalScores[a] = (newAssignments[a]!) + (bonuses[a] || 0);
					}
				});

				useGameStore.getState().updateCharacterCreation({
					abilityAssignments: newAssignments,
					abilityScores: finalScores as AbilityScores
				});

				setTimeout(() => this.render(), 0);
			};

			selectWrap.appendChild(select);
			row.appendChild(selectWrap);

			const bonusDiv = document.createElement('div');
			bonusDiv.style.textAlign = 'center';
			bonusDiv.style.color = 'var(--color-accent-blue)';
			bonusDiv.style.fontWeight = 'bold';
			bonusDiv.innerText = bonus > 0 ? `+${bonus}` : '-';
			row.appendChild(bonusDiv);

			const totalDiv = document.createElement('div');
			totalDiv.style.textAlign = 'center';
			totalDiv.style.fontWeight = '600';
			totalDiv.innerText = assignedValue ? total.toString() : '-';
			row.appendChild(totalDiv);

			const modDiv = document.createElement('div');
			modDiv.style.textAlign = 'center';
			modDiv.style.color = 'var(--color-accent-gold)';
			modDiv.style.fontWeight = 'bold';
			modDiv.innerText = assignedValue ? modifierStr : '-';
			row.appendChild(modDiv);

			rowsContainer.appendChild(row);
		});

		container.appendChild(rowsContainer);

		// Right: Description
		const info = document.createElement('div');
		info.innerHTML = `
			<div style="background: var(--color-bg-secondary); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); height: 100%;">
				<h4 style="color: var(--color-accent-gold); margin-bottom: var(--space-sm);">📋 Standart Dizi Nedir?</h4>
				<p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: var(--space-md);">
					En güvenli yöntemdir. Size verilen 6 sayıyı (15, 14, 13, 12, 10, 8) yeteneklerinize dilediğiniz gibi dağıtırsınız.
				</p>
				<div style="padding: 12px; background: var(--color-bg-primary); border-radius: 4px; border: 1px dashed var(--color-border);">
					<strong style="font-size: 0.8rem; color: var(--color-accent-blue);">Öneri:</strong>
					<p style="font-size: 0.8rem; color: var(--color-text-dim); margin-top: 4px;">
						Savaşçı iseniz 15'i STR'ye, Büyücü iseniz INT'ye vererek başlayın.
					</p>
				</div>
			</div>
		`;
		container.appendChild(info);

		parent.appendChild(container);

		const hint = createRuleHint({
			ruleId: 'ability-scores',
			title: 'Standart Dizi İpucu',
			concept: 'Temel Mekanikler',
			description: 'D&D 2024 kurallarında, bu dizi sizin uzmanlık alanlarınızı belirler. Bir yetenekte 15 olması, o konuda doğal olarak çok yetenekli olduğunuzu gösterir.'
		});
		parent.appendChild(hint);

		this.renderAbilityFooter(parent, abilities.every(a => currentAssignments[a]));
	}

	private renderPointBuy(parent: HTMLElement): void {
		const state = useGameStore.getState();
		const currentAssignments: Partial<Record<AbilityName, number>> = state.characterCreation.abilityAssignments || {};
		const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

		// Initialize default 8s if empty
		abilities.forEach(a => { if (currentAssignments[a] === undefined) currentAssignments[a] = 8; });

		const scoresArray = abilities.map(a => currentAssignments[a] || 8);
		const cost = DiceCore.calculatePointBuyCost(scoresArray);
		const remaining = DiceCore.POINT_BUY_TOTAL - cost;

		const container = document.createElement('div');
		container.style.display = 'grid';
		container.style.gridTemplateColumns = '1fr 320px';
		container.style.gap = 'var(--space-md)';

		// Left: Controls
		const rowsContainer = document.createElement('div');
		rowsContainer.style.background = 'var(--color-bg-secondary)';
		rowsContainer.style.padding = 'var(--space-md)';
		rowsContainer.style.borderRadius = 'var(--radius-md)';
		rowsContainer.style.border = '1px solid var(--color-border)';

		// Header with Remaining Points
		const pointsHeader = document.createElement('div');
		pointsHeader.style.display = 'flex';
		pointsHeader.style.justifyContent = 'space-between';
		pointsHeader.style.alignItems = 'center';
		pointsHeader.style.marginBottom = '20px';
		pointsHeader.style.padding = '12px';
		pointsHeader.style.background = 'var(--color-bg-primary)';
		pointsHeader.style.borderRadius = 'var(--radius-sm)';
		pointsHeader.style.border = '1px solid var(--color-border)';

		pointsHeader.innerHTML = `
			<span style="font-weight: bold; color: var(--color-text-secondary);">Kalan Puan:</span>
			<span style="font-size: 1.5rem; font-weight: bold; color: ${remaining < 0 ? 'var(--color-accent-red)' : 'var(--color-accent-gold)'};">
				${remaining}
			</span>
		`;
		rowsContainer.appendChild(pointsHeader);

		let bonuses: Partial<Record<AbilityName, number>> = {};
		const bgAssignments = state.characterCreation.backgroundAbilityAssignments;
		if (bgAssignments) {
			bgAssignments.forEach(a => bonuses[a.ability] = (bonuses[a.ability] || 0) + a.bonus);
		}

		abilities.forEach(ability => {
			const score = currentAssignments[ability] || 8;
			const bonus = bonuses[ability] || 0;
			const total = score + bonus;
			const mod = Math.floor((total - 10) / 2);

			const row = document.createElement('div');
			row.style.display = 'grid';
			row.style.gridTemplateColumns = '1.2fr 1.5fr 0.8fr 0.8fr 0.8fr';
			row.style.alignItems = 'center';
			row.style.padding = '12px 0';
			row.style.borderBottom = '1px solid var(--color-border-dim)';

			row.innerHTML = `
				<div>
					<div style="font-weight: bold;">${ability}</div>
					<div style="font-size: 0.75rem; color: var(--color-text-dim);">${translateAbilityName(ability)}</div>
				</div>
			`;

			// Controls Container
			const controls = document.createElement('div');
			controls.style.display = 'flex';
			controls.style.alignItems = 'center';
			controls.style.justifyContent = 'center';
			controls.style.gap = '10px';

			const minusBtn = document.createElement('button');
			minusBtn.innerText = '-';
			minusBtn.disabled = score <= 8;
			minusBtn.style.width = '28px';
			minusBtn.style.height = '28px';
			minusBtn.style.borderRadius = '50%';
			minusBtn.style.border = '1px solid var(--color-border)';
			minusBtn.style.background = 'var(--color-bg-tertiary)';
			minusBtn.style.color = 'var(--color-text-primary)';
			minusBtn.style.cursor = minusBtn.disabled ? 'not-allowed' : 'pointer';
			minusBtn.onclick = () => {
				const newAssignments = { ...currentAssignments, [ability]: score - 1 };
				this.updatePointBuy(newAssignments, bonuses);
			};

			const scoreDisplay = document.createElement('span');
			scoreDisplay.innerText = score.toString();
			scoreDisplay.style.fontSize = '1.1rem';
			scoreDisplay.style.fontWeight = 'bold';
			scoreDisplay.style.minWidth = '24px';
			scoreDisplay.style.textAlign = 'center';

			const costToNext = (DiceCore.POINT_BUY_COSTS[score + 1] || 0) - (DiceCore.POINT_BUY_COSTS[score] || 0);
			const isAffordable = remaining >= costToNext;

			const plusBtn = document.createElement('button');
			plusBtn.innerText = '+';
			plusBtn.disabled = score >= 15 || !isAffordable;
			plusBtn.style.width = '28px';
			plusBtn.style.height = '28px';
			plusBtn.style.borderRadius = '50%';
			plusBtn.style.border = '1px solid var(--color-border)';
			plusBtn.style.background = 'var(--color-bg-tertiary)';
			plusBtn.style.color = 'var(--color-text-primary)';
			plusBtn.style.cursor = plusBtn.disabled ? 'not-allowed' : 'pointer';
			plusBtn.onclick = () => {
				if (isAffordable) {
					const newAssignments = { ...currentAssignments, [ability]: score + 1 };
					this.updatePointBuy(newAssignments, bonuses);
				}
			};

			controls.appendChild(minusBtn);
			controls.appendChild(scoreDisplay);
			controls.appendChild(plusBtn);
			row.appendChild(controls);

			const bonusDiv = document.createElement('div');
			bonusDiv.style.textAlign = 'center';
			bonusDiv.style.color = 'var(--color-accent-blue)';
			bonusDiv.style.fontWeight = 'bold';
			bonusDiv.innerText = bonus > 0 ? `+${bonus}` : '-';
			row.appendChild(bonusDiv);

			const totalDiv = document.createElement('div');
			totalDiv.style.textAlign = 'center';
			totalDiv.style.fontWeight = '600';
			totalDiv.innerText = total.toString();
			row.appendChild(totalDiv);

			const modDiv = document.createElement('div');
			modDiv.style.textAlign = 'center';
			modDiv.style.color = 'var(--color-accent-gold)';
			modDiv.style.fontWeight = 'bold';
			modDiv.innerText = mod >= 0 ? `+${mod}` : mod.toString();
			row.appendChild(modDiv);

			rowsContainer.appendChild(row);
		});

		container.appendChild(rowsContainer);

		// Right: Cost Table
		const info = document.createElement('div');
		info.innerHTML = `
			<div style="background: var(--color-bg-secondary); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); height: 100%;">
				<h4 style="color: var(--color-accent-blue); margin-bottom: var(--space-sm);">⚖️ Point Buy Nedir?</h4>
				<p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px;">
					27 puanı dilediğiniz gibi harcayarak yeteneklerinizi özelleştirirsiniz.
				</p>
				
				<table style="width: 100%; font-size: 0.8rem; border-collapse: collapse; color: var(--color-text-dim);">
					<tr style="border-bottom: 1px solid var(--color-border-dim);">
						<th style="padding: 4px; text-align: left;">Puan</th>
						<th style="padding: 4px; text-align: right;">Maliyet</th>
					</tr>
					${Object.entries(DiceCore.POINT_BUY_COSTS).map(([s, c]) => `
						<tr><td style="padding: 2px;">${s}</td><td style="padding: 2px; text-align: right;">${c}</td></tr>
					`).join('')}
				</table>
			</div>
		`;
		container.appendChild(info);

		parent.appendChild(container);
		this.renderAbilityFooter(parent, remaining === 0);
	}

	private updatePointBuy(newAssignments: Partial<Record<AbilityName, number>>, bonuses: Partial<Record<AbilityName, number>>): void {
		const finalScores: Partial<AbilityScores> = {};
		const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
		abilities.forEach(a => {
			finalScores[a] = (newAssignments[a] || 8) + (bonuses[a] || 0);
		});

		useGameStore.getState().updateCharacterCreation({
			abilityAssignments: newAssignments,
			abilityScores: finalScores as AbilityScores
		});
		this.render();
	}

	private renderDiceRoll(parent: HTMLElement): void {
		const state = useGameStore.getState();
		const cState = state.characterCreation;
		const currentAssignments: Partial<Record<AbilityName, number>> = cState.abilityAssignments || {};
		const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

		// We use a custom property in cState (or locally if it's transient) to store the rolled pool
		const rollPool = (cState as any).diceRollPool || [];

		const container = document.createElement('div');
		container.style.display = 'grid';
		container.style.gridTemplateColumns = '1fr 320px';
		container.style.gap = 'var(--space-md)';

		const leftColumn = document.createElement('div');

		// 1. Roll Button / Results
		const rollArea = document.createElement('div');
		rollArea.style.background = 'var(--color-bg-secondary)';
		rollArea.style.padding = '20px';
		rollArea.style.borderRadius = 'var(--radius-md)';
		rollArea.style.border = '1px solid var(--color-border)';
		rollArea.style.marginBottom = '20px';
		rollArea.style.textAlign = 'center';

		if (rollPool.length === 0) {
			rollArea.innerHTML = `
				<h3 style="color: var(--color-accent-gold); margin-bottom: 12px;">🎲 Şansını Dene!</h3>
				<p style="color: var(--color-text-secondary); margin-bottom: 20px; font-size: 0.9rem;">
					Her yetenek için 4 zar atılır ve en düşüğü atılır (4d6 drop lowest).
				</p>
			`;
			const rollBtn = createButton({
				label: 'Zarları At 🎲',
				variant: 'primary',
				size: 'lg',
				onClick: () => {
					const result = DiceCore.rollAbilityScoreSet();
					useGameStore.getState().updateCharacterCreation({
						diceRollPool: result.scores,
						abilityAssignments: {},
						abilityScores: {}
					});
					this.render();
				}
			});
			rollArea.appendChild(rollBtn);
		} else {
			rollArea.innerHTML = `
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
					<h4 style="color: var(--color-accent-gold); margin: 0;">Atılan Sonuçlar</h4>
					<button id="re-roll-btn" style="background: transparent; border: 1px solid var(--color-border); color: var(--color-text-dim); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">🔄 Yeniden Zar At</button>
				</div>
				<div style="display: flex; gap: 10px; justify-content: center;">
					${rollPool.map((s: number) => `
						<div style="width: 40px; height: 40px; background: var(--color-bg-tertiary); border: 2px solid var(--color-accent-gold); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
							${s}
						</div>
					`).join('')}
				</div>
			`;

			const reRollBtn = rollArea.querySelector('#re-roll-btn');
			if (reRollBtn) {
				(reRollBtn as HTMLElement).onclick = () => {
					useGameStore.getState().updateCharacterCreation({
						diceRollPool: undefined,
						abilityAssignments: {},
						abilityScores: {}
					});
					this.render();
				};
			}
		}
		leftColumn.appendChild(rollArea);

		// 2. Assignment Table
		if (rollPool.length > 0) {
			const rowsContainer = document.createElement('div');
			rowsContainer.style.background = 'var(--color-bg-secondary)';
			rowsContainer.style.padding = 'var(--space-md)';
			rowsContainer.style.borderRadius = 'var(--radius-md)';
			rowsContainer.style.border = '1px solid var(--color-border)';

			rowsContainer.innerHTML = `
				<div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; font-weight: bold; margin-bottom: 12px; font-size: 0.85rem; color: var(--color-text-secondary);">
					<div>Yetenek</div>
					<div style="text-align: center">Atanan</div>
					<div style="text-align: center">Bonus</div>
					<div style="text-align: center">Toplam</div>
					<div style="text-align: center">Mod</div>
				</div>
			`;

			let bonuses: Partial<Record<AbilityName, number>> = {};
			const bgAssignments = state.characterCreation.backgroundAbilityAssignments;
			if (bgAssignments) {
				bgAssignments.forEach(a => bonuses[a.ability] = (bonuses[a.ability] || 0) + a.bonus);
			}

			abilities.forEach(ability => {
				const assigned = currentAssignments[ability];
				const bonus = bonuses[ability] || 0;
				const total = (assigned || 0) + bonus;
				const mod = assigned ? Math.floor((total - 10) / 2) : '-';

				const row = document.createElement('div');
				row.style.display = 'grid';
				row.style.gridTemplateColumns = '1.5fr 1fr 1fr 1fr 1fr';
				row.style.alignItems = 'center';
				row.style.padding = '12px 0';
				row.style.borderBottom = '1px solid var(--color-border-dim)';

				row.innerHTML = `
					<div>
						<div style="font-weight: bold;">${ability}</div>
						<div style="font-size: 0.75rem; color: var(--color-text-dim);">${translateAbilityName(ability)}</div>
					</div>
				`;

				const selectWrap = document.createElement('div');
				selectWrap.style.padding = '0 8px';
				const select = document.createElement('select');
				select.style.padding = '6px';
				select.style.borderRadius = '4px';
				select.style.border = '1px solid var(--color-border)';
				select.style.background = 'var(--color-bg-tertiary)';
				select.style.color = 'var(--color-text-primary)';
				select.style.width = '100%';

				const emptyOpt = document.createElement('option');
				emptyOpt.value = '';
				emptyOpt.text = '-';
				select.appendChild(emptyOpt);

				// Create a frequency map of the roll pool
				const poolCounts: Record<number, number> = {};
				rollPool.forEach((v: number) => poolCounts[v] = (poolCounts[v] || 0) + 1);

				// Subtract what's currently assigned
				Object.entries(currentAssignments).forEach(([a, v]) => {
					if (a !== ability && v !== undefined) poolCounts[v]!--;
				});

				// List unique values from the original pool for options
				const uniqueScores = [...new Set(rollPool as number[])].sort((a, b) => b - a);

				uniqueScores.forEach(val => {
					const opt = document.createElement('option');
					opt.value = val.toString();
					opt.text = val.toString();
					if (poolCounts[val]! <= 0 && assigned !== val) opt.disabled = true;
					if (assigned === val) opt.selected = true;
					select.appendChild(opt);
				});

				select.onchange = () => {
					const val = parseInt(select.value);
					const newAssignments = { ...currentAssignments };
					if (isNaN(val)) delete newAssignments[ability];
					else newAssignments[ability] = val;

					const finalScores: Partial<AbilityScores> = {};
					abilities.forEach(a => {
						if (newAssignments[a]) {
							finalScores[a] = (newAssignments[a]!) + (bonuses[a] || 0);
						}
					});

					useGameStore.getState().updateCharacterCreation({
						abilityAssignments: newAssignments,
						abilityScores: finalScores as AbilityScores
					});
					this.render();
				};

				selectWrap.appendChild(select);
				row.appendChild(selectWrap);

				const bonusDiv = document.createElement('div');
				bonusDiv.style.textAlign = 'center';
				bonusDiv.style.color = 'var(--color-accent-blue)';
				bonusDiv.style.fontWeight = 'bold';
				bonusDiv.innerText = bonus > 0 ? `+${bonus}` : '-';
				row.appendChild(bonusDiv);

				const totalDiv = document.createElement('div');
				totalDiv.style.textAlign = 'center';
				totalDiv.style.fontWeight = '600';
				totalDiv.innerText = assigned ? total.toString() : '-';
				row.appendChild(totalDiv);

				const modDiv = document.createElement('div');
				modDiv.style.textAlign = 'center';
				modDiv.style.color = 'var(--color-accent-gold)';
				modDiv.style.fontWeight = 'bold';
				modDiv.innerText = mod !== '-' ? (mod >= 0 ? `+${mod}` : mod.toString()) : '-';
				row.appendChild(modDiv);

				rowsContainer.appendChild(row);
			});
			leftColumn.appendChild(rowsContainer);
		}

		container.appendChild(leftColumn);

		// Right: Info
		const info = document.createElement('div');
		info.innerHTML = `
			<div style="background: var(--color-bg-secondary); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); height: 100%;">
				<h4 style="color: var(--color-accent-purple); margin-bottom: var(--space-sm);">🎲 Zar Atma Nedir?</h4>
				<p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: var(--space-md);">
					Klasik D&D yöntemidir. 4 tane 6'lık zar (d6) atılır, en düşük olan çıkarılır. Bu işlem 6 kez tekrarlanır.
				</p>
				<div style="background: var(--color-bg-primary); padding: 12px; border-radius: 4px; border: 1px solid var(--color-border);">
					<strong style="font-size: 0.8rem; color: var(--color-accent-gold);">Risk ve Ödül:</strong>
					<p style="font-size: 0.8rem; color: var(--color-text-dim); margin-top: 4px;">
						Çok yüksek skorlar (18) alabileceğiniz gibi, çok düşük skorlar (3) da alabilirsiniz!
					</p>
				</div>
			</div>
		`;
		container.appendChild(info);

		parent.appendChild(container);
		this.renderAbilityFooter(parent, abilities.every(a => currentAssignments[a]));
	}

	private renderAbilityFooter(parent: HTMLElement, isComplete: boolean): void {
		const actionContainer = document.createElement('div');
		actionContainer.style.marginTop = 'var(--space-xl)';
		actionContainer.style.display = 'flex';
		actionContainer.style.justifyContent = 'flex-end';
		actionContainer.style.paddingTop = 'var(--space-md)';
		actionContainer.style.borderTop = '1px solid var(--color-border)';

		const nextButton = createButton({
			label: 'Devam Et (Ekipman) ➡️',
			variant: 'primary',
			size: 'md',
			disabled: !isComplete,
			onClick: () => {
				useGameStore.getState().updateCharacterCreation({ step: 'equipment' });
				this.render();
			}
		});

		actionContainer.appendChild(nextButton);
		parent.appendChild(actionContainer);
	}

	private renderEquipmentStep(parent: HTMLElement): void {
		const state = useGameStore.getState();
		const selectedClassId = state.characterCreation.selectedClass;
		const selectedBackgroundId = state.characterCreation.selectedBackground;

		// Database of Packs (Türkçe)
		const PACK_CONTENTS: Record<string, string> = {
			"Explorer's Pack (Kaşif Paketi)": "Sırt çantası, uyku tulumu, yemek kabı, kav kutusu, 10 meşale, 10 günlük erzak, su matarası, 50 ft kenevir ip.",
			"Dungeoneer's Pack (Zindan Paketi)": "Sırt çantası, levye, çekiç, 10 piton (çivi), 10 meşale, kav kutusu, 10 günlük erzak, su matarası, 50 ft kenevir ip.",
			"Entertainer's Pack (Eğlendirici Paketi)": "Sırt çantası, uyku tulumu, 2 kostüm, 5 mum, 5 günlük erzak, su matarası, makyaj seti.",
			"Priest's Pack (Rahip Paketi)": "Sırt çantası, battaniye, 10 mum, kav kutusu, sadaka kutusu, 2 tütsü çubuğu, buhurdanlık, rahip cübbesi, 2 günlük erzak, su matarası.",
			"Burglar's Pack (Hırsız Paketi)": "Sırt çantası, 1000 bilye, 10 ft misina, çan, 5 mum, levye, çekiç, 10 piton, kapaklı fener, 2 şişe yağ, 5 günlük erzak, kav kutusu, su matarası, 50 ft ip.",
			"Scholar's Pack (Bilgin Paketi)": "Sırt çantası, bilim kitabı, mürekkep, tüy kalem, 10 parşömen, küçük kum torbası."
		};

		// Database of Class Equipment Options
		const CLASS_EQUIPMENT: Record<string, {
			a: string[],
			b: string | string[],
			c?: string
		}> = {
			barbarian: {
				a: ["Büyük Balta (Greataxe)", "4 x El Baltası (Handaxe)", "Explorer's Pack (Kaşif Paketi)", "15 Altın"],
				b: "75 Altın"
			},
			bard: {
				a: ["Deri Zırh (Leather Armor)", "2 x Hançer (Dagger)", "Seçilen Enstrüman", "Entertainer's Pack (Eğlendirici Paketi)", "19 Altın"],
				b: "90 Altın"
			},
			cleric: {
				a: ["Zincir Gömlek (Chain Shirt)", "Kalkan (Shield)", "Gürz (Mace)", "Kutsal Sembol", "Priest's Pack (Rahip Paketi)", "7 Altın"],
				b: "110 Altın"
			},
			druid: {
				a: ["Deri Zırh (Leather Armor)", "Kalkan (Shield)", "Orak (Sickle)", "Druid Odağı (Değnek)", "Explorer's Pack (Kaşif Paketi)", "Şifacılık Kiti (Herbalism Kit)", "9 Altın"],
				b: "50 Altın"
			},
			fighter: {
				a: ["Zincir Zırh (Chain Mail)", "Çift Elli Kılıç (Greatsword)", "Gürz (Flail)", "8 x Cirit (Javelin)", "Dungeoneer's Pack (Zindan Paketi)", "4 Altın"],
				b: ["Çivili Deri Zırh (Studded Leather)", "Pala (Scimitar)", "Kısa Kılıç (Shortsword)", "Uzun Yay (Longbow)", "20 x Ok", "Sadak (Quiver)", "Dungeoneer's Pack (Zindan Paketi)", "11 Altın"],
				c: "155 Altın"
			},
			monk: {
				a: ["Mızrak (Spear)", "5 x Hançer (Dagger)", "Zanaatkar Aleti veya Enstrüman", "Explorer's Pack (Kaşif Paketi)", "11 Altın"],
				b: "50 Altın"
			},
			paladin: {
				a: ["Zincir Zırh (Chain Mail)", "Kalkan (Shield)", "Uzun Kılıç (Longsword)", "6 x Cirit (Javelin)", "Kutsal Sembol", "Priest's Pack (Rahip Paketi)", "9 Altın"],
				b: "150 Altın"
			},
			ranger: {
				a: ["Çivili Deri Zırh (Studded Leather)", "Pala (Scimitar)", "Kısa Kılıç (Shortsword)", "Uzun Yay (Longbow)", "20 x Ok", "Sadak (Quiver)", "Druid Odağı", "Explorer's Pack (Kaşif Paketi)", "7 Altın"],
				b: "150 Altın"
			},
			rogue: {
				a: ["Deri Zırh (Leather Armor)", "2 x Hançer (Dagger)", "Kısa Kılıç (Shortsword)", "Kısa Yay (Shortbow)", "20 x Ok", "Sadak (Quiver)", "Hırsızlık Aletleri", "Burglar's Pack (Hırsız Paketi)", "8 Altın"],
				b: "100 Altın"
			},
			sorcerer: {
				a: ["Mızrak (Spear)", "2 x Hançer (Dagger)", "Büyü Odağı (Kristal)", "Dungeoneer's Pack (Zindan Paketi)", "28 Altın"],
				b: "50 Altın"
			},
			warlock: {
				a: ["Deri Zırh (Leather Armor)", "Orak (Sickle)", "2 x Hançer (Dagger)", "Büyü Odağı (Küre)", "Okült Kitap", "Scholar's Pack (Bilgin Paketi)", "15 Altın"],
				b: "100 Altın"
			},
			wizard: {
				a: ["2 x Hançer (Dagger)", "Büyü Odağı (Değnek)", "Cübbe (Robe)", "Büyü Kitabı (Spellbook)", "Scholar's Pack (Bilgin Paketi)", "5 Altın"],
				b: "55 Altın"
			}
		};

		const container = document.createElement('div');
		container.style.display = 'flex';
		container.style.flexDirection = 'column';
		container.style.gap = '20px';
		container.style.maxWidth = '800px';
		container.style.margin = '0 auto';

		// Header
		const header = document.createElement('div');
		header.innerHTML = `
			<h2 style="color: var(--color-accent-gold); margin-bottom: 8px;">🎒 Başlangıç Ekipmanları</h2>
			<p style="color: var(--color-text-secondary);">Sınıfınız ve geçmişiniz size maceraya başlarken ihtiyacınız olan temel ekipmanları sağlar.</p>
		`;
		container.appendChild(header);

		// CLASS EQUIPMENT SELECTION
		if (selectedClassId && CLASS_EQUIPMENT[selectedClassId]) {
			const classEq = CLASS_EQUIPMENT[selectedClassId];
			const classCard = createCard({ title: `Sınıf Ekipmanı (${selectedClassId.charAt(0).toUpperCase() + selectedClassId.slice(1)})` });

			const selectionForm = document.createElement('div');
			selectionForm.style.display = 'flex';
			selectionForm.style.flexDirection = 'column';
			selectionForm.style.gap = '15px';

			// Helper to render a list of items
			const renderItemList = (items: string[]) => {
				return items.map(item => {
					// Check if item is a pack to add tooltip/details
					const packKey = Object.keys(PACK_CONTENTS).find(k => item.includes(k.split('(')[0].trim()));
					if (packKey) {
						return `<li style="margin-bottom: 4px;">
							<span style="color: var(--color-text-primary); font-weight: 500;">${item}</span>
							<div style="font-size: 0.8rem; color: var(--color-text-dim); margin-left: 10px; font-style: italic;">
								📦 İçerik: ${PACK_CONTENTS[packKey]}
							</div>
						</li>`;
					}
					return `<li style="color: var(--color-text-primary);">${item}</li>`;
				}).join('');
			};

			// OPTION A
			const optA = document.createElement('label');
			optA.style.display = 'flex';
			optA.style.gap = '12px';
			optA.style.padding = '12px';
			optA.style.border = '1px solid var(--color-border)';
			optA.style.borderRadius = 'var(--radius-md)';
			optA.style.cursor = 'pointer';
			optA.style.transition = 'all 0.2s';
			optA.onmouseover = () => optA.style.background = 'var(--color-bg-tertiary)';
			optA.onmouseout = () => { if (!optA.querySelector('input')?.checked) optA.style.background = 'transparent'; };

			const radioA = document.createElement('input');
			radioA.type = 'radio';
			radioA.name = 'equipment_choice';
			radioA.value = 'a';
			radioA.checked = true; // Default

			const contentA = document.createElement('div');
			contentA.innerHTML = `
				<strong style="color: var(--color-accent-blue); display: block; margin-bottom: 8px;">Seçenek A: Standart Ekipman</strong>
				<ul style="list-style: disc; padding-left: 20px; margin: 0;">
					${renderItemList(classEq.a)}
				</ul>
			`;

			optA.appendChild(radioA);
			optA.appendChild(contentA);
			selectionForm.appendChild(optA);

			// OPTION B
			const optB = document.createElement('label');
			optB.style.display = 'flex';
			optB.style.gap = '12px';
			optB.style.padding = '12px';
			optB.style.border = '1px solid var(--color-border)';
			optB.style.borderRadius = 'var(--radius-md)';
			optB.style.cursor = 'pointer';
			optB.onmouseover = () => optB.style.background = 'var(--color-bg-tertiary)';
			optB.onmouseout = () => { if (!optB.querySelector('input')?.checked) optB.style.background = 'transparent'; };

			const radioB = document.createElement('input');
			radioB.type = 'radio';
			radioB.name = 'equipment_choice';
			radioB.value = 'b';

			const contentB = document.createElement('div');
			if (Array.isArray(classEq.b)) {
				contentB.innerHTML = `
					<strong style="color: var(--color-accent-blue); display: block; margin-bottom: 8px;">Seçenek B: Alternatif Ekipman</strong>
					<ul style="list-style: disc; padding-left: 20px; margin: 0;">
						${renderItemList(classEq.b)}
					</ul>
				`;
			} else {
				contentB.innerHTML = `
					<strong style="color: var(--color-accent-gold); display: block; margin-bottom: 8px;">Seçenek B: Altın Başlangıcı</strong>
					<div style="font-size: 1.1rem; font-weight: bold; color: var(--color-text-primary);">💰 ${classEq.b}</div>
					<div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;">Ekipmanlarınızı marketten kendiniz satın alırsınız.</div>
				`;
			}

			optB.appendChild(radioB);
			optB.appendChild(contentB);
			selectionForm.appendChild(optB);

			// OPTION C (Just for Fighter currently)
			if (classEq.c) {
				const optC = document.createElement('label');
				optC.style.display = 'flex';
				optC.style.gap = '12px';
				optC.style.padding = '12px';
				optC.style.border = '1px solid var(--color-border)';
				optC.style.borderRadius = 'var(--radius-md)';
				optC.style.cursor = 'pointer';
				optC.onmouseover = () => optC.style.background = 'var(--color-bg-tertiary)';
				optC.onmouseout = () => { if (!optC.querySelector('input')?.checked) optC.style.background = 'transparent'; };

				const radioC = document.createElement('input');
				radioC.type = 'radio';
				radioC.name = 'equipment_choice';
				radioC.value = 'c';

				const contentC = document.createElement('div');
				contentC.innerHTML = `
					<strong style="color: var(--color-accent-gold); display: block; margin-bottom: 8px;">Seçenek C: Altın Başlangıcı</strong>
					<div style="font-size: 1.1rem; font-weight: bold; color: var(--color-text-primary);">💰 ${classEq.c}</div>
					<div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;">Ekipmanlarınızı marketten kendiniz satın alırsınız.</div>
				`;

				optC.appendChild(radioC);
				optC.appendChild(contentC);
				selectionForm.appendChild(optC);
			}

			// Add interaction highlighting
			const updateStyles = () => {
				[optA, optB].forEach(opt => {
					const input = opt.querySelector('input');
					if (input?.checked) {
						opt.style.borderColor = 'var(--color-accent-gold)';
						opt.style.background = 'var(--color-bg-tertiary)';
					} else {
						opt.style.borderColor = 'var(--color-border)';
						opt.style.background = 'transparent';
					}
				});
				// Handle optC if exists
				const optC = selectionForm.querySelector('label:nth-child(3)') as HTMLElement;
				if (optC) {
					const input = optC.querySelector('input');
					if (input?.checked) {
						optC.style.borderColor = 'var(--color-accent-gold)';
						optC.style.background = 'var(--color-bg-tertiary)';
					} else {
						optC.style.borderColor = 'var(--color-border)';
						optC.style.background = 'transparent';
					}
				}
			};

			radioA.onchange = updateStyles;
			radioB.onchange = updateStyles;
			if (classEq.c) {
				const radioC = selectionForm.querySelector('input[value="c"]') as HTMLInputElement;
				if (radioC) radioC.onchange = updateStyles;
			}

			// Initial style update
			updateStyles();

			classCard.appendChild(selectionForm);
			container.appendChild(classCard);
		}

		// BACKGROUND EQUIPMENT
		if (selectedBackgroundId) {

			// Static map for common backgrounds if registry pull fails
			const BG_ITEMS_MAP: Record<string, string[]> = {
				'acolyte': ['Kutsal Sembol', 'Dua Kitabı', '5 tütsü çubuğu', 'Cübbe', '15 Altın'],
				'criminal': ['Levye', 'Koyu renkli sivil kıyafetler (başlıklı)', '15 Altın'],
				'folk_hero': ['Zanaatkar aletleri', 'Kürek', 'Demir çömlek', 'Sivil kıyafetler', '10 Altın'],
				'noble': ['İnce kıyafetler', 'Mühür yüzüğü', 'Soy kütüğü parşömeni', '25 Altın'],
				'sage': ['Mürekkep şişesi', 'Tüy kalem', 'Küçük bıçak', 'Ölü bir meslektaştan mektup', 'Sivil kıyafetler', '10 Altın'],
				'soldier': ['Rütbe nişanı', 'Savaş ganimeti (kırık hançer vb.)', 'Kart seti veya zar seti', 'Sivil kıyafetler', '10 Altın']
			};

			const items = BG_ITEMS_MAP[selectedBackgroundId] || ['Sivil kıyafetler', 'Bir miktar altın', 'Geçmişe özel bir eşya'];

			const bgCard = createCard({ title: `Geçmiş Ekipmanı (${selectedBackgroundId})` });
			bgCard.innerHTML += `
				<div style="padding: 10px;">
					<p style="color: var(--color-text-secondary); margin-bottom: 10px; font-style: italic;">
						Seçtiğiniz geçmişten gelen bu eşyalar envanterinize otomatik olarak eklenir.
					</p>
					<ul style="list-style: disc; padding-left: 20px;">
						${items.map(i => `<li style="color: var(--color-text-primary); margin-bottom: 4px;">${i}</li>`).join('')}
					</ul>
				</div>
			`;
			container.appendChild(bgCard);
		}

		// Footer Buttons
		const footer = document.createElement('div');
		footer.style.display = 'flex';
		footer.style.justifyContent = 'space-between';
		footer.style.marginTop = '20px';
		footer.style.paddingTop = '20px';
		footer.style.borderTop = '1px solid var(--color-border)';

		const backBtn = createButton({
			label: '⬅️ Geri',
			variant: 'secondary',
			onClick: () => {
				useGameStore.getState().updateCharacterCreation({ step: 'background' });
				this.render();
			}
		});

		const nextBtn = createButton({
			label: 'Devam Et (Detaylar) ➡️',
			variant: 'primary',
			onClick: () => {
				// Calculate Gold Logic
				let calculatedGold = 0;
				if (selectedClassId && CLASS_EQUIPMENT[selectedClassId]) {
					const classEq = CLASS_EQUIPMENT[selectedClassId];
					const selectedOption = (container.querySelector('input[name="equipment_choice"]:checked') as HTMLInputElement)?.value;

					let itemsToScan: string[] = [];

					if (selectedOption === 'a') {
						itemsToScan = classEq.a;
					} else if (selectedOption === 'b') {
						if (Array.isArray(classEq.b)) itemsToScan = classEq.b;
						else if (typeof classEq.b === 'string') itemsToScan = [classEq.b];
					} else if (selectedOption === 'c' && classEq.c) {
						itemsToScan = [classEq.c];
					}

					// Scan items for "X Altın" pattern
					itemsToScan.forEach(item => {
						const match = item.match(/(\d+)\s*Altın/i);
						if (match && match[1]) {
							calculatedGold += parseInt(match[1], 10);
						}
					});

					// Add Background Gold (if any)
					const bgId = selectedBackgroundId || '';
					const bgItems = bgId
						? (bgId === 'noble' ? ['25 Altın']
							: ['acolyte', 'criminal', 'warlock'].includes(bgId) ? ['15 Altın']
								: ['10 Altın'])
						: [];

					bgItems.forEach(item => {
						const match = item.match(/(\d+)\s*Altın/i);
						if (match && match[1]) {
							calculatedGold += parseInt(match[1], 10);
						}
					});
				}

				console.log('💰 Starting Gold Saved:', calculatedGold);

				useGameStore.getState().updateCharacterCreation({
					step: 'details',
					startingGold: calculatedGold
				});
				this.render();
			}
		});

		footer.appendChild(backBtn);
		footer.appendChild(nextBtn);
		container.appendChild(footer);

		parent.appendChild(container);
	}

	private renderDetailsStep(parent: HTMLElement): void {
		const state = useGameStore.getState();
		const cState = state.characterCreation;

		const container = document.createElement('div');
		container.style.display = 'grid';
		container.style.gridTemplateColumns = '1fr 1fr';
		container.style.gap = 'var(--space-lg)';

		// Left Column: Character Info
		const leftColumn = document.createElement('div');
		leftColumn.style.background = 'var(--color-bg-secondary)';
		leftColumn.style.padding = 'var(--space-lg)';
		leftColumn.style.borderRadius = 'var(--radius-md)';
		leftColumn.style.border = '1px solid var(--color-border)';

		leftColumn.innerHTML = `
			<h3 style="color: var(--color-accent-gold); margin-bottom: var(--space-md); font-family: var(--font-display);">
				📜 Karakter Bilgileri
			</h3>
		`;

		// Character Name
		const nameGroup = this.createInputGroup('Karakter Adı *', 'characterName', cState.characterName || '', 'Örn: Thorin Meşekalkanlı');
		leftColumn.appendChild(nameGroup);

		// Player Name
		const playerGroup = this.createInputGroup('Oyuncu Adı', 'playerName', cState.playerName || '', 'Senin adın');
		leftColumn.appendChild(playerGroup);

		// Alignment
		const alignmentGroup = document.createElement('div');
		alignmentGroup.style.marginBottom = 'var(--space-md)';
		alignmentGroup.innerHTML = `
			<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">Düzen (Alignment)</label>
		`;
		const alignmentSelect = document.createElement('select');
		alignmentSelect.style.width = '100%';
		alignmentSelect.style.padding = '10px';
		alignmentSelect.style.borderRadius = 'var(--radius-sm)';
		alignmentSelect.style.border = '1px solid var(--color-border)';
		alignmentSelect.style.background = 'var(--color-bg-tertiary)';
		alignmentSelect.style.color = 'var(--color-text-primary)';

		const alignments = [
			{ value: '', label: 'Seçin...' },
			{ value: 'lawful-good', label: 'Düzenli İyi (Lawful Good)' },
			{ value: 'neutral-good', label: 'Nötr İyi (Neutral Good)' },
			{ value: 'chaotic-good', label: 'Kaotik İyi (Chaotic Good)' },
			{ value: 'lawful-neutral', label: 'Düzenli Nötr (Lawful Neutral)' },
			{ value: 'true-neutral', label: 'Gerçek Nötr (True Neutral)' },
			{ value: 'chaotic-neutral', label: 'Kaotik Nötr (Chaotic Neutral)' },
			{ value: 'lawful-evil', label: 'Düzenli Kötü (Lawful Evil)' },
			{ value: 'neutral-evil', label: 'Nötr Kötü (Neutral Evil)' },
			{ value: 'chaotic-evil', label: 'Kaotik Kötü (Chaotic Evil)' }
		];

		alignments.forEach(a => {
			const opt = document.createElement('option');
			opt.value = a.value;
			opt.text = a.label;
			if (cState.alignment === a.value) opt.selected = true;
			alignmentSelect.appendChild(opt);
		});

		alignmentSelect.onchange = (e) => {
			useGameStore.getState().updateCharacterCreation({
				alignment: (e.target as HTMLSelectElement).value || undefined
			});
		};

		alignmentGroup.appendChild(alignmentSelect);
		leftColumn.appendChild(alignmentGroup);

		container.appendChild(leftColumn);

		// Right Column: Appearance
		const rightColumn = document.createElement('div');
		rightColumn.style.background = 'var(--color-bg-secondary)';
		rightColumn.style.padding = 'var(--space-lg)';
		rightColumn.style.borderRadius = 'var(--radius-md)';
		rightColumn.style.border = '1px solid var(--color-border)';

		rightColumn.innerHTML = `
			<h3 style="color: var(--color-accent-blue); margin-bottom: var(--space-md); font-family: var(--font-display);">
				👤 Görünüm
			</h3>
		`;

		const appearance = cState.appearance || {};

		const appearanceFields = [
			{ key: 'age', label: 'Yaş', placeholder: 'Örn: 120' },
			{ key: 'height', label: 'Boy', placeholder: 'Örn: 1.75m' },
			{ key: 'weight', label: 'Kilo', placeholder: 'Örn: 75kg' },
			{ key: 'eyes', label: 'Göz Rengi', placeholder: 'Örn: Yeşil' },
			{ key: 'skin', label: 'Ten Rengi', placeholder: 'Örn: Bronz' },
			{ key: 'hair', label: 'Saç', placeholder: 'Örn: Uzun, siyah' }
		];

		const appearanceGrid = document.createElement('div');
		appearanceGrid.style.display = 'grid';
		appearanceGrid.style.gridTemplateColumns = '1fr 1fr';
		appearanceGrid.style.gap = 'var(--space-sm)';

		appearanceFields.forEach(field => {
			const group = document.createElement('div');
			group.innerHTML = `
				<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.8rem;">${field.label}</label>
			`;
			const input = document.createElement('input');
			input.type = 'text';
			input.value = (appearance as any)[field.key] || '';
			input.placeholder = field.placeholder;
			input.style.width = '100%';
			input.style.padding = '8px';
			input.style.borderRadius = 'var(--radius-sm)';
			input.style.border = '1px solid var(--color-border)';
			input.style.background = 'var(--color-bg-tertiary)';
			input.style.color = 'var(--color-text-primary)';
			input.style.boxSizing = 'border-box';

			input.onchange = (e) => {
				const newAppearance = { ...appearance, [field.key]: (e.target as HTMLInputElement).value };
				useGameStore.getState().updateCharacterCreation({ appearance: newAppearance });
			};

			group.appendChild(input);
			appearanceGrid.appendChild(group);
		});

		rightColumn.appendChild(appearanceGrid);
		container.appendChild(rightColumn);

		parent.appendChild(container);

		// Backstory Section
		const backstorySection = document.createElement('div');
		backstorySection.style.marginTop = 'var(--space-lg)';
		backstorySection.style.background = 'var(--color-bg-secondary)';
		backstorySection.style.padding = 'var(--space-lg)';
		backstorySection.style.borderRadius = 'var(--radius-md)';
		backstorySection.style.border = '1px solid var(--color-border)';

		backstorySection.innerHTML = `
			<h3 style="color: var(--color-accent-purple); margin-bottom: var(--space-md); font-family: var(--font-display);">
				📖 Hikaye
			</h3>
			<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">Karakter Geçmişi (İsteğe bağlı)</label>
		`;

		const textarea = document.createElement('textarea');
		textarea.value = cState.backstory || '';
		textarea.placeholder = 'Karakterinin hikayesini yaz... Nereden geliyor? Motivasyonu ne? Gizli bir sırrı var mı?';
		textarea.rows = 5;
		textarea.style.width = '100%';
		textarea.style.padding = '12px';
		textarea.style.borderRadius = 'var(--radius-sm)';
		textarea.style.border = '1px solid var(--color-border)';
		textarea.style.background = 'var(--color-bg-tertiary)';
		textarea.style.color = 'var(--color-text-primary)';
		textarea.style.resize = 'vertical';
		textarea.style.fontFamily = 'inherit';
		textarea.style.boxSizing = 'border-box';

		textarea.onchange = (e) => {
			useGameStore.getState().updateCharacterCreation({
				backstory: (e.target as HTMLTextAreaElement).value
			});
		};

		backstorySection.appendChild(textarea);
		parent.appendChild(backstorySection);

		// Footer Actions
		const isComplete = !!cState.characterName && cState.characterName.trim().length > 0;
		const actionContainer = document.createElement('div');
		actionContainer.style.marginTop = 'var(--space-xl)';
		actionContainer.style.display = 'flex';
		actionContainer.style.justifyContent = 'flex-end';
		actionContainer.style.paddingTop = 'var(--space-md)';
		actionContainer.style.borderTop = '1px solid var(--color-border)';

		const nextButton = createButton({
			label: 'Karakteri Tamamla ✨',
			variant: 'primary',
			size: 'md',
			disabled: !isComplete,
			onClick: () => {
				useGameStore.getState().updateCharacterCreation({ step: 'review', isComplete: true });
				this.render();
			}
		});

		actionContainer.appendChild(nextButton);
		parent.appendChild(actionContainer);

		// Rule Hint
		const hint = createRuleHint({
			ruleId: 'character-details',
			title: 'İpucu: Karakter Detayları',
			concept: 'Rol Yapma',
			description: 'Karakterine bir isim ve kişilik ver! İyi bir geçmiş hikayesi, rol yapma deneyimini zenginleştirir.'
		});
		parent.appendChild(hint);
	}

	private createInputGroup(label: string, field: string, value: string, placeholder: string): HTMLElement {
		const group = document.createElement('div');
		group.style.marginBottom = 'var(--space-md)';

		group.innerHTML = `
			<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">${label}</label>
		`;

		const input = document.createElement('input');
		input.type = 'text';
		input.value = value;
		input.placeholder = placeholder;
		input.style.width = '100%';
		input.style.padding = '10px';
		input.style.borderRadius = 'var(--radius-sm)';
		input.style.border = '1px solid var(--color-border)';
		input.style.background = 'var(--color-bg-tertiary)';
		input.style.color = 'var(--color-text-primary)';
		input.style.boxSizing = 'border-box';

		input.onchange = (e) => {
			useGameStore.getState().updateCharacterCreation({
				[field]: (e.target as HTMLInputElement).value
			});
		};

		group.appendChild(input);
		return group;
	}

	private renderReviewStep(parent: HTMLElement): void {
		const state = useGameStore.getState();
		const cState = state.characterCreation;

		// Get selected data
		const species = registry.getAllSpecies().find(s => s.id === cState.selectedSpecies);
		const subspecies = species?.subraces?.find(sr => sr.id === cState.selectedSubspecies);
		const classData = registry.getAllClasses().find(c => c.id === cState.selectedClass);
		const subclass = classData?.subclasses?.find(s => s.id === cState.selectedSubclass);
		const background = registry.getAllBackgrounds().find(b => b.id === cState.selectedBackground);

		// Header
		const header = document.createElement('div');
		header.style.textAlign = 'center';
		header.style.marginBottom = 'var(--space-xl)';
		header.innerHTML = `
			<h2 style="color: var(--color-accent-gold); font-family: var(--font-display); font-size: 2rem;">
				🎉 ${cState.characterName || 'Adsız Kahraman'}
			</h2>
			<p style="color: var(--color-text-secondary); font-size: 1.1rem;">
				${subspecies ? translateSubspeciesName(subspecies.name) + ' ' : ''}${species ? translateSpeciesName(species.name) : ''} 
				${subclass ? translateSubclassName(subclass.name) + ' ' : ''}${classData ? translateClassName(classData.name) : ''}
			</p>
			${cState.playerName ? `<p style="color: var(--color-text-dim); font-size: 0.9rem;">Oyuncu: ${cState.playerName}</p>` : ''}
		`;
		parent.appendChild(header);

		// Summary Grid
		const grid = document.createElement('div');
		grid.style.display = 'grid';
		grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
		grid.style.gap = 'var(--space-md)';
		grid.style.marginBottom = 'var(--space-xl)';

		// Card: Species
		const speciesCard = this.createSummaryCard('🧬 Irk', [
			species ? translateSpeciesName(species.name) : 'Seçilmedi',
			subspecies ? translateSubspeciesName(subspecies.name) : ''
		].filter(Boolean).join(' - '));
		grid.appendChild(speciesCard);

		// Card: Class
		const classCard = this.createSummaryCard('⚔️ Sınıf', [
			classData ? translateClassName(classData.name) : 'Seçilmedi',
			subclass ? translateSubclassName(subclass.name) : ''
		].filter(Boolean).join(' - '));
		grid.appendChild(classCard);

		// Card: Background
		const bgCard = this.createSummaryCard('📜 Geçmiş', background?.name || 'Seçilmedi');
		grid.appendChild(bgCard);

		parent.appendChild(grid);

		// Ability Scores
		if (cState.abilityScores) {
			const abilitiesSection = document.createElement('div');
			abilitiesSection.style.background = 'var(--color-bg-secondary)';
			abilitiesSection.style.padding = 'var(--space-lg)';
			abilitiesSection.style.borderRadius = 'var(--radius-md)';
			abilitiesSection.style.border = '1px solid var(--color-border)';
			abilitiesSection.style.marginBottom = 'var(--space-lg)';

			abilitiesSection.innerHTML = `
				<h4 style="color: var(--color-accent-blue); margin-bottom: var(--space-md);">📊 Yetenek Skorları</h4>
			`;

			const abilitiesGrid = document.createElement('div');
			abilitiesGrid.style.display = 'grid';
			abilitiesGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
			abilitiesGrid.style.gap = 'var(--space-sm)';
			abilitiesGrid.style.textAlign = 'center';

			const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
			abilities.forEach(ability => {
				const score = cState.abilityScores?.[ability] || 10;
				const mod = Math.floor((score - 10) / 2);
				const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

				const abilityBox = document.createElement('div');
				abilityBox.style.background = 'var(--color-bg-tertiary)';
				abilityBox.style.padding = 'var(--space-sm)';
				abilityBox.style.borderRadius = 'var(--radius-sm)';
				abilityBox.style.border = '1px solid var(--color-border)';
				abilityBox.innerHTML = `
					<div style="font-size: 0.75rem; color: var(--color-text-dim);">${ability}</div>
					<div style="font-size: 1.5rem; font-weight: bold; color: var(--color-text-primary);">${score}</div>
					<div style="font-size: 0.85rem; color: var(--color-accent-gold);">${modStr}</div>
				`;
				abilitiesGrid.appendChild(abilityBox);
			});

			abilitiesSection.appendChild(abilitiesGrid);
			parent.appendChild(abilitiesSection);
		}

		// Backstory
		if (cState.backstory) {
			const backstorySection = document.createElement('div');
			backstorySection.style.background = 'var(--color-bg-secondary)';
			backstorySection.style.padding = 'var(--space-lg)';
			backstorySection.style.borderRadius = 'var(--radius-md)';
			backstorySection.style.border = '1px solid var(--color-border)';
			backstorySection.style.marginBottom = 'var(--space-lg)';
			backstorySection.innerHTML = `
				<h4 style="color: var(--color-accent-purple); margin-bottom: var(--space-md);">📖 Hikaye</h4>
				<p style="color: var(--color-text-secondary); line-height: 1.6; white-space: pre-wrap;">${cState.backstory}</p>
			`;
			parent.appendChild(backstorySection);
		}

		// Actions
		const actionContainer = document.createElement('div');
		actionContainer.style.display = 'flex';
		actionContainer.style.justifyContent = 'center';
		actionContainer.style.gap = 'var(--space-md)';
		actionContainer.style.paddingTop = 'var(--space-lg)';
		actionContainer.style.borderTop = '1px solid var(--color-border)';

		const editButton = createButton({
			label: '← Düzenle',
			variant: 'secondary',
			size: 'md',
			onClick: () => {
				useGameStore.getState().updateCharacterCreation({ step: 'species' });
				this.render();
			}
		});

		const saveButton = createButton({
			label: '💾 Karakteri Kaydet',
			variant: 'primary',
			size: 'lg',
			onClick: () => {
				this.saveCharacter();
			}
		});

		actionContainer.appendChild(editButton);
		actionContainer.appendChild(saveButton);
		parent.appendChild(actionContainer);
	}

	private createSummaryCard(title: string, content: string): HTMLElement {
		const card = document.createElement('div');
		card.style.background = 'var(--color-bg-secondary)';
		card.style.padding = 'var(--space-md)';
		card.style.borderRadius = 'var(--radius-md)';
		card.style.border = '1px solid var(--color-border)';
		card.style.textAlign = 'center';

		card.innerHTML = `
			<div style="font-size: 0.85rem; color: var(--color-text-dim); margin-bottom: 4px;">${title}</div>
			<div style="font-size: 1.1rem; color: var(--color-text-primary); font-weight: 600;">${content}</div>
		`;

		return card;
	}

	private saveCharacter(): void {
		const state = useGameStore.getState();
		const cState = state.characterCreation;

		// Build character object (simplified for now)
		const character = {
			id: `char-${Date.now()}`,
			name: cState.characterName || 'Adsız Kahraman',
			playerName: cState.playerName,
			speciesId: cState.selectedSpecies,
			subspeciesId: cState.selectedSubspecies,
			classId: cState.selectedClass,
			subclassId: cState.selectedSubclass,
			backgroundId: cState.selectedBackground,
			abilityScores: cState.abilityScores,
			alignment: cState.alignment,
			appearance: cState.appearance,
			backstory: cState.backstory,
			createdAt: new Date().toISOString()
		};

		// Save to localStorage
		const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '[]');
		savedCharacters.push(character);
		localStorage.setItem('dnd-characters', JSON.stringify(savedCharacters));

		// Show success notification
		state.addNotification(`${character.name} başarıyla kaydedildi!`, 'success');

		// Reset creation state
		useGameStore.getState().updateCharacterCreation({
			step: 'species',
			selectedSpecies: undefined,
			selectedSubspecies: undefined,
			selectedClass: undefined,
			selectedSubclass: undefined,
			selectedBackground: undefined,
			abilityScores: undefined,
			abilityAssignments: undefined,
			equipmentChoices: undefined,
			characterName: undefined,
			playerName: undefined,
			appearance: undefined,
			backstory: undefined,
			alignment: undefined,
			isComplete: false,
			errors: []
		});

		this.render();
	}
}
