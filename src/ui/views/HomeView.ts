/**
 * HomeView.ts
 * The main landing dashboard for the application.
 */

export class HomeView {
	private container: HTMLElement;
	private onNavigate: (view: string) => void;

	constructor(container: HTMLElement, onNavigate: (view: string) => void) {
		this.container = container;
		this.onNavigate = onNavigate;
	}

	public render(): void {
		this.container.innerHTML = `
      <div class="home-view" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        
        <div class="hero-section" style="margin-bottom: 3rem; animation: fadeIn 1s ease-out;">
          <h1 style="font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(197, 160, 89, 0.5);">Maceraya Hoş Geldin</h1>
          <p style="font-size: 1.2rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto;">
            Zindanların derinliklerine in, efsanevi kahramanlar yarat ve kaderini zarların ucunda belirle.
          </p>
        </div>

        <div class="action-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; width: 100%; max-width: 900px;">
          
          <!-- Card 1: Create -->
          <button class="home-card" data-action="create" style="
            background: rgba(20, 20, 25, 0.7); 
            border: 1px solid var(--color-border); 
            padding: 2rem; 
            border-radius: var(--radius-lg); 
            cursor: pointer; 
            transition: all 0.3s; 
            backdrop-filter: blur(10px);
            text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 1rem;
          ">
            <div style="font-size: 3rem; color: var(--color-accent-gold);">⚔️</div>
            <h3 style="margin: 0; color: var(--color-text-heading);">Yeni Karakter</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-muted);">Sıfırdan bir efsane yarat.</p>
          </button>

          <!-- Card 2: Load -->
          <button class="home-card" data-action="list" style="
            background: rgba(20, 20, 25, 0.7); 
            border: 1px solid var(--color-border); 
            padding: 2rem; 
            border-radius: var(--radius-lg); 
            cursor: pointer; 
            transition: all 0.3s; 
            backdrop-filter: blur(10px);
            text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 1rem;
          ">
            <div style="font-size: 3rem; color: var(--color-accent-blue);">📜</div>
            <h3 style="margin: 0; color: var(--color-text-heading);">Karakterlerim</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-muted);">Kayıtlı kahramanlarına göz at.</p>
          </button>

          <!-- Card 3: Combat -->
          <button class="home-card" data-action="combat" style="
            background: rgba(20, 20, 25, 0.7); 
            border: 1px solid var(--color-border); 
            padding: 2rem; 
            border-radius: var(--radius-lg); 
            cursor: pointer; 
            transition: all 0.3s; 
            backdrop-filter: blur(10px);
            text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 1rem;
          ">
            <div style="font-size: 3rem; color: var(--color-accent-red);">🔥</div>
            <h3 style="margin: 0; color: var(--color-text-heading);">Savaş Simülasyonu</h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-muted);">Taktiksel yeteneklerini test et.</p>
          </button>

        </div>
      </div>
    `;

		// Add Hover Effects via JS (or improved CSS later)
		const cards = this.container.querySelectorAll('.home-card');
		cards.forEach(card => {
			card.addEventListener('mouseenter', () => {
				(card as HTMLElement).style.transform = 'translateY(-10px)';
				(card as HTMLElement).style.borderColor = 'var(--color-accent-gold)';
				(card as HTMLElement).style.boxShadow = '0 0 30px rgba(197, 160, 89, 0.2)';
			});
			card.addEventListener('mouseleave', () => {
				(card as HTMLElement).style.transform = 'translateY(0)';
				(card as HTMLElement).style.borderColor = 'var(--color-border)';
				(card as HTMLElement).style.boxShadow = 'none';
			});
			card.addEventListener('click', () => {
				const action = (card as HTMLElement).getAttribute('data-action');
				if (action === 'create') {
					// Special case: Create character logic needs to be triggered
					// Ideally we pass a 'create' action, but 'builder' view expects state reset.
					// For now, let's navigate to 'builder' but we might need a distinct callback.
					// The App class handles 'create' via a separate method usually.
					// Hack: Navigate to builder directly for UI demo, standard flow handles reset.
					this.onNavigate('builder');
				} else if (action) {
					this.onNavigate(action);
				}
			});
		});
	}
}
