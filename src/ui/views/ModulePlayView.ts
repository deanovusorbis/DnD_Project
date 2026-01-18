
import { LearningModule, ModuleStep } from '../../types/module-types.ts';

const EMOTION_SPRITES: Record<string, string> = {
	'neutral': '/img/lucrea/lucrea-neutral.png',
	'happy': '/img/lucrea/lucrea-happy.png',
	'excited': '/img/lucrea/lucrea-excited.png',
	'worried': '/img/lucrea/lucrea-worried.png',
	'sad': '/img/lucrea/lucrea-sad.png',
	'thinking': '/img/lucrea/lucrea-thinking.png',
	'surprised': '/img/lucrea/lucrea-surprised.png',
	'annoyed': '/img/lucrea/lucrea-annoyed.png',
	'angry': '/img/lucrea/lucrea-angry.png',
	'smug': '/img/lucrea/lucrea-smug.png',
	'shy': '/img/lucrea/lucrea-shy.png',
	'laughing': '/img/lucrea/lucrea-laughing.png',
	'giggle': '/img/lucrea/lucrea-laughing.png',
	// NPC Characters
	'thorn-neutral': '/img/npc/thorn/thorn-neutral.png',
	'thorn-talking': '/img/npc/thorn/thorn-talking.png',
	'thorn-angry': '/img/npc/thorn/thorn-angry.png',
	'thorn-smug': '/img/npc/thorn/thorn-smug.png',
	'elara-neutral': '/img/npc/elara/elara-neutral.png',
	'elara-talking': '/img/npc/elara/elara-talking.png',
	'shadow-neutral': '/img/npc/shadow/shadow-neutral.png',
	'shadow-talking': '/img/npc/shadow/shadow-talking.png'
};


export class ModulePlayView {
	private container: HTMLElement;
	private module: LearningModule;
	private currentStepId: string;
	private onComplete?: () => void;
	private onExit?: () => void;
	private boundHandleInput: (e: KeyboardEvent) => void;
	private isDestroyed: boolean = false;

	constructor(
		container: HTMLElement,
		module: LearningModule,
		onComplete?: () => void,
		onExit?: () => void
	) {
		this.container = container;
		this.module = module;
		this.currentStepId = module.scenario.steps[0]?.id || 'intro';
		this.onComplete = onComplete;
		this.onExit = onExit;

		// Bind input handler
		this.boundHandleInput = this.handleInput.bind(this);
		document.addEventListener('keydown', this.boundHandleInput);

		// Bind global click handler for "Tap to Advance"
		// We use the container itself as the touch surface
		this.container.onclick = (e) => {
			// Don't trigger if clicking on interactive elements that should handle themselves
			// (Buttons already prevent propagation, but good to be safe)
			const target = e.target as HTMLElement;
			if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
				return;
			}
			this.handleActionTrigger();
		};

		// Wrap exit/complete to clear listener
		const originalExit = this.onExit;
		this.onExit = () => {
			this.cleanup();
			if (originalExit) originalExit();
		};
		const originalComplete = this.onComplete;
		this.onComplete = () => {
			this.cleanup();
			if (originalComplete) originalComplete();
		};
	}

	private cleanup(): void {
		this.isDestroyed = true;
		document.removeEventListener('keydown', this.boundHandleInput);
	}

	private handleInput(e: KeyboardEvent): void {
		if (this.isDestroyed) return;

		// Self-cleaning check: if container is removed from DOM, clean up
		if (!document.body.contains(this.container)) {
			this.cleanup();
			return;
		}

		if (e.code === 'Space') {
			e.preventDefault(); // Prevent page scroll

			// Don't trigger if modal overlay is present
			if (document.querySelector('.modal-overlay')) return;

			this.handleActionTrigger();
		}
	}

	private handleActionTrigger(): void {
		const step = this.module.scenario.steps.find(s => s.id === this.currentStepId);
		if (!step) return;

		// Check if typing - must match the isTyping logic in render but we need access to it
		// Since isTyping is local to render(), we can check if the full content is displayed
		const dialogueText = this.container.querySelector('.dialogue-text') as HTMLElement;
		if (dialogueText && dialogueText.dataset.typing === 'true') {
			// Trigger click on container to complete typing
			this.container.querySelector('.dialogue-container')?.dispatchEvent(new Event('click'));
		} else {
			// Advance logic matches click handler
			if (step.type === 'choice' || step.type === 'challenge') {
				this.showChoiceModal(step);
			} else if (step.nextStep) {
				this.handleNext(step.nextStep);
			} else {
				this.handleCompletion();
			}
		}
	}

	public render(): void {
		this.container.innerHTML = '';
		this.container.className = 'vn-container-fixed';
		// Removed inline styles

		const currentStep = this.module.scenario.steps.find(s => s.id === this.currentStepId);
		if (!currentStep) return;

		// Top bar
		const topBar = this.createTopBar();
		this.container.appendChild(topBar);

		// Apply background
		const bgImage = currentStep.backgroundImage || this.module.scenario.backgroundImage;
		if (bgImage) {
			this.container.style.backgroundImage = `url('${bgImage}')`;
			this.container.style.backgroundSize = 'cover';
			this.container.style.backgroundPosition = 'center';
			this.container.style.backgroundRepeat = 'no-repeat';
		} else {
			// Default gradient
			this.container.style.background = 'linear-gradient(to bottom, #2a2a35 0%, #1a1a25 100%)';
		}

		// Main VN area
		const vnArea = document.createElement('div');
		vnArea.className = 'vn-view-area';
		// Removed inline styles

		// Character sprite area
		const spriteArea = this.createSpriteArea(currentStep);
		vnArea.appendChild(spriteArea);

		// Dialogue box
		const dialogueBox = this.createDialogueBox(currentStep);
		vnArea.appendChild(dialogueBox);

		this.container.appendChild(vnArea);
	}


	private createTopBar(): HTMLElement {
		const topBar = document.createElement('div');
		topBar.className = 'vn-top-bar';
		// Removed inline styles

		const title = document.createElement('div');
		title.className = 'vn-top-title';
		title.textContent = this.module.scenario.title;

		const exitBtn = document.createElement('button');
		exitBtn.className = 'btn btn-secondary';
		exitBtn.textContent = '← Çıkış';
		exitBtn.style.cssText = 'padding: 0.4rem 1rem; font-size: 0.9rem;'; // Minimal override OK
		exitBtn.onclick = () => {
			this.showExitConfirmation();
		};

		topBar.appendChild(title);
		topBar.appendChild(exitBtn);
		return topBar;
	}

	private createSpriteArea(step: ModuleStep): HTMLElement {
		const spriteArea = document.createElement('div');
		spriteArea.className = 'vn-sprite-area';
		// Removed inline styles

		let spriteUrl: string;
		if (!step.speaker || step.speaker === 'narrator') {
			spriteUrl = '/img/storyteller/storyteller.png';
		} else {
			const emotion = (step as any).emotion || 'neutral';
			// Try to find specific sprite for character (e.g. 'thorn-neutral')
			const specificKey = `${step.speaker}-${emotion}`;

			if (EMOTION_SPRITES[specificKey]) {
				spriteUrl = EMOTION_SPRITES[specificKey];
			} else {
				// Fallback to standard emotion keys (mostly for Lucrea/Mascot)
				spriteUrl = EMOTION_SPRITES[emotion] || EMOTION_SPRITES['neutral'] || '/img/mascot/lucrea-neutral.png';
			}
		}

		const sprite = document.createElement('img');
		sprite.className = 'vn-character-sprite';
		sprite.src = spriteUrl;
		sprite.alt = step.speaker || 'Character';
		// Removed inline styles

		spriteArea.appendChild(sprite);
		return spriteArea;
	}

	private createDialogueBox(step: ModuleStep): HTMLElement {
		const dialogueContainer = document.createElement('div');
		dialogueContainer.className = 'dialogue-container vn-dialogue-container'; // Keep legacy class for selection logic if needed, add new class
		// Removed inline styles but kept logic

		// Speaker name
		const speakerName = document.createElement('div');
		speakerName.className = 'vn-speaker-name';
		// Removed inline styles

		let displayName = 'Anlatıcı';
		if (step.speaker === 'mascot') {
			displayName = 'Lucrea';
		} else if (step.speaker && step.speaker !== 'narrator') {
			displayName = step.speaker.charAt(0).toUpperCase() + step.speaker.slice(1);
		}
		speakerName.textContent = displayName;
		dialogueContainer.appendChild(speakerName);

		// Dialogue text container
		const dialogueText = document.createElement('div');
		dialogueText.className = 'dialogue-text vn-dialogue-text-content'; // Add new class
		// Removed logical styles, kept tracking attr

		// Hint Text
		const hint = document.createElement('div');
		hint.textContent = 'İlerlemek için [Space] veya Tıkla';
		hint.style.cssText = `
			position: absolute;
			bottom: 0.5rem;
			right: 1rem;
			font-size: 0.75rem;
			color: var(--color-text-dim);
			opacity: 0.5;
			pointer-events: none;
		`;
		dialogueContainer.appendChild(hint);

		// Actions (initially hidden)
		const actions = this.createActions(step);
		if (actions) {
			dialogueContainer.appendChild(actions);
			actions.style.opacity = '0';
			actions.style.transition = 'opacity 0.3s ease';
			actions.style.pointerEvents = 'none';
		}

		// Typewriter Effect
		const fullContent = this.formatContent(step.content);
		let isTyping = true;
		dialogueText.dataset.typing = 'true'; // Set tracking attribute

		// Clear any existing typing timeout before starting new one
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
			this.typingTimeout = null;
		}

		const completeTyping = () => {
			if (this.typingTimeout) {
				clearTimeout(this.typingTimeout);
				this.typingTimeout = null;
			}
			isTyping = false;
			dialogueText.dataset.typing = 'false'; // Update tracking attribute
			dialogueText.innerHTML = fullContent;
			if (actions) {
				actions.style.opacity = '1';
				actions.style.pointerEvents = 'auto';
			}
		};

		this.typeWriter(dialogueText, fullContent, () => {
			if (isTyping) completeTyping();
		});

		// Re-enable click listener ONLY for typing completion
		// This is triggered by Space key dispatcher or actual click
		dialogueContainer.onclick = (e) => {
			if (isTyping) {
				completeTyping();
				e.stopPropagation();
			}
		};

		return dialogueContainer;
	}

	private typingTimeout: number | null = null;

	private typeWriter(element: HTMLElement, htmlContent: string, onComplete: () => void) {
		element.innerHTML = '';
		const speed = 20;
		let currentHTML = '';
		let charIndex = 0;
		let inTag = false;

		const type = () => {
			if (charIndex >= htmlContent.length) {
				this.typingTimeout = null;
				onComplete();
				return;
			}

			const char = htmlContent[charIndex];
			if (char === '<') inTag = true;
			currentHTML += char;
			charIndex++;
			if (char === '>') inTag = false;

			if (inTag) {
				type();
			} else {
				element.innerHTML = currentHTML;
				// Store timeout ID to allow cancellation
				this.typingTimeout = window.setTimeout(type, speed);
			}
		};
		type();
	}

	private createActions(step: ModuleStep): HTMLElement | null {
		// Use inline style for actions container as it is simple flex
		const actionsContainer = document.createElement('div');
		actionsContainer.className = 'vn-actions-container';

		if (step.type === 'choice' || step.type === 'challenge') {
			const continueBtn = document.createElement('div');
			continueBtn.className = 'vn-next-action';
			continueBtn.textContent = 'Devam Et ▼';
			continueBtn.setAttribute('role', 'button');

			continueBtn.onclick = (e) => {
				e.stopPropagation();
				this.showChoiceModal(step);
			};

			return continueBtn;
		} else if (step.nextStep) {
			// Floating text style
			const nextBtn = document.createElement('div');
			nextBtn.className = 'vn-next-action';
			nextBtn.textContent = 'Devam Et ▼';
			nextBtn.setAttribute('role', 'button');

			nextBtn.onclick = (e) => {
				e.stopPropagation(); // Prevent bubbling to container click
				this.handleNext(step.nextStep as string);
			};

			// Return directly to be appended effectively
			return nextBtn;
		} else {
			// Finish button - now floating text style
			const finishBtn = document.createElement('div');
			finishBtn.className = 'vn-next-action';
			finishBtn.innerText = 'Tamamla ✓';
			finishBtn.setAttribute('role', 'button');
			finishBtn.style.color = '#4ade80'; // Override for green

			finishBtn.onclick = (e) => {
				e.stopPropagation();
				this.handleCompletion();
			};

			return finishBtn;
		}
	}

	private handleCompletion(): void {
		// 1. Save to LocalStorage
		const completedKey = 'dnd_completed_modules';
		const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
		if (!completed.includes(this.module.id)) {
			completed.push(this.module.id);
			if (this.module.id.includes('-basics')) {
				completed.push(this.module.id.replace('-basics', ''));
			}
			localStorage.setItem(completedKey, JSON.stringify(completed));
		}

		// 2. Show Full Completion Screen
		this.showCompletionScreen();
	}

	private showCompletionScreen(): void {
		this.container.innerHTML = ''; // Clear VN interface
		this.container.style.cssText = `
			position: fixed;
			top: 0; left: 0; width: 100%; height: 100%;
			background: radial-gradient(circle at center, #2c2c35 0%, #0d0d10 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 2000;
			animation: fadeIn 1.5s ease-in-out;
		`;

		const card = document.createElement('div');
		card.style.cssText = `
			background: linear-gradient(to bottom, #1a1a20, #0f0f13);
			border: 4px double var(--color-accent-gold);
			border-radius: 4px; /* Sharper corners for medieval feel */
			padding: 4rem;
			max-width: 700px;
			width: 90%;
			text-align: center;
			box-shadow: 
				0 0 0 1px #000, /* Inner black line */
				0 0 50px rgba(197, 160, 89, 0.15),
				inset 0 0 100px rgba(0,0,0,0.8);
			display: flex;
			flex-direction: column;
			gap: 2rem;
			align-items: center;
			position: relative;
		`;

		// Decorative corners (Simulated with pseudo-elements logic via spans for simplicity)
		const ornament = (pos: string) => `
			position: absolute; ${pos}; width: 20px; height: 20px; 
			border-${pos.includes('top') ? 'top' : 'bottom'}: 2px solid var(--color-accent-gold);
			border-${pos.includes('left') ? 'left' : 'right'}: 2px solid var(--color-accent-gold);
		`;

		const cornerTL = document.createElement('div'); cornerTL.style.cssText = ornament('top: 10px; left: 10px;');
		const cornerTR = document.createElement('div'); cornerTR.style.cssText = ornament('top: 10px; right: 10px;');
		const cornerBL = document.createElement('div'); cornerBL.style.cssText = ornament('bottom: 10px; left: 10px;');
		const cornerBR = document.createElement('div'); cornerBR.style.cssText = ornament('bottom: 10px; right: 10px;');
		card.append(cornerTL, cornerTR, cornerBL, cornerBR);

		const icon = document.createElement('div');
		icon.innerHTML = '🛡️';
		icon.style.cssText = `
			font-size: 5rem;
			filter: drop-shadow(0 0 20px var(--color-accent-gold));
			animation: float 4s ease-in-out infinite;
		`;
		card.appendChild(icon);

		const title = document.createElement('h2');
		title.textContent = 'GÖREV TAMAMLANDI';
		title.style.cssText = `
			font-family: serif; /* Medieval Font fallback */
			color: var(--color-accent-gold);
			font-size: 3rem;
			margin: 0;
			text-shadow: 0 4px 10px rgba(0,0,0,0.8);
			letter-spacing: 4px;
			font-weight: 100;
			text-transform: uppercase;
			border-bottom: 1px solid rgba(197, 160, 89, 0.3);
			padding-bottom: 1rem;
			width: 100%;
		`;
		card.appendChild(title);

		const desc = document.createElement('p');
		desc.textContent = `${this.module.name} bilgeliğine eriştin. Bu kadim bilgileri unutma, çünkü yolun daha uzun, kahraman.`;
		desc.style.cssText = `
			font-size: 1.3rem;
			color: #d4d4d8; /* Light gray text */
			line-height: 1.8;
			margin: 0;
			font-family: serif;
			font-style: italic;
		`;
		card.appendChild(desc);

		const homeBtn = document.createElement('button');
		homeBtn.textContent = 'ANA MENÜYE DÖN';
		homeBtn.style.cssText = `
			background: transparent;
			border: 1px solid var(--color-accent-gold);
			color: var(--color-accent-gold);
			padding: 1rem 3rem;
			font-size: 1.1rem;
			margin-top: 2rem;
			cursor: pointer;
			font-family: var(--font-display);
			text-transform: uppercase;
			letter-spacing: 2px;
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
		`;

		homeBtn.onmouseenter = () => {
			homeBtn.style.background = 'rgba(197, 160, 89, 0.1)';
			homeBtn.style.boxShadow = '0 0 30px rgba(197, 160, 89, 0.3)';
			homeBtn.style.letterSpacing = '4px';
		};
		homeBtn.onmouseleave = () => {
			homeBtn.style.background = 'transparent';
			homeBtn.style.boxShadow = 'none';
			homeBtn.style.letterSpacing = '2px';
		};

		homeBtn.onclick = () => {
			if (this.onComplete) this.onComplete();
		};
		card.appendChild(homeBtn);

		this.container.appendChild(card);
	}

	private showExitConfirmation(): void {
		const overlay = document.createElement('div');
		overlay.style.cssText = `
			position: fixed;
			top: 0; left: 0; width: 100%; height: 100%;
			background: rgba(0, 0, 0, 0.85);
			backdrop-filter: blur(5px);
			z-index: 3000;
			display: flex;
			align-items: center;
			justify-content: center;
			animation: fadeIn 0.2s;
		`;

		const box = document.createElement('div');
		box.style.cssText = `
			background: var(--color-background-secondary);
			border: 1px solid var(--color-border);
			border-radius: 8px;
			padding: 2rem;
			max-width: 400px;
			width: 90%;
			text-align: center;
			box-shadow: 0 10px 40px rgba(0,0,0,0.5);
		`;

		const title = document.createElement('h3');
		title.textContent = "Çıkış Yapılsın Mı?";
		title.style.cssText = `
			color: var(--color-text-heading);
			font-family: var(--font-display);
			margin-bottom: 1rem;
		`;
		box.appendChild(title);

		const desc = document.createElement('p');
		desc.textContent = "Modülden çıkarsan ilerlemen kaydedilmeyecek. Emin misin?";
		desc.style.cssText = "margin-bottom: 2rem; color: var(--color-text-muted);";
		box.appendChild(desc);

		const btnContainer = document.createElement('div');
		btnContainer.style.cssText = "display: flex; gap: 1rem; justify-content: center;";

		const cancelBtn = document.createElement('button');
		cancelBtn.className = 'btn btn-secondary';
		cancelBtn.textContent = 'İptal';
		cancelBtn.onclick = () => document.body.removeChild(overlay);

		const confirmBtn = document.createElement('button');
		confirmBtn.className = 'btn btn-primary';
		confirmBtn.style.cssText = `
			background: #ef4444; 
			color: #ffffff;
			border: 1px solid #dc2626;
			padding: 0.5rem 1.5rem;
		`;
		confirmBtn.textContent = 'Evet, Çık';
		confirmBtn.onclick = () => {
			document.body.removeChild(overlay);
			if (this.onExit) this.onExit();
		};

		btnContainer.appendChild(cancelBtn);
		btnContainer.appendChild(confirmBtn);
		box.appendChild(btnContainer);

		overlay.appendChild(box);
		document.body.appendChild(overlay);
	}

	private showChoiceModal(step: any): void {
		// Prevent multiple modals
		if (document.querySelector('.choice-modal-overlay')) return;

		const overlay = document.createElement('div');
		overlay.className = 'choice-modal-overlay'; // Add class for check
		overlay.style.cssText = `
			position: fixed;
			top: 0; left: 0; width: 100%; height: 100%;
			background: rgba(0, 0, 0, 0.85);
			z-index: 2000;
			display: flex;
			align-items: center;
			justify-content: center;
			opacity: 0;
			transition: opacity 0.3s ease;
		`;

		const container = document.createElement('div');
		container.style.cssText = `
			background: var(--color-background-secondary);
			border: 2px solid var(--color-accent-gold);
			border-radius: 8px;
			padding: 2rem;
			width: 90%;
			max-width: 600px;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			transform: scale(0.9);
			transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		`;

		const header = document.createElement('h3');
		header.textContent = "Ne Yapıyorsun?";
		header.style.cssText = `
			color: var(--color-accent-gold);
			text-align: center;
			margin: 0 0 1rem 0;
			font-family: var(--font-display);
			font-size: 1.5rem;
			text-transform: uppercase;
		`;
		container.appendChild(header);

		if (step.choices) {
			step.choices.forEach((choice: any) => {
				const btn = document.createElement('button');
				btn.textContent = choice.text;
				btn.style.cssText = `
					background: rgba(255, 255, 255, 0.05);
					border: 1px solid var(--color-border);
					padding: 1rem;
					text-align: left;
					color: var(--color-text-primary);
					cursor: pointer;
					transition: all 0.2s ease;
					font-size: 1.1rem;
					border-radius: 4px;
				`;

				btn.onmouseenter = () => {
					btn.style.background = 'rgba(197, 160, 89, 0.1)';
					btn.style.borderColor = 'var(--color-accent-gold)';
					btn.style.transform = 'translateX(5px)';
				};
				btn.onmouseleave = () => {
					btn.style.background = 'rgba(255, 255, 255, 0.05)';
					btn.style.borderColor = 'var(--color-border)';
					btn.style.transform = 'translateX(0)';
				};

				btn.onclick = () => {
					overlay.style.opacity = '0';
					setTimeout(() => {
						overlay.remove();
						// User requested to skip feedback modal for better flow
						if (choice.nextStep) {
							this.handleNext(choice.nextStep);
						}
					}, 300);
				};
				container.appendChild(btn);
			});
		}

		overlay.appendChild(container);
		document.body.appendChild(overlay);

		requestAnimationFrame(() => {
			overlay.style.opacity = '1';
			container.style.transform = 'scale(1)';
		});
	}



	private handleNext(nextStepId: string): void {
		if (nextStepId === 'end') {
			this.handleCompletion();
			return;
		}
		this.currentStepId = nextStepId;
		this.render();
	}

	private formatContent(content: string): string {
		let formatted = content
			.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-accent-gold);">$1</strong>');
		const paragraphs = formatted.split(/\n\n+/);
		return paragraphs.map(p => `<p style="margin-bottom: 0.8rem;">${p.replace(/\n/g, ' ')}</p>`).join('');
	}
}
