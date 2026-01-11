/**
 * D&D Experiential Learning Platform - DiceVisualizer Component
 * Displays and animates dice roll results.
 */

import { DiceRollResult } from '../../types/core.types';

export interface DiceVisualizerOptions {
	containerId?: string;
}

export class DiceVisualizer {
	private container: HTMLElement | null = null;

	constructor(container?: HTMLElement | string) {
		if (typeof container === 'string') {
			this.container = document.getElementById(container);
		} else if (container instanceof HTMLElement) {
			this.container = container;
		}
	}

	public renderRoll(result: DiceRollResult, label: string = 'Zar Atışı'): HTMLElement {
		const rollDiv = document.createElement('div');
		const isD20 = result.expression.die === 'd20';
		const isCritical = isD20 && result.criticalHit;
		const isFumble = isD20 && result.criticalMiss;

		rollDiv.className = `dice-result ${isCritical ? 'critical' : ''} ${isFumble ? 'fumble' : ''}`.trim();

		rollDiv.innerHTML = `
			<div class="dice-result-label">${label} (${result.expression.count}${result.expression.die})</div>
			<div class="dice-result-value">${result.total}</div>
			<div class="dice-result-details">
				${result.rolls.join(' + ')} ${result.expression.modifier ? ` (${result.expression.modifier >= 0 ? '+' : ''}${result.expression.modifier})` : ''}
			</div>
			${isCritical ? '<div class="critical-text">🌟 KRİTİK BAŞARI! 🌟</div>' : ''}
			${isFumble ? '<div class="fumble-text">💀 KRİTİK ISKALAMA! 💀</div>' : ''}
		`;

		if (this.container) {
			this.container.innerHTML = '';
			this.container.appendChild(rollDiv);
		}

		return rollDiv;
	}

	public clear(): void {
		if (this.container) this.container.innerHTML = '';
	}
}
