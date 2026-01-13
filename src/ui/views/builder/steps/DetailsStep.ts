import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';

export function renderDetailsStep(parent: HTMLElement, onStepComplete: () => void): void {
	const state = useGameStore.getState();
	const cState = state.characterCreation;

	const container = document.createElement('div');
	container.style.display = 'grid';
	container.style.gridTemplateColumns = '1fr 1fr';
	container.style.gap = 'var(--space-lg)';

	// Left Column: Character Info
	const leftColumn = document.createElement('div');
	leftColumn.style.background = 'var(--color-bg-secondary)';
	leftColumn.style.padding = 'var(--space-lg)';
	leftColumn.style.borderRadius = 'var(--radius-md)';
	leftColumn.style.border = '1px solid var(--color-border)';

	leftColumn.innerHTML = `
		<h3 style="color: var(--color-accent-gold); margin-bottom: var(--space-md); font-family: var(--font-display);">
			📜 Karakter Bilgileri
		</h3>
	`;

	// Character Name
	const nameGroup = createInputGroup('Karakter Adı *', 'characterName', cState.characterName || '', 'Örn: Thorin Meşekalkanlı');
	leftColumn.appendChild(nameGroup);

	// Player Name
	const playerGroup = createInputGroup('Oyuncu Adı', 'playerName', cState.playerName || '', 'Senin adın');
	leftColumn.appendChild(playerGroup);

	// Alignment
	const alignmentGroup = document.createElement('div');
	alignmentGroup.style.marginBottom = 'var(--space-md)';
	alignmentGroup.innerHTML = `
		<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">Düzen (Alignment)</label>
	`;
	const alignmentSelect = document.createElement('select');
	alignmentSelect.style.width = '100%';
	alignmentSelect.style.padding = '10px';
	alignmentSelect.style.borderRadius = 'var(--radius-sm)';
	alignmentSelect.style.border = '1px solid var(--color-border)';
	alignmentSelect.style.background = 'var(--color-bg-tertiary)';
	alignmentSelect.style.color = 'var(--color-text-primary)';

	const alignments = [
		{ value: '', label: 'Seçin...' },
		{ value: 'lawful-good', label: 'Düzenli İyi (Lawful Good)' },
		{ value: 'neutral-good', label: 'Nötr İyi (Neutral Good)' },
		{ value: 'chaotic-good', label: 'Kaotik İyi (Chaotic Good)' },
		{ value: 'lawful-neutral', label: 'Düzenli Nötr (Lawful Neutral)' },
		{ value: 'true-neutral', label: 'Gerçek Nötr (True Neutral)' },
		{ value: 'chaotic-neutral', label: 'Kaotik Nötr (Chaotic Neutral)' },
		{ value: 'lawful-evil', label: 'Düzenli Kötü (Lawful Evil)' },
		{ value: 'neutral-evil', label: 'Nötr Kötü (Neutral Evil)' },
		{ value: 'chaotic-evil', label: 'Kaotik Kötü (Chaotic Evil)' }
	];

	alignments.forEach(a => {
		const opt = document.createElement('option');
		opt.value = a.value;
		opt.text = a.label;
		if (cState.alignment === a.value) opt.selected = true;
		alignmentSelect.appendChild(opt);
	});

	alignmentSelect.onchange = (e) => {
		useGameStore.getState().updateCharacterCreation({
			alignment: (e.target as HTMLSelectElement).value || undefined
		});
	};

	alignmentGroup.appendChild(alignmentSelect);
	leftColumn.appendChild(alignmentGroup);

	container.appendChild(leftColumn);

	// Right Column: Appearance
	const rightColumn = document.createElement('div');
	rightColumn.style.background = 'var(--color-bg-secondary)';
	rightColumn.style.padding = 'var(--space-lg)';
	rightColumn.style.borderRadius = 'var(--radius-md)';
	rightColumn.style.border = '1px solid var(--color-border)';

	rightColumn.innerHTML = `
		<h3 style="color: var(--color-accent-blue); margin-bottom: var(--space-md); font-family: var(--font-display);">
			👤 Görünüm
		</h3>
	`;

	const appearance = cState.appearance || {};

	const appearanceFields = [
		{ key: 'age', label: 'Yaş', placeholder: 'Örn: 120' },
		{ key: 'height', label: 'Boy', placeholder: 'Örn: 1.75m' },
		{ key: 'weight', label: 'Kilo', placeholder: 'Örn: 75kg' },
		{ key: 'eyes', label: 'Göz Rengi', placeholder: 'Örn: Yeşil' },
		{ key: 'skin', label: 'Ten Rengi', placeholder: 'Örn: Bronz' },
		{ key: 'hair', label: 'Saç', placeholder: 'Örn: Uzun, siyah' }
	];

	const appearanceGrid = document.createElement('div');
	appearanceGrid.style.display = 'grid';
	appearanceGrid.style.gridTemplateColumns = '1fr 1fr';
	appearanceGrid.style.gap = 'var(--space-sm)';

	appearanceFields.forEach(field => {
		const group = document.createElement('div');
		group.innerHTML = `
			<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.8rem;">${field.label}</label>
		`;
		const input = document.createElement('input');
		input.type = 'text';
		input.value = (appearance as any)[field.key] || '';
		input.placeholder = field.placeholder;
		input.style.width = '100%';
		input.style.padding = '8px';
		input.style.borderRadius = 'var(--radius-sm)';
		input.style.border = '1px solid var(--color-border)';
		input.style.background = 'var(--color-bg-tertiary)';
		input.style.color = 'var(--color-text-primary)';
		input.style.boxSizing = 'border-box';

		input.onchange = (e) => {
			const newAppearance = { ...appearance, [field.key]: (e.target as HTMLInputElement).value };
			useGameStore.getState().updateCharacterCreation({ appearance: newAppearance });
		};

		group.appendChild(input);
		appearanceGrid.appendChild(group);
	});

	rightColumn.appendChild(appearanceGrid);
	container.appendChild(rightColumn);

	parent.appendChild(container);

	// Backstory Section
	const backstorySection = document.createElement('div');
	backstorySection.style.marginTop = 'var(--space-lg)';
	backstorySection.style.background = 'var(--color-bg-secondary)';
	backstorySection.style.padding = 'var(--space-lg)';
	backstorySection.style.borderRadius = 'var(--radius-md)';
	backstorySection.style.border = '1px solid var(--color-border)';

	backstorySection.innerHTML = `
		<h3 style="color: var(--color-accent-purple); margin-bottom: var(--space-md); font-family: var(--font-display);">
			📖 Hikaye
		</h3>
		<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">Karakter Geçmişi (İsteğe bağlı)</label>
	`;

	const textarea = document.createElement('textarea');
	textarea.value = cState.backstory || '';
	textarea.placeholder = 'Karakterinin hikayesini yaz... Nereden geliyor? Motivasyonu ne? Gizli bir sırrı var mı?';
	textarea.rows = 5;
	textarea.style.width = '100%';
	textarea.style.padding = '12px';
	textarea.style.borderRadius = 'var(--radius-sm)';
	textarea.style.border = '1px solid var(--color-border)';
	textarea.style.background = 'var(--color-bg-tertiary)';
	textarea.style.color = 'var(--color-text-primary)';
	textarea.style.resize = 'vertical';
	textarea.style.fontFamily = 'inherit';
	textarea.style.boxSizing = 'border-box';

	textarea.onchange = (e) => {
		useGameStore.getState().updateCharacterCreation({
			backstory: (e.target as HTMLTextAreaElement).value
		});
	};

	backstorySection.appendChild(textarea);
	parent.appendChild(backstorySection);

	// Footer Actions
	const isComplete = !!cState.characterName && cState.characterName.trim().length > 0;
	const actionContainer = document.createElement('div');
	actionContainer.style.marginTop = 'var(--space-xl)';
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'flex-end';
	actionContainer.style.paddingTop = 'var(--space-md)';
	actionContainer.style.borderTop = '1px solid var(--color-border)';

	const nextButton = createButton({
		label: 'Karakteri Tamamla ✨',
		variant: 'primary',
		size: 'md',
		disabled: !isComplete,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'review', isComplete: true });
			onStepComplete();
		}
	});

	actionContainer.appendChild(nextButton);
	parent.appendChild(actionContainer);

	// Rule Hint
	const hint = createRuleHint({
		ruleId: 'character-details',
		title: 'İpucu: Karakter Detayları',
		concept: 'Rol Yapma',
		description: 'Karakterine bir isim ve kişilik ver! İyi bir geçmiş hikayesi, rol yapma deneyimini zenginleştirir.'
	});
	parent.appendChild(hint);
}

function createInputGroup(label: string, field: string, value: string, placeholder: string): HTMLElement {
	const group = document.createElement('div');
	group.style.marginBottom = 'var(--space-md)';

	group.innerHTML = `
		<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">${label}</label>
	`;

	const input = document.createElement('input');
	input.type = 'text';
	input.value = value;
	input.placeholder = placeholder;
	input.style.width = '100%';
	input.style.padding = '10px';
	input.style.borderRadius = 'var(--radius-sm)';
	input.style.border = '1px solid var(--color-border)';
	input.style.background = 'var(--color-bg-tertiary)';
	input.style.color = 'var(--color-text-primary)';
	input.style.boxSizing = 'border-box';

	input.onchange = (e) => {
		useGameStore.getState().updateCharacterCreation({
			[field]: (e.target as HTMLInputElement).value
		});
	};

	group.appendChild(input);
	return group;
}
