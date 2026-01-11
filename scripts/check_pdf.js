
import fs from 'fs';
import pdf from 'pdf-parse';

const dataBuffer = fs.readFileSync('c:/Users/aizaw/OneDrive/Desktop/DnD Project/Dungeons_and_Dragons_Players_Handbook_2024.pdf');

pdf(dataBuffer).then(function (data) {
	console.log('Number of pages:', data.numpages);
	console.log('First 1000 characters:');
	console.log(data.text.substring(0, 1000));
}).catch(function (error) {
	console.error('Error parsing PDF:', error);
});
