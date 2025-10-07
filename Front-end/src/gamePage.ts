// @ts-ignore
import { PongGame, create1v1Game, createAIGame, Player } from './pongGame.js';
import { showGameCustomizationModal } from './components/GameCustomizationModal.js';
import type { GameCustomizationSettings } from './components/GameCustomization.js';
/// <reference path="./services/api.d.ts" />
// Game Page Component - Handles the actual game interface

export class GamePage {
  // hanieh added: Store tournament aliases
  private tournamentAliases: { [playerId: string]: string } = {};


  // hanieh added: Reset aliases and show modal for new tournament
  public renderTournamentGame(): void {
    this.tournamentAliases = {};
    this.gameMode = 'tournament';
    this.renderGameInterface();
  window.requestAnimationFrame(() => this.showTournamentAliasModal());
  }
  // Helper to get tournamentId from context (replace with your logic)
  private container: HTMLElement;
  public game: PongGame | null = null;
  public setPlayerNames(player1Name: string, player2Name: string): void {
    if (this.game) {
      this.game.setPlayerNames(player1Name, player2Name);
    }
    
    // Update the UI elements to show the actual player names
    const player1NameEl = document.getElementById('player1-name');
    const player2NameEl = document.getElementById('player2-name');
    
    if (player1NameEl) {
      player1NameEl.textContent = player1Name;
    }
    if (player2NameEl) {
      player2NameEl.textContent = player2Name;
    }
    
    // Update the controls info to show actual player names
    const controlsInfo = document.querySelector('.controls-info');
    if (controlsInfo) {
      controlsInfo.innerHTML = `
        <strong>${player1Name}:</strong> W/S<br>
        ${this.gameMode === '1v1' || this.gameMode === 'tournament' ? `<strong>${player2Name}:</strong> Arrow Keys` : '<strong>AI:</strong> Automated'}
      `;
    }
    
    console.log('[DEBUG] Player names updated in UI:', { player1Name, player2Name });
  }
  private gameCanvas: HTMLCanvasElement | null = null;
  public gameMode: '1v1' | 'ai' | 'tournament' = '1v1';
  private isFullscreen = false;
  private onNavigateBack?: () => void;
  public suppressModal: boolean = false;

  constructor(container: HTMLElement, onNavigateBack?: () => void) {
    this.container = container;
    this.onNavigateBack = onNavigateBack;
  }

  // hanieh added: Show tournament alias modal and store alias
  private showTournamentAliasModal(): void {
    const modal = document.getElementById('tournament-alias-modal') as HTMLElement;
    const input = document.getElementById('tournament-alias-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-tournament-alias-btn') as HTMLButtonElement;
    const errorDiv = document.getElementById('tournament-alias-error') as HTMLElement;
    if (modal && input && submitBtn && errorDiv) {
      modal.style.display = 'flex';
      input.value = '';
      errorDiv.style.display = 'none';
      submitBtn.onclick = () => {
        const alias = input.value.trim();
        if (!alias) {
          errorDiv.textContent = 'You must enter an alias to play in this tournament!';
          errorDiv.style.display = 'block';
          return;
        }
        // For demo, use a static playerId. Replace with actual player/user id logic.
        const playerId = 'player1';
        this.tournamentAliases[playerId] = alias;
        modal.style.display = 'none';
        this.initializeGame();
      };
    }
  }


  public render1v1Game(): void {
    console.log('[DEBUG] render1v1Game called. gameMode:', this.gameMode, 'currentTournamentMatch:', (window as any).currentTournamentMatch, 'suppressModal:', this.suppressModal);
    // Strong guard: Never show modal if tournament or suppressModal is true
    if (this.gameMode === 'tournament' || this.suppressModal || (window as any).currentTournamentMatch) {
      console.log('[DEBUG] Tournament match detected or suppressModal true, skipping modal and starting game directly');
      this.gameMode = 'tournament';
      this.renderGameInterface();
      window.requestAnimationFrame(() => {
        this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!this.gameCanvas) {
          console.error('[DEBUG] Tournament: Game canvas not found!');
          return;
        }
        
        // Apply different speeds based on tournament match type
        let tournamentGameConfig = {};
        const tournamentSpeed = (window as any).tournamentGameSpeed;
        if (tournamentSpeed === 'very-fast') {
          // Final match: very fast speed
          tournamentGameConfig = {
            ballSpeed: 8,
            paddleSpeed: 10
          };
          console.log('[DEBUG] Final match: Using very fast speed settings');
        } else if (tournamentSpeed === 'medium') {
          // Semi-final match: medium speed
          tournamentGameConfig = {
            ballSpeed: 5,
            paddleSpeed: 7
          };
          console.log('[DEBUG] Semi-final match: Using medium speed settings');
        }
        
        if (this.gameCanvas) { this.game = create1v1Game(this.gameCanvas, tournamentGameConfig); }
        if (this.game) this.game.matchId = 0;
        if (this.game) this.game.tournamentId = this.getTournamentIdFromContext();
        this.setupGameCallbacks();
        if (this.game) {
          console.log('[DEBUG] Tournament: Game started with matchId 0 and tournamentId', this.game.tournamentId);
        }
      });
    } else {
        // Only show modal for direct 1v1 (not tournament)
        this.gameMode = '1v1';
        this.renderGameInterface();
        console.log('[DEBUG] Showing opponent username modal for direct 1v1');
        import('./components/OpponentUsernameModal').then(({ showOpponentUsernameModal }) => {
          showOpponentUsernameModal((opponentUsername: string) => {
            this.initializeGameWithOpponent(opponentUsername);
          });
        });
    }
  }

  private initializeGameWithOpponent(opponentUsername: string): void {
    this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.gameCanvas) return;
    import('./services/api.js').then(({ onevone }) => {
      onevone.start(opponentUsername).then((response: { data?: { matchId?: number }, error?: any }) => {
        const { data, error } = response;
        let modal = document.getElementById('username-modal');
        let errorDiv = modal ? modal.querySelector('#username-error') as HTMLElement : null;
        if (error || !data?.matchId) {
          // If modal is missing, re-show it so error is visible
          if (!modal || !errorDiv) {
            import('./components/OpponentUsernameModal').then(({ showOpponentUsernameModal }) => {
              showOpponentUsernameModal((username: string) => {
                this.initializeGameWithOpponent(username);
              });
              // After modal is re-added, show error
              setTimeout(() => {
                let modal2 = document.getElementById('username-modal');
                let errorDiv2 = modal2 ? modal2.querySelector('#username-error') as HTMLElement : null;
                if (errorDiv2) {
                  errorDiv2.textContent = 'Could not start 1v1 match: ' + (error || 'No matchId');
                  errorDiv2.style.display = 'block';
                }
              }, 100);
            });
          } else {
            errorDiv.textContent = 'Could not start 1v1 match: ' + (error || 'No matchId');
            errorDiv.style.display = 'block';
          }
          return;
        }
        // Only remove modal on success
        if (modal) document.body.removeChild(modal);
        if (errorDiv) errorDiv.style.display = 'none';
        if (this.gameCanvas) { this.game = create1v1Game(this.gameCanvas); }
        if (this.game) this.game.matchId = data.matchId;
        if (this.game) this.game.tournamentId = undefined;
        
        // Set player names for 1v1 match
        const currentUser = (window as any).currentUser;
        const player1Name = currentUser?.username || 'Player 1';
        const player2Name = opponentUsername;
        this.setPlayerNames(player1Name, player2Name);
        console.log('[DEBUG] 1v1 player names set:', { player1Name, player2Name });
        
        this.setupGameCallbacks();
      });
    });
  }

  public renderAIGame(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): void {
    this.gameMode = 'ai';
    this.renderGameInterface();
  window.requestAnimationFrame(() => this.initializeAIGame(difficulty)); // hanieh added: ensure canvas exists
  }

  public renderGameInterface(): void {
    this.container.innerHTML = `
      <div class="game-page">
        <!-- Game Header -->
        <div class="game-header">
          <div class="game-controls">
            <button id="back-btn" class="game-btn secondary">
              <i class="fas fa-arrow-left"></i>
              Back
            </button>
            <div class="game-info">
              <h2 class="game-title">
                ${this.gameMode === '1v1' ? '1v1 Battle' : this.gameMode === 'tournament' ? 'Tournament' : 'AI Challenge'}
              </h2>
              <div class="game-status" id="game-status">Ready to Play</div>
            </div>
            <div style="display:flex; gap:.5rem;">
              <button id="settings-btn" class="game-btn secondary">
                <i class="fas fa-cogs"></i>
              </button>
              <button id="fullscreen-btn" class="game-btn secondary">
                <i class="fas fa-expand"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Tournament alias modal -->
        <div id="tournament-alias-modal" class="modal" style="display:none;">
          <div class="modal-content">
            <h2>Enter your alias for this tournament</h2>
            <input type="text" id="tournament-alias-input" placeholder="Your alias" />
            <button id="submit-tournament-alias-btn" class="game-btn primary">Save Alias</button>
            <div id="tournament-alias-error" class="error-message" style="display:none;"></div>
          </div>
        </div>

        <!-- Game Container -->
        <div class="game-container" id="game-container">
          <div class="game-canvas-wrapper">
            <canvas id="game-canvas" class="game-canvas"></canvas>
            <!-- Game Overlay -->
            <div class="game-overlay" id="game-overlay">
              <div class="game-overlay-content">
                <div class="game-logo">
                  <i class="fas fa-gamepad"></i>
                </div>
                <h3>Ready to Play!</h3>
                <p class="controls-info">
                  <strong>Player 1:</strong> W/S<br>
                  ${this.gameMode === '1v1' ? '<strong>Player 2:</strong> Arrow Keys' : '<strong>AI:</strong> Automated'}
                </p>
                <button id="start-game-btn" class="game-btn primary">
                  <i class="fas fa-play"></i>
                  Start Game
                </button>
              </div>
            </div>
          </div>

          <!-- Game Stats -->
          <div class="game-stats" id="game-stats">
            <div class="stat-card">
              <div class="stat-label">Player 1</div>
              <div class="stat-value" id="player1-score">0</div>
              <div class="stat-name" id="player1-name">Player 1</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Player 2</div>
              <div class="stat-value" id="player2-score">0</div>
              <div class="stat-name" id="player2-name">Player 2</div>
            </div>
          </div>
                    <!-- Tournament alias modal -->
                    <div id="tournament-alias-modal" class="modal" style="display:none;">
                      <div class="modal-content">
                        <h2>Enter your alias for this tournament</h2>
                        <input type="text" id="tournament-alias-input" placeholder="Your alias" />
                        <button id="submit-tournament-alias-btn" class="game-btn primary">Save Alias</button>
                        <div id="tournament-alias-error" class="error-message" style="display:none;"></div>
                      </div>
                    </div>
    `;

    this.setupEventListeners();
  }

  public initializeGame(): void {
    console.log('Initializing game...');
    this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    console.log('Canvas found:', this.gameCanvas);
    if (!this.gameCanvas) {
      console.error('Canvas not found!');
      return;
    }

    // Game customization removed - using default settings
    let gameConfig = {};

    if (this.gameMode === 'tournament') {
      const tournamentId = this.getTournamentIdFromContext();
      
      // Apply different speeds based on tournament match type
      const tournamentSpeed = (window as any).tournamentGameSpeed;
      if (tournamentSpeed === 'very-fast') {
        // Final match: very fast speed
        gameConfig = {
          ballSpeed: 8,
          paddleSpeed: 10
        };
        console.log('[DEBUG] Final match: Using very fast speed settings');
      } else if (tournamentSpeed === 'medium') {
        // Semi-final match: medium speed
        gameConfig = {
          ballSpeed: 5,
          paddleSpeed: 7
        };
        console.log('[DEBUG] Semi-final match: Using medium speed settings');
      }
      
      // Tournament game logic with customization
      if (this.gameCanvas) { this.game = create1v1Game(this.gameCanvas, gameConfig); }
      if (this.game) this.game.matchId = 0; // Replace with actual matchId from backend if needed
      if (this.game) this.game.tournamentId = tournamentId;
      this.setupGameCallbacks();
      console.log('[hanieh added] Tournament game created with tournamentId:', tournamentId);
      // Ensure opponent username modal is NOT shown in tournament mode
      const modal = document.getElementById('username-modal') as HTMLElement;
      if (modal) modal.style.display = 'none';
    } else if (this.gameMode === '1v1') {
      // hanieh added: Show custom modal for opponent username
      const modal = document.getElementById('username-modal') as HTMLElement;
      const input = document.getElementById('opponent-username-input') as HTMLInputElement;
      const submitBtn = document.getElementById('submit-username-btn') as HTMLButtonElement;
      const errorDiv = document.getElementById('username-error') as HTMLElement;
      const closeBtn = document.getElementById('close-username-modal') as HTMLElement;
      if (modal && input && submitBtn && errorDiv && closeBtn) {
        modal.style.display = 'flex';
        input.value = '';
        errorDiv.style.display = 'none';
        submitBtn.onclick = () => {
          const opponentUsername = input.value.trim();
          if (!opponentUsername) {
            errorDiv.textContent = 'You must enter a valid username for your opponent!';
            errorDiv.style.display = 'block';
            return;
          }
          modal.style.display = 'none';
          import('./services/api.js').then(({ onevone }) => {
            onevone.start(opponentUsername).then((response: { data?: { matchId?: number }, error?: any }) => {
              const { data, error } = response;
              if (error) {
                errorDiv.textContent = 'Could not start 1v1 match: ' + error;
                errorDiv.style.display = 'block';
                modal.style.display = 'flex';
                return;
              }
              const matchId = data?.matchId;
              if (!matchId) {
                errorDiv.textContent = 'Could not start 1v1 game: No valid matchId from backend.';
                errorDiv.style.display = 'block';
                modal.style.display = 'flex';
                return;
              }
              if (this.gameCanvas) {
                if (this.gameCanvas) { this.game = create1v1Game(this.gameCanvas, gameConfig); }
                if (this.game) this.game.matchId = matchId;
                if (this.game) this.game.tournamentId = undefined;
                
                // Set player names for 1v1 match
                const currentUser = (window as any).currentUser;
                const player1Name = currentUser?.username || 'Player 1';
                const player2Name = opponentUsername;
                this.setPlayerNames(player1Name, player2Name);
                console.log('[DEBUG] 1v1 player names set (initializeGame):', { player1Name, player2Name });
                
                this.setupGameCallbacks();
                if (this.game) {
                  console.log('[hanieh added] 1v1 game created with matchId:', this.game.matchId);
                }
              } else {
                errorDiv.textContent = 'Game canvas not found.';
                errorDiv.style.display = 'block';
                modal.style.display = 'flex';
              }
            });
          });
        };
        closeBtn.onclick = () => {
          modal.style.display = 'none';
        };
      }
    } else {
      // Non-tournament game (demo/AI)
      if (this.gameCanvas) { this.game = create1v1Game(this.gameCanvas, gameConfig); }
      if (this.game) this.game.matchId = 0;
      if (this.game) this.game.tournamentId = 1;
      this.setupGameCallbacks();
      console.log('Game created:', this.game);
    }
  }

  private initializeAIGame(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.gameCanvas) return;

    // Game customization removed - using default settings
    const gameConfig = {};
    const aiSafeConfig = gameConfig;
    
    // For AI games, use demo IDs (or adapt for tournament if needed)
    this.game = createAIGame(this.gameCanvas, difficulty, aiSafeConfig);
    this.game.matchId = Date.now();
    if (this.game) this.game.tournamentId = 1;
    this.setupGameCallbacks();
    // ...existing code...
  }

  // Helper to get tournamentId from context (replace with your logic)
  private getTournamentIdFromContext(): number {
    // TODO: Replace with actual logic to get tournamentId (e.g., from route, state, or user selection)
    return 1;
  }

  private setupGameCallbacks(): void {
    if (!this.game) return;

    // Score update callback
    this.game.onScoreUpdateCallback((player1Score, player2Score) => {
      this.updateScores(player1Score, player2Score);
    });

    // Game end callback
    this.game.onGameEndCallback((winner, gameTime) => {
      this.showGameEndModal(winner, gameTime);
      // If tournament mode, call onNavigateBack to show bracket modal
      if (this.gameMode === 'tournament' && typeof this.onNavigateBack === 'function') {
        this.onNavigateBack();
      }
    });
  }

    // hanieh added: openSettingsModal now implements game customization
  private openSettingsModal(): void {
    // Determine which features to show based on game mode
    const availableFeatures = this.gameMode === 'tournament' ? 
      ['visual', 'controls', 'powerups'] : // Tournament mode - no game rules changes
      ['visual', 'gameplay', 'powerups', 'controls', 'advanced']; // Other modes - full customization
    
    showGameCustomizationModal({
      mode: 'in-game',
      availableFeatures,
      onApply: (settings: GameCustomizationSettings) => {
        // Apply settings to current game if running
        if (this.game) {
          this.game.updateConfig(settings);
        }
        console.log('Game settings applied:', settings);
      },
      onClose: () => {
        console.log('Settings modal closed');
      }
    });
  }

  private setupEventListeners(): void {
    // Back button
    const backBtn = document.getElementById('back-btn');
    backBtn?.addEventListener('click', () => {
      this.cleanup();
      if (this.onNavigateBack) {
        this.onNavigateBack();
      }
    });

    // Settings button  
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn?.addEventListener('click', () => {
      this.openSettingsModal();
    });

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

  // Settings button removed

    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    startBtn?.addEventListener('click', () => {
      this.startGame();
    });

    // Game control buttons
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn?.addEventListener('click', () => {
      this.game?.pauseGame();
    });

    const resetBtn = document.getElementById('reset-btn');
    resetBtn?.addEventListener('click', () => {
      this.game?.resetGame();
      this.hideGameEndModal();
      this.showGameOverlay();
    });

    // Game end modal buttons REMOVED

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isFullscreen) {
          this.exitFullscreen();
        } else {
          this.cleanup();
          if (this.onNavigateBack) {
            this.onNavigateBack();
          }
        }
      }
    });
  }

  private startGame(): void {
    console.log('Starting game...', this.game);
    if (!this.game) {
      console.error('Game not initialized!');
      return;
    }
    this.hideGameOverlay();
    // Force overlay to hide in case of CSS issues
    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.style.display = 'none';
    // Ensure canvas is visible and sized correctly
    if (this.gameCanvas) {
      this.gameCanvas.style.display = 'block';
      this.gameCanvas.width = 800;
      this.gameCanvas.height = 400;
    }
    this.game.startGame();
    this.updateGameStatus('Playing...');
    console.log('Game started successfully');
  }

  private updateScores(player1Score: number, player2Score: number): void {
    const player1ScoreEl = document.getElementById('player1-score');
    const player2ScoreEl = document.getElementById('player2-score');
    
    if (player1ScoreEl) player1ScoreEl.textContent = player1Score.toString();
    if (player2ScoreEl) player2ScoreEl.textContent = player2Score.toString();
  }


    // hanieh added: showGameEndModal is not used, but kept for future modal logic
  private showGameEndModal(_winner: Player, _gameTime: number): void {
    // hanieh added: Send match result to backend for game history
    const matchId = this.game?.matchId;
    const tournamentId = this.game?.tournamentId;
    const player1Score = this.game?.getPlayers().player1.score;
    const player2Score = this.game?.getPlayers().player2.score;
    console.log('[DEBUG] Preparing to submit match result [UPDATED 16:38]:', {
      matchId,
      tournamentId,
      player1Score,
      player2Score,
      game: this.game,
      gameMode: this.gameMode,
      suppressSubmission: (window as any).suppressGamePageResultSubmission,
      allWindowFlags: {
        currentTournamentMatch: (window as any).currentTournamentMatch,
        gamePageSuppressModal: (window as any).gamePageSuppressModal,
        gamePageMode: (window as any).gamePageMode,
        localTournamentMatchId: (window as any).localTournamentMatchId,
        suppressGamePageResultSubmission: (window as any).suppressGamePageResultSubmission
      }
    });
    
    // Check if result submission is suppressed (e.g., handled by TournamentModal)
    const suppressFlag = (window as any).suppressGamePageResultSubmission;
    const isTournament = this.gameMode === 'tournament';
    const hasTournamentMatchId = (window as any).localTournamentMatchId;
    
    if (suppressFlag || isTournament || hasTournamentMatchId) {
      console.log('[DEBUG] Result submission suppressed - handled externally', {
        suppressFlag,
        gameMode: this.gameMode,
        isTournament,
        hasTournamentMatchId
      });
      
      // Call tournament result handler if available
      if ((window as any).tournamentResultHandler && typeof matchId === 'number' && typeof player1Score === 'number' && typeof player2Score === 'number') {
        console.log('[DEBUG] Calling tournament result handler');
        (window as any).tournamentResultHandler(matchId, player1Score, player2Score);
      }
      return;
    }
    
    if (typeof matchId === 'number' && typeof player1Score === 'number' && typeof player2Score === 'number') {
      if (this.gameMode === '1v1') {
        // hanieh added: Use onevone.submitResult for standalone 1v1
        import('./services/api.js').then(({ onevone }) => {
          onevone.submitResult(matchId, player1Score, player2Score)
            .then(({ data, error }: { data: any; error: any }) => {
              if (error) {
                console.error('[hanieh added] Error sending 1v1 match result:', error);
              } else {
                console.log('[hanieh added] 1v1 match result sent to backend:', data);
                window.dispatchEvent(new Event('reloadDashboardStats'));
              }
            })
            .catch((err: unknown) => {
              console.error('[hanieh added] Error sending 1v1 match result:', err);
            });
        });
      } else if (this.gameMode === 'ai') {
        // hanieh added: Save AI match result to backend
        import('./services/api.js').then(({ ai }) => {
          ai.submitResult(player1Score, player2Score)
            .then(({ data, error }: { data: any; error: any }) => {
              if (error) {
                console.error('[hanieh added] Error sending AI match result:', error);
              } else {
                console.log('[hanieh added] AI match result sent to backend:', data);
                window.dispatchEvent(new Event('reloadDashboardStats'));
              }
            })
            .catch((err: unknown) => {
              console.error('[hanieh added] Error sending AI match result:', err);
            });
        });
      } else if (this.gameMode === 'tournament') {
        // Handle all tournament matches using the tournament finish endpoint
        const currentTournamentId = (window as any).currentTournamentId || tournamentId;
        
        if (currentTournamentId) {
          import('./services/api.js').then(({ apiService }) => {
            console.log('[DEBUG] Sending tournament match result:', {
              tournamentId: currentTournamentId,
              matchId,
              userScore: player1Score,
              opponentScore: player2Score
            });
            
            apiService.tournaments.finish(currentTournamentId, {
              matchId,
              userScore: player1Score,
              opponentScore: player2Score
            })
              .then(({ data, error }: { data: any; error: any }) => {
                if (error) {
                  console.error('[DEBUG] Error sending tournament match result:', error);
                } else {
                  console.log('[DEBUG] Tournament match result sent successfully:', data);
                  window.dispatchEvent(new Event('reloadDashboardStats'));
                }
              })
              .catch((err: unknown) => {
                console.error('[DEBUG] Error sending tournament match result (catch):', err);
              });
          });
        } else {
          console.error('[DEBUG] No tournament ID found for tournament match');
        }
      } else {
        console.warn('[ADDED] Missing tournamentId for tournament match result', {
          matchId,
          tournamentId,
          player1Score,
          player2Score,
          game: this.game
        });
      }
    } else {
      console.warn('[ADDED] Missing matchId or scores, cannot send match result to backend', {
        matchId,
        tournamentId,
        player1Score,
        player2Score,
        game: this.game
      });
    }
  // Game End Modal logic REMOVED
  }

  private hideGameEndModal(): void {
  // Game End Modal hide logic REMOVED
  }

  private showGameOverlay(): void {
    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.style.display = 'flex';
    this.updateGameStatus('Ready to Play');
  }

  private hideGameOverlay(): void {
    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  private updateGameStatus(status: string): void {
    const statusEl = document.getElementById('game-status');
    if (statusEl) statusEl.textContent = status;
  }

  private toggleFullscreen(): void {
    const gameContainer = document.getElementById('game-container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    if (!gameContainer || !fullscreenBtn) return;

    if (!this.isFullscreen) {
      if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen();
      }
      this.isFullscreen = true;
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      this.exitFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    this.isFullscreen = false;
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  }

  public cleanup(): void {
    if (this.game) {
      this.game.destroy();
      this.game = null;
    }
    
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }
}

// Export factory functions for easy integration
export function create1v1GamePage(container: HTMLElement, onNavigateBack?: () => void): GamePage {
  const gamePage = new GamePage(container, onNavigateBack);
  console.log('[DEBUG] create1v1GamePage called. Flags:', {
    currentTournamentMatch: (window as any).currentTournamentMatch,
    suppressModal: gamePage.suppressModal,
    gameMode: gamePage.gameMode,
    globalSuppressModal: (window as any).gamePageSuppressModal,
    globalGameMode: (window as any).gamePageMode
  });
  // Strong guard: Never show modal if tournament or suppressModal is true
  if ((window as any).currentTournamentMatch) {
    gamePage.gameMode = 'tournament';
    gamePage.suppressModal = true;
    gamePage.renderGameInterface();
    window.requestAnimationFrame(() => gamePage.initializeGame());
    return gamePage;
  }
  if (gamePage.gameMode === 'tournament' || gamePage.suppressModal) {
    gamePage.gameMode = 'tournament';
    gamePage.suppressModal = true;
    gamePage.renderGameInterface();
    window.requestAnimationFrame(() => gamePage.initializeGame());
    return gamePage;
  }
  gamePage.suppressModal = false;
  gamePage.render1v1Game();
  return gamePage;
}

export function createAIGamePage(container: HTMLElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium', onNavigateBack?: () => void): GamePage {
  const gamePage = new GamePage(container, onNavigateBack);
  gamePage.renderAIGame(difficulty);
  return gamePage;
}
