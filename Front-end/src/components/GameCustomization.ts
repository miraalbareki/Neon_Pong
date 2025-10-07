// Game Customization Component
// Provides unified customization options for all game modes

export interface GameCustomizationSettings {
  // Visual Customization
  theme: 'neon' | 'retro' | 'dark' | 'space' | 'classic';
  ballTrail: boolean;
  particleEffects: boolean;
  screenShake: boolean;
  
  // Audio Settings
  soundEffects: boolean;

  volume: number;
  
  // Gameplay Customization
  powerUpsEnabled: boolean;
  powerUpFrequency: 'low' | 'medium' | 'high';
  selectedPowerUps: string[];

  // Advanced Features
  mapVariant: 'classic' | 'obstacles' | 'moving_walls';
  
}

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'offensive' | 'defensive' | 'utility';
  duration?: number;
  rarity: 'common' | 'rare' | 'epic';
}

// Available power-ups for all game modes
export const AVAILABLE_POWER_UPS: PowerUpDefinition[] = [
  // Offensive Power-ups
  {
    id: 'multi_ball',
    name: 'Multi Ball',
    description: 'Splits the ball into multiple balls',
    icon: '⚫',
    category: 'offensive',
    duration: 10000,
    rarity: 'epic'
  },
  {
    id: 'freeze_opponent',
    name: 'Ice Freeze',
    description: 'Temporarily freezes opponent movement',
    icon: '❄️',
    category: 'offensive',
    duration: 3000,
    rarity: 'epic'
  },

  
  // Defensive Power-ups
  {
    id: 'paddle_size_boost',
    name: 'Paddle Boost',
    description: 'Increases your paddle size',
    icon: '📏',
    category: 'defensive',
    duration: 10000,
    rarity: 'common'
  },
  
  // Utility Power-ups
  {
    id: 'paddle_speed_boost',
    name: 'Swift Paddle',
    description: 'Increases paddle movement speed',
    icon: '💨',
    category: 'utility',
    duration: 8000,
    rarity: 'common'
  },
  {
    id: 'invisible_ball',
    name: 'Ghost Ball',
    description: 'Makes the ball temporarily invisible',
    icon: '👻',
    category: 'utility',
    duration: 4000,
    rarity: 'epic'
  }
];

// Default customization settings
export const DEFAULT_CUSTOMIZATION: GameCustomizationSettings = {
  theme: 'neon',
  ballTrail: false,
  particleEffects: false,
  screenShake: false,
  soundEffects: false,
  powerUpsEnabled: true,
  powerUpFrequency: 'medium',
  selectedPowerUps: ['paddle_size_boost', 'paddle_speed_boost'],
  mapVariant: 'classic',
  volume: 50,
};

export const CHAOTIC_CUSTOMIZATION: GameCustomizationSettings = {
  ballTrail: true,
  particleEffects: true,
  screenShake: true,
  soundEffects: true,
  powerUpsEnabled: true,
  powerUpFrequency: 'high',
  selectedPowerUps: AVAILABLE_POWER_UPS.map(p => p.id),
  theme: 'retro',
  mapVariant: 'obstacles',
  volume: 50,
};

export class GameCustomizationManager {
  private static instance: GameCustomizationManager;
  private settings: GameCustomizationSettings;
  private onSettingsChange?: (settings: GameCustomizationSettings) => void;

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): GameCustomizationManager {
    if (!GameCustomizationManager.instance) {
      GameCustomizationManager.instance = new GameCustomizationManager();
    }
    return GameCustomizationManager.instance;
  }

  public getSettings(): GameCustomizationSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<GameCustomizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Update global window object for immediate access
    (window as any).gameCustomizationSettings = this.settings;
    
    // Notify current game if running
    if ((window as any).currentGame && typeof (window as any).currentGame.updateConfig === 'function') {
      (window as any).currentGame.updateConfig(this.settings);
    }
    
    // Trigger callback
    if (this.onSettingsChange) {
      this.onSettingsChange(this.settings);
    }
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_CUSTOMIZATION };
    this.saveSettings();
    (window as any).gameCustomizationSettings = this.settings;
  }

  public onSettingsChanged(callback: (settings: GameCustomizationSettings) => void): void {
    this.onSettingsChange = callback;
  }

  private loadSettings(): GameCustomizationSettings {
    try {
      const saved = localStorage.getItem('gameCustomizationSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Merge with defaults to ensure all new properties are present
        const mergedSettings = { ...DEFAULT_CUSTOMIZATION, ...parsedSettings };
        (window as any).gameCustomizationSettings = mergedSettings;
        return mergedSettings;
      }
    } catch (error) {
      console.warn('Failed to load customization settings:', error);
    }
    
    const defaultSettings = { ...DEFAULT_CUSTOMIZATION };
    (window as any).gameCustomizationSettings = defaultSettings;
    return defaultSettings;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('gameCustomizationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save customization settings:', error);
    }
  }

  // Preset configurations for quick setup
  public applyPreset(preset: 'default' | 'competitive' | 'casual' | 'chaotic'): void {
    const presets: Record<string, GameCustomizationSettings> = {
      default: DEFAULT_CUSTOMIZATION,
      chaotic: {
        ...CHAOTIC_CUSTOMIZATION,
        powerUpsEnabled: true,
        powerUpFrequency: 'high' as const,
        selectedPowerUps: AVAILABLE_POWER_UPS.map(p => p.id),
        theme: 'space' as const,
        ballTrail: true,
        particleEffects: true,
        screenShake: true,
        mapVariant: 'obstacles' as const
      }
    };
    
    this.updateSettings(presets[preset]);
  }

  // Get power-ups by category
  public getPowerUpsByCategory(category: 'offensive' | 'defensive' | 'utility'): PowerUpDefinition[] {
    return AVAILABLE_POWER_UPS.filter(powerUp => powerUp.category === category);
  }

  // Check if a specific power-up is enabled
  public isPowerUpEnabled(powerUpId: string): boolean {
    return this.settings.powerUpsEnabled && this.settings.selectedPowerUps.includes(powerUpId);
  }

  // Convert settings to GameConfig format for PongGame
  public toGameConfig(): any {
    return {
      theme: this.settings.theme,
      powerUpsEnabled: this.settings.powerUpsEnabled,
      powerUpTypes: this.settings.selectedPowerUps,
      // Visual effects
      ballTrail: this.settings.ballTrail,
      particleEffects: this.settings.particleEffects,
      screenShake: this.settings.screenShake,
      // Audio settings
      soundEffects: this.settings.soundEffects,
      volume: this.settings.volume,
      // Map variant
      mapVariant: this.settings.mapVariant
    };
  }
}

// Initialize the manager and make it globally available
export const gameCustomization = GameCustomizationManager.getInstance();