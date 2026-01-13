import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';
import {
	translateSkillName,
	skillDescriptions,
	translateToolName,
	getToolDescription
} from '../../../../utils/translations/index.ts';
import { SkillName, SKILL_ABILITY_MAP } from '../../../../types/core.types.ts';

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
	species?.traits?.forEach(trait => {
		if (trait.grantsProficiency?.skills) {
			trait.grantsProficiency.skills.forEach((s: any) => inherentSkills.add(s as SkillName));
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

	// Initial selection from state or empty
	let selectedSkills = cState.skillChoices || [];
	let selectedTools = cState.toolChoices || [];

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

	// Grid for Skills
	const skillsGrid = document.createElement('div');
	skillsGrid.style.display = 'grid';
	skillsGrid.style.gridTemplateColumns = '1fr 1fr';
	skillsGrid.style.gap = 'var(--space-md)';

	// Inherent Skills & Tools Card
	const inherentCard = createCard({
		title: 'Kazanılmış Yetenekler',
		content: `
			<p style="font-size: 0.85rem; color: var(--color-text-dim); margin-bottom: 12px;">Irkınız ve geçmişinizden gelen otomatik uzmanlıklar.</p>
			
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

	// Class Choice Card
	const choiceCard = document.createElement('div');
	choiceCard.className = 'card';
	choiceCard.style.padding = 'var(--space-md)';
	choiceCard.style.background = 'var(--color-bg-secondary)';
	choiceCard.style.borderRadius = 'var(--radius-md)';
	choiceCard.style.border = '1px solid var(--color-border)';

	const updateChoiceCard = () => {
		const remaining = classSkillCount - selectedSkills.length;
		choiceCard.innerHTML = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<h4 style="margin: 0; color: var(--color-accent-gold);">${characterClass.name} Beceri Seçimleri</h4>
				<span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; background: ${remaining === 0 ? 'var(--color-success)' : 'var(--color-bg-tertiary)'}; color: white;">
					${remaining > 0 ? `${remaining} seçim kaldı` : 'Tamamlandı'}
				</span>
			</div>
			<div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
				${classSkillOptions.map(skill => {
			const isInherited = inherentSkills.has(skill as SkillName);
			const isSelected = selectedSkills.includes(skill as SkillName);
			const isDisabled = isInherited || (!isSelected && selectedSkills.length >= classSkillCount);

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
						" 
						onmouseover="this.style.background='var(--color-bg-tertiary)'" 
						onmouseout="this.style.background='${isInherited ? 'rgba(255,255,255,0.03)' : (isSelected ? 'var(--color-bg-tertiary)' : 'transparent')}'">
							<div style="display: flex; align-items: center; gap: 8px;">
								<input type="checkbox" value="${skill}" ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} style="cursor: pointer;">
								<span style="font-size: 1rem; font-weight: 600; color: ${isSelected ? 'var(--color-accent-gold)' : 'var(--color-text-primary)'}">
									${translateSkillName(skill)}
								</span>
								<span style="
									margin-left: auto; 
									font-size: 0.75rem; 
									padding: 2px 6px; 
									border-radius: 4px; 
									background: var(--color-bg-primary); 
									color: var(--color-accent-blue);
									font-weight: 600;
								">
									${abilityKey}
								</span>
								${isInherited ? '<small style="font-size: 0.7rem; color: var(--color-text-dim);">(Zaten Var)</small>' : ''}
							</div>
							<div style="font-size: 0.8rem; color: var(--color-text-secondary); font-style: italic; margin-left: 28px;">
								${description}
							</div>
						</label>
					`;
		}).join('')}
			</div>
		`;

		// Re-attach event listeners
		choiceCard.querySelectorAll('input').forEach(input => {
			input.onchange = (e) => {
				const val = (e.target as HTMLInputElement).value as SkillName;
				if ((e.target as HTMLInputElement).checked) {
					if (selectedSkills.length < classSkillCount) {
						selectedSkills = [...selectedSkills, val];
					}
				} else {
					selectedSkills = selectedSkills.filter(s => s !== val);
				}
				updateChoiceCard();
				updateNextButton();
			};
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
					updateToolCard();
					updateNextButton();
				};
			});
		};

		container.appendChild(toolCard);
		updateToolCard();
	}

	skillsGrid.appendChild(choiceCard);
	container.appendChild(skillsGrid);

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

	const updateNextButton = () => {
		const skillsComplete = selectedSkills.length >= classSkillCount;
		const toolsComplete = toolOptions.length === 0 || selectedTools.length >= toolCount;
		nextBtn.disabled = !skillsComplete || !toolsComplete
	};

	const nextBtn = createButton({
		label: 'Devam Et (Ekipman) ➡️',
		variant: 'primary',
		disabled: true,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({
				step: 'equipment',
				skillChoices: selectedSkills,
				toolChoices: selectedTools
			});
			onStepComplete();
		}
	});

	// Initial check
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
	container.appendChild(hint);

	parent.appendChild(container);
	updateChoiceCard();
}
