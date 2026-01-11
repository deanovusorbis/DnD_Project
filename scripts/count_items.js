import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const itemsPath = path.join(__dirname, '../src/data/srd/items.json');
const data = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
const items = data.items;

const mundane = items.filter(i => i.rarity === 'common').length;
const magic = items.filter(i => i.rarity !== 'common').length;

console.log(`Sıradan (Common): ${mundane}`);
console.log(`Büyülü (Magic): ${magic}`);
console.log(`Toplam: ${items.length}`);

// Rarity breakdown
const rarityCount = {};
items.forEach(item => {
	rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
});

console.log('\nRarity Dağılımı:');
Object.entries(rarityCount).sort((a, b) => b[1] - a[1]).forEach(([rarity, count]) => {
	console.log(`  ${rarity}: ${count}`);
});
