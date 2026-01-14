import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';
import {
	translateSkillName,
	skillDescriptions,
	translateToolName,
	getToolDescription,
	languageNames,
	translateLanguageName
} from '../../../../utils/translations/index.ts';
import { SkillName, SKILL_ABILITY_MAP } from '../../../../types/core.types.ts';

// Helper to get all available skills
const ALL_SKILLS: SkillName[] = [
	'acrobatics', 'animal_handling', 'arcana', 'athletics',
	'deception', 'history', 'insight', 'intimidation',
	'investigation', 'medicine', 'nature', 'perception',
	'performance', 'persuasion', 'religion', 'sleight_of_hand',
	'stealth', 'survival'
];

export function renderProficienciesStep(parent: HTMLElement, onStepComplete: () => void): void {
	const state = useGameStore.getState();
	const cState = state.characterCreation;

	const species = registry.getAllSpecies().find(s => s.id === cState.selectedSpecies);
	const background = registry.getAllBackgrounds().find(b => b.id === cState.selectedBackground);
	const characterClass = registry.getAllClasses().find(c => c.id === cState.selectedClass);

	if (!characterClass) {
		parent.innerHTML = '<p>Lütfen önce bir sınıf seçin.</p>';
		return;
	}

	// 1. Calculate Inherent Skills
	const inherentSkills = new Set<SkillName>();

	// From Species
	let speciesChoiceCount = 0;
	species?.traits?.forEach(trait => {
		// Fixed skills
		if (trait.grantsProficiency?.skills && !trait.grantsProficiency.skills.includes('choice')) {
			trait.grantsProficiency.skills.forEach((s: any) => inherentSkills.add(s as SkillName));
		}
		// Choices
		if (trait.mechanicType === 'choice' && trait.grantsProficiency?.skills?.includes('choice')) {
			speciesChoiceCount++;
		}
	});

	// From Background
	background?.skills?.forEach((s: any) => inherentSkills.add(s as SkillName));

	// 2. Class Choices
	const classSkillOptions = characterClass.proficiencies?.skills?.choices || [];
	const classSkillCount = characterClass.proficiencies?.skills?.count || 0;

	// Tool Choices & Guaranteed
	const toolsData = characterClass.proficiencies?.tools;
	const isToolChoices = toolsData && !Array.isArray(toolsData);
	const toolOptions: string[] = isToolChoices ? toolsData.choices : [];
	const toolCount: number = isToolChoices ? toolsData.count : 0;
	const guaranteedTools: string[] = Array.isArray(toolsData) ? toolsData : [];

	// 3. State Hydration (Split Class vs Species selections)
	const allSelected = cState.skillChoices || [];

	// Try to fill Class slots first with valid class options
	let classSelected: SkillName[] = [];
	let speciesSelected: SkillName[] = [];

	const tempClassParams = allSelected.filter(s => classSkillOptions.includes(s) && !inherentSkills.has(s));
	// Take up to limit
	classSelected = tempClassParams.slice(0, classSkillCount);

	// Remaining non-inherent selections go to Species (if they fit)
	// OR if we have species choices, we treat the leftovers as potential species choices
	const usedByClass = new Set(classSelected);
	const leftovers = allSelected.filter(s => !usedByClass.has(s) && !inherentSkills.has(s));
	speciesSelected = leftovers.slice(0, speciesChoiceCount);

	// Local State Wrappers
	let selectedTools = cState.toolChoices || [];
	let selectedLanguages = cState.languageChoices || [];

	// Language Calculation
	const knownLanguages = new Set<string>();
	knownLanguages.add('Common'); // Everyone knows Common (SRD 5.2)
	species?.languages?.forEach(l => knownLanguages.add(l));

	// Calculate Max Languages (Standard Rule: Common + 2 Choice + Species Extras)
	// Base is 2 choices (Common is already fixed)
	let maxLanguageChoices = 2;

	// Add extra languages from species trait (e.g. Human)
	if (species?.extraLanguages) {
		maxLanguageChoices += species.extraLanguages;
	}

	// Filter inherent languages from choice list to prevent re-selecting
	const availableLanguages = Object.keys(languageNames).filter(l => !knownLanguages.has(l));


	// -- RENDER --
	const container = document.createElement('div');
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.gap = 'var(--space-lg)';
	container.style.maxWidth = '800px';
	container.style.margin = '0 auto';

	// Header
	const header = document.createElement('div');
	header.innerHTML = `
		<h2 style="color: var(--color-accent-gold); margin-bottom: 8px;">🎯 Yetenek ve Alet Uzmanlıkları</h2>
		<p style="color: var(--color-text-secondary);">Maceracı olduğun süre boyunca edindiğin tecrübeler belirli alanlarda uzmanlaşmanı sağlar.</p>
	`;
	container.appendChild(header);

	// Skills Grid
	const skillsGrid = document.createElement('div');
	skillsGrid.style.display = 'grid';
	skillsGrid.style.gridTemplateColumns = '1fr 1fr';
	skillsGrid.style.gap = 'var(--space-md)';

	// A. Inherent Skills Card
	const inherentCard = createCard({
		title: 'Kazanılmış Yetenekler',
		content: `
			<p style="font-size: 0.85rem; color: var(--color-text-dim); margin-bottom: 12px;">Türünüz ve geçmişinizden gelen otomatik uzmanlıklar.</p>
			
			<div style="margin-bottom: 12px;">
				<strong style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Beceriler (Skills)</strong>
				<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px;">
					${Array.from(inherentSkills).map(s => `
						<li style="background: var(--color-bg-tertiary); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--color-accent-blue); color: var(--color-accent-blue); font-size: 0.9rem;">
							${translateSkillName(s)}
						</li>
					`).join('')}
					${inherentSkills.size === 0 ? '<li style="color: var(--color-text-dim); font-style: italic;">Yok</li>' : ''}
				</ul>
			</div>

			${guaranteedTools.length > 0 ? `
				<div>
					<strong style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Aletler (Tools)</strong>
					<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px;">
						${guaranteedTools.map(t => `
							<li style="background: var(--color-bg-tertiary); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--color-accent-purple); color: var(--color-accent-purple); font-size: 0.9rem;" title="${getToolDescription(t)}">
								${translateToolName(t)}
							</li>
						`).join('')}
					</ul>
				</div>
			` : ''}
		`
	});
	skillsGrid.appendChild(inherentCard);

	// B. Class Choice Card
	const classCard = document.createElement('div');
	classCard.className = 'card';
	classCard.style.padding = 'var(--space-md)';
	classCard.style.background = 'var(--color-bg-secondary)';
	classCard.style.borderRadius = 'var(--radius-md)';
	classCard.style.border = '1px solid var(--color-border)';

	const renderClassCard = () => {
		const remaining = classSkillCount - classSelected.length;
		classCard.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<h4 style="margin: 0; color: var(--color-accent-gold);">${characterClass.name} Beceri Seçimleri</h4>
				<span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: ${remaining === 0 ? 'var(--color-success)' : 'var(--color-bg-tertiary)'}; color: white;">
					${remaining > 0 ? `${remaining} seçim kaldı` : 'Tamamlandı'}
				</span>
			</div>
			<div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
				${classSkillOptions.map(skill => {
			const isInherited = inherentSkills.has(skill as SkillName);
			const isSelected = classSelected.includes(skill as SkillName);
			// Disabled if inherited, or (not selected AND limit reached), or (selected elsewhere in species)
			const isSpeciesSelected = speciesSelected.includes(skill as SkillName);
			const isDisabled = isInherited || isSpeciesSelected || (!isSelected && classSelected.length >= classSkillCount);

			const abilityKey = SKILL_ABILITY_MAP[skill as SkillName];
			const description = skillDescriptions[skill] || '';

			return `
						<label style="
							display: flex; 
							flex-direction: column;
							gap: 4px; 
							padding: 12px; 
							border-radius: var(--radius-sm); 
							border: 2px solid ${isSelected ? 'var(--color-accent-gold)' : 'var(--color-border)'}; 
							background: ${isInherited ? 'rgba(255,255,255,0.03)' : (isSelected ? 'var(--color-bg-tertiary)' : 'transparent')}; 
							cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; 
							opacity: ${isInherited ? '0.6' : '1'}; 
							transition: all 0.2s;
						">
							<div style="display: flex; align-items: center; gap: 8px;">
								<input type="checkbox" value="${skill}" ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} style="cursor: pointer;">
								<span style="font-size: 1rem; font-weight: 600; color: ${isSelected ? 'var(--color-accent-gold)' : 'var(--color-text-primary)'}">
									${translateSkillName(skill)}
								</span>
								<span style="margin-left: auto; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: var(--color-bg-primary); color: var(--color-accent-blue); font-weight: 600;">
									${abilityKey}
								</span>
								${isInherited ? '<small style="font-size: 0.7rem; color: var(--color-text-dim);">(Zaten Var)</small>' : ''}
								${isSpeciesSelected ? '<small style="font-size: 0.7rem; color: var(--color-text-dim);">(Tür Seçimi)</small>' : ''}
							</div>
							<div style="font-size: 0.8rem; color: var(--color-text-secondary); font-style: italic; margin-left: 28px;">
								${description}
							</div>
						</label>
					`;
		}).join('')}
			</div>
		`;

		classCard.querySelectorAll('input').forEach(input => {
			input.onchange = (e) => {
				const val = (e.target as HTMLInputElement).value as SkillName;
				if ((e.target as HTMLInputElement).checked) {
					if (classSelected.length < classSkillCount) classSelected.push(val);
				} else {
					classSelected = classSelected.filter(s => s !== val);
				}
				saveSelection(); // Update state
				refreshAll();
			};
		});
	};
	skillsGrid.appendChild(classCard);
	container.appendChild(skillsGrid);


	// C. Species Choice Card (If applicable)
	let speciesCard: HTMLDivElement | null = null;
	if (speciesChoiceCount > 0) {
		speciesCard = document.createElement('div');
		speciesCard.className = 'card';
		speciesCard.style.padding = 'var(--space-md)';
		speciesCard.style.background = 'var(--color-bg-secondary)';
		speciesCard.style.borderRadius = 'var(--radius-md)';
		speciesCard.style.border = '1px solid var(--color-border)';
		speciesCard.style.marginTop = 'var(--space-md)';

		container.appendChild(speciesCard);
	}

	const renderSpeciesCard = () => {
		if (!speciesCard) return;
		const remaining = speciesChoiceCount - speciesSelected.length;

		speciesCard.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<h4 style="margin: 0; color: var(--color-accent-green);">${translateSkillName(species?.name || 'Tür')} Ekstra Uzmanlık</h4>
				<span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: ${remaining === 0 ? 'var(--color-success)' : 'var(--color-bg-tertiary)'}; color: white;">
					${remaining > 0 ? `${remaining} seçim kaldı` : 'Tamamlandı'}
				</span>
			</div>
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
				${Array.from({ length: speciesChoiceCount }).map((_, idx) => {
			const currentVal = speciesSelected[idx] || '';

			// Available options: Not inherent, not class selected, not selected in other species slots
			const options = ALL_SKILLS.filter(s =>
				!inherentSkills.has(s) &&
				!classSelected.includes(s) &&
				(!speciesSelected.includes(s) || s === currentVal)
			);

			return `
						<div style="display: flex; flex-direction: column; gap: 4px;">
							<label style="font-size: 0.85rem; color: var(--color-text-secondary);">Seçim ${idx + 1}</label>
							<select data-idx="${idx}" style="
								padding: 8px; 
								border-radius: var(--radius-sm); 
								border: 1px solid var(--color-border); 
								background: var(--color-bg-tertiary); 
								color: var(--color-text-primary);
							">
								<option value="">Seçiniz...</option>
								${options.map(opt => `
									<option value="${opt}" ${currentVal === opt ? 'selected' : ''}>
										${translateSkillName(opt)} (${SKILL_ABILITY_MAP[opt]})
									</option>
								`).join('')}
							</select>
						</div>
					`;
		}).join('')}
			</div>
		`;

		speciesCard.querySelectorAll('select').forEach(select => {
			select.onchange = (e) => {
				const idx = parseInt(select.getAttribute('data-idx') || '0');
				const val = (e.target as HTMLSelectElement).value as SkillName;

				// Update specific index
				const newSelection = [...speciesSelected];
				if (val) {
					newSelection[idx] = val;
				} else {
					newSelection.splice(idx, 1); // Remove if empty
				}
				speciesSelected = newSelection.filter(Boolean); // Clean holes

				saveSelection();
				refreshAll();
			};
		});
	};


	const refreshAll = () => {
		renderClassCard();
		renderSpeciesCard();
		updateNextButton();
	};

	// Save to store
	const saveSelection = () => {
		useGameStore.getState().updateCharacterCreation({
			skillChoices: [...classSelected, ...speciesSelected],
			toolChoices: selectedTools,
			languageChoices: selectedLanguages
		});
	};

	// Tool Choice Card (if applicable)
	if (toolOptions.length > 0) {
		const toolCard = document.createElement('div');
		toolCard.className = 'card';
		toolCard.style.padding = 'var(--space-md)';
		toolCard.style.background = 'var(--color-bg-secondary)';
		toolCard.style.borderRadius = 'var(--radius-md)';
		toolCard.style.border = '1px solid var(--color-border)';
		toolCard.style.marginTop = 'var(--space-md)';

		const updateToolCard = () => {
			const remaining = toolCount - selectedTools.length;
			toolCard.innerHTML = `
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
					<h4 style="margin: 0; color: var(--color-accent-purple);">${characterClass.name} Alet Seçimleri</h4>
					<span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: ${remaining === 0 ? 'var(--color-success)' : 'var(--color-bg-tertiary)'}; color: white;">
						${remaining > 0 ? `${remaining} seçim kaldı` : 'Tamamlandı'}
					</span>
				</div>
				<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
					${toolOptions.map((tool: string) => {
				const isSelected = selectedTools.includes(tool);
				const isDisabled = !isSelected && selectedTools.length >= toolCount;
				const description = getToolDescription(tool);

				return `
							<label style="
								display: flex; 
								flex-direction: column;
								gap: 4px; 
								padding: 8px; 
								border-radius: var(--radius-sm); 
								border: 1px solid ${isSelected ? 'var(--color-accent-purple)' : 'var(--color-border)'}; 
								background: ${isSelected ? 'var(--color-bg-tertiary)' : 'transparent'}; 
								cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; 
								transition: all 0.2s;
							"
							title="${description}">
								<div style="display: flex; align-items: center; gap: 8px;">
									<input type="checkbox" value="${tool}" ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} style="cursor: pointer;">
									<span style="font-size: 0.9rem; font-weight: 500; color: ${isSelected ? 'var(--color-accent-purple)' : 'var(--color-text-primary)'}">
										${translateToolName(tool)}
									</span>
								</div>
							</label>
						`;
			}).join('')}
				</div>
			`;

			// Re-attach event listeners
			toolCard.querySelectorAll('input').forEach(input => {
				input.onchange = (e) => {
					const val = (e.target as HTMLInputElement).value;
					if ((e.target as HTMLInputElement).checked) {
						if (selectedTools.length < toolCount) {
							selectedTools = [...selectedTools, val];
						}
					} else {
						selectedTools = selectedTools.filter(t => t !== val);
					}
					saveSelection();
					updateToolCard();
					updateNextButton();
				};
			});
		};

		container.appendChild(toolCard);
		updateToolCard();
	}

	// Language Choice Card
	const langCard = document.createElement('div');
	langCard.className = 'card';
	langCard.style.padding = 'var(--space-md)';
	langCard.style.background = 'var(--color-bg-secondary)';
	langCard.style.borderRadius = 'var(--radius-md)';
	langCard.style.border = '1px solid var(--color-border)';
	langCard.style.marginTop = 'var(--space-md)';

	const updateLangCard = () => {
		const remaining = maxLanguageChoices - selectedLanguages.length;
		langCard.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<h4 style="margin: 0; color: var(--color-accent-blue);">Lisanlar (Diller)</h4>
				<span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: ${remaining === 0 ? 'var(--color-success)' : 'var(--color-bg-tertiary)'}; color: white;">
					${remaining > 0 ? `${remaining} seçim kaldı` : 'Tamamlandı'}
				</span>
			</div>
			
			<div style="margin-bottom: 12px;">
				<strong style="display: block; font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Bildikleriniz</strong>
				<div style="display: flex; gap: 8px; flex-wrap: wrap;">
					${Array.from(knownLanguages).map(l => `
						<span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; color: var(--color-text-dim);">
							${translateLanguageName(l)}
						</span>
					`).join('')}
				</div>
			</div>

			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
				${availableLanguages.map(lang => {
			const isSelected = selectedLanguages.includes(lang);
			const isDisabled = !isSelected && selectedLanguages.length >= maxLanguageChoices;

			return `
						<label style="
							display: flex; 
							align-items: center;
							gap: 8px; 
							padding: 8px; 
							border-radius: var(--radius-sm); 
							border: 1px solid ${isSelected ? 'var(--color-accent-blue)' : 'var(--color-border)'}; 
							background: ${isSelected ? 'var(--color-bg-tertiary)' : 'transparent'}; 
							cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; 
							opacity: ${isDisabled ? '0.5' : '1'};
							transition: all 0.2s;
						">
							<input type="checkbox" value="${lang}" ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} style="cursor: pointer;">
							<span style="font-size: 0.9rem; font-weight: 500; color: ${isSelected ? 'var(--color-accent-blue)' : 'var(--color-text-primary)'}">
								${translateLanguageName(lang)}
							</span>
						</label>
					`;
		}).join('')}
			</div>
		`;

		// Events
		langCard.querySelectorAll('input').forEach(input => {
			input.onchange = (e) => {
				const val = (e.target as HTMLInputElement).value;
				if ((e.target as HTMLInputElement).checked) {
					if (selectedLanguages.length < maxLanguageChoices) selectedLanguages.push(val);
				} else {
					selectedLanguages = selectedLanguages.filter(l => l !== val);
				}
				saveSelection();
				updateLangCard();
				updateNextButton();
			};
		});
	};

	container.appendChild(langCard);
	updateLangCard();

	// Footer Actions
	const footer = document.createElement('div');
	footer.style.display = 'flex';
	footer.style.justifyContent = 'space-between';
	footer.style.marginTop = 'var(--space-xl)';
	footer.style.paddingTop = 'var(--space-md)';
	footer.style.borderTop = '1px solid var(--color-border)';

	const backBtn = createButton({
		label: '⬅️ Geri',
		variant: 'secondary',
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'abilities' });
			onStepComplete();
		}
	});

	const nextBtn = createButton({
		label: 'Devam Et (Ekipman) ➡️',
		variant: 'primary',
		disabled: true,
		onClick: () => {
			onStepComplete();
		}
	});

	const updateNextButton = () => {
		const skillsComplete = classSelected.length >= classSkillCount && speciesSelected.length >= speciesChoiceCount;
		const toolsComplete = toolOptions.length === 0 || selectedTools.length >= toolCount;
		const languagesComplete = selectedLanguages.length >= maxLanguageChoices;
		nextBtn.disabled = !skillsComplete || !toolsComplete || !languagesComplete;
	};

	// Initial render
	renderClassCard();
	renderSpeciesCard();
	updateNextButton();

	footer.appendChild(backBtn);
	footer.appendChild(nextBtn);
	container.appendChild(footer);

	// Rule Hint
	const hint = createRuleHint({
		ruleId: 'skill-proficiencies',
		title: 'Uzmanlıklar Nasıl Çalışır?',
		concept: 'Yetenek Zar Atışları',
		description: 'Uzman olduğun bir yeteneği kullandığında, d20 zarına "Yeterlilik Bonusu"nu (Proficiency Bonus) eklersin. Seviye 1\'de bu bonus +2\'dir.'
	});
	container.insertBefore(hint, container.firstChild);

	parent.appendChild(container);
}
