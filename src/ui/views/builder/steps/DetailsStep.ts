import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';

export function renderDetailsStep(parent: HTMLElement, onStepComplete: () => void): void {
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
			Karakter Detayları
		</h2>
		<p style="color: var(--color-text-secondary); line-height: 1.5;">
			Karakterinin fiziksel görünümü ve hikayesi.
		</p>
	`;
	container.appendChild(header);

	// Grid for Appearance
	const appGrid = document.createElement('div');
	appGrid.style.display = 'grid';
	appGrid.style.gridTemplateColumns = '1fr 1fr';
	appGrid.style.gap = '12px';

	const appearance = cState.appearance || {};
	const appFields = [
		{ key: 'age', label: 'Yaş', placeholder: 'Örn: 120' },
		{ key: 'height', label: 'Boy', placeholder: 'Örn: 1.75m' },
		{ key: 'weight', label: 'Kilo', placeholder: 'Örn: 75kg' },
		{ key: 'eyes', label: 'Göz Rengi', placeholder: 'Örn: Yeşil' },
		{ key: 'skin', label: 'Ten Rengi', placeholder: 'Örn: Bronz' },
		{ key: 'hair', label: 'Saç Rengi', placeholder: 'Örn: Siyah' }
	];

	appFields.forEach(f => {
		const grp = document.createElement('div');
		grp.innerHTML = `<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.8rem;">${f.label}</label>`;
		const inp = document.createElement('input');
		inp.type = 'text';
		inp.value = (appearance as any)[f.key] || '';
		inp.placeholder = f.placeholder;
		inp.style.width = '100%';
		inp.style.padding = '10px';
		inp.style.borderRadius = 'var(--radius-sm)';
		inp.style.border = '1px solid var(--color-border)';
		inp.style.background = 'var(--color-bg-tertiary)';
		inp.style.color = 'var(--color-text-primary)';

		inp.onchange = (e) => {
			const newApp = { ...cState.appearance, [f.key]: (e.target as HTMLInputElement).value };
			useGameStore.getState().updateCharacterCreation({ appearance: newApp });
		};
		grp.appendChild(inp);
		appGrid.appendChild(grp);
	});

	container.appendChild(appGrid);

	// Backstory
	const storyGroup = document.createElement('div');
	storyGroup.style.marginTop = '16px';
	storyGroup.innerHTML = `<label style="display: block; margin-bottom: 4px; color: var(--color-text-secondary); font-size: 0.9rem;">Karakter Hikayesi</label>`;
	const storyText = document.createElement('textarea');
	storyText.value = cState.backstory || '';
	storyText.placeholder = 'Karakterinin geçmişi, hedefleri ve kişilik özellikleri...';
	storyText.rows = 8;
	storyText.style.width = '100%';
	storyText.style.padding = '12px';
	storyText.style.borderRadius = 'var(--radius-sm)';
	storyText.style.border = '1px solid var(--color-border)';
	storyText.style.background = 'var(--color-bg-tertiary)';
	storyText.style.color = 'var(--color-text-primary)';
	storyText.style.resize = 'vertical';
	storyText.onchange = (e) => useGameStore.getState().updateCharacterCreation({ backstory: (e.target as HTMLTextAreaElement).value });
	storyGroup.appendChild(storyText);
	container.appendChild(storyGroup);

	// Actions
	const actionContainer = document.createElement('div');
	actionContainer.style.display = 'flex';
	actionContainer.style.justifyContent = 'space-between';
	actionContainer.style.marginTop = 'var(--space-xl)';
	actionContainer.style.paddingTop = 'var(--space-md)';
	actionContainer.style.borderTop = '1px solid var(--color-border)';

	const backButton = createButton({
		label: '⬅️ Geri',
		variant: 'secondary',
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'equipment' });
			onStepComplete();
		}
	});

	const nextButton = createButton({
		label: 'Özeti Görüntüle ➡️',
		variant: 'primary',
		size: 'lg',
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'review' });
			onStepComplete();
		}
	});

	actionContainer.appendChild(backButton);
	actionContainer.appendChild(nextButton);
	container.appendChild(actionContainer);

	parent.appendChild(container);
}
