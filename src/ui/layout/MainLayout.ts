/**
 * D&D Experiential Learning Platform - Main Layout
 * Manages the 3-pane structural skeleton of the application.
 */

export class MainLayout {
	private container: HTMLElement;
	private sidebarElement: HTMLElement | null = null;
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
				<h1>D&D Deneyimsel Öğrenme Platformu</h1>
				<div id="header-actions"></div>
			</header>
			
			<aside class="app-sidebar" id="app-sidebar">
				<!-- Sidebar content will be injected here -->
			</aside>
			
			<main class="app-main" id="app-main">
				<!-- Main view content will be injected here -->
			</main>
			
			<section class="app-log" id="app-traits">
				<!-- Traits panel content will be injected here -->
			</section>
			
			<footer class="app-footer">
				<p>D&D Deneyimsel Öğrenme Platformu • SRD 5.2.1 Uyumlu • ❤️ ile yapıldı</p>
			</footer>
		`;

		this.sidebarElement = document.getElementById('app-sidebar');
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

	/**
	 * Sets the content of the sidebar area
	 */
	public setSidebarContent(content: string | HTMLElement): void {
		if (!this.sidebarElement) return;
		if (typeof content === 'string') {
			this.sidebarElement.innerHTML = content;
		} else {
			this.sidebarElement.innerHTML = '';
			this.sidebarElement.appendChild(content);
		}
	}

	public getSidebar(): HTMLElement | null { return this.sidebarElement; }
	public getMain(): HTMLElement | null { return this.mainElement; }
	public getTraits(): HTMLElement | null { return this.traitsElement; }
}
