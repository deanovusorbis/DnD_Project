/**
 * ModulePlayView - Authentic Visual Novel Style
 * Character on side, dialogue box at bottom with no gap
 */

import { LearningModule, ModuleStep } from '../../types/module-types.ts';

const EMOTION_SPRITES: Record<string, string> = {
	'neutral': '/img/mascot/lucrea-neutral.png',
	'happy': '/img/mascot/lucrea-happy.png',
	'excited': '/img/mascot/lucrea-excited.png',
	'worried': '/img/mascot/lucrea-worried.png',
	'sad': '/img/mascot/lucrea-sad.png',
	'thinking': '/img/mascot/lucrea-thinking.png',
	'surprised': '/img/mascot/lucrea-surprised.png',
	'annoyed': '/img/mascot/lucrea-annoyed.png',
	'angry': '/img/mascot/lucrea-angry.png',
	'smug': '/img/mascot/lucrea-smug.png',
	'shy': '/img/mascot/lucrea-shy.png',
	'laughing': '/img/mascot/lucrea-laughing.png',
};

export class ModulePlayView {
	private container: HTMLElement;
	private module: LearningModule;
	private currentStepId: string;
	private onComplete?: () => void;
	private onExit?: () => void;

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
	}

	public render(): void {
		this.container.innerHTML = '';
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 1000;
			display: flex;
			flex-direction: column;
			background: linear-gradient(to bottom, #2a2a35 0%, #1a1a25 100%);
			padding: 0;
			margin: 0;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
		`;

		const currentStep = this.module.scenario.steps.find(s => s.id === this.currentStepId);
		if (!currentStep) return;

		// Top bar
		const topBar = this.createTopBar();
		this.container.appendChild(topBar);

		// Main VN area (character + dialogue, no gap)
		const vnArea = document.createElement('div');
		vnArea.style.cssText = `
			width: 100%;
			height: 100%;
			position: relative;
			overflow: hidden;
		`;

		// Character sprite area (fills remaining space)
		const spriteArea = this.createSpriteArea(currentStep);
		vnArea.appendChild(spriteArea);

		// Dialogue box (directly attached to bottom, no margin)
		const dialogueBox = this.createDialogueBox(currentStep);
		vnArea.appendChild(dialogueBox);

		this.container.appendChild(vnArea);
	}

	private createTopBar(): HTMLElement {
		const topBar = document.createElement('div');
		topBar.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			padding: 0.75rem 1.5rem;
			background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
			display: flex;
			justify-content: space-between;
			align-items: center;
			z-index: 100;
			box-sizing: border-box;
		`;

		const title = document.createElement('div');
		title.style.cssText = `
			font-family: var(--font-display);
			color: var(--color-accent-gold);
			font-size: 1rem;
		`;
		title.textContent = this.module.scenario.title;

		const exitBtn = document.createElement('button');
		exitBtn.className = 'btn btn-secondary';
		exitBtn.textContent = '← Çıkış';
		exitBtn.style.cssText = 'padding: 0.4rem 1rem; font-size: 0.9rem;';
		exitBtn.onclick = () => {
			if (confirm('Modülden çıkmak istediğinize emin misiniz?')) {
				// Remove overlay from body
				const overlay = document.getElementById('module-play-overlay');
				if (overlay) document.body.removeChild(overlay);
				if (this.onExit) this.onExit();
			}
		};

		topBar.appendChild(title);
		topBar.appendChild(exitBtn);
		return topBar;
	}

	private createSpriteArea(step: ModuleStep): HTMLElement {
		const spriteArea = document.createElement('div');
		spriteArea.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: flex-end;
			justify-content: flex-start;
			padding-left: 2rem;
			/* Extra padding bottom to account for fixed dialogue box height (200px) */
			padding-bottom: 200px; 
			box-sizing: border-box;
			background: 
				radial-gradient(ellipse at 30% 50%, rgba(139, 92, 8, 0.15) 0%, transparent 50%),
				radial-gradient(ellipse at 70% 30%, rgba(197, 160, 89, 0.1) 0%, transparent 40%),
				linear-gradient(to bottom, #2a2a35 0%, #1a1a25 100%);
			z-index: 1;
		`;

		const emotion = (step as any).emotion || 'neutral';
		const spriteUrl = EMOTION_SPRITES[emotion] || EMOTION_SPRITES['neutral'] || '/img/mascot/lucrea-neutral.png';

		// Character on LEFT side - smaller size
		const sprite = document.createElement('img');
		sprite.src = spriteUrl;
		sprite.alt = 'Lucrea';
		sprite.style.cssText = `
			height: 380px;
			max-height: 100%;
			width: auto;
			object-fit: contain;
			filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
			animation: vnFadeIn 0.5s ease-out;
			margin-left: 1rem;
		`;

		spriteArea.appendChild(sprite);
		return spriteArea;
	}

	private createDialogueBox(step: ModuleStep): HTMLElement {
		const dialogueContainer = document.createElement('div');
		dialogueContainer.style.cssText = `
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 200px;
			background: linear-gradient(to bottom, rgba(15, 15, 20, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%);
			border-top: 3px solid var(--color-accent-gold);
			padding: 1.5rem 2rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
			box-sizing: border-box;
			z-index: 100;
			margin: 0;
			/* overflow: visible needed for floating continue button */
		`;

		// Speaker name (always visible)
		const speakerName = document.createElement('div');
		speakerName.style.cssText = `
			font-family: var(--font-display);
			color: var(--color-accent-gold);
			font-size: 1.2rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 1px;
			margin-bottom: 0.5rem;
		`;
		// Determine speaker name
		let displayName = 'Anlatıcı';
		if (step.speaker === 'mascot') {
			displayName = 'Lucrea';
		} else if (step.speaker && step.speaker !== 'narrator') {
			// Capitalize first letter of custom speaker
			displayName = step.speaker.charAt(0).toUpperCase() + step.speaker.slice(1);
		}

		speakerName.textContent = displayName;
		dialogueContainer.appendChild(speakerName);

		// Dialogue text
		const dialogueText = document.createElement('div');
		dialogueText.style.cssText = `
			color: var(--color-text-primary);
			font-size: 1.05rem;
			line-height: 1.7;
			flex: 1;
			overflow: hidden; /* No scroll as requested */
		`;
		dialogueText.innerHTML = this.formatContent(step.content);
		dialogueContainer.appendChild(dialogueText);

		// Actions
		const actions = this.createActions(step);
		if (actions) {
			// If it's the floating continue button, add to container directly
			if (actions.tagName === 'DIV' && actions.style.position === 'absolute') {
				dialogueContainer.appendChild(actions);
			} else {
				dialogueContainer.appendChild(actions);
			}
		}

		return dialogueContainer;
	}

	private createActions(step: ModuleStep): HTMLElement | null {
		const actionsContainer = document.createElement('div');
		actionsContainer.style.cssText = `
			display: flex;
			gap: 1rem;
			flex-wrap: wrap;
			margin-top: 0.5rem;
		`;

		if (step.type === 'choice' && step.choices) {
			step.choices.forEach(choice => {
				const choiceBtn = document.createElement('button');
				choiceBtn.className = 'vn-choice-btn';
				choiceBtn.textContent = choice.text.replace(/^[🏥🔍💬✨💪👁️📚]+\s*/, '');
				choiceBtn.style.cssText = `flex: 1; min-width: 200px;`;
				choiceBtn.onclick = () => {
					if (choice.feedback) {
						this.showFeedback(choice.feedback, () => {
							this.currentStepId = choice.nextStep;
							this.render();
						});
					} else {
						this.currentStepId = choice.nextStep;
						this.render();
					}
				};
				actionsContainer.appendChild(choiceBtn);
			});
		} else if (step.nextStep) {
			// Continue button as floating text above dialogue box
			const continueBtn = document.createElement('div');
			continueBtn.style.cssText = `
				position: absolute;
				bottom: 100%;
				right: 2rem;
				margin-bottom: 1rem;
				color: var(--color-accent-gold);
				font-family: var(--font-display);
				font-size: 1rem;
				cursor: pointer;
				animation: pulse 2s ease-in-out infinite;
				user-select: none;
				transition: transform 0.2s;
			`;
			continueBtn.textContent = 'Devam Et ▼';
			continueBtn.onmouseover = () => {
				continueBtn.style.transform = 'translateY(-4px)';
			};
			continueBtn.onmouseout = () => {
				continueBtn.style.transform = 'translateY(0)';
			};
			continueBtn.onclick = () => {
				this.currentStepId = step.nextStep!;
				this.render();
			};
			// Add to dialogue container instead of actions
			return continueBtn;
		} else if (step.id === 'conclusion' || step.nextStep === 'end') {
			const completeBtn = document.createElement('button');
			completeBtn.className = 'vn-continue-btn';
			completeBtn.textContent = '🎉 Modülü Tamamla';
			completeBtn.onclick = () => {
				if (this.onComplete) this.onComplete();
			};
			actionsContainer.appendChild(completeBtn);
		}

		return actionsContainer.children.length > 0 ? actionsContainer : null;
	}

	private formatContent(content: string): string {
		// Only split by double newlines for paragraphs
		// Single newlines will be treated as space by HTML default behavior (which makes them flow as text)
		let formatted = content
			.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-accent-gold);">$1</strong>');

		// Split by double newline to create paragraphs
		const paragraphs = formatted.split(/\n\n+/);

		return paragraphs.map(p => `<p style="margin-bottom: 1rem; line-height: 1.6;">${p.replace(/\n/g, ' ')}</p>`).join('');
	}

	private showFeedback(message: string, onContinue: () => void): void {
		const overlay = document.createElement('div');
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.8);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
			animation: fadeIn 0.3s;
		`;

		const feedbackBox = document.createElement('div');
		feedbackBox.style.cssText = `
			background: rgba(20, 20, 25, 0.95);
			border: 2px solid var(--color-accent-gold);
			border-radius: var(--radius-lg);
			padding: 2rem;
			max-width: 500px;
			text-align: center;
			animation: slideUp 0.3s;
		`;

		feedbackBox.innerHTML = `
			<p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--color-text-primary);">
				${message}
			</p>
		`;

		const okBtn = document.createElement('button');
		okBtn.className = 'btn btn-primary';
		okBtn.textContent = 'Devam';
		okBtn.style.padding = '0.75rem 2rem';
		okBtn.onclick = () => {
			document.body.removeChild(overlay);
			onContinue();
		};

		feedbackBox.appendChild(okBtn);
		overlay.appendChild(feedbackBox);
		document.body.appendChild(overlay);
	}
}
