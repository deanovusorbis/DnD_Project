
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'srd', 'classes.json');

try {
	const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	const classes = data.classes || [];

	console.log(`Total Classes: ${classes.length}`);
	classes.forEach(c => {
		console.log(`\n[CLASS] ${c.name} (${c.id})`);
		console.log(`  - Subclasses: ${c.subclasses ? c.subclasses.length : 0}`);
		if (c.subclasses) {
			c.subclasses.forEach(s => console.log(`    - ${s.name} (${s.id})`));
		}
	});

} catch (err) {
	console.error("Error:", err);
}
