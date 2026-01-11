/**
 * D&D Experiential Learning Platform - CombatView
 * Handles combat simulations and action resolution with triple-layered narrative.
 */

import { GameEngine } from '../../engine/core/engine.ts';
import { DiceVisualizer } from '../components/DiceVisualizer.ts';
import { createButton } from '../components/Button.ts';
import { createCard } from '../components/Card.ts';
import { createRuleHint } from '../components/RuleHint.ts';

export class CombatView {
	private container: HTMLElement;
	private _engine: GameEngine;
	private _diceVisualizer: DiceVisualizer | null = null;

	constructor(container: HTMLElement, engine: GameEngine) {
		this.container = container;
		this._engine = engine;
	}

	public render(): void {
		this.container.innerHTML = '';

		const header = document.createElement('div');
		header.className = 'view-header';
		header.innerHTML = `
            <h2>Savaş Simülasyonu</h2>
            <p>Zarları at ve kuralların hikâyeye nasıl dönüştüğünü gör.</p>
        `;
		this.container.appendChild(header);

		// Dice Visualizer Area
		const vizContainer = document.createElement('div');
		vizContainer.id = 'combat-dice-viz';
		vizContainer.style.marginBottom = '20px';
		this.container.appendChild(vizContainer);
		this._diceVisualizer = new DiceVisualizer(vizContainer);

		// Tactical Actions Card
		const actionsGrid = document.createElement('div');
		actionsGrid.className = 'dice-buttons';

		const attackBtn = createButton({
			label: 'Yakın Dövüş Saldırısı (Sword)',
			variant: 'danger',
			icon: '⚔️',
			onClick: () => this.handleAction('attack_sword')
		});

		const spellBtn = createButton({
			label: 'Büyü Fırlat (Firebolt)',
			variant: 'primary',
			icon: '🔥',
			onClick: () => this.handleAction('cast_firebolt')
		});

		actionsGrid.appendChild(attackBtn);
		actionsGrid.appendChild(spellBtn);

		const actionsCard = createCard({
			title: 'Mevcut Aksiyonlar',
			content: actionsGrid
		});
		this.container.appendChild(actionsCard);

		// Core Mechanic Hint
		const hint = createRuleHint({
			ruleId: 'd20-system',
			title: 'D20 Sistemi ve Saldırı Bonusları',
			concept: 'Savaş Mekanikleri',
			description: 'Bir saldırı yaptığında 1d20 atarsın ve üzerine "Saldırı Bonusu"nu eklersin. Eğer toplam, rakibinin "Zırh Sınıfı"na (AC) eşit veya büyükse vurursun!'
		});
		this.container.appendChild(hint);
	}

	private async handleAction(actionType: string): Promise<void> {
		// This interacts with GameEngine
		console.log(`Executing action ${actionType} via engine:`, this._engine);

		// Simulated result for demonstration of narrative layers
		this.renderNarrativeLayers();
	}

	private renderNarrativeLayers(): void {
		if (this._diceVisualizer) {
			// Placeholder for real roll visualization
		}
		const layerArea = document.createElement('div');
		layerArea.className = 'narrative-stack';
		layerArea.style.marginTop = '20px';

		layerArea.innerHTML = `
            <div class="card card-accent" style="margin-bottom: 10px;">
                <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-accent-gold);">🛡️ Sistem Katmanı (Kurallar)</div>
                <div style="font-family: monospace; font-size: 0.85rem;">
                    Saldırı Rolü: [15] + Güç(3) + Prof(2) = 20 vs AC 14. <strong>Vuruş Başarılı!</strong><br>
                    Hasar: [6] + Güç(3) = 9 Kesici Hasar.
                </div>
            </div>
            
            <div class="card card-success">
                <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-accent-green);">🎭 Hikâye Katmanı (Anlatı)</div>
                <div style="font-style: italic;">
                    "Kılıcın havada ıslık çalarak kavis çizdi ve orkun deri zırhının arasından geçerek omzuna derin bir darbe indirdi. Yaratık acıyla böğürdü."
                </div>
            </div>
        `;

		// Remove previous narrative if exists
		const oldLog = this.container.querySelector('.narrative-stack');
		if (oldLog) oldLog.remove();

		this.container.appendChild(layerArea);
	}
}
