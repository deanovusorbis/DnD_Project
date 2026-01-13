import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';

export function renderGeneralStep(parent: HTMLElement, onStepComplete: () => void): void {
	const state = useGameStore.getState();
	const cState = state.characterCreation;

	const container = document.createElement('div');
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.gap = 'var(--space-lg)';
	container.style.maxWidth = '600px';
	container.style.margin = '0 auto';

	// Header
	const header = document.createElement('div');
	header.innerHTML = `
		<h2 style="color: var(--color-accent-gold); margin-bottom: var(--space-xs); font-family: var(--font-display);">
			Maceraya Başla
		</h2>
		<p style="color: var(--color-text-secondary); line-height: 1.5;">
			Karakterinin temel bilgilerini belirle.
		</p>
	`;
	container.appendChild(header);

	// Core Info Form
	const infoGroup = document.createElement('div');

	// Character Name
	// We handle this manually for focus safety
	const nameGroup = document.createElement('div');
	nameGroup.style.marginBottom = 'var(--space-md)';
	nameGroup.innerHTML = `<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">Karakter Adı *</label>`;
	const nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.value = cState.characterName || '';
	nameInput.placeholder = 'Örn: Thorin Meşekalkanlı';
	nameInput.style.width = '100%';
	nameInput.style.padding = '10px';
	nameInput.style.borderRadius = 'var(--radius-sm)';
	nameInput.style.border = '1px solid var(--color-border)';
	nameInput.style.background = 'var(--color-bg-tertiary)';
	nameInput.style.color = 'var(--color-text-primary)';

	// CRITICAL FIX: Only update store on CHANGE (blur/enter), not input.
	nameInput.onchange = (e) => {
		useGameStore.getState().updateCharacterCreation({ characterName: (e.target as HTMLInputElement).value });
	};

	nameGroup.appendChild(nameInput);
	infoGroup.appendChild(nameGroup);

	// Player Name
	const playerGroup = createInputGroup('Oyuncu Adı', 'playerName', cState.playerName || '', 'Senin adın');
	infoGroup.appendChild(playerGroup);

	// Level
	const levelFn = (e: Event) => {
		let val = parseInt((e.target as HTMLInputElement).value);
		if (isNaN(val) || val < 1) val = 1;
		if (val > 20) val = 20;
		(e.target as HTMLInputElement).value = val.toString();
		useGameStore.getState().updateCharacterCreation({ level: val });
	};
	const levelGroup = createInputGroup('Seviye (1-20)', 'level', (cState.level || 1).toString(), '1', 'number');
	levelGroup.querySelector('input')!.onchange = levelFn;
	infoGroup.appendChild(levelGroup);

	// Alignment
	const alignGroup = document.createElement('div');
	alignGroup.style.marginBottom = 'var(--space-md)';
	alignGroup.innerHTML = `<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">Düzen (Alignment)</label>`;

	const alignSelect = document.createElement('select');
	alignSelect.style.width = '100%';
	alignSelect.style.padding = '10px';
	alignSelect.style.borderRadius = 'var(--radius-sm)';
	alignSelect.style.border = '1px solid var(--color-border)';
	alignSelect.style.background = 'var(--color-bg-tertiary)';
	alignSelect.style.color = 'var(--color-text-primary)';

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
		alignSelect.appendChild(opt);
	});
	alignSelect.onchange = (e) => useGameStore.getState().updateCharacterCreation({ alignment: (e.target as HTMLSelectElement).value });
	alignGroup.appendChild(alignSelect);
	infoGroup.appendChild(alignGroup);

	container.appendChild(infoGroup);

	// Actions
	const actionContainer = document.createElement('div');
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'flex-end';
	actionContainer.style.marginTop = 'var(--space-lg)';

	const nextButton = createButton({
		label: 'Devam Et (Tür Seçimi) ➡️',
		variant: 'primary',
		size: 'lg',
		disabled: !cState.characterName,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'species' });
			onStepComplete();
		}
	});

	// Dynamic update for button enabled state (Local Only)
	nameInput.oninput = (e) => {
		nextButton.disabled = !(e.target as HTMLInputElement).value;
	};

	actionContainer.appendChild(nextButton);
	container.appendChild(actionContainer);

	parent.appendChild(container);
}

function createInputGroup(label: string, field: string, value: string, placeholder: string, type: string = 'text'): HTMLElement {
	const group = document.createElement('div');
	group.style.marginBottom = 'var(--space-md)';
	group.innerHTML = `<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.85rem;">${label}</label>`;
	const input = document.createElement('input');
	input.type = type;
	input.value = value;
	input.placeholder = placeholder;
	input.style.width = '100%';
	input.style.padding = '10px';
	input.style.borderRadius = 'var(--radius-sm)';
	input.style.border = '1px solid var(--color-border)';
	input.style.background = 'var(--color-bg-tertiary)';
	input.style.color = 'var(--color-text-primary)';

	if (type === 'text') {
		// Only change on blur/enter to prevent re-renders
		input.onchange = (e) => useGameStore.getState().updateCharacterCreation({ [field]: (e.target as HTMLInputElement).value });
	}

	group.appendChild(input);
	return group;
}
