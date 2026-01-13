import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { AbilityName, SKILL_ABILITY_MAP, SkillName } from '../../../../types/core.types.ts';
import {
	translateSpeciesName,
	translateSubspeciesName,
	translateClassName,
	translateSubclassName,
	translateSkillName,
	translateToolName,
	getToolDescription
} from '../../../../utils/translations/index.ts';

export function renderReviewStep(parent: HTMLElement, onStepComplete: () => void, onSave: () => void): void {
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
	const speciesCard = createSummaryCard('🧬 Tür', [
		species ? translateSpeciesName(species.name) : 'Seçilmedi',
		subspecies ? translateSubspeciesName(subspecies.name) : ''
	].filter(Boolean).join(' - '));
	grid.appendChild(speciesCard);

	// Card: Class
	const classCard = createSummaryCard('⚔️ Sınıf', [
		classData ? translateClassName(classData.name) : 'Seçilmedi',
		subclass ? translateSubclassName(subclass.name) : ''
	].filter(Boolean).join(' - '));
	grid.appendChild(classCard);

	// Card: Background
	const bgCard = createSummaryCard('📜 Geçmiş', background?.name || 'Seçilmedi');
	grid.appendChild(bgCard);

	// Combat Stats Summary
	const statsContainer = document.createElement('div');
	statsContainer.style.display = 'grid';
	statsContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
	statsContainer.style.gap = 'var(--space-md)';
	statsContainer.style.marginBottom = 'var(--space-lg)';

	const conScore = cState.abilityScores?.CON || 10;
	const conMod = Math.floor((conScore - 10) / 2);
	const dexScore = cState.abilityScores?.DEX || 10;
	const dexMod = Math.floor((dexScore - 10) / 2);
	const hitDie = classData?.hitDie || 'd8';
	const baseHp = parseInt(hitDie.replace('d', ''), 10);

	statsContainer.appendChild(createSummaryCard('❤️ Can Puanı (HP)', `${baseHp + conMod}`));
	statsContainer.appendChild(createSummaryCard('🛡️ Zırh Sınıfı (AC)', `${10 + dexMod}`));
	statsContainer.appendChild(createSummaryCard('🎲 İnisiyatif', `${dexMod >= 0 ? '+' : ''}${dexMod}`));
	statsContainer.appendChild(createSummaryCard('✨ Uzmanlık Bonusu', '+2'));

	parent.appendChild(statsContainer);

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

	// Skills Section
	const skillsSection = document.createElement('div');
	skillsSection.style.background = 'var(--color-bg-secondary)';
	skillsSection.style.padding = 'var(--space-lg)';
	skillsSection.style.borderRadius = 'var(--radius-md)';
	skillsSection.style.border = '1px solid var(--color-border)';
	skillsSection.style.marginBottom = 'var(--space-lg)';

	// Calculate all skills
	const allSkills = new Set<string>();
	species?.traits?.forEach(t => t.grantsProficiency?.skills?.forEach((s: any) => allSkills.add(s)));
	background?.skills?.forEach((s: any) => allSkills.add(s));
	cState.skillChoices?.forEach(s => allSkills.add(s));

	// Calculate modifiers for each skill
	const proficiencyBonus = 2; // Level 1
	const skillsWithBonuses = Array.from(allSkills).map(skill => {
		const abilityKey = SKILL_ABILITY_MAP[skill as SkillName];
		const abilityScore = cState.abilityScores?.[abilityKey] || 10;
		const abilityMod = Math.floor((abilityScore - 10) / 2);
		const totalBonus = abilityMod + proficiencyBonus;
		const bonusStr = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

		return {
			name: translateSkillName(skill),
			ability: abilityKey,
			bonus: bonusStr
		};
	});

	skillsSection.innerHTML = `
		<h4 style="color: var(--color-accent-gold); margin-bottom: var(--space-md);">🎯 Uzman Olduğun Yetenekler</h4>
		<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
			${skillsWithBonuses.map(s => `
				<div style="
					background: var(--color-bg-tertiary); 
					padding: 8px 12px; 
					border-radius: 8px; 
					border: 1px solid var(--color-border); 
					display: flex;
					justify-content: space-between;
					align-items: center;
				">
					<div style="display: flex; flex-direction: column; gap: 2px;">
						<span style="font-size: 0.9rem; font-weight: 600;">${s.name}</span>
						<span style="font-size: 0.7rem; color: var(--color-text-dim);">${s.ability}</span>
					</div>
					<span style="
						font-size: 1.1rem; 
						font-weight: 700; 
						color: var(--color-accent-gold);
						min-width: 40px;
						text-align: right;
					">${s.bonus}</span>
				</div>
			`).join('')}
			${allSkills.size === 0 ? '<span style="color: var(--color-text-dim);">Hiçbiri</span>' : ''}
		</div>
	`;
	parent.appendChild(skillsSection);

	// Tool Proficiencies
	const allTools = new Set<string>();
	// @ts-ignore guaranteed tools are string array if tools is array
	const guaranteedTools: string[] = Array.isArray(classData?.proficiencies?.tools) ? classData.proficiencies.tools : [];
	guaranteedTools.forEach((t: string) => allTools.add(t));
	cState.toolChoices?.forEach(t => allTools.add(t));

	if (allTools.size > 0) {
		const toolsSection = document.createElement('div');
		toolsSection.style.background = 'var(--color-bg-secondary)';
		toolsSection.style.padding = 'var(--space-lg)';
		toolsSection.style.borderRadius = 'var(--radius-md)';
		toolsSection.style.border = '1px solid var(--color-border)';
		toolsSection.style.marginBottom = 'var(--space-lg)';

		toolsSection.innerHTML = `
			<h4 style="color: var(--color-accent-purple); margin-bottom: var(--space-md);">🛠️ Alet Uzmanlıkları</h4>
			<div style="display: flex; flex-wrap: wrap; gap: 8px;">
				${Array.from(allTools).map(toolId => `
					<span style="background: var(--color-bg-tertiary); padding: 6px 14px; border-radius: 20px; border: 1px solid var(--color-border); font-size: 0.9rem;" title="${getToolDescription(toolId)}">
						${translateToolName(toolId)}
					</span>
				`).join('')}
			</div>
		`;
		parent.appendChild(toolsSection);
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
			onStepComplete();
		}
	});

	const saveButton = createButton({
		label: '💾 Karakteri Kaydet',
		variant: 'primary',
		size: 'lg',
		onClick: () => {
			onSave();
		}
	});

	actionContainer.appendChild(editButton);
	actionContainer.appendChild(saveButton);
	parent.appendChild(actionContainer);
}

function createSummaryCard(title: string, content: string): HTMLElement {
	const card = document.createElement('div');
	card.style.background = 'var(--color-bg-secondary)';
	card.style.padding = 'var(--space-md)';
	card.style.borderRadius = 'var(--radius-md)';
	card.style.border = '1px solid var(--color-border)';
	card.style.textAlign = 'center';

	card.innerHTML = `
		<div style="font-size: 0.85rem; color: var(--color-text-dim); margin-bottom: 4px;">${title}</div>
		<div style="font-size: 1.25rem; color: var(--color-text-primary); font-weight: 700;">${content}</div>
	`;

	return card;
}

