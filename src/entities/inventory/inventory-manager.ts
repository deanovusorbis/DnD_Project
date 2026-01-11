
import {
	CharacterInventory,
	InventoryItem,
	Item,
	Weapon,
	Armor,
	Currency
} from '../../types/index';

export const WEIGHT_LIMIT_MULTIPLIER = 15;
export const ENCUMBERED_MULTIPLIER = 5;
export const HEAVILY_ENCUMBERED_MULTIPLIER = 10;

export function createEmptyInventory(strengthScore: number = 10): CharacterInventory {
	return {
		items: [],
		currency: {
			platinum: 0,
			gold: 0,
			electrum: 0,
			silver: 0,
			copper: 0
		},
		maxCarryWeight: strengthScore * WEIGHT_LIMIT_MULTIPLIER,
		currentWeight: 0,
		encumbranceLevel: 'none'
	};
}

export function calculateTotalWeight(inventory: CharacterInventory): number {
	let totalWeight = 0;

	// Item weights
	for (const invItem of inventory.items) {
		totalWeight += invItem.item.weight * invItem.quantity;
	}

	// Currency weight: 50 coins = 1 lb
	const totalCoins =
		inventory.currency.platinum +
		inventory.currency.gold +
		inventory.currency.electrum +
		inventory.currency.silver +
		inventory.currency.copper;

	totalWeight += totalCoins / 50;

	return parseFloat(totalWeight.toFixed(2));
}

export function updateEncumbrance(inventory: CharacterInventory, strengthScore: number): CharacterInventory {
	const currentWeight = calculateTotalWeight(inventory);
	const maxCarryWeight = strengthScore * WEIGHT_LIMIT_MULTIPLIER;

	let encumbranceLevel: CharacterInventory['encumbranceLevel'] = 'none';

	if (currentWeight > maxCarryWeight) {
		encumbranceLevel = 'heavily encumbered'; // Strictly speaking, > max is "push/drag/lift" only, but effectively maxed out
	} else if (currentWeight > strengthScore * HEAVILY_ENCUMBERED_MULTIPLIER) {
		encumbranceLevel = 'heavily encumbered';
	} else if (currentWeight > strengthScore * ENCUMBERED_MULTIPLIER) {
		encumbranceLevel = 'encumbered';
	}

	return {
		...inventory,
		currentWeight,
		maxCarryWeight,
		encumbranceLevel
	};
}

export function addItemToInventory(
	inventory: CharacterInventory,
	item: Item | Weapon | Armor,
	quantity: number = 1,
	strengthScore: number = 10
): CharacterInventory {
	const newItems = [...inventory.items];
	const existingItemIndex = newItems.findIndex(i => i.item.id === item.id);

	if (existingItemIndex >= 0) {
		const existingItem = newItems[existingItemIndex]!;
		newItems[existingItemIndex] = {
			item: existingItem.item,
			quantity: existingItem.quantity + quantity,
			equipped: existingItem.equipped,
			attuned: existingItem.attuned
		};
	} else {
		const newItem: InventoryItem = {
			item,
			quantity,
			equipped: false,
			attuned: false
		};
		newItems.push(newItem);
	}

	const tempInventory = { ...inventory, items: newItems };
	return updateEncumbrance(tempInventory, strengthScore);
}

export function removeItemFromInventory(
	inventory: CharacterInventory,
	itemId: string,
	quantity: number = 1,
	strengthScore: number = 10
): CharacterInventory {
	let newItems = [...inventory.items];
	const existingItemIndex = newItems.findIndex(i => i.item.id === itemId);

	if (existingItemIndex >= 0) {
		const existingItem = newItems[existingItemIndex]!;
		const currentQty = existingItem.quantity;
		if (currentQty <= quantity) {
			// Remove item completely
			newItems.splice(existingItemIndex, 1);
		} else {
			// Reduce quantity
			newItems[existingItemIndex] = {
				item: existingItem.item,
				quantity: currentQty - quantity,
				equipped: existingItem.equipped,
				attuned: existingItem.attuned
			};
		}
	}

	const tempInventory = { ...inventory, items: newItems };
	return updateEncumbrance(tempInventory, strengthScore);
}

export function equipItem(
	inventory: CharacterInventory,
	itemId: string,
	equip: boolean = true
): CharacterInventory {
	const newItems = inventory.items.map(i => {
		if (i.item.id === itemId) {
			// If equipping armor, unequip other armor? 
			// Simplified for now: just toggle the target item
			// Future: Prevent multiple armors, handle shields, etc.
			return { ...i, equipped: equip };
		}
		return i;
	});

	return { ...inventory, items: newItems };
}

export function addCurrency(
	inventory: CharacterInventory,
	amount: Partial<Currency>,
	strengthScore: number = 10
): CharacterInventory {
	const newCurrency = { ...inventory.currency };

	if (amount.platinum) newCurrency.platinum += amount.platinum;
	if (amount.gold) newCurrency.gold += amount.gold;
	if (amount.electrum) newCurrency.electrum += amount.electrum;
	if (amount.silver) newCurrency.silver += amount.silver;
	if (amount.copper) newCurrency.copper += amount.copper;

	const tempInventory = { ...inventory, currency: newCurrency };
	return updateEncumbrance(tempInventory, strengthScore);
}
