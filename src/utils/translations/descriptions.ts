/**
 * D&D Experiential Learning Platform - Description Translations
 * Translations for long-form descriptions of species, classes, etc.
 */

// Description Translations
export const descriptionTranslations: Record<string, string> = {
	// Species descriptions
	'Humans are the most adaptable and ambitious people among the common races. Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.':
		'İnsanlar, yaygın ırklar arasında en uyumlu ve hırslı halktır. Onları ne motive ederse etsin, insanlar dünyanın yenilikçileri, başarı kazananları ve öncüleridir.',
	'Elves are a magical people of otherworldly grace, living in places of ethereal beauty, in the midst of ancient forests or in silvery spires glittering with faerie light.':
		'Elfler, öteki dünyaya ait zarafetle donanmış büyülü bir halktır. Kadim ormanların ortasında veya peri ışığıyla parlayan gümüş kulelerde, ruhani güzellikte yerlerde yaşarlar.',
	'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.':
		'Cesur ve dayanıklı cüceler, yetenekli savaşçılar, madenciler ve taş ile metal işçileri olarak bilinirler.',
	'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense.':
		'Minyon buçukluklar, daha büyük yaratıklarla dolu bir dünyada dikkat çekmeyerek ya da bunu başaramazlarsa gücendirmeyerek hayatta kalırlar.',
	// Class descriptions
	'A fierce warrior who can enter a battle rage.':
		'Savaş öfkesine kapılabilen vahşi bir savaşçı.',
	'A master of martial combat, skilled with a variety of weapons and armor.':
		'Çeşitli silah ve zırhlarda yetenekli, dövüş ustası bir savaşçı.',
	'A priestly champion who wields divine magic in service of a higher power.':
		'Yüce bir güce hizmet eden ilahi büyü kullanan rahip şampiyon.',
	'A priest of nature who can shape-shift into beasts.':
		'Hayvanlara dönüşebilen doğa rahibi.',
	'An inspiring magician whose power echoes the music of creation.':
		'Gücü yaratılışın müziğini yansıtan ilham veren bir büyücü.',
	'A holy warrior bound to a sacred oath.':
		'Kutsal bir yemine bağlı kutsal savaşçı.',
	'A warrior who uses martial arts and the power of ki.':
		'Dövüş sanatları ve ki gücünü kullanan savaşçı.',
	'A warrior who combats evil beyond civilization.':
		'Medeniyetin ötesinde kötülükle savaşan savaşçı.',
	'A scoundrel who uses stealth and trickery.':
		'Gizlilik ve aldatmaca kullanan düzenbaz.',
	'A spellcaster who draws on inherent magic.':
		'Doğuştan gelen büyüyü kullanan büyücü.',
	'A wielder of magic derived from a pact with an otherworldly being.':
		'Başka bir alemdeki varlıkla yapılan anlaşmadan güç alan büyücü.',
	'A scholarly magic-user capable of manipulating the structures of reality.':
		'Gerçekliğin yapısını manipüle edebilen akademik büyücü.'
};

export function translateDescription(text: string): string {
	if (descriptionTranslations[text]) return descriptionTranslations[text];

	// Partial matching for tricky or missing descriptions
	const partials: Record<string, string> = {
		'Aasimar': 'Aasimar ruhlarında cennetin ışığını taşır. İlahi bir varlık tarafından kötülükle savaşmak ve masumları korumak için seçilmişlerdir.',
		'Goliath': 'Goliathlar dağların zirvelerinde yaşayan, rekabeti seven ve doğanın zorluklarına meydan okuyan güçlü, devasa bir halktır.',
		'Orc': 'Orklar güç ve dayanıklılıklarıyla bilinen, savaşçı bir kültüre sahip, Gruumsh\'un öfkesini taşıyan halktır.',
		'Dragonborn': 'Ejderhalardan doğan ejderha soylular, onlara korkuyla karışık bir saygıyla bakan dünyada gururla yürürler.',
		'Gnome': 'Gnomeların yaşama sevinci ve enerjisi, minik bedenlerinin her zerresinden dışarı taşar.',
		'Tiefling': 'Şeytani bir mirasın izlerini taşıyan Tieflingler, genellikle güvensiz bakışlarla karşılansalar da kendi kaderlerini çizerler.'
	};

	// If the text contains the key word and looks like a description (long enough), replace it
	for (const [key, value] of Object.entries(partials)) {
		if (text.includes(key) && text.length > 20) {
			return value;
		}
	}

	return text;
}
