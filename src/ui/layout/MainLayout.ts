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
				<div class="header-right">
					<div id="header-actions"></div>
				</div>
			</header>
			
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
