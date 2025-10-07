export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  ballSize: number;
  paddleSpeed: number;
  ballSpeed: number;
  maxScore: number;
  // Visual Customization
  theme?: 'neon' | 'retro' | 'dark' | 'space' | 'classic';
  ballTrail?: boolean;
  particleEffects?: boolean;
  screenShake?: boolean;
  // Audio Settings
  soundEffects?: boolean;
  volume?: number;
  // Gameplay Customization
  powerUpsEnabled?: boolean;
  attacksEnabled?: boolean; // reserved for future use
  powerUpTypes?: Array<'paddle_size' | 'paddle_speed' | 'multi_ball' | 'freeze_opponent' | 'invisible_ball'>;
  powerUpFrequency?: 'low' | 'medium' | 'high';
  // Map Features
  mapVariant?: 'classic' | 'obstacles' | 'moving_walls';
  // Player-specific power-ups
  player1PowerUps?: { [key: string]: number }; // power-up type -> remaining uses
  player2PowerUps?: { [key: string]: number }; // power-up type -> remaining uses
}

export interface Player {
  id: string;
  name: string;
  score: number;
  y: number;
  isAI?: boolean;
  temporaryPaddleBoostUntilMs?: number;
  temporaryPaddleSlowUntilMs?: number;
  temporaryPaddleSpeedBoostUntilMs?: number;
}

export interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  radius: number;
  lastHitBy?: string;
  temporaryInvisibleUntilMs?: number;
}

export interface PowerUpCollectible {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  spawnTime: number;
  duration: number; // How long it stays on field before disappearing
  collected: boolean;
  glowPhase: number; // For animation
}

export type PowerUpType = 
  | 'paddle_size_boost' | 'paddle_speed_boost'| 'multi_ball'
  | 'freeze_opponent' | 'invisible_ball';

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  winner: Player | null;
  startTime: number;
  elapsedTime: number;
}

interface PowerUp {
  x: number;
  y: number;
  radius: number;
  type: 'paddle_size' | 'paddle_speed' | 'multi_ball' | 'freeze_opponent' | 'invisible_ball';
  active: boolean;
  collector?: 'player1' | 'player2';
}

// AI System Interfaces
interface AIGameState {
  ball: Ball;
  extraBalls: Ball[];
  player1: Player;
  player2: Player;
  powerUps: PowerUp[];
  timestamp: number;
}

interface BallPrediction {
  x: number;
  y: number;
  timeToReach: number;
  willHitPaddle: boolean;
  bounces: number;
}

// @ts-ignore
interface AIStrategy {
  mode: 'defensive' | 'aggressive' | 'balanced';
  targetY: number;
  confidence: number;
  shouldCollectPowerUp: boolean;
  targetPowerUp?: PowerUp;
}

interface AIPersonality {
  reactionDelay: number;        // 100-300ms delay
  predictionAccuracy: number;   // 0.7-0.95 (70%-95% accuracy)
  speedVariation: number;       // 0.8-1.2 speed multiplier
  aggressiveness: number;       // 0.3-0.8 (how aggressive in returns)
  powerUpPriority: number;      // 0.4-0.9 (likelihood to go for power-ups)
}

export class PongGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private player1: Player;
  private player2: Player;
  private ball: Ball;
  private gameState: GameState;
  private keys: { [key: string]: boolean } = {};
  private animationId: number | null = null;
  private onGameEnd?: (winner: Player, gameTime: number) => void;
  private onScoreUpdate?: (player1Score: number, player2Score: number) => void;
  private nextHitCurveFor: 'player1' | 'player2' | null = null;
  private extraBalls: Ball[] = [];
  private collectedPowerUps: PowerUp[] = [];
  
  // Floating Powerup Orbs
  private floatingPowerUps: PowerUp[] = [];
  private lastPowerUpSpawnAtMs = 0;
  private powerUpSpawnInterval = 15000; // 15 seconds between spawns
  
  // Visual Effects
  private ballTrail: { x: number; y: number; time: number; alpha: number }[] = [];
  private particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[] = [];
  private screenShakeOffset: { x: number; y: number } = { x: 0, y: 0 };
  private screenShakeIntensity: number = 0;
  private screenShakeDecay: number = 0.95;
  
  // Map Variants
  private obstacles: { x: number; y: number; width: number; height: number; type: 'static' | 'moving' }[] = [];
  private movingWalls: { x: number; y: number; width: number; height: number; direction: 'up' | 'down'; speed: number }[] = [];
  
  // Collectible Power-ups System - DISABLED
  // private collectiblePowerUps: PowerUpCollectible[] = [];
  // private lastCollectibleSpawnAtMs = 0;
  // private collectibleSpawnInterval = 3000;
  // private collectibleLifetime = 20000;

  // [ADDED BY HANIEH]
  public matchId?: number;
  public tournamentId?: number;

  // Advanced AI System Properties
  // @ts-ignore
  private aiGameState: AIGameState | null = null;
  // private aiLastUpdateTime = 0; // Unused
  // private aiUpdateInterval = 1000; // Unused
  private aiPersonality: AIPersonality = {
    predictionAccuracy: 0.8,
    aggressiveness: 0.5,
    powerUpPriority: 0.3,
    reactionDelay: 100,
    speedVariation: 0.9
  };
  // private aiCurrentStrategy: AIStrategy; // Unused variable
  // private aiReactionQueue: Array<{action: 'up' | 'down' | 'stop', executeAt: number}> = []; // Unused variable
  // @ts-ignore
  private aiPredictionHistory: BallPrediction[] = [];
  private aiDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

  constructor(canvas: HTMLCanvasElement, config?: Partial<GameConfig>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Default configuration
    this.config = {
      canvasWidth: 800,
      canvasHeight: 400,
      paddleWidth: 12,
      paddleHeight: 80,
      ballSize: 8,
      paddleSpeed: 6,
      ballSpeed: 4,
      maxScore: 5,
      theme: 'neon',
      soundEffects: true,
      volume: 70,
      powerUpsEnabled: true,
      attacksEnabled: false,
      powerUpTypes: ['paddle_size', 'paddle_speed', 'multi_ball', 'freeze_opponent', 'invisible_ball'],
      ...config
    };
    
    // Debug: Log final config after merge
    console.log('🎮 PongGame Constructor - Final config after merge:');
    console.log('   - ballSpeed:', this.config.ballSpeed);
    console.log('   - paddleSpeed:', this.config.paddleSpeed);

    // Set canvas size
    this.canvas.width = this.config.canvasWidth;
    this.canvas.height = this.config.canvasHeight;

    // Initialize players
    this.player1 = {
      id: 'player1',
      name: 'Player 1',
      score: 0,
      y: this.config.canvasHeight / 2 - this.config.paddleHeight / 2
    };

    this.player2 = {
      id: 'player2',
  name: (config && (config as any).gameMode === 'ai') ? 'AI Opponent' : 'Player 2',
  score: 0,
  y: this.config.canvasHeight / 2 - this.config.paddleHeight / 2,
  isAI: (config && (config as any).gameMode === 'ai') ? true : false
    };

    // Initialize ball
    this.ball = {
      x: this.config.canvasWidth / 2,
      y: this.config.canvasHeight / 2,
      velocityX: this.config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      velocityY: this.config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      speed: this.config.ballSpeed,
      radius: this.config.ballSize
    };

    // Initialize game state
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      winner: null,
      startTime: 0,
      elapsedTime: 0
    };

    console.log('Game state initialized:', this.gameState);

    this.setupEventListeners();
    this.render();

    // Initialize AI personality based on difficulty
    this.initializeAIPersonality();
    
    // Initialize audio system
    this.initAudio();
    
    // Initialize map variant
    this.initializeMapVariant(this.config.mapVariant || 'classic');
  }

  // Public Methods
  public startGame(): void {
    console.log('Starting game...');
    console.log('Game state before start:', this.gameState);
    console.log('Player1:', this.player1);
    console.log('Player2:', this.player2);
    
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    this.gameState.startTime = Date.now();
    this.resetBall();
    this.animationId = null;
    this.gameLoop();
    
    console.log('Game started successfully');
  }

  public pauseGame(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
    if (!this.gameState.isPaused) {
      this.gameLoop();
    }
  }

  public resetGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    this.gameState.winner = null;
    this.player1.score = 0;
    this.player2.score = 0;
    this.player1.temporaryPaddleBoostUntilMs = undefined;
    this.player2.temporaryPaddleBoostUntilMs = undefined;
    this.player1.temporaryPaddleSlowUntilMs = undefined;
    this.player2.temporaryPaddleSlowUntilMs = undefined;
    this.player1.temporaryPaddleSpeedBoostUntilMs = undefined;
    this.player2.temporaryPaddleSpeedBoostUntilMs = undefined;
    this.ball.temporaryInvisibleUntilMs = undefined;
    // Clear powerup systems
    this.collectedPowerUps = [];
    this.floatingPowerUps = [];
    this.lastPowerUpSpawnAtMs = 0;
    this.extraBalls = [];
    this.resetBall();
    this.resetPaddles();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.render();
  }

  public setPlayer2AI(isAI: boolean): void {
    console.log('Setting Player2 AI to:', isAI);
    this.player2.isAI = isAI;
    console.log('Player2 isAI after setting:', this.player2.isAI);
  }

  public setPlayerNames(player1Name: string, player2Name: string): void {
    this.player1.name = player1Name;
    this.player2.name = player2Name;
    // Force a re-render to immediately update the names on canvas
    this.render();
  }

  public onGameEndCallback(callback: (winner: Player, gameTime: number) => void): void {
    this.onGameEnd = callback;
  }

  public onScoreUpdateCallback(callback: (player1Score: number, player2Score: number) => void): void {
    this.onScoreUpdate = callback;
  }

  public updateConfig(newConfig: Partial<GameConfig>): void {
    console.log('🔧 Updating game config:', newConfig);
    
    // Store previous config for comparison
    const previousConfig = { ...this.config };
    
    // Update config
    Object.assign(this.config, newConfig);
    
    // Apply visual changes immediately
    if (newConfig.theme && newConfig.theme !== previousConfig.theme) {
      console.log('🎨 Theme changed from', previousConfig.theme, 'to:', newConfig.theme);
      // The theme will be applied in the next render cycle automatically
    }
    
    // Handle power-up changes
    if (newConfig.powerUpsEnabled !== undefined) {
      if (!newConfig.powerUpsEnabled) {
        // Clear existing power-ups when disabled
        this.collectedPowerUps = [];
        this.floatingPowerUps = [];
        console.log('🔌 Power-ups disabled, clearing existing power-ups');
      } else {
        console.log('⚡ Power-ups enabled');
      }
    }
    
    // Handle power-up frequency changes
    if (newConfig.powerUpFrequency && this.config.powerUpsEnabled) {
      const frequencyMultipliers = { low: 2.0, medium: 1.0, high: 0.5 };
      const multiplier = frequencyMultipliers[newConfig.powerUpFrequency] || 1.0;
      // This would affect spawn timing in a full implementation
      console.log('🎯 Power-up frequency set to:', newConfig.powerUpFrequency, 'multiplier:', multiplier);
    }
    
    // Handle paddle size changes
    if (newConfig.paddleHeight) {
      this.config.paddleHeight = newConfig.paddleHeight;
      console.log('🏓 Paddle height updated to:', newConfig.paddleHeight);
    }
    
    // Handle audio settings
    if (newConfig.soundEffects !== undefined) {
      console.log('🔊 Sound effects:', newConfig.soundEffects ? 'enabled' : 'disabled');
    }
    
    if (newConfig.volume !== undefined) {
      console.log('🔉 Volume set to:', newConfig.volume + '%');
    }
    
    // Handle visual effects
    if (newConfig.ballTrail !== undefined) {
      console.log('🌟 Ball trail:', newConfig.ballTrail ? 'enabled' : 'disabled');
    }
    
    if (newConfig.particleEffects !== undefined) {
      console.log('✨ Particle effects:', newConfig.particleEffects ? 'enabled' : 'disabled');
    }
    
    if (newConfig.screenShake !== undefined) {
      console.log('📳 Screen shake:', newConfig.screenShake ? 'enabled' : 'disabled');
    }
    
    // Handle map variant changes
    if (newConfig.mapVariant && newConfig.mapVariant !== previousConfig.mapVariant) {
      console.log('🗺️ Map variant changed to:', newConfig.mapVariant);
      this.initializeMapVariant(newConfig.mapVariant);
    }
    
    console.log('✅ Game config updated:', this.config);
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getPlayers(): { player1: Player; player2: Player } {
    return {
      player1: { ...this.player1 },
      player2: { ...this.player2 }
    };
  }

  // Private Methods
  private setupEventListeners(): void {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = true;
      
      // Initialize audio context on first user interaction
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('🔊 Audio context resumed on user interaction');
        }).catch(error => {
          console.warn('❌ Failed to resume audio context:', error);
        });
      }
      
      // Prevent default for game control keys
      if (["arrowup", "arrowdown", "w", "s", " "].includes(key)) {
        e.preventDefault();
      }
      // Game controls
      if (key === ' ') {
        if (!this.gameState.isPlaying && !this.gameState.isGameOver) {
          // Start the game
          this.startGame();
        } else if (this.gameState.isPaused) {
          // Resume the game
          this.resumeGame();
        } else if (this.gameState.isPlaying) {
          // Pause the game
          this.pauseGame();
        }
      }
      
      // Player 1 power-up activation (A key)
      if (key === 'a') {
        if (this.gameState.isPlaying && this.config.powerUpsEnabled) {
          this.activateCollectedPowerUp('player1');
          console.log('🎮 Player 1 (A key) - activating power-up from inventory!');
        }
      }
      
      // Player 2 power-up activation (T key)
      if (key === 't') {
        if (this.gameState.isPlaying && this.config.powerUpsEnabled) {
          this.activateCollectedPowerUp('player2');
          console.log('🎮 Player 2 (T key) - activating power-up from inventory!');
        }
      }
      if (key === 'r') {
        this.resetGame();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  private gameLoop(): void {
    console.log('Game loop running - isPlaying:', this.gameState.isPlaying, 'isPaused:', this.gameState.isPaused, 'isGameOver:', this.gameState.isGameOver);
    
    if (!this.gameState.isPlaying || this.gameState.isPaused || this.gameState.isGameOver) {
      console.log('Game loop stopping because:', {
        notPlaying: !this.gameState.isPlaying,
        isPaused: this.gameState.isPaused,
        isGameOver: this.gameState.isGameOver
      });
      return;
    }

    this.update();
    this.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    console.log('Update method called - game state:', this.gameState);
    
    // Update elapsed time
    this.gameState.elapsedTime = Date.now() - this.gameState.startTime;

    // Update paddles
    this.updatePaddles();
    this.updateBall();
    
    // Update floating powerup orbs
    if (this.config.powerUpsEnabled) {
      this.updateFloatingPowerUps();
      this.spawnFloatingPowerUps();
    }
    
    // Update extra balls
    this.updateExtraBalls();

    // Update visual effects
    this.updateVisualEffects();

    // Update map variants
    this.updateMapVariants();

    // Check map collisions
    this.checkMapCollisions();

    // Check for scoring
    this.checkScoring();

    // Check for game end
    this.checkGameEnd();
  }

  private getEffectivePaddleSpeed(player: Player): number {
    let base = this.config.paddleSpeed;
    
    // Debug: Log paddle speed every 100 frames
    if (Math.random() < 0.01) {
      console.log('🎮 Paddle Speed Check - config.paddleSpeed:', this.config.paddleSpeed, 'base:', base);
    }
    
    const now = Date.now();
    if (player.temporaryPaddleSlowUntilMs && now < player.temporaryPaddleSlowUntilMs) {
      base *= 0.6;
    }
    if (player.temporaryPaddleSpeedBoostUntilMs && now < player.temporaryPaddleSpeedBoostUntilMs) {
      base *= 1.5;
    }
    return base;
  }

  private updatePaddles(): void {
    const p1Speed = this.getEffectivePaddleSpeed(this.player1);
    const p2Speed = this.getEffectivePaddleSpeed(this.player2);
  
    // Player 1 controls (W/S)
    if (this.keys['w']) {
      this.player1.y -= p1Speed;
    }
    if (this.keys['s']) {
      this.player1.y += p1Speed;
    }
  
    // Player 2 controls (Arrow Up/Down)
    if (!this.player2.isAI) {
      console.log('Player2 is NOT AI, using manual controls');
      if (this.keys['arrowup']) {
        this.player2.y -= p2Speed;
      }
      if (this.keys['arrowdown']) {
        this.player2.y += p2Speed;
      }
    } else {
      console.log('Player2 IS AI, calling updateAI...');
      this.updateAI(p2Speed);
      
      // Handle AI power-ups (inventory system only)
      // if (this.config.powerUpsEnabled) {
      //   this.handleAIPowerUps(); // Old floating powerup system - disabled
      // }
    }
  
    // Clamp paddles to canvas bounds
    this.clampPaddle(this.player1);
    this.clampPaddle(this.player2);
  }

  private updateAI(aiSpeed: number): void {
    console.log('AI updateAI called');
    
    // Simple AI: just follow the ball's Y position
    const ballY = this.ball.y;
    const paddleCenterY = this.player2.y + this.getPaddleHeight(this.player2) / 2;
    const difference = ballY - paddleCenterY;
    
    console.log('Ball Y:', ballY, 'Paddle Center Y:', paddleCenterY, 'Difference:', difference);
    
    if (Math.abs(difference) > 10) { // Dead zone to prevent jittering
      if (difference > 0) {
        console.log('AI moving DOWN');
        this.player2.y += aiSpeed;
      } else {
        console.log('AI moving UP');
        this.player2.y -= aiSpeed;
      }
    } else {
      console.log('AI staying still (in dead zone)');
    }
  }

  // @ts-ignore
  private predictBallTrajectory(ball: Ball): BallPrediction {
    // Simulate ball movement with physics
    let x = ball.x;
    let y = ball.y;
    let vx = ball.velocityX;
    let vy = ball.velocityY;
    let bounces = 0;
    let timeSteps = 0;
    const maxSteps = 1000; // Prevent infinite loops
    
    const paddleX = this.config.canvasWidth - this.config.paddleWidth * 2;
    
    // Add prediction error based on AI personality
    const errorFactor = 1 - this.aiPersonality.predictionAccuracy;
    const predictionError = (Math.random() - 0.5) * errorFactor * 100;
    
    while (x > paddleX && x < this.config.canvasWidth && timeSteps < maxSteps) {
      x += vx;
      y += vy;
      timeSteps++;
      
      // Handle wall bounces
      if (y <= 0 || y >= this.config.canvasHeight) {
        vy = -vy;
        y = Math.max(0, Math.min(y, this.config.canvasHeight));
        bounces++;
      }
      
      // Stop if ball is moving away from AI
      if (vx < 0) break;
    }
    
    return {
      x: x,
      y: y + predictionError,
      timeToReach: timeSteps,
      willHitPaddle: x >= paddleX && x <= this.config.canvasWidth,
      bounces: bounces
    };
  }

  // @ts-ignore
  private determineAIStrategy(prediction: BallPrediction): void {
    const scoreGap = this.player2.score - this.player1.score;
    const ballComingTowardsAI = this.ball.velocityX > 0;
    
    // Determine mode based on game state
    let mode: 'defensive' | 'aggressive' | 'balanced' = 'balanced';
    
    if (scoreGap < -2) {
      mode = 'aggressive'; // Behind, need to be more aggressive
    } else if (scoreGap > 2) {
      mode = 'defensive'; // Ahead, play it safe
    } else if (!ballComingTowardsAI) {
      mode = 'balanced'; // Ball going away, prepare position
    }
    
    // Calculate target position
    let targetY = this.config.canvasHeight / 2; // Default center position
    
    if (prediction.willHitPaddle && ballComingTowardsAI) {
      // Position to intercept the ball
      targetY = prediction.y;
      
      // Add strategic positioning based on aggressiveness
      if (mode === 'aggressive') {
        // Try to hit at an angle
        const paddleHeight = this.getPaddleHeight(this.player2);
        const offset = (Math.random() - 0.5) * paddleHeight * this.aiPersonality.aggressiveness;
        targetY += offset;
      }
    }
    
    // Old floating powerup system - disabled (using inventory system instead)
    // if (this.config.powerUpsEnabled && this.powerUps.length > 0) {
    //   const nearbyPowerUp = this.findNearestPowerUp();
    //   if (nearbyPowerUp && Math.random() < this.aiPersonality.powerUpPriority) {
    //     const distanceToPlayer = Math.abs(nearbyPowerUp.x - (this.config.canvasWidth - this.config.paddleWidth));
    //     const distanceToBall = Math.abs(this.ball.x - (this.config.canvasWidth - this.config.paddleWidth));
        
    //     // Only go for power-up if it's closer than the ball or ball is far away
    //     if (distanceToPlayer < distanceToBall * 0.7) {
    //       targetY = nearbyPowerUp.y;
    //     }
    //   }
    // }
  }

  // OLD FLOATING POWERUP SYSTEM - DISABLED (using inventory system instead)
  // private findNearestPowerUp(): PowerUp | undefined {
  //   if (!this.powerUps.length) return undefined;
    
  //   const aiX = this.config.canvasWidth - this.config.paddleWidth;
  //   let nearest: PowerUp | undefined;
  //   let minDistance = Infinity;
    
  //   for (const powerUp of this.powerUps) {
  //     if (!powerUp.active) continue;
      
  //     const distance = Math.sqrt(
  //       Math.pow(powerUp.x - aiX, 2) + 
  //       Math.pow(powerUp.y - (this.player2.y + this.getPaddleHeight(this.player2) / 2), 2)
  //     );
      
  //     if (distance < minDistance) {
  //       minDistance = distance;
  //       nearest = powerUp;
  //     }
  //   }
    
  //   return nearest;
  // }

  private clampPaddle(player: Player): void {
    const paddleHeight = this.getPaddleHeight(player);
    player.y = Math.max(0, Math.min(player.y, this.config.canvasHeight - paddleHeight));
  }

  private updateBall(): void {
    this.ball.x += this.ball.velocityX;
    this.ball.y += this.ball.velocityY;

    // Ball collision with top and bottom walls
    if (this.ball.y <= this.config.ballSize / 2 || this.ball.y >= this.config.canvasHeight - this.config.ballSize / 2) {
      this.ball.velocityY = -this.ball.velocityY;
      this.ball.y = Math.max(this.config.ballSize / 2, Math.min(this.ball.y, this.config.canvasHeight - this.config.ballSize / 2));

      // Visual effects
      this.addScreenShake(2);
      this.createParticles(this.ball.x, this.ball.y, 6, '#ffffff', 2);
    }

    // Ball collision with paddles
    this.checkPaddleCollision();
  }

  private checkPaddleCollision(): void {
    const ballLeft = this.ball.x - this.config.ballSize / 2;
    const ballRight = this.ball.x + this.config.ballSize / 2;
    const ballTop = this.ball.y - this.config.ballSize / 2;
    const ballBottom = this.ball.y + this.config.ballSize / 2;

    // Player 1 paddle collision
    const p1X = this.config.paddleWidth;
    const p1Y = this.player1.y;
    const p1Height = this.getPaddleHeight(this.player1);
    const p1Right = p1X + this.config.paddleWidth;

    if (ballLeft <= p1Right && ballRight >= p1X && ballBottom >= p1Y && ballTop <= p1Y + p1Height) {
      if (this.ball.velocityX < 0) { // Only bounce if moving toward paddle
        this.ball.velocityX = -this.ball.velocityX;
        this.ball.x = p1Right + this.config.ballSize / 2; // Prevent sticking
        this.addSpin('player1');
        this.ball.lastHitBy = 'player1';
        this.playSound('paddle-hit');
        
        // Visual effects
        this.addScreenShake(3);
        this.createParticles(this.ball.x, this.ball.y, 8, '#00fff7', 3);
      }
    }

    // Player 2 paddle collision
    const p2Right = this.config.canvasWidth - this.config.paddleWidth;
    const p2X = p2Right - this.config.paddleWidth;
    const p2Y = this.player2.y;
    const p2Height = this.getPaddleHeight(this.player2);

    if (ballLeft <= p2Right && ballRight >= p2X && ballBottom >= p2Y && ballTop <= p2Y + p2Height) {
      if (this.ball.velocityX > 0) { // Only bounce if moving toward paddle
        this.ball.velocityX = -this.ball.velocityX;
        this.ball.x = p2X - this.config.ballSize / 2; // Prevent sticking
        this.addSpin('player2');
        this.ball.lastHitBy = 'player2';
        this.playSound('paddle-hit');
        
        // Visual effects
        this.addScreenShake(3);
        this.createParticles(this.ball.x, this.ball.y, 8, '#ff00ea', 3);
      }
    }
  }

  private addSpin(hitter: 'player1' | 'player2'): void {
    // Increase ball speed slightly after each paddle hit
    const speedIncrease = 1.05;
    this.ball.velocityX *= speedIncrease;
    this.ball.velocityY *= speedIncrease;

    // Add some randomness to prevent repetitive gameplay
    let extra = (Math.random() - 0.5) * 0.5;
    if (this.nextHitCurveFor === hitter) {
      extra = (Math.random() - 0.5) * 1.5; // stronger curve for next hit
      this.nextHitCurveFor = null; // consume
    }
    this.ball.velocityY += extra;
  }

  private checkScoring(): void {
    if (this.ball.x < 0) {
      // Player 2 scores
      this.player2.score++;
      this.onScoreUpdate?.(this.player1.score, this.player2.score);
      
      // Visual effects for scoring
      this.addScreenShake(8);
      this.createParticles(this.config.canvasWidth / 4, this.config.canvasHeight / 2, 15, '#ff00ea', 4);
      
      this.resetBall(1); // Ball goes toward player 1
    } else if (this.ball.x > this.config.canvasWidth) {
      // Player 1 scores
      this.player1.score++;
      this.onScoreUpdate?.(this.player1.score, this.player2.score);
      
      // Visual effects for scoring
      this.addScreenShake(8);
      this.createParticles((this.config.canvasWidth * 3) / 4, this.config.canvasHeight / 2, 15, '#00fff7', 4);
      
      this.resetBall(-1); // Ball goes toward player 2
    }
  }

  private checkGameEnd(): void {
    console.log('Checking game end - Player1 score:', this.player1.score, 'Player2 score:', this.player2.score, 'Max score:', this.config.maxScore);
    console.log('Game state:', this.gameState);
    
    if (this.player1.score >= this.config.maxScore || this.player2.score >= this.config.maxScore) {
      console.log('Game ending! Winner:', this.player1.score >= this.config.maxScore ? this.player1.name : this.player2.name);
      this.gameState.isGameOver = true;
      this.gameState.isPlaying = false;
      this.gameState.winner = this.player1.score >= this.config.maxScore ? this.player1 : this.player2;
      
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }

      this.onGameEnd?.(this.gameState.winner, this.gameState.elapsedTime);
    }
  }

  private resetBall(direction?: number): void {
    this.ball.x = this.config.canvasWidth / 2;
    this.ball.y = this.config.canvasHeight / 2;
    this.ball.radius = this.config.ballSize;
    
    const dir = direction || (Math.random() > 0.5 ? 1 : -1);
    this.ball.velocityX = this.config.ballSpeed * dir;
    this.ball.velocityY = this.config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    
    console.log('⚽ Ball Reset - config.ballSpeed:', this.config.ballSpeed, 'velocityX:', this.ball.velocityX);
  }

  private resetPaddles(): void {
    this.player1.y = this.config.canvasHeight / 2 - this.getPaddleHeight(this.player1) / 2;
    this.player2.y = this.config.canvasHeight / 2 - this.getPaddleHeight(this.player2) / 2;
  }

  private render(): void {
    // Apply screen shake
    this.ctx.save();
    this.ctx.translate(this.screenShakeOffset.x, this.screenShakeOffset.y);
    
    // Clear canvas
    this.ctx.fillStyle = '#080820';
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Draw background effects
    this.drawBackground();

    // Draw center line
    this.drawCenterLine();

    // Draw paddles
    this.drawPaddle(this.config.paddleWidth, this.player1.y, this.player1);
    this.drawPaddle(this.config.canvasWidth - this.config.paddleWidth * 2, this.player2.y, this.player2);

    // Draw ball trail
    this.drawBallTrail();

    // Draw ball
    this.drawBall();

    // Draw extra balls
    this.drawExtraBalls();

    // Draw particles
    this.drawParticles();

    // Draw map variants
    this.drawMapVariants();

    // Draw floating powerup orbs
    if (this.config.powerUpsEnabled) {
      this.drawFloatingPowerUps();
    }

    // Draw scores
    this.drawScores();

    // Draw power-up inventory
    if (this.config.powerUpsEnabled) {
      this.drawPowerUpInventory();
    }

    // Draw game state messages
    this.drawGameStateMessages();
    
    // Restore context (undo screen shake)
    this.ctx.restore();
  }

  private drawBackground(): void {
    const theme = this.config.theme || 'neon';
    const time = Date.now() * 0.002;
    
    // Clear with theme-specific base color
    this.ctx.fillStyle = this.getThemeBackgroundColor(theme);
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    
    // Add theme-specific effects
    this.ctx.save();
    
    switch (theme) {
      case 'retro':
        // DRAMATIC ORANGE/YELLOW RETRO THEME
        this.ctx.fillStyle = 'rgba(255, 140, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // Animated orange grid
        for (let x = 0; x < this.config.canvasWidth; x += 30) {
          this.ctx.strokeStyle = `rgba(255, 165, 0, ${0.5 + 0.4 * Math.sin(time + x)})`;
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.config.canvasHeight);
          this.ctx.stroke();
        }
        for (let y = 0; y < this.config.canvasHeight; y += 30) {
          this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + 0.4 * Math.cos(time + y)})`;
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.config.canvasWidth, y);
          this.ctx.stroke();
        }
        break;
        
      case 'dark':
        // DRAMATIC PURPLE/BLACK DARK THEME
        this.ctx.fillStyle = 'rgba(75, 0, 130, 0.4)';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // Dark purple vignette
        const darkGradient = this.ctx.createRadialGradient(
          this.config.canvasWidth / 2, this.config.canvasHeight / 2, 0,
          this.config.canvasWidth / 2, this.config.canvasHeight / 2, 
          Math.max(this.config.canvasWidth, this.config.canvasHeight) / 1.5
        );
        darkGradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
        darkGradient.addColorStop(1, 'rgba(25, 25, 112, 0.8)');
        this.ctx.fillStyle = darkGradient;
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        break;
        
      case 'space':
        // DRAMATIC BLUE/PURPLE SPACE THEME
        this.ctx.fillStyle = 'rgba(30, 27, 75, 0.5)';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // Space gradient
        const spaceGradient = this.ctx.createLinearGradient(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        spaceGradient.addColorStop(0, 'rgba(123, 104, 238, 0.4)');
        spaceGradient.addColorStop(0.5, 'rgba(72, 61, 139, 0.5)');
        spaceGradient.addColorStop(1, 'rgba(25, 25, 112, 0.6)');
        this.ctx.fillStyle = spaceGradient;
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // Animated stars
        for (let i = 0; i < 50; i++) {
          const x = (i * 137) % this.config.canvasWidth;
          const y = (i * 211) % this.config.canvasHeight;
          const alpha = 0.5 + 0.5 * Math.sin(time + i);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.fillRect(x, y, 3, 3);
        }
        break;
        
      case 'classic':
        // DRAMATIC WHITE/GRAY CLASSIC THEME
        this.ctx.fillStyle = 'rgba(240, 248, 255, 0.95)';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // Classic checkerboard pattern
        const tileSize = 40;
        for (let x = 0; x < this.config.canvasWidth; x += tileSize) {
          for (let y = 0; y < this.config.canvasHeight; y += tileSize) {
            if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
              this.ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
              this.ctx.fillRect(x, y, tileSize, tileSize);
            }
          }
        }
        break;
        
      default: // neon
        // DRAMATIC CYAN/MAGENTA NEON THEME
        this.ctx.fillStyle = 'rgba(0, 255, 247, 0.15)';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        
        // Animated neon grid
        for (let x = 0; x < this.config.canvasWidth; x += 40) {
          this.ctx.strokeStyle = `rgba(0, 255, 247, ${0.4 + 0.5 * Math.sin(time + x)})`;
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.config.canvasHeight);
          this.ctx.stroke();
        }
        for (let y = 0; y < this.config.canvasHeight; y += 40) {
          this.ctx.strokeStyle = `rgba(255, 0, 234, ${0.4 + 0.5 * Math.cos(time + y)})`;
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.config.canvasWidth, y);
          this.ctx.stroke();
        }
        break;
    }
    
    this.ctx.restore();
  }
  
  private getThemeBackgroundColor(theme: string): string {
    switch (theme) {
      case 'retro': return '#2d1810';      // Dark brown/orange
      case 'dark': return '#0f0f23';       // Very dark purple
      case 'space': return '#1e1b4b';      // Dark blue
      case 'classic': return '#f8f9fa';    // Light gray
      default: return '#080820';           // Dark blue (neon)
    }
  }
  
  private getThemeAccentColor(theme: string): string {
    switch (theme) {
      case 'retro': return '#ff8c00';      // Bright orange
      case 'dark': return '#9932cc';       // Dark orchid
      case 'space': return '#7b68ee';      // Medium slate blue
      case 'classic': return '#696969';    // Dim gray
      default: return '#00fff7';           // Cyan (neon)
    }
  }

  private drawCenterLine(): void {
    const theme = this.config.theme || 'neon';
    this.ctx.strokeStyle = this.getThemeAccentColor(theme);
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([15, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.config.canvasWidth / 2, 0);
    this.ctx.lineTo(this.config.canvasWidth / 2, this.config.canvasHeight);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawPaddle(x: number, y: number, player: Player): void {
  // Premium paddle: neon glow, inner shadow, and gradient
  this.ctx.save();
  this.ctx.shadowColor = '#00fff7';
  this.ctx.shadowBlur = 30;
  const paddleHeight = this.getPaddleHeight(player);
  const gradient = this.ctx.createLinearGradient(x, y, x + this.config.paddleWidth, y + paddleHeight);
  gradient.addColorStop(0, '#00fff7');
  gradient.addColorStop(0.5, '#fff');
  gradient.addColorStop(1, '#ff00ea');
  this.ctx.fillStyle = gradient;
  this.ctx.fillRect(x, y, this.config.paddleWidth, paddleHeight);
  // Inner shadow
  this.ctx.globalAlpha = 0.3;
  this.ctx.fillStyle = '#222';
  this.ctx.fillRect(x + 2, y + 2, this.config.paddleWidth - 4, paddleHeight - 4);
  this.ctx.globalAlpha = 1;
  
  // Power-up visual indicators
  const now = Date.now();
  if (player.temporaryPaddleBoostUntilMs && now < player.temporaryPaddleBoostUntilMs) {
    // Paddle size boost - green glow
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 20;
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x - 2, y - 2, this.config.paddleWidth + 4, paddleHeight + 4);
  }
  
  if (player.temporaryPaddleSlowUntilMs && now < player.temporaryPaddleSlowUntilMs) {
    // Slow opponent - blue glow
    this.ctx.shadowColor = '#4444ff';
    this.ctx.shadowBlur = 15;
    this.ctx.strokeStyle = '#4444ff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - 1, y - 1, this.config.paddleWidth + 2, paddleHeight + 2);
  }
  
  
  this.ctx.restore();
  }

  private getPaddleHeight(player: Player): number {
    const base = this.config.paddleHeight;
    const now = Date.now();
    let height = base;
    if (player.temporaryPaddleBoostUntilMs && now < player.temporaryPaddleBoostUntilMs) {
      height *= 1.5;
    }
    return height;
  }

  private drawBall(): void {
    // Check if ball is invisible
    const now = Date.now();
    const isInvisible = this.ball.temporaryInvisibleUntilMs && now < this.ball.temporaryInvisibleUntilMs;
    
    if (isInvisible) {
      // Draw a subtle outline when invisible
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.arc(this.ball.x, this.ball.y, this.config.ballSize, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
      return;
    }
    
    // Premium ball: animated neon glow and gradient
    this.ctx.save();
    this.ctx.shadowColor = '#ff00ea';
    this.ctx.shadowBlur = 25 + 10 * Math.abs(Math.sin(Date.now() * 0.005));
    const gradient = this.ctx.createRadialGradient(
      this.ball.x, this.ball.y, 0,
      this.ball.x, this.ball.y, this.config.ballSize
    );
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.4, '#ff00ea');
    gradient.addColorStop(1, '#00fff7');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.config.ballSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawExtraBalls(): void {
    for (const ball of this.extraBalls) {
      this.ctx.save();
      this.ctx.shadowColor = '#ff8800';
      this.ctx.shadowBlur = 15;
      const gradient = this.ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ball.radius
      );
      gradient.addColorStop(0, '#ff8800');
      gradient.addColorStop(0.7, '#ff6600');
      gradient.addColorStop(1, '#ff4400');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private drawBallTrail(): void {
    if (!this.config.ballTrail || this.ballTrail.length === 0) return;
    
    this.ctx.save();
    for (let i = 0; i < this.ballTrail.length; i++) {
      const point = this.ballTrail[i];
      const size = this.config.ballSize * 0.3 * point.alpha;
      
      this.ctx.globalAlpha = point.alpha * 0.6;
      this.ctx.fillStyle = '#00fff7';
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawParticles(): void {
    if (!this.config.particleEffects || this.particles.length === 0) return;
    
    this.ctx.save();
    for (const particle of this.particles) {
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawMapVariants(): void {
    // Draw obstacles
    this.drawObstacles();
    
    // Draw moving walls
    this.drawMovingWalls();
  }

  private drawObstacles(): void {
    if (this.obstacles.length === 0) return;
    
    this.ctx.save();
    for (const obstacle of this.obstacles) {
      // Draw obstacle with glow effect
      this.ctx.shadowColor = '#ff8800';
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = '#ff8800';
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Draw inner highlight
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
    }
    this.ctx.restore();
  }

  private drawMovingWalls(): void {
    if (this.movingWalls.length === 0) return;
    
    this.ctx.save();
    for (const wall of this.movingWalls) {
      // Draw moving wall with animated glow
      const time = Date.now() * 0.005;
      const glowIntensity = 10 + 5 * Math.sin(time);
      
      this.ctx.shadowColor = '#00ff88';
      this.ctx.shadowBlur = glowIntensity;
      this.ctx.fillStyle = '#00ff88';
      this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      
      // Draw inner highlight
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#88ff88';
      this.ctx.fillRect(wall.x + 2, wall.y + 2, wall.width - 4, wall.height - 4);
    }
    this.ctx.restore();
  }

  private audioContext: AudioContext | null = null;
  private audioFiles: { [key: string]: AudioBuffer } = {};

  private async initAudio(): Promise<void> {
    if (!this.config.soundEffects) {
      console.log('🔇 Sound effects disabled, skipping audio initialization');
      return;
    }
    
    try {
      console.log('🔊 Initializing audio system...');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load audio files (only the ones we have)
      const audioFiles = [
        'paddle-hit',
      ];
      
      for (const fileName of audioFiles) {
        console.log(`🎵 Loading audio file: ${fileName}.wav`);
        const response = await fetch(`/audio/${fileName}.wav`);
        if (!response.ok) {
          console.warn(`⚠️ Failed to load audio file: ${fileName}.wav (${response.status})`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        this.audioFiles[fileName] = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log(`✅ Successfully loaded: ${fileName}.wav`);
      }
      
      console.log('🎉 Audio system initialized successfully!');
    } catch (error) {
      console.warn('❌ Audio initialization failed:', error);
    }
  }

  private playSound(soundName: string): void {
    if (!this.config.soundEffects) {
      console.log(`🔇 Sound effects disabled, not playing: ${soundName}`);
      return;
    }
    
    if (!this.audioContext) {
      console.warn(`⚠️ Audio context not initialized, cannot play: ${soundName}`);
      return;
    }
    
    // Resume audio context if suspended (required by modern browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(error => {
        console.warn('❌ Failed to resume audio context:', error);
      });
    }
    
    if (!this.audioFiles[soundName]) {
      console.warn(`⚠️ Audio file not loaded: ${soundName}`);
      return;
    }
    
    try {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.audioFiles[soundName];
    gainNode.gain.value = (this.config.volume || 70) / 100;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
      
      console.log(`🔊 Playing sound: ${soundName} at volume: ${gainNode.gain.value}`);
    } catch (error) {
      console.warn(`❌ Failed to play sound ${soundName}:`, error);
    }
  }

  // Visual Effects Methods
  private addScreenShake(intensity: number): void {
    if (!this.config.screenShake) return;
    this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
  }

  private createParticles(x: number, y: number, count: number, color: string, speed: number = 2): void {
    if (!this.config.particleEffects) return;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const velocity = speed + Math.random() * speed;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1.0,
        maxLife: 1.0,
        color: color,
        size: 2 + Math.random() * 3
      });
    }
  }

  private updateVisualEffects(): void {
    // Update ball trail
    if (this.config.ballTrail) {
      this.ballTrail.push({
        x: this.ball.x,
        y: this.ball.y,
        time: Date.now(),
        alpha: 1.0
      });
      
      // Remove old trail points
      const now = Date.now();
      this.ballTrail = this.ballTrail.filter(point => now - point.time < 1000);
      
      // Update alpha
      this.ballTrail.forEach(point => {
        const age = now - point.time;
        point.alpha = Math.max(0, 1 - (age / 1000));
      });
    }

    // Update particles
    if (this.config.particleEffects) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98; // Friction
        particle.vy *= 0.98;
        particle.life -= 0.02;
        
        if (particle.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    // Update screen shake
    if (this.config.screenShake && this.screenShakeIntensity > 0) {
      this.screenShakeOffset.x = (Math.random() - 0.5) * this.screenShakeIntensity;
      this.screenShakeOffset.y = (Math.random() - 0.5) * this.screenShakeIntensity;
      this.screenShakeIntensity *= this.screenShakeDecay;
      
      if (this.screenShakeIntensity < 0.1) {
        this.screenShakeIntensity = 0;
        this.screenShakeOffset = { x: 0, y: 0 };
      }
    }
  }

  // Map Variant Methods
  private initializeMapVariant(variant: 'classic' | 'obstacles' | 'moving_walls'): void {
    // Clear existing map elements
    this.obstacles = [];
    this.movingWalls = [];

    switch (variant) {
      case 'classic':
        // No additional elements needed
        console.log('🗺️ Classic map initialized');
        break;
        
      case 'obstacles':
        this.initializeObstacles();
        console.log('🗺️ Obstacles map initialized');
        break;
        
      case 'moving_walls':
        this.initializeMovingWalls();
        console.log('🗺️ Moving walls map initialized');
        break;
    }
  }

  private initializeObstacles(): void {
    // Add static obstacles in the center area
    const centerX = this.config.canvasWidth / 2;
    const centerY = this.config.canvasHeight / 2;
    
    // Top obstacle
    this.obstacles.push({
      x: centerX - 30,
      y: centerY - 80,
      width: 60,
      height: 20,
      type: 'static'
    });
    
    // Bottom obstacle
    this.obstacles.push({
      x: centerX - 30,
      y: centerY + 60,
      width: 60,
      height: 20,
      type: 'static'
    });
    
    // Side obstacles
    this.obstacles.push({
      x: centerX - 100,
      y: centerY - 20,
      width: 20,
      height: 40,
      type: 'static'
    });
    
    this.obstacles.push({
      x: centerX + 80,
      y: centerY - 20,
      width: 20,
      height: 40,
      type: 'static'
    });
  }

  private initializeMovingWalls(): void {
    // Add moving walls that move up and down
    this.movingWalls.push({
      x: this.config.canvasWidth / 2 - 10,
      y: 50,
      width: 20,
      height: 60,
      direction: 'down',
      speed: 1
    });
    
    this.movingWalls.push({
      x: this.config.canvasWidth / 2 - 10,
      y: this.config.canvasHeight - 110,
      width: 20,
      height: 60,
      direction: 'up',
      speed: 1
    });
  }


  private updateMapVariants(): void {
    // Update moving walls
    for (const wall of this.movingWalls) {
      if (wall.direction === 'down') {
        wall.y += wall.speed;
        if (wall.y + wall.height > this.config.canvasHeight - 50) {
          wall.direction = 'up';
        }
      } else {
        wall.y -= wall.speed;
        if (wall.y < 50) {
          wall.direction = 'down';
        }
      }
    }
  }

  private checkMapCollisions(): void {
    // Check ball collision with obstacles
    for (const obstacle of this.obstacles) {
      if (this.isBallCollidingWithObstacle(obstacle)) {
        this.handleObstacleCollision(obstacle);
      }
    }
    
    // Check ball collision with moving walls
    for (const wall of this.movingWalls) {
      if (this.isBallCollidingWithObstacle(wall)) {
        this.handleObstacleCollision(wall);
      }
    }
  }

  private isBallCollidingWithObstacle(obstacle: { x: number; y: number; width: number; height: number }): boolean {
    const ballLeft = this.ball.x - this.config.ballSize / 2;
    const ballRight = this.ball.x + this.config.ballSize / 2;
    const ballTop = this.ball.y - this.config.ballSize / 2;
    const ballBottom = this.ball.y + this.config.ballSize / 2;
    
    return ballLeft < obstacle.x + obstacle.width &&
           ballRight > obstacle.x &&
           ballTop < obstacle.y + obstacle.height &&
           ballBottom > obstacle.y;
  }


  private handleObstacleCollision(obstacle: { x: number; y: number; width: number; height: number }): void {
    // Determine collision side and bounce accordingly
    const ballCenterX = this.ball.x;
    const ballCenterY = this.ball.y;
    const obstacleCenterX = obstacle.x + obstacle.width / 2;
    const obstacleCenterY = obstacle.y + obstacle.height / 2;
    
    const dx = ballCenterX - obstacleCenterX;
    const dy = ballCenterY - obstacleCenterY;
    
    // Determine which side was hit
    if (Math.abs(dx) / obstacle.width > Math.abs(dy) / obstacle.height) {
      // Hit left or right side
      this.ball.velocityX = -this.ball.velocityX;
      this.ball.x = dx > 0 ? obstacle.x + obstacle.width + this.config.ballSize / 2 : obstacle.x - this.config.ballSize / 2;
    } else {
      // Hit top or bottom side
      this.ball.velocityY = -this.ball.velocityY;
      this.ball.y = dy > 0 ? obstacle.y + obstacle.height + this.config.ballSize / 2 : obstacle.y - this.config.ballSize / 2;
    }
    
    // Visual and audio effects
    this.addScreenShake(2);
    this.createParticles(this.ball.x, this.ball.y, 6, '#ff8800', 2);
  }


  private addPowerUpToInventory(type: PowerUpType, collector: 'player1' | 'player2'): void {
    // Convert PowerUpType to old PowerUp format for inventory
    const powerUpTypeMap: { [key in PowerUpType]: string } = {
      'paddle_size_boost': 'paddle_size',
      'paddle_speed_boost': 'paddle_speed',
      'multi_ball': 'multi_ball',
      'freeze_opponent': 'freeze_opponent',
      'invisible_ball': 'invisible_ball'
    };

    const oldType = powerUpTypeMap[type] || 'paddle_size';
    
    const powerUp = {
      x: 0, y: 0, radius: 0, // Not needed for inventory
      type: oldType as any,
      active: true,
      collector
    };
    
    this.collectedPowerUps.push(powerUp);
    console.log('📦 Added to inventory:', oldType, 'for', collector);
  }

  private updateExtraBalls(): void {
    for (let i = this.extraBalls.length - 1; i >= 0; i--) {
      const ball = this.extraBalls[i];
      
      // Update position
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;
      
      // Bounce off top and bottom walls
      if (ball.y <= ball.radius || ball.y >= this.config.canvasHeight - ball.radius) {
        ball.velocityY = -ball.velocityY;
        ball.y = Math.max(ball.radius, Math.min(ball.y, this.config.canvasHeight - ball.radius));
        
        // Visual effects
        this.addScreenShake(1);
        this.createParticles(ball.x, ball.y, 4, '#ff8800', 2);
      }
      
      // Check scoring (remove ball if it goes off screen)
      if (ball.x < -50 || ball.x > this.config.canvasWidth + 50) {
        this.extraBalls.splice(i, 1);
        continue;
      }
      
      // Check paddle collisions
      this.checkExtraBallCollision(ball);
      
      // Check map collisions for extra balls
      this.checkExtraBallMapCollisions(ball);
    }
  }

  private checkExtraBallCollision(ball: Ball): void {
    // Player 1 paddle collision
    const p1X = this.config.paddleWidth;
    const p1Y = this.player1.y;
    const p1Height = this.getPaddleHeight(this.player1);
    const p1Right = p1X + this.config.paddleWidth;

    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    if (ballLeft <= p1Right && ballRight >= p1X && ballBottom >= p1Y && ballTop <= p1Y + p1Height) {
      if (ball.velocityX < 0) {
        ball.velocityX = -ball.velocityX;
        ball.x = p1Right + ball.radius;
        ball.lastHitBy = 'player1';
        this.playSound('paddle-hit');
        
        // Visual effects
        this.addScreenShake(2);
        this.createParticles(ball.x, ball.y, 6, '#00fff7', 2);
      }
    }

    // Player 2 paddle collision
    const p2X = this.config.canvasWidth - this.config.paddleWidth;
    const p2Y = this.player2.y;
    const p2Height = this.getPaddleHeight(this.player2);
    const p2Right = this.config.canvasWidth - this.config.paddleWidth;

    if (ballLeft <= p2Right && ballRight >= p2X && ballBottom >= p2Y && ballTop <= p2Y + p2Height) {
      if (ball.velocityX > 0) {
        ball.velocityX = -ball.velocityX;
        ball.x = p2X - ball.radius;
        ball.lastHitBy = 'player2';
        this.playSound('paddle-hit');
        
        // Visual effects
        this.addScreenShake(2);
        this.createParticles(ball.x, ball.y, 6, '#ff00ea', 2);
      }
    }
  }

  private checkExtraBallMapCollisions(ball: Ball): void {
    // Check collision with obstacles
    for (const obstacle of this.obstacles) {
      if (this.isExtraBallCollidingWithObstacle(ball, obstacle)) {
        this.handleExtraBallObstacleCollision(ball, obstacle);
      }
    }
    
    // Check collision with moving walls
    for (const wall of this.movingWalls) {
      if (this.isExtraBallCollidingWithObstacle(ball, wall)) {
        this.handleExtraBallObstacleCollision(ball, wall);
      }
    }
  }

  private isExtraBallCollidingWithObstacle(ball: Ball, obstacle: { x: number; y: number; width: number; height: number }): boolean {
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    
    return ballLeft < obstacle.x + obstacle.width &&
           ballRight > obstacle.x &&
           ballTop < obstacle.y + obstacle.height &&
           ballBottom > obstacle.y;
  }


  private handleExtraBallObstacleCollision(ball: Ball, obstacle: { x: number; y: number; width: number; height: number }): void {
    // Determine collision side and bounce accordingly
    const ballCenterX = ball.x;
    const ballCenterY = ball.y;
    const obstacleCenterX = obstacle.x + obstacle.width / 2;
    const obstacleCenterY = obstacle.y + obstacle.height / 2;
    
    const dx = ballCenterX - obstacleCenterX;
    const dy = ballCenterY - obstacleCenterY;
    
    // Determine which side was hit
    if (Math.abs(dx) / obstacle.width > Math.abs(dy) / obstacle.height) {
      // Hit left or right side
      ball.velocityX = -ball.velocityX;
      ball.x = dx > 0 ? obstacle.x + obstacle.width + ball.radius : obstacle.x - ball.radius;
    } else {
      // Hit top or bottom side
      ball.velocityY = -ball.velocityY;
      ball.y = dy > 0 ? obstacle.y + obstacle.height + ball.radius : obstacle.y - ball.radius;
    }
    
    // Visual and audio effects
    this.addScreenShake(1);
    this.createParticles(ball.x, ball.y, 4, '#ff8800', 2);
  }

  private resumeGame(): void {
    if (this.gameState.isPaused) {
      this.gameState.isPaused = false;
      console.log('Game resumed');
    }
  }

  private activateCollectedPowerUp(requestingPlayer?: 'player1' | 'player2'): void {
    if (this.collectedPowerUps.length === 0) return;

    // Find power-up for requesting player
    let powerUpIndex = this.collectedPowerUps.findIndex(pu => pu.collector === requestingPlayer);
    if (powerUpIndex === -1) return;

    const powerUp = this.collectedPowerUps.splice(powerUpIndex, 1)[0];
    const player = requestingPlayer === 'player1' ? this.player1 : this.player2;
    const opponent = requestingPlayer === 'player1' ? this.player2 : this.player1;
    
    console.log(`🎮 ${requestingPlayer} activated ${powerUp.type} powerup!`);
    
    // Implement powerup effects for the 5 selected powerups
    switch (powerUp.type) {
      case 'paddle_size': {
        player.temporaryPaddleBoostUntilMs = Date.now() + 8000; // 8 seconds
        this.notify(`🟢 Paddle Size Boost activated for ${player.name}!`);
        break;
      }
      case 'paddle_speed': {
        player.temporaryPaddleSpeedBoostUntilMs = Date.now() + 8000;
        this.notify(`💨 Paddle Speed Boost activated for ${player.name}!`);
        break;
      }
      case 'multi_ball': {
        // Create 2 extra balls
        for (let i = 0; i < 2; i++) {
          const angle = (Math.PI / 4) + (Math.random() - 0.5) * (Math.PI / 2);
          const speed = this.config.ballSpeed * 0.8;
          this.extraBalls.push({
            x: this.ball.x,
            y: this.ball.y,
            velocityX: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            velocityY: Math.sin(angle) * speed,
            speed: speed,
            radius: this.config.ballSize,
            lastHitBy: requestingPlayer
          });
        }
        this.notify(`🟠 Multi-Ball activated! 2 extra balls spawned!`);
        break;
      }
      case 'freeze_opponent': {
        opponent.temporaryPaddleSlowUntilMs = Date.now() + 3000;
        this.notify(`❄️ Freeze Opponent applied to ${opponent.name}!`);
        break;
      }
      case 'invisible_ball': {
        this.ball.temporaryInvisibleUntilMs = Date.now() + 4000;
        this.notify(`👻 Invisible Ball activated!`);
        break;
      }
      default: {
        console.warn(`Unknown powerup type: ${powerUp.type}`);
        break;
      }
    }
  }

  private notify(message: string): void {
    try {
      const fn = (window as any)?.showMessage;
      if (typeof fn === 'function') fn(message, 'info');
    } catch {}
  }

  private spawnFloatingPowerUps(): void {
    const now = Date.now();
    if (now - this.lastPowerUpSpawnAtMs < this.powerUpSpawnInterval) return;
    if (this.floatingPowerUps.length >= 3) return; // Max 3 floating powerups

    // Get available powerup types from customization
    const availableTypes = this.config.powerUpTypes || ['paddle_size', 'ball_speed', 'slow_opponent'];
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Spawn at random position in center area
    const x = this.config.canvasWidth / 2 + (Math.random() - 0.5) * 200;
    const y = this.config.canvasHeight / 2 + (Math.random() - 0.5) * 200;

    const powerUp: PowerUp = {
      x: x,
      y: y,
      radius: 15,
      type: randomType as any,
      active: true
    };

    this.floatingPowerUps.push(powerUp);
    this.lastPowerUpSpawnAtMs = now;
    console.log(`✨ Spawned floating powerup: ${randomType} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
  }

  private updateFloatingPowerUps(): void {
    for (let i = this.floatingPowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.floatingPowerUps[i];
      
      // Animate floating motion
      powerUp.y += Math.sin(Date.now() * 0.003 + i) * 0.5;
      
      // Check collision with ball
      if (this.isBallCollidingWithPowerUp(powerUp)) {
        this.collectFloatingPowerUp(powerUp, i);
      }
      
      // Remove old powerups (30 seconds lifetime)
      if (Date.now() - this.lastPowerUpSpawnAtMs > 30000) {
        this.floatingPowerUps.splice(i, 1);
      }
    }
  }

  private isBallCollidingWithPowerUp(powerUp: PowerUp): boolean {
    const dx = this.ball.x - powerUp.x;
    const dy = this.ball.y - powerUp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.ball.radius + powerUp.radius);
  }

  private collectFloatingPowerUp(powerUp: PowerUp, index: number): void {
    // Determine collector based on ball direction
    const collector = this.ball.velocityX > 0 ? 'player1' : 'player2';
    
    // Add to inventory
    this.addPowerUpToInventory(powerUp.type as any, collector);
    
    // Remove from floating powerups
    this.floatingPowerUps.splice(index, 1);
    
    // Visual effects
    this.addScreenShake(2);
    this.createParticles(powerUp.x, powerUp.y, 8, this.getPowerUpColor(powerUp.type), 3);
    
    console.log(`🎯 ${collector} collected floating powerup: ${powerUp.type}`);
  }

  private drawFloatingPowerUps(): void {
    for (const powerUp of this.floatingPowerUps) {
    this.ctx.save();
    
      // Pulsing effect
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2;
      const radius = powerUp.radius * pulse;
      
      // Glow effect
      this.ctx.shadowColor = this.getPowerUpColor(powerUp.type);
      this.ctx.shadowBlur = 15;
      
      // Draw powerup orb
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.beginPath();
      this.ctx.arc(powerUp.x, powerUp.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw symbol
    this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText(this.getPowerUpSymbol(powerUp.type), powerUp.x, powerUp.y);
    
    this.ctx.restore();
    }
  }

  private drawScores(): void {
  // Premium score: neon text and glow
  this.ctx.save();
  this.ctx.font = 'bold 54px Orbitron, Arial';
  this.ctx.textAlign = 'center';
  this.ctx.shadowColor = '#00fff7';
  this.ctx.shadowBlur = 20;
  this.ctx.fillStyle = 'rgba(0,255,255,0.95)';
  this.ctx.fillText(this.player1.score.toString(), this.config.canvasWidth / 4, 70);
  this.ctx.fillStyle = 'rgba(255,0,255,0.95)';
  this.ctx.fillText(this.player2.score.toString(), (this.config.canvasWidth * 3) / 4, 70);
  this.ctx.shadowBlur = 0;
  this.ctx.font = 'bold 18px Orbitron, Arial';
  this.ctx.fillStyle = '#fff';
  this.ctx.fillText(this.player1.name, this.config.canvasWidth / 4, 100);
  this.ctx.fillText(this.player2.name, (this.config.canvasWidth * 3) / 4, 100);
  this.ctx.restore();
  }

  private drawGameStateMessages(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    
    if (!this.gameState.isPlaying && !this.gameState.isGameOver) {
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText('Press SPACE to Start', this.config.canvasWidth / 2, this.config.canvasHeight / 2 + 50);
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`${this.player1.name}: W/S or ↑/↓ | ${this.player2.name}: I/K or Mouse`, this.config.canvasWidth / 2, this.config.canvasHeight / 2 + 80);
      this.ctx.fillText('Press R to Reset', this.config.canvasWidth / 2, this.config.canvasHeight / 2 + 100);
    } else if (this.gameState.isPaused) {
      this.ctx.font = 'bold 36px Arial';
      this.ctx.fillText('PAUSED', this.config.canvasWidth / 2, this.config.canvasHeight / 2);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press SPACE to Resume', this.config.canvasWidth / 2, this.config.canvasHeight / 2 + 40);
    } else if (this.gameState.isGameOver && this.gameState.winner) {
      this.ctx.font = 'bold 36px Arial';
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillText(`${this.gameState.winner.name} Wins!`, this.config.canvasWidth / 2, this.config.canvasHeight / 2);
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = '#ffffff';
      const gameTime = Math.floor(this.gameState.elapsedTime / 1000);
      this.ctx.fillText(`Game Time: ${gameTime}s`, this.config.canvasWidth / 2, this.config.canvasHeight / 2 + 40);
      this.ctx.fillText('Press R to Play Again', this.config.canvasWidth / 2, this.config.canvasHeight / 2 + 65);
    }
  }

  private drawPowerUpInventory(): void {
    if (this.collectedPowerUps.length === 0) return;

    this.ctx.save();
    
    // Position at bottom-left corner, smaller size
    const x = 10;
    const y = this.config.canvasHeight - 100;
    const width = 300;
    const height = 90;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Title
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillText(`Power-up Inventory`, x + 10, y + 20);
    
    // Instructions
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${this.player1.name}: Press A | ${this.player2.name}: Press T`, x + 10, y + 35);
    
    // Show power-ups for each player
    const p1PowerUps = this.collectedPowerUps.filter(pu => pu.collector === 'player1');
    const p2PowerUps = this.collectedPowerUps.filter(pu => pu.collector === 'player2');
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillText(`P1: ${p1PowerUps.length} | P2: ${p2PowerUps.length}`, x + 10, y + 50);
    
    // Show power-up icons for each player
    const iconSize = 20;
    const spacing = 25;
    
    // Player 1 powerups (left side)
    p1PowerUps.forEach((powerUp, index) => {
      const iconX = x + 10 + (index * spacing);
      const iconY = y + 65;
      
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.beginPath();
      this.ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Power-up symbol
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.getPowerUpSymbol(powerUp.type), iconX + iconSize/2, iconY + iconSize/2 + 4);
    });
    
    // Player 2 powerups (right side)
    p2PowerUps.forEach((powerUp, index) => {
      const iconX = x + 150 + (index * spacing);
      const iconY = y + 65;
      
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.beginPath();
      this.ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Power-up symbol
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.getPowerUpSymbol(powerUp.type), iconX + iconSize/2, iconY + iconSize/2 + 4);
    });
    
    this.ctx.restore();
  }

  private getPowerUpColor(type: string): string {
    const colors: { [key: string]: string } = {
      'paddle_size': '#00ff88',
      'paddle_speed': '#00ccff',
      'multi_ball': '#ff8800',
      'freeze_opponent': '#88ccff',
      'invisible_ball': '#cccccc'
    };
    return colors[type] || '#ffffff';
  }

  private getPowerUpSymbol(type: string): string {
    const symbols: { [key: string]: string } = {
      'paddle_size': '⬆',
      'paddle_speed': '💨',
      'multi_ball': '⚪',
      'freeze_opponent': '❄',
      'invisible_ball': '👻'
    };
    return symbols[type] || '?';
  }

  private initializeAIPersonality(): void {
    const personalities = {
      easy: {
        reactionDelay: 250,
        predictionAccuracy: 0.75,
        speedVariation: 0.85,
        aggressiveness: 0.4,
        powerUpPriority: 0.5
      },
      medium: {
        reactionDelay: 180,
        predictionAccuracy: 0.85,
        speedVariation: 0.95,
        aggressiveness: 0.6,
        powerUpPriority: 0.7
      },
      hard: {
        reactionDelay: 120,
        predictionAccuracy: 0.92,
        speedVariation: 1.1,
        aggressiveness: 0.8,
        powerUpPriority: 0.85
      }
    };
    
    this.aiPersonality = personalities[this.aiDifficulty];
  }

  public setAIDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.aiDifficulty = difficulty;
    this.initializeAIPersonality();
  }

  // Cleanup method
  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Game Factory Functions
export function createPongGame(
  canvas: HTMLCanvasElement,
  config?: Partial<GameConfig>
): PongGame {
  return new PongGame(canvas, config);
}

export function create1v1Game(canvas: HTMLCanvasElement, overrides?: Partial<GameConfig>): PongGame {
  // Get global customization settings but exclude game rules
  const globalSettings = (window as any).gameCustomizationSettings || {};
  const { maxScore: _, ...visualSettings } = globalSettings; // Exclude maxScore from global settings
  
  const game = new PongGame(canvas, {
    maxScore: 5, // Always use 5 for 1v1 games
    ballSpeed: 5,
    paddleSpeed: 7,
    ...visualSettings, // Only apply visual customizations
    ...overrides // Allow explicit overrides
  });
  
  game.setPlayer2AI(false);
  
  // Store reference for real-time updates
  (window as any).currentGame = game;
  
  console.log('🎮 Created 1v1 game with maxScore: 5, visual settings:', visualSettings);
  
  return game;
}

export function createAIGame(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium', overrides?: Partial<GameConfig>): PongGame {
  const difficultyConfig = {
    easy: { ballSpeed: 2, paddleSpeed: 4 },
    medium: { ballSpeed: 5, paddleSpeed: 7 },
    hard: { ballSpeed: 8, paddleSpeed: 10 }
  } as const;
  
  // Get global customization settings but exclude game rules and physics that affect difficulty
  const globalSettings = (window as any).gameCustomizationSettings || {};
  const { maxScore: _, ballSpeed: __, paddleSpeed: ___, ...visualSettings } = globalSettings; // Exclude game rules and physics
  
  console.log('🔍 DEBUG - Global settings:', globalSettings);
  console.log('🔍 DEBUG - Visual settings after exclusion:', visualSettings);
  console.log('🔍 DEBUG - Difficulty config:', difficultyConfig[difficulty]);
  console.log('🔍 DEBUG - Overrides parameter:', overrides);
  
  const finalConfig = {
    maxScore: 5, // Always use 5 for AI games
    ...visualSettings, // Apply visual customizations first
    ...difficultyConfig[difficulty], // Then apply difficulty settings (higher priority)
    ...overrides // Allow explicit overrides (highest priority)
  };
  
  console.log('🔍 DEBUG - Final config being passed to constructor:', finalConfig);
  
  const game = new PongGame(canvas, finalConfig);
  
  // Set AI after game creation
  game.setPlayer2AI(true);
  game.setAIDifficulty(difficulty);
  game.setPlayerNames('Player 1', 'AI Opponent');
  
  console.log('🤖 AI Game created with difficulty:', difficulty);
  console.log('🤖 Difficulty config applied:', difficultyConfig[difficulty]);
  console.log('🤖 Player2 isAI:', game.getPlayers().player2.isAI);
  
  // Force log the actual config to verify
  console.log('🤖 ACTUAL CONFIG CHECK:');
  console.log('   - Ball Speed should be:', difficultyConfig[difficulty].ballSpeed);
  console.log('   - Paddle Speed should be:', difficultyConfig[difficulty].paddleSpeed);
  
  return game;
}
