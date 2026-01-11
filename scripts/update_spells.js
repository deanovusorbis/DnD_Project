
import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://raw.githubusercontent.com/vorpalhex/srd_spells/master/spells.json';
const outputPath = path.resolve('src/data/srd/spells.json');

console.log(`Fetching spells from ${url}...`);

https.get(url, (res) => {
	let data = '';

	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		try {
			const externalSpells = JSON.parse(data);
			console.log(`Received ${externalSpells.length} spells.`);

			const transformedSpells = externalSpells.map((s) => {
				// Parse Level
				let level = 0;
				if (s.level === 'cantrip') {
					level = 0;
				} else {
					level = parseInt(s.level, 10);
				}

				// Generate ID
				const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

				// Generate Classes
				// Note: Raw data has classes as array of strings ["wizard", "sorcerer"], which matches our need.
				// Ensure lowercase
				const classes = (s.classes || []).map(c => c.toLowerCase());

				return {
					id: id,
					name: s.name,
					level: level,
					school: s.school.toLowerCase(),
					classes: classes,
					ritual: s.ritual || false,
					description: s.description
				};
			});

			// Filter to ensure we only have valid data (optional basics)
			// Removing any spells with no classes if that's an issue? No, keep all SRD.

			const outputData = {
				spells: transformedSpells
			};

			fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
			console.log(`Successfully wrote ${transformedSpells.length} spells to ${outputPath}`);

		} catch (e) {
			console.error('Error parsing or writing data:', e);
			process.exit(1);
		}
	});

}).on('error', (err) => {
	console.error('Error fetching data:', err);
	process.exit(1);
});
