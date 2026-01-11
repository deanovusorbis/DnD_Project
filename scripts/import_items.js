import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/data/srd/items.json');

// Unicode fraction mapping
const fractions = {
	'¼': 0.25, '½': 0.5, '¾': 0.75, '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
	'⅙': 1 / 6, '⅚': 5 / 6, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
};

function parseWeight(weightStr) {
	if (!weightStr) return 0;
	let cleanStr = weightStr.trim();
	let factor = 1;
	if (cleanStr.includes('oz.')) {
		factor = 1.0 / 16.0;
		cleanStr = cleanStr.replace('oz.', '').trim();
	} else if (cleanStr.includes('lb.')) {
		cleanStr = cleanStr.replace('lb.', '').trim();
	}
	for (const [char, val] of Object.entries(fractions)) {
		if (cleanStr.includes(char)) cleanStr = cleanStr.replace(char, val.toString());
	}
	const weight = parseFloat(cleanStr);
	return isNaN(weight) ? 0 : weight * factor;
}

function parseCSVLine(line) {
	const chars = line.split('');
	const fields = [];
	let currentField = '';
	let inQuotes = false;
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		if (char === '"') {
			if (inQuotes && chars[i + 1] === '"') {
				currentField += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			fields.push(currentField);
			currentField = '';
		} else {
			currentField += char;
		}
	}
	fields.push(currentField);
	return fields;
}

function parseType(typeStr) {
	const result = { type: 'other', subtype: '', category: '', classification: '', armorType: '' };
	const lower = typeStr.toLowerCase();

	if (lower.includes('weapon')) {
		result.type = 'weapon';
		if (lower.includes('martial')) result.category = 'martial';
		if (lower.includes('simple')) result.category = 'simple';
		if (lower.includes('melee')) result.classification = 'melee';
		if (lower.includes('ranged')) result.classification = 'ranged';
		const match = typeStr.match(/Weapon \(([^)]+)\)/);
		if (match) result.subtype = match[1];
	} else if (lower.includes('armor') || lower.includes('shield')) {
		result.type = 'armor';
		if (lower.includes('light')) result.armorType = 'light';
		if (lower.includes('medium')) result.armorType = 'medium';
		if (lower.includes('heavy')) result.armorType = 'heavy';
		if (lower.includes('shield')) { result.type = 'shield'; result.subtype = 'shield'; }
		const match = typeStr.match(/Armor \(([^)]+)\)/);
		if (match) result.subtype = match[1];
	} else if (lower.includes('ammunition')) {
		result.type = 'consumable'; result.subtype = 'ammunition';
		const match = typeStr.match(/Ammunition \(([^)]+)\)/);
		if (match) result.subtype = match[1];
	} else if (lower.includes('potion')) {
		result.type = 'consumable'; result.subtype = 'potion';
	} else if (lower.includes('scroll')) {
		result.type = 'consumable'; result.subtype = 'scroll';
	} else if (lower.includes('ring') || lower.includes('wondrous') || lower.includes('rod') || lower.includes('staff') || lower.includes('wand')) {
		result.type = 'wondrous';
	}
	return result;
}

function processCSV(filePath) {
	console.log(`Processing: ${path.basename(filePath)}`);
	if (!fs.existsSync(filePath)) {
		console.warn(`File not found: ${filePath}`);
		return [];
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split(/\r?\n/);
	const headers = parseCSVLine(lines[0]);
	const colParams = {};
	headers.forEach((h, i) => colParams[h] = i);

	const items = [];

	for (let i = 1; i < lines.length; i++) {
		if (!lines[i].trim()) continue;
		const cols = parseCSVLine(lines[i]);
		if (cols.length < headers.length) {
			console.warn(`Skipping line ${i + 1} in ${path.basename(filePath)}: Columns ${cols.length} < Headers ${headers.length}`);
			continue;
		}

		const name = cols[colParams['Name']].trim();
		if (!name) continue;

		// Skip headers if repeated
		if (name === 'Name') continue;

		const typeInfo = parseType(cols[colParams['Type']]);
		const damageRaw = cols[colParams['Damage']];
		const propertiesRaw = cols[colParams['Properties']];
		const weightRaw = cols[colParams['Weight']];

		// Parse Damage
		let damage = '';
		let damageType = '';
		if (damageRaw) {
			const parts = damageRaw.split(' ');
			if (parts.length >= 2) {
				damage = parts[0];
				damageType = parts[1].toLowerCase();
			} else {
				damage = damageRaw;
			}
		}

		const rawRarity = cols[colParams['Rarity']].toLowerCase();
		const rarity = (rawRarity === 'none' || rawRarity === '') ? 'common' : rawRarity;

		// Clean ID generation: remove special chars, replace spaces with dashes
		// +1 Weapon -> plus-1-weapon
		let idName = name.toLowerCase();
		idName = idName.replace(/\+/g, 'plus-');
		idName = idName.replace(/[^a-z0-9]+/g, '-');
		// Remove leading/trailing dashes
		idName = idName.replace(/^-+|-+$/g, '');

		const item = {
			id: idName,
			name: name,
			type: typeInfo.type,
			rarity: rarity,
			weight: parseWeight(weightRaw),
			description: cols[colParams['Text']],
			cost: { quantity: 0, unit: 'gp' }
		};

		// Parse Cost/Value
		const valStr = cols[colParams['Value']]; // e.g., "15 GP", "2 SP"
		if (valStr) {
			const valMatch = valStr.match(/([\d\.]+)\s*([A-Za-z]+)/);
			if (valMatch) {
				item.cost.quantity = parseFloat(valMatch[1]);
				item.cost.unit = valMatch[2].toLowerCase();
			}
		}

		// Add specific fields
		if (item.type === 'weapon') {
			const props = propertiesRaw ? propertiesRaw.split(',').map(p => p.trim()) : [];
			item.weapon = {
				category: typeInfo.category,
				damage: damage,
				damageType: damageType,
				properties: props,
				range: props.find(p => p.includes('Range')) || undefined
			};
		} else if (item.type === 'armor') {
			let ac = 10;
			const acMatch = damageRaw && damageRaw.match(/AC\s+(\d+)/);
			if (acMatch) ac = parseInt(acMatch[1]);
			item.armor = {
				type: typeInfo.armorType,
				ac: ac,
				dexBonus: damageRaw && damageRaw.includes('+ Dex')
			};
		} else if (item.type === 'shield') {
			item.armor = { type: 'shield', ac: 2, dexBonus: false };
		}

		items.push(item);
	}
	console.log(`Parsed ${items.length} records from ${path.basename(filePath)}`);
	return items;
}

function run() {
	const files = [
		path.join(__dirname, '../MundaneItems.csv'), // Process mundane items first
		path.join(__dirname, '../MagicItems.csv')
	];

	let allItems = [];
	const seenIds = new Set();
	const baseItemsMap = new Map();

	for (const f of files) {
		const fileItems = processCSV(f);
		let duplicates = 0;
		let added = 0;

		fileItems.forEach(item => {
			if (!seenIds.has(item.id)) {
				allItems.push(item);
				seenIds.add(item.id);
				// Track potential base items
				if (item.rarity === 'common' || item.rarity === 'none' || item.rarity === 'unknown') {
					baseItemsMap.set(item.name, item);
				}
				added++;
			} else {
				// Handle Duplicate by appending suffix
				let suffix = 1;
				let newId = `${item.id}-${suffix}`;
				while (seenIds.has(newId)) {
					suffix++;
					newId = `${item.id}-${suffix}`;
				}
				// Log the resolution
				// console.log(`Duplicate resolved: ${item.name} (original ID: ${item.id}) -> New ID: ${newId}`);
				item.id = newId;
				allItems.push(item);
				seenIds.add(newId);
				added++;
				// duplicates++; // No longer counting as skipped duplicate
			}
		});
		console.log(`File stats for ${path.basename(f)}: Added ${added}, Duplicates resolved`);
	}

	// Safety Net: Generate base items for magical +X items if missing
	// DISABLED: We only want items from CSV files, no auto-generation
	/*
	const generated = [];
	allItems.forEach(item => {
		if (item.name.match(/^\+\d\s/)) {
			const baseName = item.name.replace(/^\+\d\s/, '').trim();
			// Check if we have the base item
			const baseId = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

			if (!seenIds.has(baseId)) {
				// Not found. Check if we have a "clean" version in baseItemsMap by name?
				// Actually baseItemsMap keys are "Longsword" etc.
				if (!baseItemsMap.has(baseName)) {
					// Generate it!
					console.log(`Generating missing base item: ${baseName}`);
					const baseItem = JSON.parse(JSON.stringify(item));
					baseItem.id = baseId;
					baseItem.name = baseName;
					baseItem.rarity = 'common';
					// Adjust AC if armor
					if (baseItem.type === 'armor' && baseItem.armor) {
						baseItem.armor.ac -= 1; // Assume +1 bonus
					}
					generated.push(baseItem);
					seenIds.add(baseId);
				}
			}
		}
	});
	*/
	const generated = [];

	const finalItems = [...allItems, ...generated];
	finalItems.sort((a, b) => a.name.localeCompare(b.name));

	fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ items: finalItems }, null, 2));
	console.log(`Done. Total items: ${finalItems.length}`);
}

run();
