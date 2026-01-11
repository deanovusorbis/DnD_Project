/**
 * D&D Experiential Learning Platform - Character Translations
 * Translations for character-related content (species, classes, abilities)
 */

// Species Names
export const speciesNames: Record<string, string> = {
	'Human': 'İnsan',
	'Elf': 'Elf',
	'Dwarf': 'Cüce',
	'Halfling': 'Buçukluk',
	'Dragonborn': 'Ejderha Soylu',
	'Gnome': 'Gnome',
	'Tiefling': 'Tiefling',
	'Aasimar': 'Aasimar',
	'Goliath': 'Goliath',
	'Orc': 'Ork'
};

// Subspecies Names
export const subspeciesNames: Record<string, string> = {
	// Goliaths
	'Cloud Giant Ancestry': 'Bulut Devi Soyu',
	'Fire Giant Ancestry': 'Ateş Devi Soyu',
	'Frost Giant Ancestry': 'Buz Devi Soyu',
	'Hill Giant Ancestry': 'Tepe Devi Soyu',
	'Stone Giant Ancestry': 'Taş Devi Soyu',
	'Storm Giant Ancestry': 'Fırtına Devi Soyu',
	// Dragonborn
	'Black Dragonborn': 'Siyah Ejderha Soyu',
	'Blue Dragonborn': 'Mavi Ejderha Soyu',
	'Brass Dragonborn': 'Pirinç Ejderha Soyu',
	'Bronze Dragonborn': 'Bronz Ejderha Soyu',
	'Copper Dragonborn': 'Bakır Ejderha Soyu',
	'Gold Dragonborn': 'Altın Ejderha Soyu',
	'Green Dragonborn': 'Yeşil Ejderha Soyu',
	'Red Dragonborn': 'Kırmızı Ejderha Soyu',
	'Silver Dragonborn': 'Gümüş Ejderha Soyu',
	'White Dragonborn': 'Beyaz Ejderha Soyu',
	// Elves
	'High Elf': 'Yüce Elf',
	'Wood Elf': 'Orman Elfi',
	'Dark Elf': 'Karanlık Elf',
	// Gnomes
	'Forest Gnome': 'Orman Gnome\'u',
	'Rock Gnome': 'Kaya Gnome\'u',
	// Tieflings
	'Infernal Tiefling': 'Cehennem Tiefling\'i',
	'Abyssal Tiefling': 'Uçurum Tiefling\'i',
	// Aasimar
	'Protector Aasimar': 'Koruyucu Aasimar',
	'Scourge Aasimar': 'Felaket Aasimar',
	'Fallen Aasimar': 'Düşmüş Aasimar'
};

// Class Names
export const classNames: Record<string, string> = {
	'Barbarian': 'Barbar',
	'Bard': 'Bard',
	'Cleric': 'Rahip',
	'Druid': 'Druid',
	'Fighter': 'Savaşçı',
	'Monk': 'Keşiş',
	'Paladin': 'Paladin',
	'Ranger': 'Ranger',
	'Rogue': 'Rogue',
	'Sorcerer': 'Sorcerer',
	'Warlock': 'Warlock',
	'Wizard': 'Büyücü'
};

// Subclass Names
export const subclassNames: Record<string, string> = {
	// Barbarian
	'Path of the Berserker': 'Çılgın Yolu',
	'Path of the Totem Warrior': 'Totem Savaşçısı Yolu',
	'Path of the Ancestral Guardian': 'Ata Koruyucu Yolu',
	'Path of the Wild Heart': 'Vahşi Kalp Yolu',
	'Path of the World Tree': 'Dünya Ağacı Yolu',
	'Path of the Zealot': 'Fanatik Yolu',
	// Bard
	'College of Lore': 'Bilgi Koleji',
	'College of Valor': 'Cesaret Koleji',
	'College of Dance': 'Dans Koleji',
	'College of Glamour': 'Cazibe Koleji',
	// Cleric
	'Life Domain': 'Yaşam Alanı',
	'Light Domain': 'Işık Alanı',
	'War Domain': 'Savaş Alanı',
	// Druid
	'Circle of the Land': 'Toprak Çemberi',
	'Circle of the Moon': 'Ay Çemberi',
	'Circle of the Sea': 'Deniz Çemberi',
	'Circle of the Stars': 'Yıldız Çemberi',
	// Fighter
	'Champion': 'Şampiyon',
	'Battle Master': 'Savaş Ustası',
	'Eldritch Knight': 'Esrarengiz Şövalye',
	'Psi Warrior': 'Psionik Savaşçı',
	// Monk
	'Way of the Open Hand': 'Açık El Yolu',
	'Warrior of the Elements': 'Element Savaşçısı',
	'Warrior of Mercy': 'Merhamet Savaşçısı',
	'Warrior of Shadow': 'Gölge Savaşçısı',
	// Paladin
	'Oath of Devotion': 'Bağlılık Yemini',
	'Oath of the Ancients': 'Kadimler Yemini',
	'Oath of Glory': 'Zafer Yemini',
	'Oath of Vengeance': 'İntikam Yemini',
	// Ranger
	'Hunter': 'Avcı',
	'Beast Master': 'Canavar Ustası',
	'Fey Wanderer': 'Peri Gezgini',
	'Gloom Stalker': 'Kasvet Avcısı',
	// Rogue
	'Thief': 'Hırsız',
	'Arcane Trickster': 'Büyülü Düzenbaz',
	'Assassin': 'Suikastçı',
	'Soulknife': 'Ruh Bıçağı',
	// Sorcerer
	'Draconic Bloodline': 'Ejderha Soyu',
	'Aberrant Sorcery': 'Anormal Büyücülük',
	'Clockwork Sorcery': 'Çark Büyücülüğü',
	'Wild Magic Sorcery': 'Vahşi Büyü',
	// Warlock
	'The Fiend': 'İblis Hamisi',
	'Archfey Patron': 'Archfey Hamisi',
	'Celestial Patron': 'Göksel Hami',
	'Great Old One Patron': 'Yüce Eskiler Hamisi',
	// Wizard
	'School of Evocation': 'Evokasyon Okulu',
	'School of Abjuration': 'Koruma Okulu',
	'School of Divination': 'Kehanet Okulu',
	'School of Illusion': 'İllüzyon Okulu'
};

// Ability Names
export const abilityNames: Record<string, string> = {
	'STR': 'Güç',
	'DEX': 'Çeviklik',
	'CON': 'Dayanıklılık',
	'INT': 'Zeka',
	'WIS': 'Bilgelik',
	'CHA': 'Karizma'
};

// Helper Functions
export function translateSpeciesName(name: string): string {
	return speciesNames[name] || name;
}

export function translateSubspeciesName(name: string): string {
	return subspeciesNames[name] || name;
}

export function translateClassName(name: string): string {
	return classNames[name] || name;
}

export function translateSubclassName(name: string): string {
	return subclassNames[name] || name;
}

export function translateAbilityName(name: string): string {
	return abilityNames[name] || name;
}
