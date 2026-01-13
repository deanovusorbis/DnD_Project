
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'srd', 'species.json');

try {
	const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	const speciesList = data.species || [];
	let errorCount = 0;

	console.log("--- Checking Species Traits ---");

	speciesList.forEach(s => {
		if (s.traits) {
			s.traits.forEach(t => {
				const issues = [];
				if (t.level === undefined) issues.push("Missing 'level'");
				if (t.requiredLevel !== undefined) issues.push("Has 'requiredLevel' (deprecated)");

				if (issues.length > 0) {
					console.log(`[${s.name}] Trait '${t.name}' (${t.id}): ${issues.join(', ')}`);
					errorCount++;
				}
			});
		}
	});

	if (errorCount === 0) {
		console.log("SUCCESS: All traits have 'level' and no 'requiredLevel'.");
	} else {
		console.log(`\nFound ${errorCount} traits with issues.`);
	}

} catch (err) {
	console.error("Error:", err);
}
