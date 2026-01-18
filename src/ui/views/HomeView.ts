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
      <div class="home-view">
        
        <div class="home-hero">
          <h1 class="home-hero-title">Maceraya Hoş Geldin</h1>
          <p class="home-hero-subtitle">
            Zindanların derinliklerine in, efsanevi kahramanlar yarat ve kaderini zarların ucunda belirle.
          </p>
        </div>

        <div class="home-action-grid">
          
          <!-- Card 1: Create -->
          <button class="home-card" data-action="create">
            <div class="home-card-icon" style="color: var(--color-accent-gold);">⚔️</div>
            <div class="home-card-content">
              <h3 class="home-card-title">Yeni Karakter</h3>
              <p class="home-card-desc">Sıfırdan bir efsane yarat.</p>
            </div>
          </button>

          <!-- Card 2: Load -->
          <button class="home-card" data-action="list">
            <div class="home-card-icon" style="color: var(--color-accent-blue);">📜</div>
            <div class="home-card-content">
              <h3 class="home-card-title">Karakterlerim</h3>
              <p class="home-card-desc">Kayıtlı kahramanlarına göz at.</p>
            </div>
          </button>

          <!-- Card 3: Learning Modules -->
          <button class="home-card" data-action="modules">
            <div class="home-card-icon" style="color: #fbbf24;">🎓</div>
            <div class="home-card-content">
              <h3 class="home-card-title">Eğitim Modülleri</h3>
              <p class="home-card-desc">D&D dünyasını keşfet ve öğren.</p>
            </div>
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
