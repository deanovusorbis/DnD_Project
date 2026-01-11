

import { CharacterInventory } from '../types/inventory.types';
import { calculateTotalWeight } from '../entities/inventory/inventory-manager';

export function renderInventorySheet(containerId: string, inventory: CharacterInventory) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalWeight = calculateTotalWeight(inventory);

    // Determine Encumbrance Status Color
    let encumbranceColor = 'var(--color-text-secondary)';
    let encumbranceText = 'Normal';

    if (inventory.encumbranceLevel === 'encumbered') {
        encumbranceColor = 'var(--color-accent-gold)';
        encumbranceText = 'Aşırı Yüklü (-10 Hız)';
    } else if (inventory.encumbranceLevel === 'heavily encumbered') {
        encumbranceColor = 'var(--color-accent-red)';
        encumbranceText = 'Çok Ağır Yüklü (-20 Hız, Dezavantaj)';
    }

    const html = `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">🛡️ Ekipman ve Envanter</h3>
            <span class="inventory-summary">
                <span style="color: var(--color-accent-gold)">${totalWeight.toFixed(1)}</span> / ${inventory.maxCarryWeight} lb
            </span>
        </div>

        <!-- Encumbrance Bar -->
        <div class="mastery-bar" style="margin-top: 0; margin-bottom: var(--space-lg); background: var(--color-bg-tertiary);">
            <div class="mastery-bar-fill" style="width: ${Math.min((totalWeight / inventory.maxCarryWeight) * 100, 100)}%; background: ${inventory.encumbranceLevel === 'none' ? 'var(--color-accent-green)' : encumbranceColor}"></div>
        </div>
        <div style="text-align: right; font-size: 0.8rem; color: ${encumbranceColor}; margin-top: -10px; margin-bottom: var(--space-lg);">
            Durum: ${encumbranceText}
        </div>

        <!-- Money Pouch -->
        <div class="inventory-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-sm); text-align: center; margin-bottom: var(--space-lg); background: var(--color-bg-tertiary); padding: var(--space-sm); border-radius: var(--radius-md);">
            <div>
                <div style="color: #e5e4e2; font-weight: bold;">PP</div>
                <div>${inventory.currency.platinum}</div>
            </div>
            <div>
                <div style="color: #d4af37; font-weight: bold;">GP</div>
                <div>${inventory.currency.gold}</div>
            </div>
            <div>
                <div style="color: #a0b2c6; font-weight: bold;">EP</div>
                <div>${inventory.currency.electrum}</div>
            </div>
            <div>
                <div style="color: #c0c0c0; font-weight: bold;">SP</div>
                <div>${inventory.currency.silver}</div>
            </div>
            <div>
                <div style="color: #b87333; font-weight: bold;">CP</div>
                <div>${inventory.currency.copper}</div>
            </div>
        </div>

        <div class="inventory-list">
            ${inventory.items.length === 0 ? '<p class="text-secondary text-center">Envanter boş.</p>' : ''}
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead style="border-bottom: 1px solid var(--color-border); color: var(--color-accent-gold);">
                    <tr>
                        <th style="text-align: left; padding: var(--space-sm);">Eşya</th>
                        <th style="text-align: center; padding: var(--space-sm);">Adet</th>
                        <th style="text-align: center; padding: var(--space-sm);">Ağırlık</th>
                        <th style="text-align: right; padding: var(--space-sm);">Aksiyonlar</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventory.items.map(slot => `
                        <tr style="border-bottom: 1px solid var(--color-border-light);">
                            <td style="padding: var(--space-sm);">
                                <div style="font-weight: bold; ${slot.equipped ? 'color: var(--color-accent-green);' : ''}">
                                    ${slot.item.name} ${slot.equipped ? '(Kuşanıldı)' : ''}
                                </div>
                                <div style="font-size: 0.8rem; color: var(--color-text-secondary);">
                                    ${slot.item.type} | ${slot.item.rarity}
                                </div>
                            </td>
                            <td style="text-align: center; padding: var(--space-sm);">${slot.quantity}</td>
                            <td style="text-align: center; padding: var(--space-sm);">${(slot.item.weight * slot.quantity).toFixed(1)} lb</td>
                            <td style="text-align: right; padding: var(--space-sm); display: flex; gap: 4px; justify-content: flex-end;">
                                ${slot.item.type === 'weapon' || slot.item.type === 'armor' ? `
                                    <button class="btn btn-secondary btn-sm" onclick="window.toggleEquip('${slot.item.id}')" title="${slot.equipped ? 'Çıkar' : 'Kuşan'}">
                                        ${slot.equipped ? '🛡️' : '⚔️'}
                                    </button>
                                ` : ''}
                                <button class="btn btn-secondary btn-sm" onclick="window.removeItem('${slot.item.id}')" style="color: var(--color-accent-red);" title="Sil">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;

    container.innerHTML = html;
}
