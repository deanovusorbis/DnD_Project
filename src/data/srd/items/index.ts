/**
 * D&D Items Index
 */

import armorData from './armor.json';
import gearData from './gear.json';
import wondrousData from './wondrous.json';
import wondrousChanneling from './wondrous-channeling.json';
import otherData from './other.json';

// Subdivided Weapons
// Subdivided Weapons
import weaponsSwordsBase from './weapons-swords-base.json';
import weaponsSwordsMagic from './weapons-swords-magic.json';
import weaponsSwordsMaterials from './weapons-swords-materials.json';
import weaponsAxesHammersBase from './weapons-axes-hammers-base.json';
import weaponsAxesHammersMagic from './weapons-axes-hammers-magic.json';
import weaponsAxesHammersMaterials from './weapons-axes-hammers-materials.json';
import weaponsPolearmsStaffsBase from './weapons-polearms-staffs-base.json';
import weaponsPolearmsStaffsMagic from './weapons-polearms-staffs-magic.json';
import weaponsPolearmsStaffsMaterials from './weapons-polearms-staffs-materials.json';
import weaponsRangedBase from './weapons-ranged-base.json';
import weaponsRangedMagic from './weapons-ranged-magic.json';
import weaponsFirearmsBase from './weapons-firearms-base.json';
import weaponsFirearmsMagic from './weapons-firearms-magic.json';
import weaponsOthersBase from './weapons-others-base.json';
import weaponsOthersMagic from './weapons-others-magic.json';
import weaponsOthersMaterials from './weapons-others-materials.json';


// Subdivided Enspelled
import enspelledArmor from './enspelled-armor.json';
import enspelledOthers from './enspelled-others.json';
import enspelledWeaponsCantrip from './enspelled-weapons-cantrip.json';
import enspelledWeaponsLevel1_2 from './enspelled-weapons-level-1-2.json';
import enspelledWeaponsLevel3_4 from './enspelled-weapons-level-3-4.json';
import enspelledWeaponsLevel5_6 from './enspelled-weapons-level-5-6.json';
import enspelledWeaponsLevel7_8 from './enspelled-weapons-level-7-8.json';

// Packs and Tools
import packsToolsData from './packs-tools.json';

// Consumables and Misc
import consumablesData from './consumables.json';
import ammunitionData from './ammunition.json';
import artObjectsData from './art-objects.json';

// Wearables and Containers
import wearablesData from './wearables.json';
import containersData from './containers.json';

// Magic Variants
import magicPlusOne from './magic-plus-one.json';
import magicPlusTwo from './magic-plus-two.json';
import magicPlusThree from './magic-plus-three.json';
import magicMaterials from './magic-materials.json';

export const items = [
	...armorData,
	...gearData,
	...wondrousData,
	...wondrousChanneling,
	...otherData,
	...weaponsSwordsBase,
	...weaponsSwordsMagic,
	...weaponsSwordsMaterials,
	...weaponsAxesHammersBase,
	...weaponsAxesHammersMagic,
	...weaponsAxesHammersMaterials,
	...weaponsPolearmsStaffsBase,
	...weaponsPolearmsStaffsMagic,
	...weaponsPolearmsStaffsMaterials,
	...weaponsRangedBase,
	...weaponsRangedMagic,
	...weaponsFirearmsBase,
	...weaponsFirearmsMagic,
	...weaponsOthersBase,
	...weaponsOthersMagic,
	...weaponsOthersMaterials,
	...enspelledArmor,
	...enspelledOthers,
	...enspelledWeaponsCantrip,
	...enspelledWeaponsLevel1_2,
	...enspelledWeaponsLevel3_4,
	...enspelledWeaponsLevel5_6,
	...enspelledWeaponsLevel7_8,
	...packsToolsData,
	...consumablesData,
	...ammunitionData,
	...artObjectsData,
	...wearablesData,
	...containersData,
	...magicPlusOne,
	...magicPlusTwo,
	...magicPlusThree,
	...magicMaterials,
];
