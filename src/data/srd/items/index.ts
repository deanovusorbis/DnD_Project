import adventuring from './adventuring.json';
import arcane from './arcane.json';
import armory from './armory.json';
import generalStore from './general-store.json';
import inn from './inn.json';
import jeweler from './jeweler.json';
import leatherwork from './leatherwork.json';
import musical from './musical.json';
import potion from './potion.json';
import tailor from './tailor.json';
import temple from './temple.json';
import thieves from './thieves.json';
import weapons from './weapons.json';
import armor from './armor.json';
import tools from './tools.json';

export const items = [
	...adventuring,
	...arcane,
	...armory,
	...armor,
	...tools,
	...generalStore,
	...inn,
	...jeweler,
	...leatherwork,
	...musical,
	...potion,
	...tailor,
	...temple,
	...thieves,
	...weapons
];

export default items;
