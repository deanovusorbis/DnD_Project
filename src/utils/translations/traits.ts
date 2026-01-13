/**
 * D&D Experiential Learning Platform - Trait Translations
 * Translations for character traits and racial features
 */

// Trait Translations
export const traitTranslations: Record<string, { name: string, description: string }> = {


	'Rage': {
		name: 'Öfke (Rage)',
		description: 'Savaşta ilkel bir öfkeye bürünerek hasar bonusu, dirençler ve güç avantajları kazanırsın.'
	},
	'Unarmored Defense': {
		name: 'Zırhsız Savunma',
		description: 'Zırh giymediğinde AC değerin 10 + DEX + CON (veya Monk için WIS) olarak hesaplanır.'
	},
	'Bardic Inspiration': {
		name: 'Ozan İlhamı',
		description: 'Müziğinle veya sözlerinle bir yoldaşına ilham vererek, onun zarlarına ekleyebileceği bir bonus zar (d6) kazandırırsın.'
	},
	'Spellcasting': {
		name: 'Büyü Yapma',
		description: 'Evrenin dokusunu değiştirerek büyülü etkiler yaratma yeteneği. Büyülerini ve slotlarını akıllıca kullan.'
	},
	'Divine Domain': {
		name: 'İlahi Alan',
		description: 'Tanrının etki alanlarından birini seçersin (örneğin Yaşam veya Savaş), bu sana özel büyüler ve yetenekler verir.'
	},
	'Druidic': {
		name: 'Druid Dili',
		description: 'Druidlerin gizli dilini bilirsin ve gizli mesajlar bırakabilirsin.'
	},
	'Fighting Style': {
		name: 'Dövüş Tarzı',
		description: 'Belirli bir dövüş stilinde (örneğin Okçuluk veya Çift Silah) uzmanlaşarak bonuslar kazanırsın.'
	},
	'Second Wind': {
		name: 'İkinci Soluk',
		description: 'Savaşın ortasında dayanıklılığını toplayarak kendini (1d10 + Seviye) kadar iyileştirebilirsin.'
	},
	'Martial Arts': {
		name: 'Dövüş Sanatları',
		description: 'Silahsız dövüşte ve Monk silahlarında ustalaşırsın. DEX kullanabilir ve bonus saldırı yapabilirsin.'
	},
	'Divine Sense': {
		name: 'İlahi Sezi',
		description: 'Çevrendeki göksel varlıkları, iblisleri veya yaşayan ölüleri sezebilirsin.'
	},
	'Lay on Hands': {
		name: 'Ellerle Şifa',
		description: 'Kutsal bir dokunuşla yaraları iyileştirebilir veya hastalıkları temizleyebilirsin.'
	},
	'Sneak Attack': {
		name: 'Sinsi Saldırı',
		description: 'Avantajlı olduğun durumlarda veya düşmanının yanında bir müttefikin varken fazladan hasar verirsin.'
	},
	'Thieves\' Cant': {
		name: 'Hırsız Dili',
		description: 'Suç dünyasının gizli jargonını, işaretlerini ve sembollerini anlarsın.'
	},
	'Sorcerous Origin': {
		name: 'Büyü Kökeni',
		description: 'Büyü gücünün kaynağını seçersin (örneğin Ejderha Soyu veya Vahşi Büyü).'
	},
	'Otherworldly Patron': {
		name: 'Düzlem Ötesi Hami',
		description: 'Sana güç veren varlığı seçersin (örneğin İblis, Peri veya Eskilerden Biri).'
	},
	'Pact Magic': {
		name: 'Pakt Büyüsü',
		description: 'Haminle yaptığın anlaşmadan gelen, kısa dinlenmede yenilenen özel büyü yeteneği.'
	},
	'Arcane Recovery': {
		name: 'Büyüsel Yenilenme',
		description: 'Kısa bir dinlenme sırasında, harcadığın bazı büyü slotlarını geri kazanabilirsin.'
	},



	// Barbarian Class Features
	'Reckless Attack': {
		name: 'Pervasız Saldırı',
		description: 'Turunun başında, tüm yakın dövüş silah saldırılarını avantajlı yapabilirsin. Ancak bir sonraki turuna kadar sana yapılan tüm saldırılar da avantajlı olur. Dikkatini tamamen saldırıya verip savunmadan vazgeçersin.'
	},
	'Danger Sense': {
		name: 'Tehlike Sezgisi',
		description: 'Görebildiğin tehlikelere karşı Çeviklik (Dexterity) kurtarma atışlarında avantaj kazanırsın (tuzaklar, büyüler vb.). Kör, sağır veya etkisiz haldeyken bu yeteneği kullanamazsın.'
	},
	'Frenzy': {
		name: 'Çılgınlık',
		description: 'Öfkeye kapıldığında çılgın bir duruma girebilirsin. Öfkende kaldığın sürece, her turda bonus aksiyon olarak fazladan bir yakın dövüş saldırısı yapabilirsin. Öfken bittiğinde, 1 kademe bitkinlik (exhaustion) kazanırsın.'
	},
	'Divine Fury': {
		name: 'İlahi Öfke',
		description: 'Öfkene ilahi güçler eşlik eder. Öfkedeyken, turundaki ilk silah saldırı hasarına fazladan 1d6 + (Barbar seviyesinin yarısı) hasar eklersin. Bu hasar, seçtiğin ilahi kaynağa göre Nekrotik veya Radyant türünde olabilir.'
	},
	'Dreadful Strikes': {
		name: 'Korkunç Vuruşlar',
		description: 'Vuruşların düşmanlarına korku salır. Öfkedeyken bir yaratığa silah saldırısıyla hasar verdiğinde, ona fazladan psişik hasar verirsin. Bu hasar, Barbar seviyenle artar.'
	},
	// Fighter Class Features
	'Action Surge': {
		name: 'Aksiyon Patlaması',
		description: 'Sınırlarını aşarak bir an için kendini zorlarsın. Turunda, bir kez ekstra aksiyon yapabilirsin. Kısa veya uzun dinlenmeden sonra tekrar kullanabilirsin.'
	},
	'Extra Attack': {
		name: 'Ekstra Saldırı',
		description: 'Turunda Saldırı aksiyonu yaptığında, bir yerine iki kez saldırabilirsin.'
	},
	'Extra Attack (2)': {
		name: 'Ekstra Saldırı (2)',
		description: 'Turunda Saldırı aksiyonu yaptığında, üç kez saldırabilirsin.'
	},
	'Extra Attack (3)': {
		name: 'Ekstra Saldırı (3)',
		description: 'Turunda Saldırı aksiyonu yaptığında, dört kez saldırabilirsin.'
	},
	'Indomitable': {
		name: 'Yılmaz',
		description: 'Başarısız olduğun bir kurtarma atışını tekrar atabilirsin. Yeni sonucu kullanmalısın. Uzun dinlenmeden sonra tekrar kullanabilirsin.'
	},
	'Indomitable (2 uses)': {
		name: 'Yılmaz (2 kullanım)',
		description: 'Yılmaz özelliğini uzun dinlenmeler arasında 2 kez kullanabilirsin.'
	},
	'Indomitable (3 uses)': {
		name: 'Yılmaz (3 kullanım)',
		description: 'Yılmaz özelliğini uzun dinlenmeler arasında 3 kez kullanabilirsin.'
	},
	// Rogue Class Features
	'Cunning Action': {
		name: 'Kurnaz Aksiyon',
		description: 'Bonus aksiyon olarak Dash (Depar), Disengage (Geri Çekilme) veya Hide (Saklanma) yapabilirsin.'
	},
	'Expertise': {
		name: 'Uzmanlık',
		description: 'Yetkin olduğun iki beceri veya alet yetkinliğini seç. Bu seçimlere ait kontrollerde yetkinlik bonusunu iki kat uygularsın.'
	},
	'Uncanny Dodge': {
		name: 'Esrarengiz Savuşturma',
		description: 'Görebildiğin bir saldırgan sana vuruş yaptığında, tepki olarak aldığın hasarı yarıya indirebilirsin.'
	},
	'Evasion': {
		name: 'Kaçınma',
		description: 'Çeviklik kurtarma atışında başarılı olursan hiç hasar almazsın, başarısız olsan bile sadece yarısını alırsın (normalde yarı hasar alan etkiler için).'
	},
	'Reliable Talent': {
		name: 'Güvenilir Yetenek',
		description: 'Yetkin olduğun bir beceri kontrolü için d20 atarken 9 veya altı atarsan, sonucu 10 olarak sayarsın.'
	},
	'Slippery Mind': {
		name: 'Kaygan Zihin',
		description: 'Bilgelik kurtarma atışlarında yetkinlik kazanırsın.'
	},
	'Elusive': {
		name: 'Ele Avuca Sığmaz',
		description: 'Hiçbir saldırı sana karşı avantajlı olamaz (sen etkisiz olmadığın sürece).'
	},
	'Stroke of Luck': {
		name: 'Şans Darbesi',
		description: 'Kaçırdığın bir saldırıyı vuruşa çevirebilir veya başarısız olduğun bir yetenek kontrolünü başarıya dönüştürebilirsin. Kısa veya uzun dinlenmeden sonra tekrar kullanabilirsin.'
	},
	'Supreme Sneak': {
		name: 'Üstün Gizlenme',
		description: 'Saklanma için yaptığın Çeviklik (Gizlenme) kontrollerinde avantaj kazanırsın. Ayrıca, turunda hareket etmediysen seni bulmaları 10 puan daha zorlaşır.'
	},
	'Thief\'s Reflexes': {
		name: 'Hırsız Refleksleri',
		description: 'Savaşın ilk turunda iki tur alırsın. İkinci turun normal inisiyatifine göre gerçekleşir.'
	},
	'Use Magic Device': {
		name: 'Büyülü Eşya Kullanımı',
		description: 'Sınıf, ırk veya seviye kısıtlaması olan büyülü eşyaları görmezden gelebilirsin.'
	},
	// Monk Class Features
	'Ki': {
		name: 'Ki',
		description: 'Dövüş sanatı eğitimin sayesinde ki enerjisini kullanabilirsin. Ki puanlarını Flurry of Blows, Patient Defense, Step of the Wind gibi yeteneklerde harcarsın. Kısa dinlenmede tamamı yenilenir.'
	},
	'Flurry of Blows': {
		name: 'Darbe Sağanağı',
		description: 'Saldırı aksiyonu yaptıktan hemen sonra, 1 ki puan harcayarak bonus aksiyon ile iki silahsız vuruş yapabilirsin.'
	},
	'Stunning Strike': {
		name: 'Sersemletici Vuruş',
		description: 'Bir yaratığa silahsız vuruş veya monk silahıyla vurduğunda, 1 ki puan harcayarak hedefin Dayanıklılık kurtarma atması yapmasını sağlayabilirsin. Başarısız olursa, bir sonraki turunun sonuna kadar sersemler (stunned).'
	},
	'Deflect Missiles': {
		name: 'Füzeleri Saptır',
		description: 'Menzilli silah saldırısı sana vuruş yaptığında, tepki kullanarak hasarı 1d10 + Çeviklik değiştiricin + Monk seviyesi kadar azaltabilirsin. Hasarı sıfıra düşürürsen, füzeyi yakalayıp geri fırlatabilirsin.'
	},
	'Unarmored Movement': {
		name: 'Zırhsız Hareket',
		description: 'Zırh ve kalkan giymediğinde hızın artar. Bonus seviyeye göre 10-30 ft arasında artar. Ayrıca yüksek seviyelerde duvarlarda ve suyun üstünde koşabilirsin.'
	},
	'Open Hand Technique': {
		name: 'Açık El Tekniği',
		description: 'Flurry of Blows ile vurduğunda, her vuruşta hedefin düşmesini, itilmesini veya tepki kullanamamasını sağlayabilirsin.'
	},
	'Shadow Arts': {
		name: 'Gölge Sanatları',
		description: '2 ki puan harcayarak Darkness, Darkvision, Pass Without Trace veya Silence büyülerini yapabilirsin. Ayrıca Minor Illusion catnip\'ini bedava bilirsin.'
	},
	// Bard Class Features
	'Jack of All Trades': {
		name: 'Her İşin Ustası',
		description: 'Yetkin olmadığın yetenek kontrollerine yetkinlik bonusunun yarısını ekleyebilirsin.'
	},
	'Song of Rest': {
		name: 'Dinlenme Şarkısı',
		description: 'Kısa dinlenmede şarkı söylersin veya müzik çalarsın. Sen ve müttefiklerin d6 (yüksek seviyelerde daha fazla) ekstra can puanı iyileşir.'
	},
	// Cleric Class Features
	'Divine Intervention': {
		name: 'İlahi Müdahale',
		description: 'Tanrından yardım isteyebilirsin. D100 at, cleric seviyenden düşük veya eşit atarsan tanrın müdahale eder. Başarılı olursan, 7 gün kullanamazsın.'
	},
	'Destroy Undead': {
		name: 'Ölümsüzleri Yok Et',
		description: 'Turn Undead özelliğine karşı başarısız olan bir undead, CR\'i belirli bir eşiğin altındaysa anında yok olur.'
	},
	// Paladin Class Features
	'Divine Smite': {
		name: 'İlahi Darbe',
		description: 'Silah saldırısıyla vuruş yaptığında, bir büyü slotu harcayarak fazladan 2d8 (slot seviyesi başına +1d8) radyant hasar verebilirsin. Undead veya fiend\'lara karşı +1d8 ekstra.'
	},
	// Sorcerer Class Features
	'Metamagic': {
		name: 'Metabüyü',
		description: 'Büyü puanı harcayarak büyülerini değiştirebilirsin. Subtle Spell, Quickened Spell, Twinned Spell gibi seçeneklerden ikisini seçersin.'
	},
	'Wild Magic Surge': {
		name: 'Vahşi Büyü Patlaması',
		description: 'Seviye 1 veya üstü bir büyü yaptığında, DM d20 attırabilir. 1 atarsan, Wild Magic tablosundan rastgele bir etki gerçekleşir.'
	},
	// Wizard Class Features
	'Spell Mastery': {
		name: 'Büyü Ustalığı',
		description: 'Seviye 1\'den bir büyü ve seviye 2\'den başka bir büyü seç. Bunları slot harcamadan sınırsız yapabilirsin (hazırlı olmalılar).'
	},
	'Signature Spells': {
		name: 'İmza Büyüleri',
		description: 'Seviye 3\'ten iki büyü seç. Bunlar her zaman hazırlı sayılır ve her biri için bir kez slot harcamadan yapabilirsin.'
	},
	// Warlock Class Features
	'Pact Boon': {
		name: 'Pakt Nimeti',
		description: 'Hamin sana özel bir nimet verir: Pact of the Chain (akbaba), Pact of the Blade (silah), Pact of the Tome (kitap) veya Pact of the Talisman (muska).'
	},
	'Eldritch Invocations': {
		name: 'Esrarengiz Çağrılar',
		description: 'Haminle olan bağından gelen gizemli yetenekler. Agonizing Blast, Devil\'s Sight, Mask of Many Faces gibi çeşitli güçler arasından seçim yaparsın.'
	},
	// Ranger Class Features  
	'Hunter\'s Prey': {
		name: 'Avcının Avı',
		description: 'Colossus Slayer (büyük hasar), Giant Killer (dev öldürücü) veya Horde Breaker (sürü kırıcı) arasından bir av tarzı seçersin.'
	},

	// Missing Class Features - Rogue
	'Assassinate': {
		name: 'Suikast',
		description: 'Savaşın ilk turunda, henüz hareket etmemiş yaratıklara karşı avantajlısın. Sürpriz olan herhangi bir yaratığa vurduğun saldırılar kritik vuruş olur.'
	},
	'Fast Hands': {
		name: 'Hızlı Eller',
		description: 'Cunning Action ile bonus aksiyon kullandığında, Sleight of Hand kontrolü yapabilir, hırsızlık aletlerini kullanabilir, bir nesneyle etkileşime geçebilir veya bir tuzağı etkisiz hale getirebilirsin.'
	},
	'Second-Story Work': {
		name: 'İkinci Kat Ustalığı',
		description: 'Tırmanma artık sana ekstra hareket maliyeti getirmez. Ayrıca, koşarak uzun atlama yaptığında, atlama mesafesi Çeviklik değiştiricin kadar artar.'
	},
	// Druid Features
	'Wild Shape': {
		name: 'Vahşi Şekil',
		description: 'Aksiyon veya Bonus Aksiyon (Ay Çemberi için) olarak bir hayvana dönüşebilirsin. Dönüşmek Druid seviyene bağlı olarak belirli yetenekler ve can puanı sağlar.'
	},
	// PHB 2024 Druid Subclasses
	'Circle of the Land': {
		name: 'Toprak Çemberi',
		description: 'Kadim bilgileri ve ritüelleri koruyan mistiklerin ve bilgelerin çemberi. Doğayla olan bağlarını belirli arazi türleri üzerinden kurarlar.'
	},
	'Circle of the Land Spells': {
		name: 'Toprak Çemberi Büyüleri',
		description: 'Uzun dinlenme bitirdiğinde bir arazi türü seçersin: Kurak, Kutup, Ilıman veya Tropikal. Seçtiğin araziye özgü büyüler her zaman hazırlı sayılır.'
	},
	'Land\'s Aid': {
		name: 'Toprağın Yardımı',
		description: 'Bir Wild Shape kullanımını harcayarak 60 fit içindeki bir noktada çiçekler ve dikenler oluşturabilirsin. Alandaki düşmanlar Nekrotik hasar alırken seçtiğin bir müttefik iyileşir.'
	},
	'Natural Recovery': {
		name: 'Doğal Toparlanma',
		description: 'Her uzun dinlenmede bir kez, hazırladığın arazi büyülerinden birini slot harcamadan yapabilirsin. Ayrıca kısa dinlenmede harcanmış büyü slotlarını geri kazanabilirsin.'
	},
	'Nature\'s Ward': {
		name: 'Doğanın Muhafazası',
		description: 'Zehirlenmiş (Poisoned) durum etkisine karşı bağışıklık kazanırsın ve seçtiğin arazi türüne bağlı olarak bir hasar türüne dirençli olursun.'
	},
	'Nature\'s Sanctuary': {
		name: 'Doğanın Sığınağı',
		description: 'Wild Shape harcayarak 15 fitlik bir alanda ruhani ağaçlar ve sarmaşıklar oluşturursun. Sen ve müttefiklerin burada siper (Half Cover) ve hasar direnci kazanırsınız.'
	},
	'Circle of the Moon': {
		name: 'Ay Çemberi',
		description: 'Vahşi yaşamı korumak için hayvan formlarına bürünen druidlerin çemberi. Ay büyüsünü kullanarak dönüşümlerini güçlendirirler.'
	},
	'Circle of the Moon Spells': {
		name: 'Ay Çemberi Büyüleri',
		description: 'Cure Wounds, Moonbeam ve Starry Wisp gibi büyüler her zaman hazırlı sayılır ve bu büyüleri Vahşi Şekil formundayken de yapabilirsin.'
	},
	'Circle Forms': {
		name: 'Çember Formları',
		description: 'Vahşi Şekil formunun gücü artar: Daha yüksek Challenge Rating (Druid seviyesi / 3), daha yüksek AC (13 + Wisdom) ve Druid seviyenin 3 katı kadar Geçici Can Puanı kazanırsın.'
	},
	'Improved Circle Forms': {
		name: 'Gelişmiş Çember Formları',
		description: 'Vahşi Şekil formundayken saldırıların Radyant hasar verebilir ve Dayanıklılık kurtarma atışlarına Bilgelik değiştiricini eklersin.'
	},
	'Moonlight Step': {
		name: 'Ay Işığı Adımı',
		description: 'Bonus aksiyonla 30 fit mesafeye ışınlanabilirsin. Işınlandıktan sonraki ilk saldırın avantajlı olur.'
	},
	'Lunar Form': {
		name: 'Ay Formu',
		description: 'Ay ışığıyla güçlenirsin: Vahşi Şekil saldırıların turda bir kez fazladan 2d10 Radyant hasar verir ve Ay Işığı Adımı ile yanındaki bir müttefiğini de ışınlayabilirsin.'
	},
	'Circle of the Sea': {
		name: 'Deniz Çemberi',
		description: 'Okyanusların ve fırtınaların hırçın güçlerinden beslenen druidlerin çemberi. Gelgitlerin ve dalgaların akışıyla uyum sağlarlar.'
	},
	'Circle of the Sea Spells': {
		name: 'Deniz Çemberi Büyüleri',
		description: 'Fog Cloud, Lightning Bolt ve Control Water gibi deniz ve fırtına temalı büyüler her zaman hazırlı sayılır.'
	},
	'Wrath of the Sea': {
		name: 'Denizin Gazabı',
		description: 'Bonus aksiyonla bir Wild Shape harcayarak 10 dakika boyunca etrafında okyanus serpintisi oluşturursun. Düşmanlarına Soğuk hasarı verir ve onları uzaklaştırırsın.'
	},
	'Aquatic Affinity': {
		name: 'Sucul Yakınlık',
		description: 'Denizin Gazabı etkisinin menzili artar ve hızına eşit bir Yüzme hızı kazanırsın.'
	},
	'Stormborn': {
		name: 'Fırtına Doğan',
		description: 'Denizin Gazabı etkinken Uçma hızı kazanırsın ve Soğuk, Yıldırım ve Gök Gürültüsü hasarlarına karşı dirençli olursun.'
	},
	'Oceanic Gift': {
		name: 'Okyanus Hediyesi',
		description: 'Denizin Gazabı etkisini 60 fit içindeki bir müttefiğine devredebilir veya iki Wild Shape harcayarak ikinizde birden aktif edebilirsin.'
	},
	'Circle of the Stars': {
		name: 'Yıldız Çemberi',
		description: 'Takımyıldızlardaki gizli sırları izleyen druidlerin çemberi. Kozmosun güçlerini kullanarak rehberlik ve yıkım sağlarlar.'
	},
	'Star Map': {
		name: 'Yıldız Haritası',
		description: 'Özel bir yıldız haritasına sahip olursun. Guidance ve Guiding Bolt büyülerini harcayarak slot harcamadan yapabilirsin.'
	},
	'Starry Form': {
		name: 'Yıldız Formu',
		description: 'Wild Shape harcayarak yıldızlı bir forma bürünürsün: Archer (Menzilli saldırı), Chalice (Ekstra şifa) veya Dragon (Konsantrasyon ve uçma).'
	},
	'Cosmic Omen': {
		name: 'Kozmik Alamet',
		description: 'Yıldız haritanı danışarak uğur (Weal) veya uğursuzluk (Woe) zarları kazanırsın. Bunları müttefiklerine yardım etmek veya düşmanlarını engellemek için kullanabilirsin.'
	},
	'Twinkling Constellations': {
		name: 'Parıldayan Takımyıldızlar',
		description: 'Yıldız Formun gelişir: Archer ve Chalice daha güçlü olur, Dragon etkinken uçabilirsin ve her tur takımyıldızını değiştirebilirsin.'
	},
	'Full of Stars': {
		name: 'Yıldız Dolu',
		description: 'Yıldız formundayken kısmen maddesellikten çıkarsın; Ezici, Delici ve Kesici hasarlara karşı direnç kazanırsın.'
	},
	// Ranger Features
	'Primal Companion': {
		name: 'İlkel Yoldaş',
		description: 'Beast Master ranger özelliği. Doğal bir ruh seni bir hayvan yoldaşıyla birleştirir. Bu yoldaş savaşta seninle hareket eder ve komutlarına uyar.'
	},
	// Bard Features
	// Monk Features
	'Elemental Attunement': {
		name: 'Element Uyumu',
		description: 'Way of the Elements monk özelliği. Temel elementleri (ateş, su, hava, toprak) kontrol etmek için ki enerjini kullanabilirsin.'
	},
	'Hand of Healing': {
		name: 'Şifa Eli',
		description: 'Way of Mercy monk özelliği. Ki enerjini kullanarak dokunduğun yaratıkları iyileştirebilirsin. Ki puanı başına daha fazla şifa sağlarsın.'
	},
	// Warlock Features
	'Awakened Mind': {
		name: 'Uyanmış Zihin',
		description: 'Great Old One warlock özelliği. 30 ft içindeki herhangi bir yaratıkla telepati kurabilirsin. Aynı dili konuşmanıza gerek yok.'
	},
	// Fighter Subclass Features
	// Fighter - Champion (PHB 2024)
	'Improved Critical': {
		name: 'Gelişmiş Kritik',
		description: 'Silah saldırıların ve silahsız vuruşların 19-20 aralığında kritik vuruş olur.'
	},
	'Remarkable Athlete': {
		name: 'Olağanüstü Atlet',
		description: 'İnisiyatif kontrollerinde ve Atletizm (Athletics) kontrollerinde avantaj kazanırsın. Ayrıca kritik vuruş yaptıktan hemen sonra hızının yarısı kadar fırsat saldırısı kışkırtmadan hareket edebilirsin.'
	},
	'Heroic Warrior': {
		name: 'Kahraman Savaşçı',
		description: 'Dövüş sırasında, sıranın başında eğer sahip değilsen kendini Kahramanca İlham (Heroic Inspiration) verebilirsin.'
	},
	'Survivor': {
		name: 'Hayatta Kalan',
		description: 'Ölüm kurtarma atışlarında avantajlısın ve 18-20 arası attığın zarlar 20 sayılır. Ayrıca "Bloodied" durumundayken (canın yarının altındayken) her tur başında 5 + Dayanıklılık değiştiricin kadar can yenilersin.'
	},
	// Fighter - Battle Master (PHB 2024)
	'Combat Superiority': {
		name: 'Savaş Üstünlüğü',
		description: 'Özel manevralar yapmanı sağlayan Üstünlük Zarları (Superiority Dice - d8) kazanırsın. Bu zarlar kısa veya uzun dinlenmede yenilenir.'
	},
	'Student of War': {
		name: 'Savaş Öğrencisi',
		description: 'Bir tür zanaatkar aletinde yetkinlik kazanırsın ve Fighter yetenek listesinden ek bir beceri seçersin.'
	},
	'Know Your Enemy': {
		name: 'Düşmanını Tanı',
		description: '30 fit içindeki bir yaratığın bağışıklıklarını (Immunity), dirençlerini (Resistance) veya zayıflıklarını (Vulnerability) öğrenebilirsin. Bir Üstünlük Zarı harcayarak bu özelliği tekrar kullanabilirsin.'
	},
	'Relentless': {
		name: 'Yorulmaz',
		description: 'Turda bir kez, bir manevra kullandığında Üstünlük Zarı harcamak yerine 1d8 atıp onu kullanabilirsin.'
	},
	// Battle Master Maneuvers
	'Ambush': {
		name: 'Pusu',
		description: 'Gizlilik veya inisiyatif atışına bir Üstünlük Zarı ekleyebilirsin.'
	},
	'Bait and Switch': {
		name: 'Yer Değiştirme ve Koruma',
		description: '5 fit içindeki bir müttefikle yer değiştirebilirsin. Yer değiştirdiğin kişi veya sen, bir sonraki turuna kadar attığın zar kadar AC bonusu kazanırsınız.'
	},
	'Commander\'s Strike': {
		name: 'Komutan Hamlesi',
		description: 'Saldırı aksiyonundaki bir saldırın yerine bir müttefiğinin reaksiyonunu kullanarak saldırmasını sağlayabilirsin. Müttefiğin hasarına Üstünlük Zarı ekler.'
	},
	'Commanding Presence': {
		name: 'Komuta Duruşu',
		description: 'Gözdağı, Performans veya İkna kontrollerine bir Üstünlük Zarı ekleyebilirsin.'
	},
	'Disarming Attack': {
		name: 'Silahsızlandırma Saldırısı',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Hedef Güç kurtarma atışında başarısız olursa elindeki bir nesneyi düşürür.'
	},
	'Distracting Strike': {
		name: 'Dikkat Dağıtıcı Darbe',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Bir sonraki müttefiğinin o hedefe saldırısı avantajlı olur.'
	},
	'Evasive Footwork': {
		name: 'Kaçamak Ayak Hareketleri',
		description: 'Bonus aksiyonla Disengage yapabilir ve bir sonraki turuna kadar AC değerine bir Üstünlük Zarı ekleyebilirsin.'
	},
	'Feinting Attack': {
		name: 'Yanıltıcı Saldırı',
		description: 'Bonus aksiyonla 5 fit içindeki bir hedefi yanıltırsın. Bir sonraki saldırın avantajlı olur ve hasarına Üstünlük Zarı eklenir.'
	},
	'Goading Attack': {
		name: 'Kışkırtıcı Saldırı',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Hedef Bilgelik kurtarma atışında başarısız olursa, senden başkasına saldırdığında dezavantajlı olur.'
	},
	'Lunging Attack': {
		name: 'Uzun Adım Saldırısı',
		description: 'Bonus aksiyonla Dash yapabilirsin. Düz bir hatta en az 5 fit ilerledikten sonra yaptığın yakın dövüş saldırısının hasarına Üstünlük Zarı eklersin.'
	},
	'Maneuvering Attack': {
		name: 'Manevra Saldırısı',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Bir müttefiğin reaksiyonunu kullanarak hızının yarısı kadar hareket edebilir.'
	},
	'Menacing Attack': {
		name: 'Tehditkar Darbe',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Hedef Bilgelik kurtarma atışında başarısız olursa bir sonraki turuna kadar senden korkar (Frightened).'
	},
	'Parry': {
		name: 'Savuşturma',
		description: 'Bir yakın dövüş saldırısı hasar aldığında reaksiyonunla hasarı Üstünlük Zarı + Güç/Çeviklik kadar azaltırsın.'
	},
	'Precision Attack': {
		name: 'Hassas Saldırı',
		description: 'Kaçırdığın bir saldırı zarına Üstünlük Zarı ekleyerek vuruşa dönüştürebilirsin.'
	},
	'Pushing Attack': {
		name: 'İtme Saldırısı',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Hedef Güç kurtarma atışında başarısız olursa 15 fit uzağa itilir.'
	},
	'Rally': {
		name: 'Moral Verme',
		description: 'Bonus aksiyonla 30 fit içindeki bir müttefiğe Üstünlük Zarı + seviyenin yarısı kadar Geçici Can Puanı verirsin.'
	},
	'Riposte': {
		name: 'Karşı Saldırı',
		description: 'Bir düşman seni yakın dövüşte ıskaladığında reaksiyonunla karşı saldırı yapabilir ve hasarına Üstünlük Zarı ekleyebilirsin.'
	},
	'Sweeping Attack': {
		name: 'Geniş Süpürme',
		description: 'Bir düşmana vurduğunda Üstünlük Zarını 5 fit içindeki başka bir düşmana hasar olarak vurabilirsin.'
	},
	'Tactical Assessment': {
		name: 'Taktiksel Değerlendirme',
		description: 'Tarih, Araştırma veya Sezi kontrollerine bir Üstünlük Zarı ekleyebilirsin.'
	},
	'Trip Attack': {
		name: 'Çelme Takma',
		description: 'Saldırı hasarına Üstünlük Zarı eklersin. Hedef Güç kurtarma atışında başarısız olursa yere yıkılır (Prone).'
	},
	// Fighter - Eldritch Knight (PHB 2024)
	'War Bond': {
		name: 'Savaş Bağı',
		description: 'İki silahla büyüsel bir bağ kurabilirsin. Bu silahlar elinden düşürülemez ve onları bonus aksiyonla yanına ışınlayabilirsin.'
	},
	'War Magic': {
		name: 'Savaş Büyüsü',
		description: 'Saldırı aksiyonundaki saldırılarından birini bir Wizard cantrip\'i ile değiştirebilirsin.'
	},
	'Eldritch Strike': {
		name: 'Esrarengiz Darbe',
		description: 'Bir silaha vurduğun düşman, bir sonraki turuna kadar senin büyülerin karşısındaki kurtarma atışlarında dezavantajlı olur.'
	},
	'Arcane Charge': {
		name: 'Gizemli Hücum',
		description: 'Action Surge kullandığında 30 fit mesafeye ışınlanabilirsin.'
	},
	'Improved War Magic': {
		name: 'Gelişmiş Savaş Büyüsü',
		description: 'Saldırı aksiyonundaki iki saldırını 1. veya 2. seviye bir Wizard büyüsü ile değiştirebilirsin.'
	},
	// Fighter - Psi Warrior (PHB 2024)
	'Psionic Power': {
		name: 'Psiyonik Güç',
		description: 'Zihinsel gücünü temsil eden Psiyonik Enerji Zarları (Psionic Energy Dice) kazanırsın. Bu zarları çeşitli telekinetik etkiler için kullanırsın.'
	},
	'Protective Field': {
		name: 'Koruyucu Alan',
		description: 'Reaksiyonunla bir Psiyonik Enerji Zarı harcayarak alınan hasarı zar + Zeka kadar azaltırsın.'
	},
	'Psionic Strike': {
		name: 'Psiyonik Darbe',
		description: 'Silah hasarının üstüne bir Psiyonik Enerji Zarı + Zeka kadar Kuvvet (Force) hasarı ekler.'
	},
	'Telekinetic Movement': {
		name: 'Telekinetik Hareket',
		description: 'Zihninle bir nesneyi veya müttefiğini 30 fit uzağa taşıyabilirsin.'
	},
	'Telekinetic Adept': {
		name: 'Telekinetik Uzman',
		description: 'Gelişmiş psiyonik yetenekler kazanırsın: Psi-Powered Leap (Uçma hızı) ve Telekinetic Thrust (Hedefi yere yıkma veya itme).'
	},
	'Guarded Mind': {
		name: 'Muhafız Zihin',
		description: 'Psikolojik hasara direnç kazanırsın ve zihinsel etkileri (Charmed/Frightened) sonlandırabilirsin.'
	},
	'Bulwark of Force': {
		name: 'Kuvvet Kalesi',
		description: 'Zeka değiştiricin kadar müttefiğine Yarım Siper (Half Cover) sağlayan bir kalkan oluşturursun.'
	},
	'Telekinetic Master': {
		name: 'Telekinetik Usta',
		description: 'Telekinesis büyüsünü hazırlı sayarsın ve bu büyüyü sürdürürken bonus aksiyonla bir saldırı yapabilirsin.'
	},
	// Paladin Features
	'Aura of Protection': {
		name: 'Koruma Aurası',
		description: '10 ft (18. seviyede 30 ft) içindeki sen ve müttefikler, tüm kurtarma atışlarına Karizma değiştiricin kadar bonus alır.'
	},
	// Sorcerer Features
	'Dragon Ancestor': {
		name: 'Ejderha Atası',
		description: 'Draconic Bloodline sorcerer özelliği. Bir ejderha türü seçersin. O ejderha elementine direnç kazanırsın ve o element büyülerine Karizma değiştiricini eklersin.'
	},
	// Wizard Features
	'Arcane Tradition': {
		name: 'Arkan Geleneği',
		description: 'Büyü okullarından birini seçersin (Evocation, Abjuration, Divination, vb.). Her okul farklı özellikler sağlar.'
	},
	'Evocation Savant': {
		name: 'Evokasyon Bilgini',
		description: 'Evocation büyülerini büyü kitabına kopyalama maliyeti ve süresi yarıya iner.'
	},
	'Portent': {
		name: 'Kehanet',
		description: 'Divination wizard özelliği. Her gün 2d20 atarsın ve sonuçları not edersin. Gün içinde herhangi bir saldırı, kurtarma veya yetenek zarını bu sonuçlarla değiştirebilirsin.'
	},
	'Sculpt Spells': {
		name: 'Büyü Şekillendirme',
		description: 'Evocation büyüsü yapıp alan hasarı verdiğinde, seçtiğin Zeka değiştiricin + 1 kadar yaratık otomatik başarılı olur ve hiç hasar almaz.'
	},
	'Improved Minor Illusion': {
		name: 'Gelişmiş Küçük İllüzyon',
		description: 'Minor Illusion catrip\'ini bilirsin ve hem ses hem görüntü yaratabilirsin (normalde sadece biri).'
	},
	'Restore Balance': {
		name: 'Dengeyi Kurtar',
		description: 'Clockwork Sorcerer özelliği. Tepki olarak bir yaratığın avantaj veya dezavantajını iptal edebilirsin.'
	},


	'Psionic Spells': {
		name: 'Psionik Büyüler',
		description: 'Soulknife rogue özelliği. Psionic Energy zarlarını kullanarak belirli büyüleri (Mage Hand, Invisibility vb.) yapabilirsin.'
	},
	// PHB 2024 Barbarian Subclasses
	'Path of the Berserker': {
		name: 'Berserker Yolu',
		description: 'Öfkesini saf şiddete kanalize eden barbarların yolu. Savaşın kaosunda öfkelerinin onları ele geçirmesine izin verirler.'
	},
	'Mindless Rage': {
		name: 'Düşüncesiz Öfke',
		description: 'Öfken etkinken Büyülenmiş (Charmed) ve Korkmuş (Frightened) durum etkilerine karşı bağışıklığın olur. Öfkeye girdiğinde bu etkiler altındaysan, etki senin üzerinde sonlanır.'
	},
	'Retaliation': {
		name: 'Misilleme',
		description: '5 fit yakınındaki bir yaratıktan hasar aldığında, o yaratığa karşı bir silah veya Silahsız Vuruş ile tek bir yakın dövüş saldırısı yapmak için Reaksiyonunu kullanabilirsin.'
	},
	'Intimidating Presence': {
		name: 'Korkutucu Varlık',
		description: 'Bonus Aksiyon olarak 30 fitlik bir alandaki seçtiğin her yaratığın Korkmuş (Frightened) durumuna geçmesini sağlayabilirsin (Wisdom kurtarma atışı). Uzun Dinlenmede veya bir Öfke hakkı harcandığında yenilenir.'
	},
	'Path of the Wild Heart': {
		name: 'Yaban Kalp Yolu',
		description: 'Kendini hayvanların akrabası olarak gören ve doğayla büyülü bir bağ kuran barbarların yolu.'
	},
	'Animal Speaker': {
		name: 'Hayvan Konuşmacısı',
		description: 'Beast Sense ve Speak with Animals büyülerini sadece Ritüel olarak yapabilirsin.'
	},
	'Rage of the Wilds': {
		name: 'Yabanın Öfkesi',
		description: 'Öfkeni aktif ettiğinde Ayı (Dirençler), Kartal (Çeviklik) veya Kurt (Müttefik Avantajı) özelliklerinden birini seçersin.'
	},
	'Aspect of the Wilds': {
		name: 'Yabanın Görünümü',
		description: 'Baykuş (Karanlık Görüşü), Panter (Tırmanma) veya Somon (Yüzme) özelliklerinden birini seçersin. Uzun Dinlenmede değiştirilebilir.'
	},
	'Nature Speaker': {
		name: 'Doğa Konuşmacısı',
		description: 'Commune with Nature büyüsünü sadece Ritüel olarak yapabilirsin.'
	},
	'Power of the Wilds': {
		name: 'Yabanın Gücü',
		description: 'Öfkeni aktif ettiğinde Şahin (Uçma), Aslan (Düşman Dezavantajı) veya Koç (Yere Devirme) özelliklerinden birini seçersin.'
	},
	'Path of the World Tree': {
		name: 'Dünya Ağacı Yolu',
		description: 'Kozmik Yggdrasil ağacına bağlanan, yaşam gücü ve boyutsal seyahat yetenekleri kazanan barbarların yolu.'
	},
	'Vitality of the Tree': {
		name: 'Ağacın Canlılığı',
		description: 'Öfke aktifleştiğinde Geçici Can Puanı kazanır ve her tur müttefiklerine Geçici Can Puanı dağıtabilirsin.'
	},
	'Vitality Surge': {
		name: 'Canlılık Patlaması',
		description: 'Öfkeni aktif ettiğinde Barbar seviyen kadar Geçici Can Puanı kazanırsın.'
	},
	'Life-Giving Force': {
		name: 'Yaşam Veren Güç',
		description: 'Öfken etkinken her turunun başında, 10 fit içindeki müttefiklerine fazladan d6\'lar kadar Geçici Can Puanı verebilirsin.'
	},
	'Branches of the Tree': {
		name: 'Ağacın Dalları',
		description: 'Öfke etkinken 30 fit içindeki yaratıkları hayali dallarla yanına ışınlayabilir ve hızlarını 0\'a indirebilirsin.'
	},
	'Battering Roots': {
		name: 'Vurucu Kökler',
		description: 'Ağır veya Çok Yönlü silahlarla erişimin 10 fit artar ve Push veya Topple ustalık özelliklerini ekstradan kullanabilirsin.'
	},
	'Travel Along the Tree': {
		name: 'Ağaç Boyunca Seyahat',
		description: 'Öfke aktifken Bonus Aksiyonla ışınlanabilirsin. Öfke başına bir kez 150 fite kadar mesafe ve müttefik taşıma özelliği.'
	},
	'Path of the Zealot': {
		name: 'Bağnazın Yolu',
		description: 'Bir tanrıyla ilahi bir bağ kurarak öfkesini kutsal bir coşkuya dönüştüren barbarların yolu.'
	},
	'Warrior of the Gods': {
		name: 'Tanrıların Savaşçısı',
		description: 'Bonus Aksiyonla d12 zar havuzundan harcayarak kendini iyileştirebilirsin. Havuz seviyene göre artar.'
	},
	'Fanatical Focus': {
		name: 'Bağnaz Odak',
		description: 'Başarısız olduğun bir kurtarma atışını Öfke Hasarı bonusunu ekleyerek tekrar atabilirsin.'
	},
	'Zealous Presence': {
		name: 'Bağnaz Varlık',
		description: 'Bonus Aksiyonla 60 fit içindeki 10 müttefiğine saldırı ve kurtarma atışlarında Avantaj kazandırabilirsin.'
	},
	'Rage of the Gods': {
		name: 'Tanrıların Öfkesi',
		description: 'İlahi bir savaşçıya dönüşerek Uçma hızı ve hasar dirençleri kazanır, müttefiklerini ölümün eşiğinden döndürebilirsin.'
	},
	// PHB 2024 Bard Subclasses
	'College of Dance': {
		name: 'Dans Koleji',
		description: 'Yaratılış Kelimeleri’nin sadece söz veya şarkıyla değil, gök cisimlerinin ve en küçük canlıların hareketleriyle de ifade edildiğini bilen ozanların okulu.'
	},
	'Dazzling Footwork': {
		name: 'Göz Alıcı Ayak İşi',
		description: 'Zırh giymediğinde ve kalkan kullanmadığında; Performans kontrollerinde avantaj, Karizma tabanlı zırhsız savunma, ilham harcadığında bonus silahsız vuruş ve Ozan hasarı kazanırsın.'
	},
	'Inspiring Movement': {
		name: 'İlham Veren Hareket',
		description: 'Bir düşman turunu yanında bitirdiğinde, bir Ozan İlhamı harcayarak hızının yarısı kadar hareket edebilirsin. Bir müttefiğin de reaksiyonuyla hareket edebilir. Bu hareket fırsat saldırısı kışkırtmaz.'
	},
	'Tandem Footwork': {
		name: 'Birlikte Ayak İşi',
		description: 'İnisiyatif atarken bir Ozan İlhamı harcayarak kendine ve 30 fit içindeki müttefiklerine inisiyatif bonusu kazandırabilirsin.'
	},
	'Leading Evasion': {
		name: 'Öncü Kaçınma',
		description: 'Dexterity kurtarma atışlarında başarılı olursan hasar almazsın, başarısız olursan yarısını alırsın. Bu özelliği yanındaki müttefiklerinle paylaşabilirsin.'
	},
	'College of Glamour': {
		name: 'Cazibe Koleji',
		description: 'Kökeni Feywild’ın büyüleyici büyüsüne dayanan, şarkılarına ve hikayelerine güzellik ve korku iplikleri dokuyan ozanların okulu.'
	},
	'Beguiling Magic': {
		name: 'Büyüleyici Büyü',
		description: 'Charm Person ve Mirror Image büyüleri her zaman hazırlıdır. Bir Enchantment veya Illusion büyüsü yaptıktan sonra bir yaratığı büyüleyebilir veya korkutabilirsin.'
	},
	'Mantle of Inspiration': {
		name: 'İlham Pelerini',
		description: 'Bonus aksiyonla Ozan İlhamı harcayarak müttefiklerine geçici can puanı kazandırır ve reaksiyonlarıyla hızları kadar hareket etmelerini sağlarsın.'
	},
	'Mantle of Majesty': {
		name: 'Haşmet Pelerini',
		description: 'Command büyüsü her zaman hazırlıdır. Bonus aksiyonla Command yapabilir ve haşmetli bir görünüme bürünerek 1 dakika boyunca her tur bedava Command yapabilirsin.'
	},
	'Unbreakable Majesty': {
		name: 'Sarsılmaz Haşmet',
		description: 'Bonus aksiyonla haşmetli bir varlığa bürünürsün. Bu süre boyunca sana saldıranların sana vurabilmesi için Karizma kurtarma atışında başarılı olmaları gerekir.'
	},
	'College of Lore': {
		name: 'Bilgi Koleji',
		description: 'Çeşitli kaynaklardan büyüler ve sırlar toplayan, yolsuzlukları ortaya çıkaran ve yalanları çözen ozanların okulu.'
	},
	'Cutting Words': {
		name: 'Keskin Sözler',
		description: 'Reaksiyonla Ozan İlhamı harcayarak 60 fit içindeki bir yaratığın saldırı, hasar veya yetenek zarından sonuç düşürebilirsin.'
	},
	'Magical Discoveries': {
		name: 'Büyülü Keşifler',
		description: 'Cleric, Druid veya Wizard büyü listelerinden seçtiğin iki büyüyü öğrenirsin. Bu büyüler her zaman hazırlıdır.'
	},
	'Peerless Skill': {
		name: 'Emsalsiz Yetenek',
		description: 'Başarısız olduğun bir yetenek kontrolü veya saldırı zarını, bir Ozan İlhamı zarı ekleyerek başarıya dönüştürebilirsin. Zar başarısız olursa ilham harcanmaz.'
	},
	'College of Valor': {
		name: 'Cesaret Koleji',
		description: 'Antik kahramanların eylemlerini şarkılarıyla yaşatan, yeni nesillere ilham veren cesur ozanların okulu.'
	},
	'Combat Inspiration': {
		name: 'Savaş İlhamı',
		description: 'İlham verdiğin kişiler bunu AC\'lerini artırmak (Savunma) veya hasarlarına eklemek (Saldırı) için kullanabilir.'
	},
	'Battle Magic': {
		name: 'Savaş Büyüsü',
		description: 'Aksiyon gerektiren bir büyü yaptıktan sonra bonus aksiyonla bir silah saldırısı yapabilirsin.'
	},
	// PHB 2024 Cleric Subclasses
	'Life Domain': {
		name: 'Yaşam Alanı',
		description: 'Evrendeki tüm yaşamı sürdüren pozitif enerjiye odaklanan, iyileştirme sanatında ustalaşmış rahiplerin alanı.'
	},
	'Disciple of Life': {
		name: 'Yaşam Müridi',
		description: 'İyileştirme büyülerin daha etkilidir. Bir büyü slotu kullanarak can puanı yenilediğinde, hedef fazladan (2 + büyü slotu seviyesi) kadar can puanı kazanır.'
	},
	'Preserve Life': {
		name: 'Yaşamı Koru',
		description: 'Channel Divinity harcayarak 30 fit içindeki yaralı müttefiklerine (Rahip seviyenin 5 katı kadar) can puanı dağıtabilirsin. Hedefi maksimum canının yarısından fazlasına çıkaramaz.'
	},
	'Blessed Healer': {
		name: 'Kutsanmış İyileştirici',
		description: 'Başkalarına yaptığın iyileştirme büyüleri seni de iyileştirir. Başka birine can yenileyen bir büyü yaptığında, (2 + büyü slotu seviyesi) kadar can puanı kazanırsın.'
	},
	'Supreme Healing': {
		name: 'Yüce İyileştirme',
		description: 'Büyü veya Channel Divinity ile can puanı yenilerken zar atmazsın; her zar için mümkün olan en yüksek sonucu kullanırsın.'
	},
	'Light Domain': {
		name: 'Işık Alanı',
		description: 'Alevlerin ve vahyin ilahi gücünü vurgulayan, karanlığı ve yalanları yok eden aydınlanmış ruhların alanı.'
	},
	'Radiance of the Dawn': {
		name: 'Şafağın Işıltısı',
		description: 'Channel Divinity harcayarak 30 fitlik bir alanda ışık patlaması yaratırsın. Büyülü karanlığı dağıtır ve seçtiğin düşmanlara (2d10 + rahip seviyesi) kadar Radyant hasarı verirsin.'
	},
	'Warding Flare': {
		name: 'Koruyucu Parlama',
		description: '30 fit içindeki bir yaratık saldırı yaptığında Reaksiyonunla ona dezavantaj verebilirsin. Bu özelliği Bilgelik bonusun kadar kullanabilirsin.'
	},
	'Improved Warding Flare': {
		name: 'Gelişmiş Koruyucu Parlama',
		description: 'Koruyucu Parlama kullandığında hedefe (2d6 + Bilgelik bonusu) kadar geçici can puanı da verirsin. Kullanımlar kısa dinlenmede yenilenir.'
	},
	'Corona of Light': {
		name: 'Işık Halesi',
		description: 'Etrafına 60 fitlik güneş ışığı yayarsın. Düşmanların Radyant ve Ateş hasarı veren büyülerine karşı kurtarma atışlarında dezavantajlı olur.'
	},
	'Trickery Domain': {
		name: 'Düzenbazlık Alanı',
		description: 'Deception, illüzyon ve gizlilik büyüleri kullanarak tiranlarla alay eden ve değişimi savunan rahiplerin alanı.'
	},
	'Blessing of the Trickster': {
		name: 'Düzenbazın Kutsaması',
		description: 'Kendine veya 30 fit içindeki bir müttefiğine Gizlilik kontrollerinde avantaj kazandırırsın. Uzun dinlenmeye kadar sürer.'
	},
	'Invoke Duplicity': {
		name: 'Kopya Yaratma',
		description: 'Channel Divinity harcayarak kendi illüzyonel bir kopyanı yaratırsın. Kopyanın olduğu yerden büyü yapabilir, düşmanları şaşırtarak saldırı avantajı kazanabilir ve kopyayı hareket ettirebilirsin.'
	},
	'Trickster\'s Transposition': {
		name: 'Düzenbazın Yer Değiştirmesi',
		description: 'Kopyanı yarattığında veya hareket ettirdiğinde Bonus Aksiyon ile kopyanla yer değiştirebilirsin (ışınlanabilirsin).'
	},
	'Improved Duplicity': {
		name: 'Gelişmiş Kopya',
		description: 'Kopyan artık müttefiklerine de saldırı avantajı sağlar ve illüzyon bittiğinde seçtiğin birini rahip seviyen kadar iyileştirir.'
	},
	'War Domain': {
		name: 'Savaş Alanı',
		description: 'Savaşta mükemmelleşen, başkalarına ilham veren ve şiddeti bir dua olarak sunan kahraman rahiplerin alanı.'
	},
	'War Priest': {
		name: 'Savaş Rahibi',
		description: 'Bir silah veya silahsız vuruş yaptıktan sonra Bonus Aksiyon ile fazladan bir saldırı yapabilirsin. Bilgelik bonusun kadar kullanım hakkın vardır.'
	},
	'Guided Strike': {
		name: 'Güdümlü Vuruş',
		description: 'Sen veya 30 fit içindeki bir müttefiğin saldırı kaçırdığında Channel Divinity harcayarak o saldırıya +10 bonus verebilirsin.'
	},
	'War God\'s Blessing': {
		name: 'Savaş Tanrısının Lütfu',
		description: 'Channel Divinity harcayarak Shield of Faith veya Spiritual Weapon büyülerini konsantrasyon gerektirmeden yapabilirsin.'
	},
	'Avatar of Battle': {
		name: 'Savaşın Sureti',
		description: 'Ezici (Bludgeoning), Delici (Piercing) ve Kesici (Slashing) hasarlara karşı direnç kazanırsın.'
	}
};

export function translateTrait(name: string, description: string): { name: string, description: string } {
	// 1. Direct match check
	if (traitTranslations[name]) {
		return traitTranslations[name];
	}

	// 2. Partial key match check (e.g. "Draconic Ancestry (Red)")
	const key = Object.keys(traitTranslations).find(k => name.includes(k));
	if (key) {
		const trans = traitTranslations[key];
		if (!trans) return { name, description };
		let translatedName = name.replace(key, trans.name);

		// Dragon/Element Color translations
		translatedName = translatedName
			.replace('(Black)', '(Siyah - Asit)')
			.replace('(Blue)', '(Mavi - Yıldırım)')
			.replace('(Brass)', '(Pirinç - Ateş)')
			.replace('(Bronze)', '(Bronz - Yıldırım)')
			.replace('(Copper)', '(Bakır - Asit)')
			.replace('(Gold)', '(Altın - Ateş)')
			.replace('(Green)', '(Yeşil - Zehir)')
			.replace('(Red)', '(Kırmızı - Ateş)')
			.replace('(Silver)', '(Gümüş - Soğuk)')
			.replace('(White)', '(Beyaz - Soğuk)');

		return {
			name: translatedName,
			description: trans.description
		};
	}

	// 3. Fallback to generic description replacements
	return {
		name: name,
		description: description
			.replace(/You have resistance to/g, 'Direncini kazanırsın:')
			.replace(/You have proficiency in/g, 'Yetkinliğin var:')
			.replace(/You gain/g, 'Kazanırsın:')
			.replace(/You can/g, 'Yapabilirsin:')
			.replace(/damage/g, 'hasarı')
			.replace(/advantage/g, 'avantaj')
			.replace(/saving throw/g, 'kurtarma atışı')
	};
}
