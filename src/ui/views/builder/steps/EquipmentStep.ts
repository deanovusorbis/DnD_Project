import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';

// Database of Packs (Türkçe)
const PACK_CONTENTS: Record<string, string> = {
	"Explorer's Pack (Kaşif Paketi)": "Sırt Çantası, Uyku Tulumu, Yemek Kabı, Kav Kutusu, 10 Meşale, 10 Günlük Erzak, Su Matarası, 50 ft Kenevir İp.",
	"Dungeoneer's Pack (Zindan Paketi)": "Sırt Çantası, Levye, Çekiç, 10 Çivi, 10 Meşale, Kav Kutusu, 10 Günlük Erzak, Su Matarası, 50 ft Kenevir İp.",
	"Entertainer's Pack (Eğlendirici Paketi)": "Sırt Çantası, Uyku Tulumu, 2 Kostüm, 5 Mum, 5 Günlük Erzak, Su Matarası, Makyaj Seti.",
	"Priest's Pack (Rahip Paketi)": "Sırt Çantası, Battaniye, 10 Mum, Kav Kutusu, Sadaka Kutusu, 2 Tütsü Çubuğu, Buhurdanlık, Rahip Cübbesi, 2 Günlük Erzak, Su Matarası.",
	"Burglar's Pack (Hırsız Paketi)": "Sırt Çantası, 1000 Bilye, 10 ft Misina, Çan, 5 Mum, Levye, Çekiç, 10 Çivi, Kapaklı Fener, 2 Şişe Yağ, 5 Günlük Erzak, Kav Kutusu, Su Matarası, 50 ft İp.",
	"Scholar's Pack (Bilgin Paketi)": "Sırt Çantası, Bilim Kitabı, Mürekkep, Tüy Kalem, 10 Parşömen, Küçük Kum Torbası."
};

// Database of Class Equipment Options
const CLASS_EQUIPMENT: Record<string, {
	a: string[],
	b: string | string[],
	c?: string
}> = {
	barbarian: {
		a: ["Büyük Balta (Greataxe)", "4 x El Baltası (Handaxe)", "Explorer's Pack (Kaşif Paketi)", "15 Altın"],
		b: "75 Altın"
	},
	bard: {
		a: ["Deri Zırh (Leather Armor)", "2 x Hançer (Dagger)", "Seçilen Enstrüman", "Entertainer's Pack (Eğlendirici Paketi)", "19 Altın"],
		b: "90 Altın"
	},
	cleric: {
		a: ["Zincir Gömlek (Chain Shirt)", "Kalkan (Shield)", "Gürz (Mace)", "Kutsal Sembol", "Priest's Pack (Rahip Paketi)", "7 Altın"],
		b: "110 Altın"
	},
	druid: {
		a: ["Deri Zırh (Leather Armor)", "Kalkan (Shield)", "Orak (Sickle)", "Druid Odağı (Değnek)", "Explorer's Pack (Kaşif Paketi)", "Şifacılık Kiti (Herbalism Kit)", "9 Altın"],
		b: "50 Altın"
	},
	fighter: {
		a: ["Zincir Zırh (Chain Mail)", "Çift Elli Kılıç (Greatsword)", "Gürz (Flail)", "8 x Cirit (Javelin)", "Dungeoneer's Pack (Zindan Paketi)", "4 Altın"],
		b: ["Çivili Deri Zırh (Studded Leather)", "Pala (Scimitar)", "Kısa Kılıç (Shortsword)", "Uzun Yay (Longbow)", "20 x Ok", "Sadak (Quiver)", "Dungeoneer's Pack (Zindan Paketi)", "11 Altın"],
		c: "155 Altın"
	},
	monk: {
		a: ["Mızrak (Spear)", "5 x Hançer (Dagger)", "Zanaatkar Aleti veya Enstrüman", "Explorer's Pack (Kaşif Paketi)", "11 Altın"],
		b: "50 Altın"
	},
	paladin: {
		a: ["Zincir Zırh (Chain Mail)", "Kalkan (Shield)", "Uzun Kılıç (Longsword)", "6 x Cirit (Javelin)", "Kutsal Sembol", "Priest's Pack (Rahip Paketi)", "9 Altın"],
		b: "150 Altın"
	},
	ranger: {
		a: ["Çivili Deri Zırh (Studded Leather)", "Pala (Scimitar)", "Kısa Kılıç (Shortsword)", "Uzun Yay (Longbow)", "20 x Ok", "Sadak (Quiver)", "Druid Odağı", "Explorer's Pack (Kaşif Paketi)", "7 Altın"],
		b: "150 Altın"
	},
	rogue: {
		a: ["Deri Zırh (Leather Armor)", "2 x Hançer (Dagger)", "Kısa Kılıç (Shortsword)", "Kısa Yay (Shortbow)", "20 x Ok", "Sadak (Quiver)", "Hırsızlık Aletleri", "Burglar's Pack (Hırsız Paketi)", "8 Altın"],
		b: "100 Altın"
	},
	sorcerer: {
		a: ["Mızrak (Spear)", "2 x Hançer (Dagger)", "Büyü Odağı (Kristal)", "Dungeoneer's Pack (Zindan Paketi)", "28 Altın"],
		b: "50 Altın"
	},
	warlock: {
		a: ["Deri Zırh (Leather Armor)", "Orak (Sickle)", "2 x Hançer (Dagger)", "Büyü Odağı (Küre)", "Okült Kitap", "Scholar's Pack (Bilgin Paketi)", "15 Altın"],
		b: "100 Altın"
	},
	wizard: {
		a: ["2 x Hançer (Dagger)", "Büyü Odağı (Değnek)", "Cübbe (Robe)", "Büyü Kitabı (Spellbook)", "Scholar's Pack (Bilgin Paketi)", "5 Altın"],
		b: "55 Altın"
	}
};

export function renderEquipmentStep(parent: HTMLElement, onStepComplete: () => void): void {
	const state = useGameStore.getState();
	const selectedClassId = state.characterCreation.selectedClass;
	const selectedBackgroundId = state.characterCreation.selectedBackground;

	const container = document.createElement('div');
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.gap = '20px';
	container.style.maxWidth = '800px';
	container.style.margin = '0 auto';

	// Header
	const header = document.createElement('div');
	header.innerHTML = `
		<h2 style="color: var(--color-accent-gold); margin-bottom: 8px;">🎒 Başlangıç Ekipmanları</h2>
		<p style="color: var(--color-text-secondary);">Sınıfınız ve geçmişiniz size maceraya başlarken ihtiyacınız olan temel ekipmanları sağlar.</p>
	`;
	container.appendChild(header);

	// CLASS EQUIPMENT SELECTION
	if (selectedClassId && CLASS_EQUIPMENT[selectedClassId]) {
		const classEq = CLASS_EQUIPMENT[selectedClassId];
		const classCard = createCard({
			title: `Sınıf Ekipmanı (${selectedClassId.charAt(0).toUpperCase() + selectedClassId.slice(1)})`,
			content: ''
		});

		const selectionForm = document.createElement('div');
		selectionForm.style.display = 'flex';
		selectionForm.style.flexDirection = 'column';
		selectionForm.style.gap = '15px';

		const renderItemList = (items: string[]) => {
			return items.map(item => {
				const packKey = Object.keys(PACK_CONTENTS).find(k => {
					const parts = k.split('(');
					const base = parts[0] ? parts[0].trim() : '';
					return item && base && item.includes(base);
				});
				if (packKey && PACK_CONTENTS[packKey]) {
					return `<li style="margin-bottom: 4px;">
						<span style="color: var(--color-text-primary); font-weight: 500;">${item}</span>
						<div style="font-size: 0.8rem; color: var(--color-text-dim); margin-left: 10px; font-style: italic;">
							📦 İçerik: ${PACK_CONTENTS[packKey]}
						</div>
					</li>`;
				}
				return `<li style="color: var(--color-text-primary);">${item}</li>`;
			}).join('');
		};

		// OPTION A
		const optA = document.createElement('label');
		optA.style.display = 'flex';
		optA.style.gap = '12px';
		optA.style.padding = '12px';
		optA.style.border = '1px solid var(--color-border)';
		optA.style.borderRadius = 'var(--radius-md)';
		optA.style.cursor = 'pointer';
		optA.style.transition = 'all 0.2s';
		optA.onmouseover = () => optA.style.background = 'var(--color-bg-tertiary)';
		optA.onmouseout = () => { if (!optA.querySelector('input')?.checked) optA.style.background = 'transparent'; };

		const radioA = document.createElement('input');
		radioA.type = 'radio';
		radioA.name = 'equipment_choice';
		radioA.value = 'a';
		radioA.checked = true;

		const contentA = document.createElement('div');
		contentA.innerHTML = `
			<strong style="color: var(--color-accent-blue); display: block; margin-bottom: 8px;">Seçenek A: Standart Ekipman</strong>
			<ul style="list-style: disc; padding-left: 20px; margin: 0;">
				${renderItemList(classEq.a)}
			</ul>
		`;

		optA.appendChild(radioA);
		optA.appendChild(contentA);
		selectionForm.appendChild(optA);

		// OPTION B
		const optB = document.createElement('label');
		optB.style.display = 'flex';
		optB.style.gap = '12px';
		optB.style.padding = '12px';
		optB.style.border = '1px solid var(--color-border)';
		optB.style.borderRadius = 'var(--radius-md)';
		optB.style.cursor = 'pointer';
		optB.onmouseover = () => optB.style.background = 'var(--color-bg-tertiary)';
		optB.onmouseout = () => { if (!optB.querySelector('input')?.checked) optB.style.background = 'transparent'; };

		const radioB = document.createElement('input');
		radioB.type = 'radio';
		radioB.name = 'equipment_choice';
		radioB.value = 'b';

		const contentB = document.createElement('div');
		if (Array.isArray(classEq.b)) {
			contentB.innerHTML = `
				<strong style="color: var(--color-accent-blue); display: block; margin-bottom: 8px;">Seçenek B: Alternatif Ekipman</strong>
				<ul style="list-style: disc; padding-left: 20px; margin: 0;">
					${renderItemList(classEq.b)}
				</ul>
			`;
		} else {
			contentB.innerHTML = `
				<strong style="color: var(--color-accent-gold); display: block; margin-bottom: 8px;">Seçenek B: Altın Başlangıcı</strong>
				<div style="font-size: 1.1rem; font-weight: bold; color: var(--color-text-primary);">💰 ${classEq.b}</div>
				<div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;">Ekipmanlarınızı marketten kendiniz satın alırsınız.</div>
			`;
		}

		optB.appendChild(radioB);
		optB.appendChild(contentB);
		selectionForm.appendChild(optB);

		// OPTION C
		if (classEq.c) {
			const optC = document.createElement('label');
			optC.style.display = 'flex';
			optC.style.gap = '12px';
			optC.style.padding = '12px';
			optC.style.border = '1px solid var(--color-border)';
			optC.style.borderRadius = 'var(--radius-md)';
			optC.style.cursor = 'pointer';
			optC.onmouseover = () => optC.style.background = 'var(--color-bg-tertiary)';
			optC.onmouseout = () => { if (!optC.querySelector('input')?.checked) optC.style.background = 'transparent'; };

			const radioC = document.createElement('input');
			radioC.type = 'radio';
			radioC.name = 'equipment_choice';
			radioC.value = 'c';

			const contentC = document.createElement('div');
			contentC.innerHTML = `
				<strong style="color: var(--color-accent-gold); display: block; margin-bottom: 8px;">Seçenek C: Altın Başlangıcı</strong>
				<div style="font-size: 1.1rem; font-weight: bold; color: var(--color-text-primary);">💰 ${classEq.c}</div>
				<div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px;">Ekipmanlarınızı marketten kendiniz satın alırsınız.</div>
			`;

			optC.appendChild(radioC);
			optC.appendChild(contentC);
			selectionForm.appendChild(optC);
		}

		const updateStyles = () => {
			[optA, optB].forEach(opt => {
				const input = opt.querySelector('input');
				if (input?.checked) {
					opt.style.borderColor = 'var(--color-accent-gold)';
					opt.style.background = 'var(--color-bg-tertiary)';
				} else {
					opt.style.borderColor = 'var(--color-border)';
					opt.style.background = 'transparent';
				}
			});
			const optC = selectionForm.querySelector('label:nth-child(3)') as HTMLElement;
			if (optC) {
				const input = optC.querySelector('input');
				if (input?.checked) {
					optC.style.borderColor = 'var(--color-accent-gold)';
					optC.style.background = 'var(--color-bg-tertiary)';
				} else {
					optC.style.borderColor = 'var(--color-border)';
					optC.style.background = 'transparent';
				}
			}
		};

		radioA.onchange = updateStyles;
		radioB.onchange = updateStyles;
		if (classEq.c) {
			const radioC = selectionForm.querySelector('input[value="c"]') as HTMLInputElement;
			if (radioC) radioC.onchange = updateStyles;
		}

		updateStyles();
		classCard.appendChild(selectionForm);
		container.appendChild(classCard);
	}

	// BACKGROUND EQUIPMENT
	if (selectedBackgroundId) {
		const BG_ITEMS_MAP: Record<string, string[]> = {
			'acolyte': ['Kutsal Sembol', 'Dua Kitabı', '5 tütsü çubuğu', 'Cübbe', '15 Altın'],
			'criminal': ['Levye', 'Koyu renkli sivil kıyafetler (başlıklı)', '15 Altın'],
			'folk_hero': ['Zanaatkar aletleri', 'Kürek', 'Demir çömlek', 'Sivil kıyafetler', '10 Altın'],
			'noble': ['İnce kıyafetler', 'Mühür yüzüğü', 'Soy kütüğü parşömeni', '25 Altın'],
			'sage': ['Mürekkep şişesi', 'Tüy kalem', 'Küçük bıçak', 'Ölü bir meslektaştan mektup', 'Sivil kıyafetler', '10 Altın'],
			'soldier': ['Rütbe nişanı', 'Savaş ganimeti (kırık hançer vb.)', 'Kart seti veya zar seti', 'Sivil kıyafetler', '10 Altın']
		};

		const items = BG_ITEMS_MAP[selectedBackgroundId] || ['Sivil kıyafetler', 'Bir miktar altın', 'Geçmişe özel bir eşya'];

		const bgCard = createCard({
			title: `Geçmiş Ekipmanı (${selectedBackgroundId})`,
			content: `
				<div style="padding: 10px;">
					<p style="color: var(--color-text-secondary); margin-bottom: 10px; font-style: italic;">
						Seçtiğiniz geçmişten gelen bu eşyalar envanterinize otomatik olarak eklenir.
					</p>
					<ul style="list-style: disc; padding-left: 20px;">
						${items.map(i => `<li style="color: var(--color-text-primary); margin-bottom: 4px;">${i}</li>`).join('')}
					</ul>
				</div>
			`
		});
		container.appendChild(bgCard);
	}

	// Footer Buttons
	const footer = document.createElement('div');
	footer.style.display = 'flex';
	footer.style.justifyContent = 'space-between';
	footer.style.marginTop = '20px';
	footer.style.paddingTop = '20px';
	footer.style.borderTop = '1px solid var(--color-border)';

	const backBtn = createButton({
		label: '⬅️ Geri',
		variant: 'secondary',
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'background' });
			onStepComplete();
		}
	});

	const nextBtn = createButton({
		label: 'Devam Et (Detaylar) ➡️',
		variant: 'primary',
		onClick: () => {
			let calculatedGold = 0;
			if (selectedClassId && CLASS_EQUIPMENT[selectedClassId]) {
				const classEq = CLASS_EQUIPMENT[selectedClassId];
				const selectedOption = (container.querySelector('input[name="equipment_choice"]:checked') as HTMLInputElement)?.value;

				let itemsToScan: string[] = [];
				if (selectedOption === 'a') itemsToScan = classEq.a;
				else if (selectedOption === 'b') {
					if (Array.isArray(classEq.b)) itemsToScan = classEq.b;
					else if (typeof classEq.b === 'string') itemsToScan = [classEq.b];
				} else if (selectedOption === 'c' && classEq.c) itemsToScan = [classEq.c];

				itemsToScan.forEach(item => {
					const match = item.match(/(\d+)\s*Altın/i);
					if (match && match[1]) calculatedGold += parseInt(match[1], 10);
				});

				const bgId = selectedBackgroundId || '';
				const bgItems = bgId
					? (bgId === 'noble' ? ['25 Altın']
						: ['acolyte', 'criminal', 'warlock'].includes(bgId) ? ['15 Altın']
							: ['10 Altın'])
					: [];

				bgItems.forEach(item => {
					const match = item.match(/(\d+)\s*Altın/i);
					if (match && match[1]) calculatedGold += parseInt(match[1], 10);
				});
			}

			useGameStore.getState().updateCharacterCreation({
				step: 'details',
				startingGold: calculatedGold
			});
			onStepComplete();
		}
	});

	footer.appendChild(backBtn);
	footer.appendChild(nextBtn);
	container.appendChild(footer);
	parent.appendChild(container);
}
