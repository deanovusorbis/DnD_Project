import { useGameStore } from '../../../../../engine/core/store.ts';
import { AbilityName, AbilityScores } from '../../../../../types/core.types.ts';
import { translateAbilityName } from '../../../../../utils/translations/index.ts';
import { renderAbilityFooter } from '../AbilitiesStep.ts';

export function renderStandardArray(parent: HTMLElement, onUpdate: () => void): void {
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

			// Disable if already assigned to another ability
			const isUsed = Object.entries(currentAssignments).some(([a, v]) => a !== ability && v === val);
			if (isUsed) opt.disabled = true;
			if (assignedValue === val) opt.selected = true;

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
			onUpdate();
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

	// Right Column: Summary/Info
	const info = document.createElement('div');
	info.innerHTML = `
		<div style="background: var(--color-bg-secondary); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); height: 100%;">
			<h4 style="color: var(--color-accent-gold); margin-bottom: var(--space-sm);">📋 Standart Dizi Nedir?</h4>
			<p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5;">
				Dengeli bir başlangıç için sunulan hazır puanlardır: <b>15, 14, 13, 12, 10, 8</b>.
				<br><br>
				Hangi puanı hangi yeteneğe vereceğiniz, karakterinizin neyde iyi olacağını belirler. 
				Örneğin bir Savaşçı için 15'i STR (Güç) veya DEX (Çeviklik) alanına koymak mantıklıdır.
			</p>
		</div>
	`;
	container.appendChild(info);

	parent.appendChild(container);

	const isComplete = abilities.every(a => currentAssignments[a]);
	renderAbilityFooter(parent, isComplete, onUpdate);
}
