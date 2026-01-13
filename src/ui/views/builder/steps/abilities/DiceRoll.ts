import { useGameStore } from '../../../../../engine/core/store.ts';
import * as DiceCore from '../../../../../engine/core/dice.ts';
import { AbilityName, AbilityScores } from '../../../../../types/core.types.ts';
import { translateAbilityName } from '../../../../../utils/translations/index.ts';
import { createButton } from '../../../../components/Button.ts';
import { renderAbilityFooter } from '../AbilitiesStep.ts';

export function renderDiceRoll(parent: HTMLElement, onUpdate: () => void): void {
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
				onUpdate();
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
				onUpdate();
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
				if (a !== ability && v !== undefined) poolCounts[v as number]!--;
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
	renderAbilityFooter(parent, abilities.every(a => currentAssignments[a]), onUpdate);
}
