/**
 * D&D Experiential Learning Platform - Feature Translations
 * Translations for class and subclass features
 */

// Subclass Feature Names
export const subclassFeatureNames: Record<string, string> = {
	// Fighter - Champion
	'Improved Critical': 'Gelişmiş Kritik',
	'Remarkable Athlete': 'Olağanüstü Atlet',
	'Additional Fighting Style': 'Ek Dövüş Stili',
	'Superior Critical': 'Üstün Kritik',
	'Survivor': 'Hayatta Kalan',
	// Fighter - Battle Master
	'Combat Superiority': 'Savaş Üstünlüğü',
	// Fighter - Eldritch Knight
	'Spellcasting': 'Büyü Yapma',
	'War Magic': 'Savaş Büyüsü',
	'Eldritch Strike': 'Esrarengiz Vuruş',
	'Arcane Charge': 'Arkan Hücum',
	'Improved War Magic': 'Gelişmiş Savaş Büyüsü',
	// Fighter - Psi Warrior
	'Psionic Power': 'Psionik Güç',
	'Telekinetic Adept': 'Telekinetik Usta',
	'Guarded Mind': 'Korunan Zihin',
	'Bulwark of Force': 'Güç Kalkanı',
	'Telekinetic Master': 'Telekinetik Efendi',
	// Cleric - Life Domain
	'Bonus Proficiency': 'Ek Yeterlilik',
	'Disciple of Life': 'Yaşam Müridi',
	'Channel Divinity: Preserve Life': 'İlahi Kanal: Hayatı Koru',
	'Blessed Healer': 'Kutsanmış Şifacı',
	'Divine Strike': 'İlahi Vuruş',
	'Supreme Healing': 'Üstün Şifa',
	// Cleric - Light Domain
	'Warding Flare': 'Koruyucu Parıltı',
	'Radiance of the Dawn': 'Şafağın Işıltısı',
	'Improved Flare': 'Gelişmiş Parıltı',
	'Potent Spellcasting': 'Güçlü Büyü Yapma',
	'Corona of Light': 'Işık Tacı',
	// Barbarian
	'Rage Beyond Death': 'Ölüm Ötesi Öfke',
	'Persistent Rage': 'Kalıcı Öfke',
	'Spirit Shield': 'Ruh Kalkanı',
	'Ancestral Protectors': 'Ata Koruyucular',
	'Feral Instinct': 'Vahşi İçgüdü',
	'Bear Spirit': 'Ayı Ruhu',
	'Eagle Spirit': 'Kartal Ruhu',
	'Wolf Spirit': 'Kurt Ruhu',
	// Bard
	'Cutting Words': 'Keskin Sözler',
	'Blade Flourish': 'Kılıç Gösterisi',
	'Mantle of Inspiration': 'İlham Pelerini',
	'Psychic Blades': 'Psişik Bıçaklar',
	// Druid
	'Wild Shape': 'Vahşi Şekil',
	'Lunar Form': 'Ay Formu',
	'Starry Form': 'Yıldız Formu',
	'Ebb and Flow': 'Gel-Git',
	// Monk
	'Elemental Attunement': 'Element Uyumu',
	'Hand of Healing': 'Şifa Eli',
	'Shadow Step': 'Gölge Adımı',
	'Cloak of Shadows': 'Gölge Pelerini',
	// Paladin
	'Divine Sense': 'İlahi Algı',
	'Sacred Weapon': 'Kutsal Silah',
	'Aura of Protection': 'Koruma Aurası',
	'Aura of Courage': 'Cesaret Aurası',
	'Undying Sentinel': 'Ölümsüz Gözcü',
	// Ranger
	'Favored Enemy': 'Tercih Edilen Düşman',
	'Natural Explorer': 'Doğal Kaşif',
	'Ranger Companion': 'Ranger Yoldaşı',
	'Dread Ambusher': 'Korkunç Pusucu',
	"Stalker's Flurry": 'Takipçinin Darbesi',
	// Rogue
	'Sneak Attack': 'Sinsi Saldırı',
	'Fast Hands': 'Hızlı Eller',
	'Second-Story Work': 'İkinci Kat Ustalığı',
	'Assassinate': 'Suikast',
	'Infiltration Expertise': 'Sızma Uzmanlığı',
	// Sorcerer
	'Font of Magic': 'Büyü Kaynağı',
	'Draconic Resilience': 'Ejderha Dayanıklılığı',
	'Elemental Affinity': 'Element Yakınlığı',
	'Tides of Chaos': 'Kaos Dalgaları',
	'Bend Luck': 'Şansı Bük',
	// Warlock
	"Dark One's Blessing": 'Karanlığın Nimeti',
	'Fey Presence': 'Peri Varlığı',
	'Healing Light': 'Şifa Işığı',
	'Awakened Mind': 'Uyanmış Zihin',
	// Wizard
	'Arcane Recovery': 'Arkan Toparlanma',
	'Sculpt Spells': 'Büyü Şekillendirme',
	'Abjuration Savant': 'Koruma Bilgini',
	'Arcane Ward': 'Arkan Muhafız',
	'Portent': 'Kehanet',
	'Illusory Reality': 'Hayali Gerçeklik'
};

export function translateSubclassFeatureName(name: string): string {
	return subclassFeatureNames[name] || name;
}
