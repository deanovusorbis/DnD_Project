import { useGameStore } from '../../../../../engine/core/store.ts';
import * as DiceCore from '../../../../../engine/core/dice.ts';
import { AbilityName, AbilityScores } from '../../../../../types/core.types.ts';
import { translateAbilityName } from '../../../../../utils/translations/index.ts';
import { renderAbilityFooter } from '../AbilitiesStep.ts';

export function renderPointBuy(parent: HTMLElement, onUpdate: () => void): void {
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
			updatePointBuyState(newAssignments, bonuses, onUpdate);
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
				updatePointBuyState(newAssignments, bonuses, onUpdate);
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
	renderAbilityFooter(parent, remaining === 0, onUpdate);
}

function updatePointBuyState(newAssignments: Partial<Record<AbilityName, number>>, bonuses: Partial<Record<AbilityName, number>>, onUpdate: () => void): void {
	const finalScores: Partial<AbilityScores> = {};
	const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
	abilities.forEach(a => {
		finalScores[a] = (newAssignments[a] || 8) + (bonuses[a] || 0);
	});

	useGameStore.getState().updateCharacterCreation({
		abilityAssignments: newAssignments,
		abilityScores: finalScores as AbilityScores
	});
	onUpdate();
}
