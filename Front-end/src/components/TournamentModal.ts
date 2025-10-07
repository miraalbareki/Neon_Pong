// Tournament Bracket Modal for 4-player knockout
// This is a simple modal that collects 4 player names and displays a bracket

import { languageManager } from '../translations';

export function showTournamentBracketModal() {
  const t = languageManager.getTranslations();
  // Remove any existing modal
  let oldModal = document.getElementById('tournament-bracket-modal');
  if (oldModal) oldModal.remove();

  // Modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'tournament-bracket-modal';
  overlay.className = 'modal-overlay';

  // Modal content
  const modal = document.createElement('div');
  modal.className = 'tournament-container';
  modal.innerHTML = `
    <button class="close-btn">×</button>
    <div class="bracket-preview">
      <svg viewBox="0 0 100 100">
        <path d="M20 20 L40 20 L40 35 L60 35 M40 35 L40 50 L20 50 M20 70 L40 70 L40 65 L60 65 M40 65 L40 80 L20 80 M60 35 L60 50 L80 50 M60 65 L60 50"/>
      </svg>
    </div>
    <h1 class="title">${t.games.tournaments.modal.title}</h1>
    <p class="subtitle">${t.games.tournaments.modal.bracketSetup}</p>
    <div class="tournament-title-container">
      <input type="text" id="tournamentTitle" class="tournament-title-input" placeholder="Enter tournament title" maxlength="30" value="My Awesome Tournament">
    </div>
    <div class="players-grid">
      <div class="player-slot">
        <span class="player-number">P1</span>
        <input type="text" class="player-input" placeholder="Player 1" maxlength="20">
      </div>
      <div class="player-slot">
        <span class="player-number">P2</span>
        <input type="text" class="player-input" placeholder="Player 2" maxlength="20">
      </div>
      <div class="player-slot">
        <span class="player-number">P3</span>
        <input type="text" class="player-input" placeholder="Player 3" maxlength="20">
      </div>
      <div class="player-slot">
        <span class="player-number">P4</span>
        <input type="text" class="player-input" placeholder="Player 4" maxlength="20">
      </div>
    </div>
    <div class="vs-indicator">VS</div>
    <button class="start-button" id="startBtn">⚡ Generate Bracket ⚡</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add styles (only once)
  if (!document.getElementById('tournament-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'tournament-modal-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      .tournament-container {
        font-family: 'JetBrains Mono', monospace;
        background: rgba(20, 20, 30, 0.95);
        border: 2px solid #00fff7;
        border-radius: 32px;
        padding: 48px 32px;
        max-width: 600px;
        width: 100%;
        position: relative;
        backdrop-filter: blur(18px) saturate(180%);
        box-shadow: 0 0 60px 0 #00fff7, 0 0 0 4px #222 inset;
        animation: slideIn 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
        border-image: linear-gradient(135deg, #00fff7 0%, #ff00ea 100%) 1;
        overflow: hidden;
      }
      .close-btn {
        position: absolute;
        top: 18px;
        right: 28px;
        background: none;
        border: none;
        color: #00fff7;
        font-size: 32px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'JetBrains Mono', monospace;
        text-shadow: 0 0 12px #00fff7, 0 0 2px #fff;
      }
      .close-btn:hover {
        color: #ff00ea;
        transform: rotate(90deg) scale(1.2);
        text-shadow: 0 0 24px #ff00ea;
      }
      .title {
        color: #00fff7;
        font-size: 38px;
        font-weight: 800;
        text-align: center;
        margin-bottom: 18px;
        text-shadow: 0 0 32px #00fff7, 0 0 8px #ff00ea;
        letter-spacing: 3px;
        background: linear-gradient(90deg, #00fff7 0%, #ff00ea 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .subtitle {
        color: #fff;
        text-align: center;
        margin-bottom: 24px;
        font-size: 16px;
        letter-spacing: 2px;
        opacity: 0.7;
      }
      .tournament-title-container {
        width: 100%;
        margin-bottom: 20px;
        text-align: center;
      }
      .tournament-title-input {
        width: 80%;
        max-width: 400px;
        background: rgba(255,255,255,0.1);
        border: 2px solid #00fff7;
        border-radius: 12px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        padding: 12px 20px;
        text-align: center;
        outline: none;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(0, 255, 247, 0.3);
      }
      .tournament-title-input:focus {
        border-color: #ff00ea;
        box-shadow: 0 0 25px rgba(255, 0, 234, 0.5);
        transform: scale(1.02);
      }
      .tournament-title-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
        font-weight: 400;
      }
      .players-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        margin-bottom: 48px;
        width: 100%;
        position: relative;
        padding-top: 20px;
      }
      .player-slot {
        position: relative;
        background: linear-gradient(135deg, rgba(0,255,247,0.08), rgba(255,0,234,0.08));
        border: 2px solid #222;
        border-radius: 18px;
        padding: 32px 20px;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-shadow: 0 0 24px 0 #00fff7 inset;
        transition: box-shadow 0.3s, border-color 0.3s;
        opacity: 0;
        transform: translateY(24px);
        animation: fadeInUp 0.5s ease-out forwards;
      }
      .player-slot:nth-child(1) { animation-delay: 0.1s; }
      .player-slot:nth-child(2) { animation-delay: 0.2s; }
      .player-slot:nth-child(3) { animation-delay: 0.3s; }
      .player-slot:nth-child(4) { animation-delay: 0.4s; }
      .player-slot.filled {
        border-color: #00fff7;
        box-shadow: 0 0 32px 0 #ff00ea inset;
        background: linear-gradient(135deg, rgba(0,255,247,0.18), rgba(255,0,234,0.18));
      }
      .player-slot.duplicate-error {
        border-color: #ef4444;
        box-shadow: 0 0 32px 0 #ef4444 inset;
        background: linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.18));
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
      }
      .player-number {
        position: absolute;
        top: -12px;
        left: 20px;
        background: linear-gradient(135deg, #00fff7, #ff00ea);
        color: #222;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 20px;
        letter-spacing: 1px;
        box-shadow: 0 4px 16px #00fff7;
        z-index: 10;
      }
      .player-input {
        background: rgba(255,255,255,0.08);
        border: none;
        color: #fff;
        font-size: 20px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        outline: none;
        width: 100%;
        text-align: center;
        letter-spacing: 2px;
        border-radius: 8px;
        padding: 10px 0;
        box-shadow: 0 0 8px #00fff7 inset;
        transition: box-shadow 0.2s;
      }
      .player-input:focus {
        box-shadow: 0 0 16px #ff00ea inset;
      }
      .player-input::placeholder {
        color: #00fff7;
        font-weight: 400;
        opacity: 0.5;
      }
      .player-input.duplicate-input {
        box-shadow: 0 0 16px #ef4444 inset;
        border: 1px solid #ef4444;
      }
      .error-message {
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 16px;
        margin: 20px 0;
        animation: fadeInShake 0.5s ease-out;
      }
      .error-content {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;
        font-weight: 600;
      }
      .error-icon {
        font-size: 20px;
        color: #ef4444;
      }
      .error-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
      }
      .vs-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        background: linear-gradient(90deg, #00fff7 0%, #ff00ea 100%);
        color: #fff;
        font-size: 18px;
        font-weight: 800;
        padding: 10px 22px;
        border-radius: 32px;
        border: 2px solid #00fff7;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 0 24px #ff00ea;
        backdrop-filter: blur(8px);
      }
      .start-button {
        width: 100%;
        background: linear-gradient(90deg, #00fff7 0%, #ff00ea 100%);
        border: none;
        border-radius: 18px;
        padding: 22px;
        color: #222;
        font-size: 20px;
        font-weight: 800;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.3s;
        text-transform: uppercase;
        letter-spacing: 3px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 32px #00fff7, 0 0 0 2px #ff00ea inset;
      }
      .start-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: left 0.5s;
      }
      .start-button:hover {
        transform: translateY(-3px) scale(1.04);
        box-shadow: 0 15px 40px #ff00ea, 0 0 0 2px #00fff7 inset;
      }
      .start-button:hover::before {
        left: 100%;
      }
      .start-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        background: linear-gradient(90deg, #666 0%, #888 100%);
      }
      .start-button:disabled:hover {
        transform: none;
        box-shadow: 0 8px 25px #ff00ea;
      }
      .bracket-preview {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 80px;
        height: 80px;
        opacity: 0.12;
        pointer-events: none;
      }
      .bracket-preview svg {
        width: 100%;
        height: 100%;
        stroke: #00fff7;
        fill: none;
        stroke-width: 2;
      }
      @media (max-width: 640px) {
        .tournament-container { padding: 18px; margin: 10px; }
        .players-grid { gap: 14px; }
        .player-slot { padding: 14px 8px; min-height: 80px; }
        .title { font-size: 24px; }
        .player-input { font-size: 14px; }
      }
      @media (max-width: 480px) {
        .players-grid { grid-template-columns: 1fr; gap: 8px; }
        .vs-indicator { display: none; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes fadeInUp {
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideOut {
        to { opacity: 0; transform: translateY(-30px) scale(0.9); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      @keyframes fadeInShake {
        0% { opacity: 0; transform: translateY(-10px) scale(0.9); }
        50% { opacity: 1; transform: translateY(0) scale(1.02); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      /* Player Selection Styles */
      .player-selection-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin: 32px 0;
        padding: 20px;
      }
      
      .player-selection-card {
        background: linear-gradient(135deg, rgba(0,255,247,0.1), rgba(255,0,234,0.1));
        border: 2px solid #333;
        border-radius: 16px;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        position: relative;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .player-selection-card:hover {
        border-color: #00fff7;
        box-shadow: 0 0 20px rgba(0, 255, 247, 0.3);
        transform: translateY(-2px);
      }
      
      .player-selection-card.selected {
        border-color: #00fff7;
        background: linear-gradient(135deg, rgba(0,255,247,0.2), rgba(255,0,234,0.2));
        box-shadow: 0 0 30px rgba(0, 255, 247, 0.5);
        transform: scale(1.05);
      }
      
      .player-selection-number {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00fff7, #ff00ea);
        color: #222;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 20px;
        letter-spacing: 1px;
      }
      
      .player-selection-name {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin: 8px 0;
        letter-spacing: 1px;
      }
      
      .player-selection-indicator {
        font-size: 24px;
        opacity: 0.7;
        transition: all 0.3s ease;
      }
      
      .player-selection-card.selected .player-selection-indicator {
        opacity: 1;
        transform: scale(1.2);
      }
      
      .selection-buttons {
        display: flex;
        gap: 16px;
        margin-top: 32px;
      }
      
      .back-button {
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #666;
        border-radius: 12px;
        padding: 16px 24px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .back-button:hover {
        border-color: #888;
        background: rgba(255, 255, 255, 0.15);
      }
      
      .confirm-selection-button {
        flex: 2;
        background: linear-gradient(90deg, #00fff7 0%, #ff00ea 100%);
        border: none;
        border-radius: 12px;
        padding: 16px 24px;
        color: #222;
        font-size: 16px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 2px;
        opacity: 0.5;
      }
      
      .confirm-selection-button:not(:disabled) {
        opacity: 1;
      }
      
      .confirm-selection-button:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 255, 247, 0.4);
      }
    `;
    document.head.appendChild(style);
  }

  // JS logic for modal
  const inputs = modal.querySelectorAll('.player-input') as NodeListOf<HTMLInputElement>;
  const startBtn = modal.querySelector('#startBtn') as HTMLButtonElement;
  const slots = modal.querySelectorAll('.player-slot');
  function updateSlotState(input: HTMLInputElement, slot: Element) {
    if (input.value.trim()) {
      slot.classList.add('filled');
    } else {
      slot.classList.remove('filled');
    }
  }
  
  function checkForDuplicates(): string[] {
    const names = Array.from(inputs).map(input => input.value.trim().toLowerCase()).filter(name => name !== '');
    const duplicates: string[] = [];
    const seen = new Set<string>();
    
    for (const name of names) {
      if (seen.has(name)) {
        duplicates.push(name);
      } else {
        seen.add(name);
      }
    }
    
    return duplicates;
  }
  
  function showErrorMessage(message: string) {
    // Remove any existing error message
    const existingError = modal.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">${message}</span>
      </div>
    `;
    
    // Insert error message before the start button
    const startButtonContainer = modal.querySelector('.start-button');
    if (startButtonContainer) {
      startButtonContainer.parentNode?.insertBefore(errorDiv, startButtonContainer);
    }
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
  
  function highlightDuplicateInputs(duplicateNames: string[]) {    
    // Reset all input highlights
    inputs.forEach((input, index) => {
      const slot = slots[index];
      slot.classList.remove('duplicate-error');
      input.classList.remove('duplicate-input');
    });
    
    // Highlight inputs with duplicate names
    if (duplicateNames.length > 0) {
      inputs.forEach((input, index) => {
        const inputValue = input.value.trim().toLowerCase();
        if (duplicateNames.includes(inputValue)) {
          const slot = slots[index];
          slot.classList.add('duplicate-error');
          input.classList.add('duplicate-input');
        }
      });
    }
  }
  
  function checkAllInputs() {
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
    const duplicates = checkForDuplicates();
    const hasDuplicates = duplicates.length > 0;
    
    // Highlight duplicate inputs
    highlightDuplicateInputs(duplicates);
    
    // Remove any existing error message if no duplicates
    if (!hasDuplicates) {
      const existingError = modal.querySelector('.error-message');
      if (existingError) existingError.remove();
    }
    
    // Enable button only if all filled and no duplicates
    startBtn.disabled = !allFilled || hasDuplicates;
    
    if (hasDuplicates) {
      startBtn.innerHTML = t.games.tournaments.modal.duplicateNames;
      startBtn.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    } else if (allFilled) {
      startBtn.innerHTML = t.games.tournaments.modal.startTournament;
      startBtn.style.background = 'linear-gradient(90deg, #00fff7 0%, #ff00ea 100%)';
    } else {
      startBtn.innerHTML = t.games.tournaments.modal.generateBracket;
      startBtn.style.background = 'linear-gradient(90deg, #00fff7 0%, #ff00ea 100%)';
    }
  }
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      updateSlotState(input, slots[index]);
      checkAllInputs();
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const nextInput = inputs[index + 1];
        if (nextInput) {
          nextInput.focus();
        } else if (!startBtn.disabled) {
          startTournament();
        }
      }
    });
  });
  async function startTournament() {
    if (startBtn.disabled) return;
    
    const players = Array.from(inputs).map(input => input.value.trim());
    
    // Final validation check for duplicates
    const duplicates = checkForDuplicates();
    if (duplicates.length > 0) {
      const duplicateList = duplicates.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(', ');
      showErrorMessage(`Duplicate names found: ${duplicateList}. Each player must have a unique name.`);
      return;
    }
    
    // Check for empty names
    if (players.some(name => name === '')) {
      showErrorMessage('All player names must be filled in.');
      return;
    }
    
    // Show player selection step
    showPlayerSelectionStep(players);
  }

  function showPlayerSelectionStep(players: string[]) {
    // Hide the current form and show player selection
    const modal = overlay.querySelector('.tournament-container') as HTMLElement;
    if (!modal) return;
    
    modal.innerHTML = `
      <button class="close-btn">×</button>
      <div class="bracket-preview">
        <svg viewBox="0 0 100 100">
          <path d="M20 20 L40 20 L40 35 L60 35 M40 35 L40 50 L20 50 M20 70 L40 70 L40 65 L60 65 M40 65 L40 80 L20 80 M60 35 L60 50 L80 50 M60 65 L60 50"/>
        </svg>
      </div>
      <h1 class="title">${t.games.tournaments.modal.selectPlayer}</h1>
      <p class="subtitle">${t.games.tournaments.modal.selectAlias}</p>
      <div class="player-selection-grid">
        ${players.map((player: string, index: number) => `
          <div class="player-selection-card" data-player="${player}" data-index="${index}">
            <div class="player-selection-number">P${index + 1}</div>
            <div class="player-selection-name">${player}</div>
            <div class="player-selection-indicator">👤</div>
          </div>
        `).join('')}
      </div>
      <div class="selection-buttons">
        <button class="back-button" id="backBtn">← Back to Edit Players</button>
        <button class="confirm-selection-button" id="confirmBtn" disabled>Create Tournament</button>
      </div>
    `;

    // Add event listeners for player selection
    let selectedPlayer: string | null = null;
    const playerCards = modal.querySelectorAll('.player-selection-card');
    const confirmBtn = modal.querySelector('#confirmBtn') as HTMLButtonElement;
    const backBtn = modal.querySelector('#backBtn') as HTMLButtonElement;
    const closeBtn = modal.querySelector('.close-btn') as HTMLButtonElement;

    playerCards.forEach(card => {
      card.addEventListener('click', () => {
        // Remove previous selection
        playerCards.forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        selectedPlayer = (card as HTMLElement).dataset.player || null;
        
        // Enable confirm button
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = '1';
        }
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Go back to original form
        overlay.remove();
        showTournamentBracketModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.remove();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (selectedPlayer) {
          createTournamentWithAlias(players, selectedPlayer);
        }
      });
    }
  }

  async function createTournamentWithAlias(players: string[], creatorAlias: string) {
    const confirmBtn = overlay.querySelector('#confirmBtn') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.innerHTML = t.games.tournaments.modal.creating;
      confirmBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)';
    }
    
    try {
      console.log('[🚀 FRONTEND DEBUG] Starting tournament creation process...');
      console.log('[🚀 FRONTEND DEBUG] Players array:', players);
      console.log('[🚀 FRONTEND DEBUG] Selected creator alias:', creatorAlias);
      
      // Step 1: Create tournament in backend with selected player as creator
      const { apiService } = await import('../services/api');
      const tournamentName = `Tournament ${new Date().toLocaleTimeString()}`;
      
      console.log('[🚀 FRONTEND DEBUG] Tournament parameters:', {
        name: tournamentName,
        creatorAlias: creatorAlias,
        min_players: 4,
        max_players: 4
      });
      
      console.log('[🚀 FRONTEND DEBUG] Calling apiService.tournaments.create...');
      const createResponse = await apiService.tournaments.create(
        tournamentName,
        4, // min_players
        4, // max_players
        creatorAlias
      );
      
      console.log('[✅ FRONTEND SUCCESS] Tournament creation response:', createResponse);
      const tournamentId = createResponse.data.tournamentId;
      console.log('[🚀 FRONTEND DEBUG] Tournament ID:', tournamentId);
      
      // Store tournament ID globally for result submission
      (window as any).currentTournamentId = tournamentId;
      
      // Step 2: Join remaining players as guests (skip the creator who's already joined)
      console.log('[🚀 FRONTEND DEBUG] Starting guest player joins...');
      console.log('[🚀 FRONTEND DEBUG] Creator alias (already joined):', creatorAlias);
      
      for (let i = 0; i < players.length; i++) {
        // Skip the creator - they're already joined during tournament creation
        if (players[i] === creatorAlias) {
          console.log(`[🚀 FRONTEND DEBUG] Skipping creator ${players[i]} - already joined`);
          continue;
        }
        
        try {
          console.log(`[🚀 FRONTEND DEBUG] Joining guest: ${players[i]} to tournament ${tournamentId}`);
          const joinResponse = await apiService.tournaments.join(tournamentId, players[i]);
          console.log(`[✅ FRONTEND SUCCESS] Player ${players[i]} joined:`, joinResponse);
        } catch (error) {
          console.log(`[❌ FRONTEND ERROR] Player ${players[i]} join failed:`, error);
          // Continue with other players if one fails
        }
      }
      
      console.log('[🚀 FRONTEND DEBUG] All players processed, showing matchmaking...');
      // Step 3: Show matchmaking animation with real backend tournament
      overlay.remove();
      await showMatchmakingAnimation(players, tournamentId);
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      startBtn.innerHTML = t.games.tournaments.modal.errorTryAgain;
      startBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
      setTimeout(() => {
        startBtn.innerHTML = t.games.tournaments.modal.startTournament;
        startBtn.style.background = 'linear-gradient(90deg, #00fff7 0%, #ff00ea 100%)';
      }, 2000);
    }
  }
  startBtn.addEventListener('click', startTournament);
  checkAllInputs();
  (inputs[0] as HTMLInputElement).focus();
  // Close button
  modal.querySelector('.close-btn')?.addEventListener('click', () => {
    modal.style.animation = 'slideOut 0.4s ease-in';
    setTimeout(() => overlay.remove(), 400);
  });
}

// Slot Machine Matchmaking Animation Function
async function showMatchmakingAnimation(players: string[], tournamentId: number | null): Promise<void> {
  const t = languageManager.getTranslations();
  return new Promise(async (resolve) => {
    // Create matchmaking overlay
    const matchmakingOverlay = document.createElement('div');
    matchmakingOverlay.id = 'matchmaking-overlay';
    matchmakingOverlay.className = 'modal-overlay';
    
    // Slot Machine Matchmaking container
    const matchmakingContainer = document.createElement('div');
    matchmakingContainer.className = 'slot-machine-container';
    matchmakingContainer.innerHTML = `
      <div class="matchmaking-header">
        <h1 class="matchmaking-title">${t.games.tournaments.modal.matchmaking}</h1>
        <p class="matchmaking-subtitle">Using advanced backend matchmaking algorithms...</p>
      </div>
      
      <div class="matches-container">
        <!-- Match 1 -->
        <div class="match-picker">
          <h3 class="match-title">SEMIFINAL MATCH 1</h3>
          <div class="slot-machine-match">
            <div class="player-slot" data-slot="match1-player1">
              <div class="slot-reel">
                ${players.map(player => `<div class="slot-name">${player}</div>`).join('')}
              </div>
            </div>
            <div class="vs-divider">VS</div>
            <div class="player-slot" data-slot="match1-player2">
              <div class="slot-reel">
                ${players.map(player => `<div class="slot-name">${player}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Match 2 -->
        <div class="match-picker">
          <h3 class="match-title">SEMIFINAL MATCH 2</h3>
          <div class="slot-machine-match">
            <div class="player-slot" data-slot="match2-player1">
              <div class="slot-reel">
                ${players.map(player => `<div class="slot-name">${player}</div>`).join('')}
              </div>
            </div>
            <div class="vs-divider">VS</div>
            <div class="player-slot" data-slot="match2-player2">
              <div class="slot-reel">
                ${players.map(player => `<div class="slot-name">${player}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="matchmaking-status">
        <div class="status-text">⚙️ Backend system calculating optimal matches...</div>
      </div>
    `;
    
    matchmakingOverlay.appendChild(matchmakingContainer);
    document.body.appendChild(matchmakingOverlay);
    
    // Add matchmaking styles
    if (!document.getElementById('matchmaking-styles')) {
      const style = document.createElement('style');
      style.id = 'matchmaking-styles';
      style.textContent = `
        .matchmaking-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(10px);
        }
        
        .slot-machine-container {
          background: rgba(15, 23, 42, 0.95);
          border: 2px solid #00fff7;
          border-radius: 24px;
          padding: 40px;
          max-width: 1000px;
          width: 100%;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 50px rgba(0, 255, 247, 0.3);
          animation: slideInScale 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .matches-container {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin: 40px 0;
        }
        
        .match-picker {
          flex: 1;
          max-width: 400px;
        }
        
        .match-title {
          color: #00fff7;
          font-size: 1.2em;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 0 0 10px rgba(0, 255, 247, 0.5);
        }
        
        .slot-machine-match {
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(0, 255, 247, 0.3);
          border-radius: 16px;
          padding: 30px 20px;
        }
        
        .player-slot {
          flex: 1;
          height: 80px;
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid #00fff7;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        .slot-reel {
          display: flex;
          flex-direction: column;
          animation: slotSpin 3s ease-out;
          transform: translateY(0);
        }
        
        .slot-name {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1.1em;
          font-weight: 600;
          background: linear-gradient(135deg, rgba(0, 255, 247, 0.1), rgba(255, 0, 234, 0.1));
          border-bottom: 1px solid rgba(0, 255, 247, 0.2);
        }
        
        .vs-divider {
          color: #ff00ea;
          font-size: 1.5em;
          font-weight: 800;
          text-shadow: 0 0 15px rgba(255, 0, 234, 0.8);
          min-width: 50px;
          text-align: center;
        }
        
        @keyframes slotSpin {
          0% { transform: translateY(0); }
          70% { transform: translateY(-400px); }
          100% { transform: translateY(-320px); }
        }
        
        .matchmaking-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .matchmaking-title {
          font-size: 2.5em;
          font-weight: 800;
          background: linear-gradient(135deg, #00fff7, #ff00ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
          text-shadow: 0 0 30px rgba(0, 255, 247, 0.5);
        }
        
        .matchmaking-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1em;
          margin-bottom: 0;
        }
        
        .matchmaking-status {
          text-align: center;
          margin-top: 30px;
        }
        
        .status-text {
          color: #fff;
          font-size: 1.1em;
          font-weight: 500;
        }
        
        .players-analysis {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .player-card {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(0, 255, 247, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .player-card.analyzing {
          border-color: #00fff7;
          box-shadow: 0 0 20px rgba(0, 255, 247, 0.4);
          transform: scale(1.05);
        }
        
        .player-avatar {
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        .player-name {
          color: #fff;
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 1.1em;
        }
        
        .analysis-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .analysis-fill {
          height: 100%;
          background: linear-gradient(90deg, #00fff7, #ff00ea);
          width: 0%;
          transition: width 2s ease;
        }
        
        .skill-rating {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9em;
        }
        
        .matchmaking-progress {
          margin-bottom: 30px;
        }
        
        .progress-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 15px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00fff7, #ff00ea);
          width: 0%;
          transition: width 0.5s ease;
        }
        
        .progress-text {
          text-align: center;
          color: #fff;
          font-weight: 500;
        }
        
        .matchmaking-status {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        
        .status-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        
        .status-item.active {
          background: rgba(0, 255, 247, 0.2);
          border: 1px solid #00fff7;
          box-shadow: 0 0 15px rgba(0, 255, 247, 0.3);
        }
        
        .status-item.completed {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid #22c55e;
        }
        
        .status-icon {
          font-size: 1.5em;
          margin-bottom: 8px;
        }
        
        .status-text {
          color: #fff;
          font-size: 0.9em;
          text-align: center;
        }
        
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @media (max-width: 768px) {
          .matches-container {
            flex-direction: column;
            gap: 30px;
          }
          .slot-machine-match {
            flex-direction: column;
            gap: 15px;
          }
          .vs-divider {
            transform: rotate(90deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Slot Machine Animation Logic
    
    // Add spinning animation styles
    const spinningStyle = document.createElement('style');
    spinningStyle.id = 'spinning-styles';
    spinningStyle.textContent = `
      .slot-reel.spinning {
        animation: slotSpinContinuous 0.1s linear infinite;
      }
      
      @keyframes slotSpinContinuous {
        0% { transform: translateY(0); }
        100% { transform: translateY(-80px); }
      }
    `;
    document.head.appendChild(spinningStyle);
    
    // Start the slot machine animations immediately
    const allSlotReels = matchmakingContainer.querySelectorAll('.slot-reel');
    allSlotReels.forEach((reel, index) => {
      // Add slight delay between each slot for visual effect
      setTimeout(() => {
        reel.classList.add('spinning');
      }, index * 200);
    });
    
    // Get real backend matchmaking results during animation
    let backendMatchesPromise: Promise<any[]> | null = null;
    
    if (tournamentId) {
      // Start the backend request immediately and store the promise
      backendMatchesPromise = (async () => {
        try {
          console.log('[🚀 FRONTEND API] Calling backend tournament start API for tournament:', tournamentId);
          const { apiService } = await import('../services/api');
          const startResponse = await apiService.tournaments.start(tournamentId);
          console.log('[🚀 FRONTEND API] ✅ Backend API call successful! Response:', startResponse);
          
          if (startResponse.data && startResponse.data.matches) {
            const matches = startResponse.data.matches;
            console.log('[🚀 FRONTEND API] ✅ Backend provided matches:', matches);
            
            // IMPORTANT: Store backend matches globally immediately when received
            (window as any).globalBackendMatches = matches;
            console.log('[🚀 FRONTEND API] ✅ Stored backend matches globally for slot machine use');
            return matches;
          } else {
            console.error('[🚀 FRONTEND API] ❌ Backend API success but no matches found in response:', startResponse);
            return [];
          }
        } catch (error) {
          console.error('[🚀 FRONTEND API] ❌ Backend API call failed with error:', error);
          console.error('[🚀 FRONTEND API] This will trigger frontend fallback randomization');
          return [];
        }
      })();
    }
    
    // Helper function to set slot result
    function setSlotResult(slotId: string, playerName: string) {
      const slot = matchmakingContainer.querySelector(`[data-slot="${slotId}"] .slot-reel`);
      if (slot) {
        // Instead of positioning, directly replace the content with the correct name
        (slot as HTMLElement).innerHTML = `<div class="slot-name" style="height: 80px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1em; font-weight: 600; background: linear-gradient(135deg, rgba(0, 255, 247, 0.1), rgba(255, 0, 234, 0.1));">${playerName}</div>`;
        (slot as HTMLElement).style.transform = 'translateY(0px)';
        (slot as HTMLElement).style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        console.log(`[DEBUG] Setting ${slotId} to ${playerName} - content replaced`);
      }
    }
    
    // Stop slot machines and show final results after waiting for backend
    setTimeout(async () => {
      // Stop all animations
      allSlotReels.forEach(reel => {
        reel.classList.remove('spinning');
        (reel as HTMLElement).style.animation = 'none';
      });
      
      // Wait for backend response if available
      let finalMatches: any[] = [];
      if (backendMatchesPromise) {
        try {
          finalMatches = await backendMatchesPromise;
          console.log('[DEBUG] Awaited backend matches:', finalMatches);
        } catch (error) {
          console.error('[DEBUG] Error waiting for backend matches:', error);
        }
      }
      
      // Position slots to show final matches
      if (finalMatches.length >= 2) {
        // Use real backend matches
        const match1 = finalMatches[0];
        const match2 = finalMatches[1];
        
        // Store backend matches globally for startGame function
        (window as any).globalBackendMatches = finalMatches;
        
        // Set final positions based on backend results
        console.log('[🎯 FRONTEND] ✅ Using BACKEND randomization! Backend Fisher-Yates shuffle was successful.');
        console.log('[🎯 FRONTEND] Backend provided matches:', finalMatches);
        setSlotResult('match1-player1', match1.player1.tournament_alias);
        setSlotResult('match1-player2', match1.player2.tournament_alias);
        setSlotResult('match2-player1', match2.player1.tournament_alias);
        setSlotResult('match2-player2', match2.player2.tournament_alias);
        
        console.log('[🎯 FRONTEND] Final pairings from backend:');
        console.log(`[🎯 FRONTEND] Match 1: ${match1.player1.tournament_alias} vs ${match1.player2.tournament_alias}`);
        console.log(`[🎯 FRONTEND] Match 2: ${match2.player1.tournament_alias} vs ${match2.player2.tournament_alias}`);
      } else {
        // Fallback to random assignment if backend fails
        console.log('[⚠️ FRONTEND] ❌ Backend failed! Using FRONTEND fallback randomization.');
        console.log('[⚠️ FRONTEND] Backend matches were:', finalMatches);
        console.log('[⚠️ FRONTEND] Players before frontend shuffle:', players);
        
        // Use Fisher-Yates shuffle for proper randomization
        const shuffled = [...players];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        console.log('[⚠️ FRONTEND] Players after frontend Fisher-Yates shuffle:', shuffled);
        
        setSlotResult('match1-player1', shuffled[0]);
        setSlotResult('match1-player2', shuffled[1]);
        setSlotResult('match2-player1', shuffled[2]);
        setSlotResult('match2-player2', shuffled[3]);
        
        console.log('[⚠️ FRONTEND] Final pairings from frontend fallback:');
        console.log(`[⚠️ FRONTEND] Match 1: ${shuffled[0]} vs ${shuffled[1]}`);
        console.log(`[⚠️ FRONTEND] Match 2: ${shuffled[2]} vs ${shuffled[3]}`);
      }
      
      // Update status to show results
      const statusText = matchmakingContainer.querySelector('.status-text');
      if (statusText) {
        statusText.textContent = '🎉 Perfect matches found! Enjoy the results...';
      }
      
      // Wait longer to show the final results before transitioning to bracket
      setTimeout(() => {
        if (statusText) {
          statusText.textContent = '🏆 Loading tournament bracket...';
        }
        
        // Final transition to bracket after showing results
        setTimeout(() => {
          matchmakingOverlay.remove();
          showBracket(players);
          resolve();
        }, 1500);
      }, 3000); // Show results for 3 seconds
    }, 5000); // Spin for 5 seconds
  });
}


function showBracket(players: string[]) {
  const t = languageManager.getTranslations();
  // Helper to fetch matches for a tournament
  async function fetchTournamentMatches(tournamentId: number) {
  const { apiService } = await import('../services/api');
  // hanieh added: use tournaments.getById
  const response = await apiService.tournaments.getById(tournamentId);
  // The backend returns {data: {data: {tournament, matches}}} so we need response.data.data.matches
  return response.data && response.data.data && response.data.data.matches ? response.data.data.matches : [];
  }
  // Helper to show 'Back to Bracket' button after match ends
  function showGameOverModal() {
    // Remove any existing modal
    let oldModal = document.getElementById('game-over-modal');
    if (oldModal) oldModal.remove();
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'game-over-modal';
    overlay.className = 'modal-overlay';
    // Modal content
    const modal = document.createElement('div');
    modal.className = 'game-over-modal-content';
    modal.innerHTML = `
      <h2 style="text-align:center;margin-bottom:1.5rem;">Game is over</h2>
      <p style="text-align:center;margin-bottom:2rem;">Click below to return to the bracket and play the next match.</p>
      <button id="back-to-bracket-btn" class="btn btn-primary" style="width:100%;font-size:1.1em;">Back to Bracket</button>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    // Button logic
    modal.querySelector('#back-to-bracket-btn')?.addEventListener('click', () => {
      overlay.remove();
      const app = document.getElementById('app');
      if (app) app.innerHTML = '';
      showBracket(players);
    });
    // Add styles (only once)
    if (!document.getElementById('game-over-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'game-over-modal-styles';
      style.textContent = `
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(20,20,30,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .game-over-modal-content { background: #222; border-radius: 24px; padding: 48px 32px; max-width: 400px; width: 100%; box-shadow: 0 0 40px #00fff7; color: #fff; text-align: center; }
        .game-over-modal-content h2 { font-size: 2rem; color: #00fff7; margin-bottom: 1rem; }
        .game-over-modal-content .btn { margin-top: 2rem; }
      `;
      document.head.appendChild(style);
    }
  }
  // Remove any existing bracket
  let oldBracket = document.getElementById('tournament-bracket-ui');
  if (oldBracket) oldBracket.remove();

  // Bracket container
  const bracket = document.createElement('div');
  bracket.id = 'tournament-bracket-ui';
  bracket.innerHTML = `
    <div class="tournament-container">
      <div class="tournament-header">
        <h1 class="tournament-title"><span class="trophy">🏆</span> ${t.games.tournaments.modal.bracketTitle.replace('🏆 ', '')}</h1>
        <p class="tournament-subtitle">${t.games.tournaments.modal.bracketSubtitle}</p>
      </div>
      <div class="bracket-container">
        <div class="semifinals-column">
          <div class="match" data-match="1">
            <div class="match-header">${t.games.tournaments.modal.match1Semifinal}</div>
            <div class="match-players">
              <div class="player" data-player="${players[0]}">${players[0]}</div>
              <div class="vs-divider">${t.games.tournaments.modal.vs}</div>
              <div class="player" data-player="${players[1]}">${players[1]}</div>
            </div>
            <div class="start-match-btn-container">
              <button class="btn btn-primary start-match-btn" data-match="1">${t.games.tournaments.modal.startMatch}</button>
            </div>
          </div>
          <div class="match" data-match="2">
            <div class="match-header">${t.games.tournaments.modal.match2Semifinal}</div>
            <div class="match-players">
              <div class="player" data-player="${players[2]}">${players[2]}</div>
              <div class="vs-divider">${t.games.tournaments.modal.vs}</div>
              <div class="player" data-player="${players[3]}">${players[3]}</div>
            </div>
            <div class="start-match-btn-container">
              <button class="btn btn-primary start-match-btn" data-match="2">${t.games.tournaments.modal.startMatch}</button>
            </div>
          </div>
        </div>
        <div class="bracket-lines">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path class="connection-line" id="line1" d="M 25 25 L 50 25 L 50 50 L 75 50" />
            <path class="connection-line" id="line2" d="M 25 75 L 50 75 L 50 50 L 75 50" />
          </svg>
        </div>
        <div class="final-column">
          <div class="match final-match" data-match="final">
            <div class="match-header">${t.games.tournaments.modal.championshipFinal}</div>
            <div class="match-players">
              <div class="player placeholder" data-from="match1">${t.games.tournaments.modal.winnerOfMatch1}</div>
              <div class="vs-divider">${t.games.tournaments.modal.vs}</div>
              <div class="player placeholder" data-from="match2">${t.games.tournaments.modal.winnerOfMatch2}</div>
            </div>
            <div class="start-match-btn-container">
              <button class="btn btn-primary start-match-btn" data-match="final">${t.games.tournaments.modal.startFinal}</button>
            </div>
          </div>
        </div>
      </div>
      <!-- controls removed -->
    </div>
  `;
  // Add start match button logic
  const startBtns = bracket.querySelectorAll('.start-match-btn');
  const match2Btn = bracket.querySelector('.start-match-btn[data-match="2"]') as HTMLButtonElement;
  const finalBtn = bracket.querySelector('.start-match-btn[data-match="final"]') as HTMLButtonElement;
  
  // Initially disable Match 2 and Final buttons
  if (match2Btn) {
    match2Btn.disabled = true;
    match2Btn.style.opacity = '0.5';
    match2Btn.title = 'Finish Match 1 first';
  }
  if (finalBtn) {
    finalBtn.disabled = true;
    finalBtn.style.opacity = '0.5';
    finalBtn.title = 'Finish both semifinals first';
  }
  startBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const matchNum = (btn as HTMLButtonElement).getAttribute('data-match');
      console.log('[DEBUG] Start Match button clicked:', { matchNum, btn });
      // Note: Match progression is now handled automatically by winner detection
      // No manual validation needed since buttons are enabled/disabled automatically
      // Get the two player names for this match
      let playerA = '', playerB = '';
      if (matchNum === '1') {
        playerA = players[0];
        playerB = players[1];
      } else if (matchNum === '2') {
        playerA = players[2];
        playerB = players[3];
      } else if (matchNum === 'final') {
        // Get winners from previous matches
        const results = (window as any).globalMatchResults;
        if (results && results['1'] && results['2']) {
          playerA = results['1'];
          playerB = results['2'];
        } else {
          console.error('[ERROR] Cannot start final - missing semifinal winners');
          return;
        }
      }
      console.log('[DEBUG] About to call startGame with:', { playerA, playerB, matchNum });
      // Call tournament-specific game logic
      startGame(playerA, playerB, matchNum);
    });
  });
  // Enable Match 2 button when Match 1 is finished
  function enableMatch2IfReady() {
    if (match2Btn && matchWinners[1]) {
      match2Btn.disabled = false;
      match2Btn.style.opacity = '1';
      match2Btn.title = '';
    }
  }
  // Patch selectWinner to enable Match 2 when Match 1 is done
  const originalSelectWinner = selectWinner;
  (selectWinner as any) = function(playerElement: HTMLElement, matchNumber: string | number) {
    originalSelectWinner(playerElement, matchNumber);
    enableMatch2IfReady();
  };

  // Real game integration using your friend's backend approach
  async function startGame(playerA: string, playerB: string, matchNum: string | null) {
    console.log('[DEBUG] TournamentModal startGame called with:', { playerA, playerB, matchNum });
    try {
      // Get matchId from stored backend matches (your friend's approach)
      const backendMatches = (window as any).globalBackendMatches;
      let matchId: number;
      
      if (matchNum === '1' && backendMatches?.[0]) {
        matchId = backendMatches[0].matchId;
      } else if (matchNum === '2' && backendMatches?.[1]) {
        matchId = backendMatches[1].matchId;
      } else if (matchNum === 'final') {
        // For final match, check if there's a third match (created after semifinals)
        if (backendMatches?.[2]) {
          matchId = backendMatches[2].matchId;
        } else {
          // Final match might be created dynamically after semifinals - need to fetch latest matches
          console.log('[DEBUG] Final match not found in stored matches, fetching latest from backend...');
          
          // Get tournament ID from the current tournament data
          const tournamentId = (window as any).currentTournamentId;
          if (!tournamentId) {
            throw new Error('Tournament ID not found');
          }
          
          try {
            // Fetch latest matches from backend
            const latestMatches = await fetchTournamentMatches(tournamentId);
            console.log('[DEBUG] Latest matches from backend:', latestMatches);
            
            // Update global storage with latest matches
            (window as any).globalBackendMatches = latestMatches;
            
            // Look for final match in the updated matches
            const finalMatch = latestMatches.find((match: any) => match.round === 'final');
            if (finalMatch) {
              matchId = finalMatch.matchId;
              console.log('[DEBUG] Found final match with ID:', matchId);
            } else {
              throw new Error('Final match not yet available - complete both semifinals first');
            }
          } catch (fetchError) {
            console.error('[DEBUG] Error fetching latest matches:', fetchError);
            throw new Error('Final match not yet available - complete both semifinals first');
          }
        }
      } else {
        throw new Error(`No matchId found for match ${matchNum}`);
      }
      
      console.log('[DEBUG] Using backend matchId:', matchId);
      
      // No API call needed - your friend's backend already created the match
      // Just start the game directly with the existing matchId
      
      // Launch the real pong game in the current view
      const app = document.getElementById("app");
      if (app) {
        let gameContainer = document.getElementById("game-container-wrapper") as HTMLElement;
        if (!gameContainer) {
          gameContainer = document.createElement("div");
          gameContainer.id = "game-container-wrapper";
          gameContainer.className = "game-container-wrapper";
          app.innerHTML = '';
          app.appendChild(gameContainer);
        } else {
          gameContainer.innerHTML = '';
        }
        
        // Set tournament flags BEFORE creating the game
        (window as any).currentTournamentMatch = true;
        (window as any).gamePageSuppressModal = true;
        (window as any).gamePageMode = 'tournament'; // Use unified tournament mode
        (window as any).localTournamentMatchId = matchId;
        (window as any).localTournamentPlayers = { playerA, playerB };
        // REMOVED: (window as any).suppressGamePageResultSubmission = true; // Let normal tournament submission work
        
        // Set game speed based on match type (semi-final vs final)
        if (matchNum === 'final') {
          (window as any).tournamentGameSpeed = 'very-fast'; // Final matches are very fast
        } else {
          (window as any).tournamentGameSpeed = 'medium'; // Semi-final matches are medium speed
        }
        
        console.log('[DEBUG] TournamentModal: Setting flags before game creation:', {
          gamePageMode: (window as any).gamePageMode,
          suppressGamePageResultSubmission: false, // Not suppressing - using normal tournament submission
          localTournamentMatchId: (window as any).localTournamentMatchId,
          matchId
        });
        
        import('../gamePage').then(({ create1v1GamePage }) => {
          const gamePage = create1v1GamePage(gameContainer, () => {
            console.log('[DEBUG] TournamentModal onNavigateBack callback triggered');
            
            // DIRECT APPROACH: Check game result immediately when callback is triggered
            setTimeout(() => {
              if (gamePage.game) {
                const player1Score = gamePage.game.getPlayers().player1.score;
                const player2Score = gamePage.game.getPlayers().player2.score;
                
                console.log('[DEBUG] DIRECT: Game scores detected:', { player1Score, player2Score, playerA, playerB });
                
                if (player1Score >= 5 || player2Score >= 5) {
                  const winner = player1Score > player2Score ? playerA : playerB;
                  console.log('[DEBUG] DIRECT: Tournament winner determined:', winner);
                  
                  // Store result in global match results
                  if (!(window as any).globalMatchResults) {
                    (window as any).globalMatchResults = {};
                  }
                  
                  (window as any).globalMatchResults[matchNum] = winner;
                  console.log('[DEBUG] DIRECT: Updated globalMatchResults:', (window as any).globalMatchResults);
                  
                  // Submit result to backend using your friend's tournament endpoint
                  (async () => {
                    try {
                      
                      // Get tournament ID from stored data
                      const tournamentId = (window as any).currentTournamentId;
                      
                      // Use your friend's tournament finish endpoint
                      const response = await fetch(`/tournaments/${tournamentId}/finish`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                          matchId: matchId,
                          userScore: player1Score,
                          opponentScore: player2Score
                        })
                      });
                      
                      if (response.ok) {
                        console.log('[DEBUG] Tournament match result submitted to backend successfully');
                      } else {
                        throw new Error(`HTTP ${response.status}`);
                      }
                    } catch (error) {
                      console.error('[DEBUG] Error submitting tournament result to backend:', error);
                    }
                  })();
                  
                  // Special announcement for FINAL match - TOURNAMENT CHAMPION!
                  if (matchNum === 'final') {
                    console.log('🏆🏆🏆 TOURNAMENT CHAMPION: ' + winner + ' 🏆🏆🏆');
                    
                    // Show simple champion announcement modal
                    setTimeout(() => {
                      const championModal = document.createElement('div');
                      championModal.className = 'modal-overlay';
                      championModal.style.cssText = `
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.8); display: flex; align-items: center;
                        justify-content: center; z-index: 10000;
                      `;
                      
                      championModal.innerHTML = `
                        <div style="
                          background: linear-gradient(135deg, #FFD700, #FFA500);
                          padding: 40px; border-radius: 20px; text-align: center;
                          box-shadow: 0 0 30px rgba(255,215,0,0.5);
                          border: 3px solid #FFD700;
                        ">
                          <h1 style="color: #8B4513; font-size: 3em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                            ${t.games.tournaments.modal.champion}
                          </h1>
                          <h2 style="color: #8B4513; font-size: 2.5em; margin: 20px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                            ${winner}
                          </h2>
                          <p style="color: #8B4513; font-size: 1.3em; margin: 20px 0;">
                            Congratulations on winning the tournament!
                          </p>
                          <button onclick="
                            this.parentElement.parentElement.remove();
                            // Close tournament modal if open
                            const tournamentModal = document.getElementById('tournament-bracket-modal');
                            if (tournamentModal) tournamentModal.remove();
                            // Navigate back to tournaments page
                            if (window.navigateTo) window.navigateTo('/tournament');
                            else window.location.hash = '/tournament';
                          " 
                                  style="
                                    background: #228B22; color: white; border: none;
                                    padding: 15px 30px; font-size: 1.2em; border-radius: 10px;
                                    cursor: pointer; margin-top: 20px;
                                    transition: all 0.3s ease;
                                  "
                                  onmouseover="this.style.background='#32CD32'"
                                  onmouseout="this.style.background='#228B22'">
                            🏠 Back to Tournaments �
                          </button>
                        </div>
                      `;
                      
                      document.body.appendChild(championModal);
                    }, 1000);
                  }
                  
                  console.log('[DEBUG] DIRECT: Winner will be displayed when bracket is shown');
                }
              }
            }, 100);
            
            showGameOverModal();
          });
          
          // Set player names with a small delay to ensure game is initialized
          setTimeout(() => {
            if (gamePage.setPlayerNames) {
              gamePage.setPlayerNames(playerA, playerB);
              console.log('[DEBUG] Player names set:', { playerA, playerB });
            }
          }, 50);
          
          // Set the matchId for result submission with a delay to ensure game is initialized
          setTimeout(() => {
            if (gamePage.game) {
              console.log('[DEBUG] Setting matchId on game:', matchId);
              gamePage.game.matchId = matchId;
              // Clear any tournamentId that might be set
              gamePage.game.tournamentId = undefined;
              console.log('[DEBUG] Game object after setting IDs:', {
                matchId: gamePage.game.matchId,
                tournamentId: gamePage.game.tournamentId
              });
            }
          }, 100);
          
          // Set the onGameEndCallback for bracket winner logic and result submission
          if (gamePage.game) {
            // Use the game's onGameEndCallback for handling both result submission and bracket updates
            gamePage.game.onGameEndCallback(async (winner: any, _gameTime: number) => {
              // Handle both result submission and bracket update
              try {
                // Get winner name and scores
                const winnerName = winner.name;
                const players = gamePage.game?.getPlayers();
                const player1Score = players?.player1.score || 0;
                const player2Score = players?.player2.score || 0;
                
                console.log('[DEBUG] Local tournament match ended. Winner:', winnerName, 'Scores:', player1Score, player2Score);
                
                // Submit result to tournament API using our new approach
                const globalTournamentId = (window as any).globalTournamentId;
                if (globalTournamentId) {
                  const { apiService } = await import('../services/api.js');
                  await apiService.tournaments.finish(globalTournamentId, {
                    matchId: matchId,
                    player1Score: player1Score,
                    player2Score: player2Score,
                    winner: winnerName
                  });
                  console.log('[DEBUG] Match result submitted to backend via tournaments.finish');
                } else {
                  console.error('[ERROR] No globalTournamentId found for result submission');
                }
                
                // Update bracket with winner using globalMatchResults approach from memory
                if (!(window as any).globalMatchResults) {
                  (window as any).globalMatchResults = {};
                }
                
                // Store result in globalMatchResults (from memory approach)
                (window as any).globalMatchResults[matchNum || 'unknown'] = winnerName;
                
                // Update bracket display
                if (matchNum === '1') {
                  matchWinners[1] = winnerName;
                  const match1Btn = document.querySelector('.start-match-btn[data-match="1"]') as HTMLButtonElement;
                  if (match1Btn) {
                    match1Btn.disabled = true;
                    match1Btn.style.opacity = '0.5';
                    match1Btn.title = 'Match 1 is finished';
                  }
                  enableMatch2IfReady();
                } else if (matchNum === '2') {
                  matchWinners[2] = winnerName;
                  const match2Btn = document.querySelector('.start-match-btn[data-match="2"]') as HTMLButtonElement;
                  if (match2Btn) {
                    match2Btn.disabled = true;
                    match2Btn.style.opacity = '0.5';
                    match2Btn.title = 'Match 2 is finished';
                  }
                }
                
                // Update final match display
                updateFinalMatch();
                
                console.log('[DEBUG] Bracket updated. Match winners:', matchWinners);
                
                // Trigger dashboard stats reload
                window.dispatchEvent(new Event('reloadDashboardStats'));
                
              } catch (error) {
                console.error('Error handling local tournament match result:', error);
                alert('Error saving match result. Please try again.');
              }
            });
          }
          
          // Clear flags after game is initialized
          setTimeout(() => {
            delete (window as any).currentTournamentMatch;
            delete (window as any).gamePageSuppressModal;
            delete (window as any).gamePageMode;
            delete (window as any).localTournamentMatchId;
            delete (window as any).localTournamentPlayers;
            delete (window as any).suppressGamePageResultSubmission;
            delete (window as any).tournamentGameSpeed; // Clean up speed setting
          }, 1000);
        });
      }
    } catch (error) {
      console.error('Error starting local tournament match:', error);
      console.error('Full error details:', (error as any).message || error);
      
      // Check if user is logged in
      const token = sessionStorage.getItem('token');
      console.log('[DEBUG] Auth token present:', !!token);
      
      if (!token) {
        alert('Error: You must be logged in to play tournament matches. Please log in and try again.');
        return;
      }
      
      // More detailed error message
      const errorMsg = (error as any).message || String(error);
      console.error('[DEBUG] Tournament match creation failed:', errorMsg);
      alert(`Error starting match: ${errorMsg}. Please make sure you are logged in and try again.`);
    }
  }

  // Add styles (only once)
  if (!document.getElementById('tournament-bracket-styles')) {
    const style = document.createElement('style');
    style.id = 'tournament-bracket-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      .tournament-container { font-family: 'Inter', sans-serif; background: none; max-width: 1000px; width: 100%; color: white; }
      .tournament-header { text-align: center; margin-bottom: 60px; }
      .tournament-title { font-size: 42px; font-weight: 700; background: linear-gradient(135deg, #00d4ff, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 10px; }
      .tournament-subtitle { font-size: 16px; color: rgba(255,255,255,0.6); font-weight: 500; }
      .bracket-container { display: flex; align-items: center; justify-content: center; gap: 100px; position: relative; min-height: 500px; }
      .semifinals-column { display: flex; flex-direction: column; gap: 60px; }
      .final-column { display: flex; align-items: center; }
      .match { background: rgba(30,41,59,0.9); border: 2px solid rgba(59,130,246,0.4); border-radius: 16px; backdrop-filter: blur(10px); transition: all 0.3s; overflow: hidden; width: 280px; animation: slideIn 0.7s ease-out forwards; opacity: 0; transform: translateY(40px); }
      .match:hover { border-color: rgba(0,212,255,0.7); transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,212,255,0.2); }
      .match-header { background: linear-gradient(135deg, rgba(59,130,246,0.8), rgba(147,51,234,0.8)); padding: 14px 20px; text-align: center; font-weight: 700; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; }
      .match-players { padding: 24px; }
      .player { display: flex; align-items: center; justify-content: center; padding: 18px 20px; background: rgba(15,23,42,0.7); border: 2px solid rgba(71,85,105,0.4); border-radius: 12px; margin-bottom: 14px; font-weight: 600; font-size: 16px; transition: all 0.3s; cursor: pointer; min-height: 65px; position: relative; }
      .player:last-child { margin-bottom: 0; }
      .player:hover { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.6); transform: translateX(8px); }
      .player.winner { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.7); color: #10b981; transform: translateX(8px); }
      .player.winner::after { content: '✓'; position: absolute; right: 15px; font-size: 20px; color: #10b981; }
      .player.placeholder { color: rgba(255,255,255,0.4); font-style: italic; cursor: default; border-style: dashed; }
      .player.placeholder:hover { background: rgba(15,23,42,0.7); border-color: rgba(71,85,105,0.4); transform: none; }
      .vs-divider { text-align: center; font-weight: 700; color: rgba(147,51,234,0.9); font-size: 14px; margin: 12px 0; letter-spacing: 2px; }
      .match.final-match { border-color: rgba(255,215,0,0.7); background: rgba(30,41,59,0.95); width: 320px; }
      .match.final-match:hover { border-color: rgba(255,215,0,0.9); box-shadow: 0 15px 30px rgba(255,215,0,0.3); }
      .match.final-match .match-header { background: linear-gradient(135deg, rgba(255,215,0,0.9), rgba(245,158,11,0.9)); color: #1a1a2e; font-size: 14px; }
      .bracket-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; }
      .bracket-lines svg { width: 100%; height: 100%; }
      .connection-line { stroke: rgba(59,130,246,0.5); stroke-width: 3; fill: none; transition: all 0.3s; }
      .connection-line.active { stroke: rgba(0,212,255,0.9); stroke-width: 4; filter: drop-shadow(0 0 8px rgba(0,212,255,0.4)); }
      .controls { text-align: center; margin-top: 50px; display: flex; gap: 20px; justify-content: center; }
      .btn { padding: 14px 28px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      .btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(59,130,246,0.3); }
      .btn-secondary { background: rgba(71,85,105,0.7); color: white; border: 2px solid rgba(148,163,184,0.4); }
      .btn-secondary:hover { background: rgba(71,85,105,0.9); transform: translateY(-2px); }
      @media (max-width: 768px) { .bracket-container { flex-direction: column; gap: 50px; } .tournament-title { font-size: 32px; } .match { width: 100%; max-width: 300px; } .match.final-match { width: 100%; max-width: 320px; } .bracket-lines { display: none; } .controls { flex-direction: column; align-items: center; gap: 15px; } }
      .match { animation: slideIn 0.7s ease-out forwards; opacity: 0; transform: translateY(40px); }
      .semifinals-column .match:nth-child(1) { animation-delay: 0.2s; }
      .semifinals-column .match:nth-child(2) { animation-delay: 0.4s; }
      .final-column .match { animation-delay: 0.6s; }
      @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
  }

  // Place in app
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '';
    app.appendChild(bracket);
  } else {
    document.body.appendChild(bracket);
  }

  // Display winners from globalMatchResults
  console.log('[DEBUG] Checking for stored winners:', (window as any).globalMatchResults);
  if ((window as any).globalMatchResults) {
    const results = (window as any).globalMatchResults;
    
    // Update Match 1 winner
    if (results['1']) {
      console.log('[DEBUG] Displaying Match 1 winner:', results['1']);
      const match1Element = bracket.querySelector('[data-match="1"]');
      if (match1Element) {
        // Add winner display to match 1
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'match-winner';
        winnerDiv.innerHTML = `<strong>🏆 Winner: ${results['1']}</strong>`;
        winnerDiv.style.cssText = 'color: #4CAF50; font-weight: bold; text-align: center; margin-top: 10px; font-size: 1.1em;';
        match1Element.appendChild(winnerDiv);
        
        // Update final match placeholder
        const finalMatch = bracket.querySelector('[data-from="match1"]');
        if (finalMatch) {
          finalMatch.textContent = results['1'];
          finalMatch.classList.remove('placeholder');
          (finalMatch as HTMLElement).style.color = '#4CAF50';
        }
        
        // AUTOMATICALLY ENABLE MATCH 2 when Match 1 is complete
        const match2Btn = bracket.querySelector('.start-match-btn[data-match="2"]') as HTMLButtonElement;
        if (match2Btn) {
          match2Btn.disabled = false;
          match2Btn.style.opacity = '1';
          match2Btn.title = '';
          console.log('[DEBUG] Match 2 automatically enabled after Match 1 completion');
        }
        
        // DISABLE MATCH 1 button since it's complete
        const match1Btn = bracket.querySelector('.start-match-btn[data-match="1"]') as HTMLButtonElement;
        if (match1Btn) {
          match1Btn.disabled = true;
          match1Btn.style.opacity = '0.5';
          match1Btn.textContent = 'Match Complete';
          match1Btn.title = 'This match is already complete';
          console.log('[DEBUG] Match 1 button disabled - match complete');
        }
      }
    }
    
    // Update Match 2 winner
    if (results['2']) {
      console.log('[DEBUG] Displaying Match 2 winner:', results['2']);
      const match2Element = bracket.querySelector('[data-match="2"]');
      if (match2Element) {
        // Add winner display to match 2
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'match-winner';
        winnerDiv.innerHTML = `<strong>🏆 Winner: ${results['2']}</strong>`;
        winnerDiv.style.cssText = 'color: #4CAF50; font-weight: bold; text-align: center; margin-top: 10px; font-size: 1.1em;';
        match2Element.appendChild(winnerDiv);
        
        // Update final match placeholder
        const finalMatch = bracket.querySelector('[data-from="match2"]');
        if (finalMatch) {
          finalMatch.textContent = results['2'];
          finalMatch.classList.remove('placeholder');
          (finalMatch as HTMLElement).style.color = '#4CAF50';
        }
        
        // DISABLE MATCH 2 button since it's complete
        const match2Btn = bracket.querySelector('.start-match-btn[data-match="2"]') as HTMLButtonElement;
        if (match2Btn) {
          match2Btn.disabled = true;
          match2Btn.style.opacity = '0.5';
          match2Btn.textContent = 'Match Complete';
          match2Btn.title = 'This match is already complete';
          console.log('[DEBUG] Match 2 button disabled - match complete');
        }
        
        // ENABLE FINAL MATCH if both semifinals are complete
        if (results['1'] && results['2']) {
          const finalBtn = bracket.querySelector('.start-match-btn[data-match="final"]') as HTMLButtonElement;
          if (finalBtn) {
            finalBtn.disabled = false;
            finalBtn.style.opacity = '1';
            finalBtn.title = '';
            console.log('[DEBUG] Final match automatically enabled - both semifinals complete');
          }
        }
      }
    }
    
    // Update Final winner
    if (results['final']) {
      console.log('[DEBUG] Displaying Final winner:', results['final']);
      const finalElement = bracket.querySelector('[data-match="final"]');
      if (finalElement) {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'tournament-champion';
        winnerDiv.innerHTML = `<h2 style="color: #FFD700; text-align: center; margin-top: 20px;">🏆 CHAMPION: ${results['final']} 🏆</h2>`;
        finalElement.appendChild(winnerDiv);
        
        // DISABLE FINAL button since tournament is complete
        const finalBtn = bracket.querySelector('.start-match-btn[data-match="final"]') as HTMLButtonElement;
        if (finalBtn) {
          finalBtn.disabled = true;
          finalBtn.style.opacity = '0.5';
          finalBtn.textContent = 'Tournament Complete';
          finalBtn.title = 'Tournament has ended - Champion crowned!';
          console.log('[DEBUG] Final button disabled - tournament complete');
        }
      }
    }
  }

  // Interactive logic - DISABLED manual selection since we have automatic winner detection
  let matchWinners: { [key: string]: string } = {};
  function selectWinner(playerElement: HTMLElement, matchNumber: string | number) {
    // Manual selection disabled - winners are determined automatically by game results
    console.log('[DEBUG] Manual winner selection disabled - winners determined by game results');
    return;
    // Store winner
    const playerName = playerElement.getAttribute('data-player') || '';
    matchWinners[matchNumber] = playerName;
    // Update final match
    updateFinalMatch();
    // Activate connection line
    const lineId = `line${matchNumber}`;
    const line = document.getElementById(lineId);
    if (line) {
      line!.classList.add('active');
      setTimeout(() => {
        const lineElement = document.getElementById(lineId);
        if (lineElement) {
          lineElement.classList.add('active');
        }
      }, 100);
    }
  }
  function updateFinalMatch() {
    const finalPlayers = bracket.querySelectorAll('.final-match .player');
    // Update first finalist
    if (matchWinners[1]) {
      finalPlayers[0].textContent = matchWinners[1];
      finalPlayers[0].classList.remove('placeholder');
      finalPlayers[0].setAttribute('data-player', matchWinners[1]);
      (finalPlayers[0] as HTMLElement).onclick = () => selectWinner(finalPlayers[0] as HTMLElement, 'final');
    }
    // Update second finalist
    if (matchWinners[2]) {
      finalPlayers[1].textContent = matchWinners[2];
      finalPlayers[1].classList.remove('placeholder');
      finalPlayers[1].setAttribute('data-player', matchWinners[2]);
      (finalPlayers[1] as HTMLElement).onclick = () => selectWinner(finalPlayers[1] as HTMLElement, 'final');
    }
    // Check for tournament champion
    if (matchWinners['final']) {
      setTimeout(() => {
        showChampionAlert(matchWinners['final']);
      }, 600);
    }
  }
  function showChampionAlert(champion: string) {
    alert(`🏆🎉 TOURNAMENT CHAMPION 🎉🏆\n\n${champion.toUpperCase()}\n\nCongratulations on your victory!\n\n🥇 You are the ultimate champion! 🥇`);
  }
  // Attach event listeners - DISABLED manual selection
  // Manual player selection disabled - winners determined automatically by game results
  console.log('[DEBUG] Manual player selection disabled - winners determined by game results');
  
  // Remove click events from players to prevent manual selection
  const allPlayers = bracket.querySelectorAll('.player:not(.placeholder)');
  allPlayers.forEach(p => {
    (p as HTMLElement).style.cursor = 'default';
    (p as HTMLElement).onclick = null;
  });
  // controls removed
}

