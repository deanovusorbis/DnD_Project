import { registry } from '../../../../engine/core/registry.ts';
import { useGameStore } from '../../../../engine/core/store.ts';
import { createButton } from '../../../components/Button.ts';
import { createCard } from '../../../components/Card.ts';
import { createRuleHint } from '../../../components/RuleHint.ts';
import {
	translateSpeciesName,
	translateSubspeciesName,
	translateSize,
	translateDescription
} from '../../../../utils/translations/index.ts';

export function renderSpeciesStep(parent: HTMLElement, onStepComplete: () => void): void {
	const state = useGameStore.getState();
	const selectedSpeciesId = state.characterCreation.selectedSpecies;

	const speciesList = registry.getAllSpecies().sort((a, b) =>
		translateSpeciesName(a.name).localeCompare(translateSpeciesName(b.name), 'tr')
	);

	// PARENT CONTAINER
	const container = document.createElement('div');

	// GRID
	const grid = document.createElement('div');
	grid.className = 'concepts-grid';
	grid.style.display = 'grid';
	grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
	grid.style.gap = 'var(--space-lg)';
	grid.style.marginBottom = 'var(--space-xl)';

	speciesList.forEach(species => {
		const isSelected = selectedSpeciesId === species.id;
		const hasSubraces = species.subraces && species.subraces.length > 0;
		let subraceSelect: HTMLSelectElement | undefined;

		const cardContent = document.createElement('div');
		cardContent.style.minHeight = '120px';
		cardContent.style.display = 'flex';
		cardContent.style.flexDirection = 'column';

		// STATS BADGES + DESCRIPTION ONLY (Clean)
		cardContent.innerHTML = `
			<div style="display: flex; gap: 8px; margin-bottom: 12px;">
				<span style="background: var(--color-bg-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: var(--color-accent-blue); border: 1px solid var(--color-border);">
					🏃 ${species.speed} ft
				</span>
				<span style="background: var(--color-bg-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: var(--color-accent-blue); border: 1px solid var(--color-border);">
					📏 ${translateSize(species.size)}
				</span>
			</div>
			
			<div style="font-size: 0.9rem; line-height: 1.5; color: var(--color-text-secondary); margin-bottom: 8px;">
				${translateDescription(species.description)}
			</div>
		`;

		// NO FEATURES SECTION HERE

		// SUBRACE SELECTOR (Bottom of card)
		if (hasSubraces) {
			const subraceWrapper = document.createElement('div');
			subraceWrapper.style.marginTop = 'auto'; // Push to bottom

			const label = document.createElement('label');
			label.style.fontSize = '0.75rem';
			label.style.fontWeight = '600';
			label.style.color = 'var(--color-text-dim);';
			label.innerText = 'Alt Tür:';
			label.style.display = 'block';
			label.style.marginBottom = '4px';

			subraceSelect = document.createElement('select');
			subraceSelect.className = 'subrace-selector';
			subraceSelect.style.width = '100%';
			subraceSelect.style.padding = '8px';
			subraceSelect.style.fontSize = '0.9rem';
			subraceSelect.style.borderRadius = 'var(--radius-sm)';
			subraceSelect.style.border = '1px solid var(--color-border)';
			subraceSelect.style.background = 'var(--color-bg-secondary)';
			subraceSelect.style.color = 'var(--color-text-primary)';

			subraceSelect.innerHTML = species.subraces!.map(sr =>
				`<option value="${sr.id}" ${state.characterCreation.selectedSubspecies === sr.id ? 'selected' : ''}>${translateSubspeciesName(sr.name)}</option>`
			).join('');

			subraceSelect.onclick = (e) => e.stopPropagation();
			subraceSelect.onchange = (e) => {
				const val = (e.target as HTMLSelectElement).value;
				useGameStore.getState().updateCharacterCreation({
					selectedSpecies: species.id,
					selectedSubspecies: val
				});
				renderSpeciesStep(parent, onStepComplete);
			};

			subraceWrapper.appendChild(label);
			subraceWrapper.appendChild(subraceSelect);
			cardContent.appendChild(subraceWrapper);
		}

		// Footer Button
		const footerBtn = createButton({
			label: isSelected ? 'Seçildi' : 'Seç',
			variant: isSelected ? 'secondary' : 'primary',
			size: 'sm',
			onClick: (e) => {
				e.stopPropagation();
				const subVal = subraceSelect ? subraceSelect.value : undefined;
				useGameStore.getState().updateCharacterCreation({
					selectedSpecies: species.id,
					selectedSubspecies: subVal
				});
				renderSpeciesStep(parent, onStepComplete);
			}
		});

		const card = createCard({
			title: translateSpeciesName(species.name),
			variant: 'default',
			content: cardContent,
			footer: footerBtn
		});

		// Layout
		card.style.height = '100%';
		card.style.display = 'flex';
		card.style.flexDirection = 'column';

		setTimeout(() => {
			const body = card.querySelector('.card-body') as HTMLElement;
			if (body) {
				body.style.flex = '1';
				body.style.display = 'flex';
				body.style.flexDirection = 'column';
			}
		}, 0);

		cardContent.style.flex = '1';

		if (isSelected) {
			card.style.borderColor = 'var(--color-accent-gold)';
			card.style.boxShadow = '0 0 0 2px var(--color-accent-gold)';
		}

		grid.appendChild(card);
	});
	container.appendChild(grid);


	// ACTION FOOTER
	const footer = document.createElement('div');
	footer.style.display = 'flex';
	footer.style.justifyContent = 'flex-end';
	footer.style.gap = 'var(--space-md)';
	footer.style.marginTop = 'var(--space-xl)';
	footer.style.borderTop = '1px solid var(--color-border)';
	footer.style.paddingTop = 'var(--space-md)';

	const nextBtn = createButton({
		label: 'Devam Et (Sınıf Seçimi) ➡️',
		variant: 'primary',
		size: 'lg',
		disabled: !selectedSpeciesId,
		onClick: () => {
			useGameStore.getState().updateCharacterCreation({ step: 'class' });
			onStepComplete();
		}
	});

	footer.appendChild(nextBtn);
	container.appendChild(footer);

	parent.innerHTML = '';
	parent.appendChild(container);

	// Hint
	const hint = createRuleHint({
		ruleId: 'species-choice',
		title: 'Tür Seçimi',
		concept: 'Temel Özellikler',
		description: 'Türünüz, karakterinizin fiziksel özelliklerini (boy, hız, görüş yeteneği) ve bazı doğuştan gelen yeteneklerini belirler. Seçtiğiniz türe göre daha dayanıklı, daha çevik veya daha zeki olabilirsiniz.'
	});
	container.insertBefore(hint, grid);

	parent.appendChild(container);
}
