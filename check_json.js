const fs = require('fs');

function checkDuplicateKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const stack = [{}]; // Stack of maps to track keys at each level

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Count { and [ for starts
        const openers = (line.match(/[\{\[]/g) || []).length;
        const closers = (line.match(/[\}\]]/g) || []).length;

        // Handle openers
        for (let j = 0; j < openers; j++) {
            stack.push({});
        }

        // Check for key
        const match = line.match(/\"([^\"]+)\"\s*:/);
        if (match) {
            const key = match[1];
            if (stack[stack.length - 1][key]) {
                console.log(`Duplicate key "${key}" found on line ${i + 1}. Previous occurrence on line ${stack[stack.length - 1][key]}`);
            }
            stack[stack.length - 1][key] = i + 1;
        }

        // Handle closers
        for (let j = 0; j < closers; j++) {
            if (stack.length > 1) {
                stack.pop();
            }
        }
    }
}

checkDuplicateKeys('src/data/srd/classes.json');
