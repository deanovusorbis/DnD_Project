const fs = require('fs');
const content = fs.readFileSync('src/data/srd/classes.json', 'utf8');

function findDuplicateKeys(jsonStr) {
    const lines = jsonStr.split('\n');
    const stack = [new Set()];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const opens = (line.match(/\{/g) || []).length;
        const closes = (line.match(/\}/g) || []).length;

        for (let j = 0; j < opens; j++) {
            stack.push(new Set());
        }

        const match = line.match(/\"([^\"]+)\"\s*:/);
        if (match) {
            const key = match[1];
            if (stack.length > 0) {
                if (stack[stack.length - 1].has(key)) {
                    console.log(`Duplicate key found: "${key}" on line ${i + 1}`);
                }
                stack[stack.length - 1].add(key);
            }
        }

        for (let j = 0; j < closes; j++) {
            if (stack.length > 1) {
                stack.pop();
            }
        }
    }
}

try {
    findDuplicateKeys(content);
} catch (e) {
    console.error(e);
}
