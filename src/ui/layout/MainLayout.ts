/**
 * D&D Experiential Learning Platform - Main Layout
 * Manages the 3-pane structural skeleton of the application.
 */

export class MainLayout {
	private container: HTMLElement;
	private mainElement: HTMLElement | null = null;
	private traitsElement: HTMLElement | null = null;

	constructor(containerId: string = 'app') {
		const el = document.getElementById(containerId);
		if (!el) throw new Error(`Container #${containerId} not found`);
		this.container = el;
	}

	/**
	 * Renders the initial layout structure
	 */
	public render(): void {
		this.container.innerHTML = `
			<header class="app-header">
				<div class="header-left">
					<h1>DICE & DESTINY</h1>
				</div>
				<nav class="app-nav">
					<button class="nav-btn" data-target="home">ANA SAYFA</button>
					<button class="nav-btn" data-target="list">Karakterler</button>
					<button class="nav-btn" data-target="modules">Eğitim Modülleri</button>
					<button class="nav-btn" data-target="profile">Profil</button>
				</nav>
				<div class="header-right" style="display: flex; align-items: center; gap: 1rem;">
					<div id="header-actions"></div>
					<button class="burger-btn" id="burger-toggle">☰</button>
				</div>
			</header>
			
			<!-- Mobile Menu Overlay -->
			<div class="mobile-menu-overlay" id="mobile-menu">
				<button class="mobile-nav-btn" data-target="home">ANA SAYFA</button>
				<button class="mobile-nav-btn" data-target="list">Karakterler</button>
				<button class="mobile-nav-btn" data-target="modules">Eğitim Modülleri</button>
				<button class="mobile-nav-btn" data-target="profile">Profil</button>
				<button class="mobile-nav-btn" id="close-mobile-menu" style="color: var(--color-accent-red); margin-top: 2rem;">KAPAT</button>
			</div>
			
			<main class="app-main" id="app-main">
				<!-- Main view content will be injected here -->
			</main>
			
			<section class="app-log" id="app-traits">
				<!-- Traits panel content will be injected here -->
			</section>
			
			<footer class="app-footer">
				<p>Dice & Destiny • SRD 5.2.1 Uyumlu • ❤️ ile yapıldı</p>
			</footer>
		`;

		this.mainElement = document.getElementById('app-main');
		this.traitsElement = document.getElementById('app-traits');

		this.setupMobileMenu();
	}

	private setupMobileMenu(): void {
		const burgerBtn = document.getElementById('burger-toggle');
		const mobileMenu = document.getElementById('mobile-menu');
		const closeBtn = document.getElementById('close-mobile-menu');
		const mobileLinks = mobileMenu?.querySelectorAll('.mobile-nav-btn');

		if (burgerBtn && mobileMenu) {
			burgerBtn.addEventListener('click', () => {
				mobileMenu.classList.add('active');
			});
		}

		if (closeBtn && mobileMenu) {
			closeBtn.addEventListener('click', () => {
				mobileMenu.classList.remove('active');
			});
		}

		// Close menu when a link is clicked
		mobileLinks?.forEach(link => {
			if (link.id !== 'close-mobile-menu') {
				link.addEventListener('click', () => {
					mobileMenu?.classList.remove('active');
				});
			}
		});
	}

	/**
	 * Sets the content of the main view area
	 */
	public setMainContent(content: string | HTMLElement): void {
		if (!this.mainElement) return;
		if (typeof content === 'string') {
			this.mainElement.innerHTML = content;
		} else {
			this.mainElement.innerHTML = '';
			this.mainElement.appendChild(content);
		}
	}

	public getMain(): HTMLElement | null { return this.mainElement; }
	public getTraits(): HTMLElement | null { return this.traitsElement; }
}
