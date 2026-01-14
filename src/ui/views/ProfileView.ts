/**
 * ProfileView.ts
 * Displays user profile, expertise, and stats.
 */

export class ProfileView {
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	public render(): void {
		this.container.innerHTML = `
      <div class="view-header">
        <h2>Kullanıcı Profili</h2>
        <p>Deneyim ve Uzmanlık Alanları</p>
      </div>

      <div class="concepts-grid">
        <!-- User Stats Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">İstatistikler</h3>
          </div>
          <div class="card-body">
            <div class="ability-scores">
              <div class="ability-score">
                <div class="ability-name">KARAKTERLER</div>
                <div class="ability-value">3</div>
              </div>
              <div class="ability-score">
                <div class="ability-name">SAVAŞLAR</div>
                <div class="ability-value">12</div>
              </div>
              <div class="ability-score">
                <div class="ability-name">SEVİYE</div>
                <div class="ability-value">5</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expertise Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Uzmanlıklar (Expertise)</h3>
          </div>
          <div class="card-body">
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-accent-gold);">✦</span> 
                <strong>Zindan Yönetimi (Dungeon Master)</strong>
              </li>
              <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-accent-gold);">✦</span> 
                <strong>Kural Bilgisi (Rules Lawyer)</strong>
              </li>
              <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--color-accent-gold);">✦</span> 
                <strong>Karakter Yaratma (Character Building)</strong>
              </li>
            </ul>
          </div>
        </div>

        <!-- System Status -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Sistem Durumu</h3>
          </div>
          <div class="card-body">
            <p><strong>Veritabanı:</strong> SRD 5.2.1 + Custom Lists</p>
            <p><strong>Eşya Sayısı:</strong> 244 (Unique)</p>
            <p><strong>Dükkanlar:</strong> 12 Kategori</p>
          </div>
        </div>
      </div>
    `;
	}
}
