/**
 * D&D Spells Index
 */

import level0Data from './spells-level-0.json';
import level1Data from './spells-level-1.json';
import level2Data from './spells-level-2.json';
import level3Data from './spells-level-3.json';
import level4Data from './spells-level-4.json';
import level5Data from './spells-level-5.json';
import level6Data from './spells-level-6.json';
import level7Data from './spells-level-7.json';
import level8Data from './spells-level-8.json';
import level9Data from './spells-level-9.json';

export const spells = [
	...level0Data,
	...level1Data,
	...level2Data,
	...level3Data,
	...level4Data,
	...level5Data,
	...level6Data,
	...level7Data,
	...level8Data,
	...level9Data,
];
