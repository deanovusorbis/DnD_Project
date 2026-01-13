/**
 * Tool Names and Descriptions (Turkish)
 */

// Musical Instruments
export const musicalInstruments: Record<string, { name: string; description: string }> = {
	'bagpipes': { name: 'Gayda', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'drum': { name: 'Davul', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'dulcimer': { name: 'Santur', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'flute': { name: 'Flüt', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'horn': { name: 'Korno', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'lute': { name: 'Lavta', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'lyre': { name: 'Lir', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'pan_flute': { name: 'Pan Flüt', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'shawm': { name: 'Zurna', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' },
	'viol': { name: 'Viyola', description: 'Bilinen bir melodiyi çal veya doğaçlama yap' }
};

// Artisan's Tools
export const artisansTools: Record<string, { name: string; description: string }> = {
	'alchemists_supplies': { name: 'Simyacı Malzemeleri', description: 'Madde tanımla veya ateş yak' },
	'brewers_supplies': { name: 'Bira Yapım Malzemeleri', description: 'Zehirli içeceği tespit et' },
	'calligraphers_supplies': { name: 'Hat Sanatı Malzemeleri', description: 'Sahteciliğe karşı süslü yazı yaz' },
	'carpenters_tools': { name: 'Marangoz Aletleri', description: 'Kapı veya sandık aç/kapat' },
	'cartographers_tools': { name: 'Haritacı Aletleri', description: 'Küçük bir alanın haritasını çiz' },
	'cobblers_tools': { name: 'Ayakkabıcı Aletleri', description: 'Ayakkabıyı modifiye et' },
	'cooks_utensils': { name: 'Aşçı Gereçleri', description: 'Yemeğin tadını iyileştir veya zehir tespit et' },
	'glassblowers_tools': { name: 'Cam Üfleme Aletleri', description: 'Cam nesnenin geçmişini anla' },
	'jewelers_tools': { name: 'Kuyumcu Aletleri', description: 'Mücevherin değerini belirle' },
	'leatherworkers_tools': { name: 'Deri İşçiliği Aletleri', description: 'Deri eşyaya desen ekle' },
	'masons_tools': { name: 'Taşçı Aletleri', description: 'Taşa sembol veya delik oy' },
	'painters_supplies': { name: 'Ressam Malzemeleri', description: 'Gördüğün bir şeyin resmini çiz' },
	'potters_tools': { name: 'Çömlekçi Aletleri', description: 'Seramik nesnenin geçmişini anla' },
	'smiths_tools': { name: 'Demirci Aletleri', description: 'Kapı veya sandık zorla aç' },
	'tinkers_tools': { name: 'Tamirci Aletleri', description: 'Hurda parçalardan küçük eşya yap' },
	'weavers_tools': { name: 'Dokumacı Aletleri', description: 'Giysi yırtığını onar veya desen dik' },
	'woodcarvers_tools': { name: 'Ahşap Oymacılığı Aletleri', description: 'Ahşaba desen oy' }
};

// Other Tools
export const otherTools: Record<string, { name: string; description: string }> = {
	'herbalism_kit': { name: 'Bitkibilim Seti', description: 'Bitki tanımla veya panzehir/şifa iksiri yap' },
	'thieves_tools': { name: 'Hırsız Aletleri', description: 'Kilit aç veya tuzak etkisiz hale getir' }
};

// Combined tool list
export const allTools = {
	...musicalInstruments,
	...artisansTools,
	...otherTools
};

export function translateToolName(toolId: string): string {
	return allTools[toolId]?.name || toolId;
}

export function getToolDescription(toolId: string): string {
	return allTools[toolId]?.description || '';
}
