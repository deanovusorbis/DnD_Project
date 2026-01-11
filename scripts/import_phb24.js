
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../Spells.csv');
const JSON_OUTPUT_PATH = path.join(__dirname, '../src/data/srd/spells.json');

function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')     // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

function parseCSVLine(line) {
	const values = [];
	let currentValue = '';
	let insideQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (insideQuotes && line[i + 1] === '"') {
				// Escaped quote
				currentValue += '"';
				i++;
			} else {
				insideQuotes = !insideQuotes;
			}
		} else if (char === ',' && !insideQuotes) {
			values.push(currentValue);
			currentValue = '';
		} else {
			currentValue += char;
		}
	}
	values.push(currentValue);
	return values;
}

try {
	const data = fs.readFileSync(CSV_PATH, 'utf8');
	const lines = data.split(/\r?\n/);

	// Headers: Name, Level, Casting Time, Duration, School, Range, Components, Classes, Subclasses, Text, At Higher Levels
	// Indices: 0     1      2             3         4       5      6           7        8           9     10

	const spells = [];

	// Skip header row
	for (let i = 1; i < lines.length; i++) {
		if (!lines[i].trim()) continue;

		const cols = parseCSVLine(lines[i]);
		if (cols.length < 5) continue; // Invalid row

		const name = cols[0];
		const levelRaw = cols[1];
		const castingTime = cols[2];
		const duration = cols[3];
		const schoolRaw = cols[4];
		const range = cols[5];
		const components = cols[6];
		const classesRaw = cols[7];
		// subClassesRaw = cols[8];
		const text = cols[9];
		const atHigherLevels = cols[10];

		// Parse Level
		let level = 0;
		if (levelRaw && levelRaw.toLowerCase().includes('cantrip')) {
			level = 0;
		} else {
			const match = levelRaw ? levelRaw.match(/(\d+)/) : null;
			if (match) level = parseInt(match[1]);
		}

		// Parse School and Ritual
		let school = schoolRaw ? schoolRaw.toLowerCase() : '';
		let ritual = false;
		if (school.includes('(ritual)')) {
			ritual = true;
			school = school.replace(/\(ritual\)/g, '').trim();
		}
		// Clean up remaining parenthesis if any (e.g. "abjuration (ritual)" -> "abjuration")
		school = school.replace(/\(.*\)/, '').trim();


		// Parse Classes
		// Expected format: "Artificer (EFA), Sorcerer (PHB'24), Wizard (PHB'24)"
		let classes = [];
		if (classesRaw) {
			classes = classesRaw.split(',').map(c => {
				// Remove parenthetical details like (PHB'24)
				return c.replace(/\(.*\)/, '').trim().toLowerCase();
			}).filter(c => c.length > 0);
		}

		// Deduplicate classes
		const uniqueClasses = [...new Set(classes)];

		// Construct Description
		let description = text || '';
		if (atHigherLevels && atHigherLevels.trim()) {
			description += '\n\n**At Higher Levels:** ' + atHigherLevels;
		}

		if (!name) continue;

		const spell = {
			id: slugify(name),
			name: name,
			level: level,
			school: school,
			classes: uniqueClasses,
			ritual: ritual,
			castingTime: castingTime,
			range: range,
			components: components,
			duration: duration,
			description: description
		};

		spells.push(spell);
	}

	console.log(`Parsed ${spells.length} spells.`);

	fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify({ spells: spells }, null, 2));
	console.log(`Successfully wrote to ${JSON_OUTPUT_PATH}`);

} catch (error) {
	console.error("Error processing CSV:", error);
	process.exit(1);
}
