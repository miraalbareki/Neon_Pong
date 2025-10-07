// Game Customization Modal Interface
import { 
  GameCustomizationManager, 
  GameCustomizationSettings, 
  AVAILABLE_POWER_UPS, 
  PowerUpDefinition 
} from './GameCustomization.js';

export interface CustomizationModalOptions {
  mode: 'pre-game' | 'in-game' | 'profile';
  availableFeatures?: string[]; // Which features to show
  onApply?: (settings: GameCustomizationSettings) => void;
  onClose?: () => void;
}

export class GameCustomizationModal {
  private modal: HTMLElement | null = null;
  private customization: GameCustomizationManager;
  private options: CustomizationModalOptions;
  private currentSettings: GameCustomizationSettings;

  constructor(options: CustomizationModalOptions) {
    this.options = options;
    this.customization = GameCustomizationManager.getInstance();
    this.currentSettings = this.customization.getSettings();
  }

  public show(): void {
    this.createModal();
    this.modal!.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  public hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
      if (this.options.onClose) {
        this.options.onClose();
      }
    }
  }

  private createModal(): void {
    // Remove existing modal if any
    const existingModal = document.getElementById('game-customization-modal');
    if (existingModal) {
      existingModal.remove();
    }

    this.modal = document.createElement('div');
    this.modal.id = 'game-customization-modal';
    this.modal.className = 'game-customization-modal';
    
    this.modal.innerHTML = `
      <div class="customization-modal-backdrop"></div>
      <div class="customization-modal-content">
        <div class="customization-modal-header">
          <h2><i class="fas fa-cogs"></i> Game Customization</h2>
          <button class="close-btn" id="customization-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="customization-modal-body">
          ${this.renderPresets()}
          ${this.renderTabs()}
          <div class="customization-content" id="customization-content">
            ${this.renderVisualSettings()}
          </div>
        </div>
        
        <div class="customization-modal-footer">
          <button class="game-btn secondary" id="reset-defaults-btn">
            <i class="fas fa-undo"></i> Reset to Defaults
          </button>
          <div class="footer-actions">
            <button class="game-btn secondary" id="cancel-customization-btn">Cancel</button>
            <button class="game-btn primary" id="apply-customization-btn">
              <i class="fas fa-check"></i> Apply Settings
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();
  }

  private renderPresets(): string {
    return `
      <div class="customization-presets">
        <h3><i class="fas fa-magic"></i> Quick Presets</h3>
        <div class="preset-buttons">
          <button class="preset-btn" data-preset="default">
            <i class="fas fa-balance-scale"></i>
            <span>Default</span>
            <small>Balanced gameplay</small>
          </button>
          <button class="preset-btn" data-preset="chaotic">
            <i class="fas fa-bolt"></i>
            <span>Chaotic</span>
            <small>Maximum chaos!</small>
          </button>
        </div>
      </div>
    `;
  }

  private renderTabs(): string {
    return `
      <div class="customization-tabs">
        <button class="tab-btn active" data-tab="visual">
          <i class="fas fa-paint-brush"></i> Visual
        </button>
        <button class="tab-btn" data-tab="powerups">
          <i class="fas fa-magic"></i> Power-ups
        </button>
      </div>
    `;
  }

  private renderVisualSettings(): string {
    return `
      <div class="settings-section active" data-section="visual">
        <div class="settings-grid">
          <div class="setting-group">
            <label for="theme-select">Theme</label>
            <select id="theme-select" value="${this.currentSettings.theme}">
              <option value="neon">Neon Cyber</option>
              <option value="retro">Retro Arcade</option>
              <option value="dark">Dark Mode</option>
              <option value="space">Space Explorer</option>
              <option value="classic">Classic White</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="map-variant-select">Map Variant</label>
            <select id="map-variant-select" value="${this.currentSettings.mapVariant}">
              <option value="classic">Classic Arena</option>
              <option value="obstacles">With Obstacles</option>
              <option value="moving_walls">Moving Walls</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label class="checkbox-label">
              <input type="checkbox" id="ball-trail-checkbox" ${this.currentSettings.ballTrail ? 'checked' : ''}>
              <span class="checkmark"></span>
              Ball Trail Effect
            </label>
          </div>
          
          <div class="setting-group">
            <label class="checkbox-label">
              <input type="checkbox" id="particle-effects-checkbox" ${this.currentSettings.particleEffects ? 'checked' : ''}>
              <span class="checkmark"></span>
              Particle Effects
            </label>
          </div>
          
          <div class="setting-group">
            <label class="checkbox-label">
              <input type="checkbox" id="screen-shake-checkbox" ${this.currentSettings.screenShake ? 'checked' : ''}>
              <span class="checkmark"></span>
              Screen Shake
            </label>
          </div>
          
          <div class="setting-group">
            <label class="checkbox-label">
              <input type="checkbox" id="sound-effects-checkbox" ${this.currentSettings.soundEffects ? 'checked' : ''}>
              <span class="checkmark"></span>
              Sound Effects
            </label>
          </div>
          
          <div class="setting-group">
            <label for="volume-slider">Volume: <span id="volume-value">${this.currentSettings.volume}%</span></label>
            <input type="range" id="volume-slider" min="0" max="100" value="${this.currentSettings.volume}" class="slider">
          </div>
        </div>
      </div>
    `;
  }


  private renderPowerUpSettings(): string {
    return `
      <div class="settings-section active" data-section="powerups">
        <div class="powerups-header">
          <div class="setting-group">
            <label class="checkbox-label">
              <input type="checkbox" id="powerups-enabled-checkbox" ${this.currentSettings.powerUpsEnabled ? 'checked' : ''}>
              <span class="checkmark"></span>
              Enable Power-ups
            </label>
          </div>
          
          <div class="setting-group">
            <label for="powerup-frequency-select">Power-up Frequency</label>
            <select id="powerup-frequency-select" value="${this.currentSettings.powerUpFrequency}" ${!this.currentSettings.powerUpsEnabled ? 'disabled' : ''}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div class="powerups-selection ${!this.currentSettings.powerUpsEnabled ? 'disabled' : ''}">
          ${this.renderPowerUpCategories()}
        </div>
      </div>
    `;
  }

  private renderPowerUpCategories(): string {
    const categories = ['offensive', 'defensive', 'utility'] as const;
    
    return categories.map(category => `
      <div class="powerup-category">
        <h4><i class="fas fa-${this.getCategoryIcon(category)}"></i> ${category.charAt(0).toUpperCase() + category.slice(1)} Power-ups</h4>
        <div class="powerup-grid">
          ${AVAILABLE_POWER_UPS
            .filter(p => p.category === category)
            .map(powerUp => this.renderPowerUpOption(powerUp))
            .join('')}
        </div>
      </div>
    `).join('');
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      offensive: 'sword',
      defensive: 'shield',
      utility: 'tools'
    };
    return icons[category as keyof typeof icons] || 'star';
  }

  private renderPowerUpOption(powerUp: PowerUpDefinition): string {
    const isSelected = this.currentSettings.selectedPowerUps.includes(powerUp.id);
    return `
      <div class="powerup-option ${isSelected ? 'selected' : ''}" data-powerup="${powerUp.id}">
        <div class="powerup-icon">${powerUp.icon}</div>
        <div class="powerup-info">
          <div class="powerup-name">${powerUp.name}</div>
          <div class="powerup-description">${powerUp.description}</div>
          <div class="powerup-rarity rarity-${powerUp.rarity}">${powerUp.rarity}</div>
        </div>
        <div class="powerup-checkbox">
          <input type="checkbox" ${isSelected ? 'checked' : ''}>
        </div>
      </div>
    `;
  }




  private attachEventListeners(): void {
    if (!this.modal) return;

    // Close modal handlers
    const closeBtn = this.modal.querySelector('#customization-close-btn');
    const cancelBtn = this.modal.querySelector('#cancel-customization-btn');
    const backdrop = this.modal.querySelector('.customization-modal-backdrop');

    [closeBtn, cancelBtn, backdrop].forEach(element => {
      element?.addEventListener('click', () => this.hide());
    });

    // Preset buttons
    this.modal.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = (e.currentTarget as HTMLElement).dataset.preset as any;
        this.applyPreset(preset);
      });
    });

    // Tab navigation
    this.modal.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = (e.currentTarget as HTMLElement).dataset.tab;
        this.switchTab(tabName!);
      });
    });

    // Settings inputs
    this.attachSettingsListeners();

    // Apply button
    const applyBtn = this.modal.querySelector('#apply-customization-btn');
    applyBtn?.addEventListener('click', () => this.applySettings());

    // Reset button
    const resetBtn = this.modal.querySelector('#reset-defaults-btn');
    resetBtn?.addEventListener('click', () => this.resetToDefaults());
  }

  private attachSettingsListeners(): void {
    if (!this.modal) return;

    // Theme selection
    const themeSelect = this.modal.querySelector('#theme-select') as HTMLSelectElement;
    themeSelect?.addEventListener('change', (e) => {
      this.currentSettings.theme = (e.target as HTMLSelectElement).value as any;
      this.previewSettings();
    });

    // Map variant
    const mapSelect = this.modal.querySelector('#map-variant-select') as HTMLSelectElement;
    mapSelect?.addEventListener('change', (e) => {
      this.currentSettings.mapVariant = (e.target as HTMLSelectElement).value as any;
      this.previewSettings();
    });


    // Power-up frequency
    const powerupFrequencySelect = this.modal.querySelector('#powerup-frequency-select') as HTMLSelectElement;
    powerupFrequencySelect?.addEventListener('change', (e) => {
      this.currentSettings.powerUpFrequency = (e.target as HTMLSelectElement).value as any;
    });


    // Checkboxes
    const checkboxes = [
      { id: 'ball-trail-checkbox', prop: 'ballTrail' },
      { id: 'particle-effects-checkbox', prop: 'particleEffects' },
      { id: 'screen-shake-checkbox', prop: 'screenShake' },
      { id: 'sound-effects-checkbox', prop: 'soundEffects' },
      { id: 'powerups-enabled-checkbox', prop: 'powerUpsEnabled' }
    ];

    checkboxes.forEach(({ id, prop }) => {
      const checkbox = this.modal!.querySelector(`#${id}`) as HTMLInputElement;
      checkbox?.addEventListener('change', (e) => {
        (this.currentSettings as any)[prop] = (e.target as HTMLInputElement).checked;
        if (prop === 'powerUpsEnabled') {
          this.togglePowerUpSection();
        }
        this.previewSettings();
      });
    });

    // Sliders
    const sliders = [
      { id: 'volume-slider', prop: 'volume', valueId: 'volume-value', suffix: '%' }
    ];

    sliders.forEach(({ id, prop, valueId, suffix = '' }) => {
      const slider = this.modal!.querySelector(`#${id}`) as HTMLInputElement;
      const valueSpan = this.modal!.querySelector(`#${valueId}`);
      
      slider?.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        (this.currentSettings as any)[prop] = value;
        if (valueSpan) valueSpan.textContent = `${value}${suffix}`;
        this.previewSettings();
      });
    });

    // Power-up selection
    this.modal.querySelectorAll('.powerup-option').forEach(option => {
      option.addEventListener('click', () => {
        this.togglePowerUp((option as HTMLElement).dataset.powerup!);
      });
    });
  }

  private switchTab(tabName: string): void {
    if (!this.modal) return;

    console.log('🔄 Switching to tab:', tabName);

    // Update tab buttons
    this.modal.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.remove('active');
    });
    this.modal.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update content
    const content = this.modal.querySelector('#customization-content');
    if (content) {
      // Clear existing content
      content.innerHTML = '';
      
      let sectionHtml = '';
      switch (tabName) {
        case 'visual':
          console.log('📱 Rendering visual settings');
          sectionHtml = this.renderVisualSettings();
          break;
        case 'powerups':
          console.log('⚡ Rendering power-up settings');
          sectionHtml = this.renderPowerUpSettings();
          break;
        default:
          console.warn('❌ Unknown tab:', tabName);
          return;
      }
      
      // Set content and ensure the section is visible
      content.innerHTML = sectionHtml;
      console.log('✅ Content set for tab:', tabName, 'HTML length:', sectionHtml.length);
      
      // Find the settings section and make sure it's active
      const settingsSection = content.querySelector('.settings-section');
      if (settingsSection) {
        settingsSection.classList.add('active');
        console.log('✅ Added active class to settings section');
      } else {
        console.warn('❌ Settings section not found in content');
      }
      
      this.attachSettingsListeners();
      console.log('✅ Attached settings listeners for tab:', tabName);
    } else {
      console.error('❌ Content container not found');
    }
  }

  private togglePowerUp(powerUpId: string): void {
    const index = this.currentSettings.selectedPowerUps.indexOf(powerUpId);
    if (index > -1) {
      this.currentSettings.selectedPowerUps.splice(index, 1);
    } else {
      this.currentSettings.selectedPowerUps.push(powerUpId);
    }
    
    // Update UI
    const option = this.modal?.querySelector(`[data-powerup="${powerUpId}"]`);
    const checkbox = option?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (option && checkbox) {
      option.classList.toggle('selected');
      checkbox.checked = this.currentSettings.selectedPowerUps.includes(powerUpId);
    }
  }

  private togglePowerUpSection(): void {
    const section = this.modal?.querySelector('.powerups-selection');
    const frequencySelect = this.modal?.querySelector('#powerup-frequency-select') as HTMLSelectElement;
    
    if (section && frequencySelect) {
      if (this.currentSettings.powerUpsEnabled) {
        section.classList.remove('disabled');
        frequencySelect.disabled = false;
      } else {
        section.classList.add('disabled');
        frequencySelect.disabled = true;
      }
    }
  }

  private applyPreset(preset: 'default' | 'chaotic'): void {
    this.customization.applyPreset(preset);
    this.currentSettings = this.customization.getSettings();
    
    // Refresh the current tab
    const activeTab = this.modal?.querySelector('.tab-btn.active') as HTMLElement;
    if (activeTab) {
      this.switchTab(activeTab.dataset.tab!);
    }
    
    this.previewSettings();
  }

  private previewSettings(): void {
    // Apply settings immediately for live preview
    this.customization.updateSettings(this.currentSettings);
  }

  private applySettings(): void {
    this.customization.updateSettings(this.currentSettings);
    
    if (this.options.onApply) {
      this.options.onApply(this.currentSettings);
    }
    
    this.hide();
  }

  private resetToDefaults(): void {
    this.customization.resetToDefaults();
    this.currentSettings = this.customization.getSettings();
    
    // Refresh current tab
    const activeTab = this.modal?.querySelector('.tab-btn.active') as HTMLElement;
    if (activeTab) {
      this.switchTab(activeTab.dataset.tab!);
    }
  }
}

// Utility function to show customization modal
export function showGameCustomizationModal(options: CustomizationModalOptions = { mode: 'pre-game' }): GameCustomizationModal {
  const modal = new GameCustomizationModal(options);
  modal.show();
  return modal;
}