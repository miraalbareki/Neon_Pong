// OpponentUsernameModal.ts
// Premium glassmorphism modal for 1v1 opponent username entry

import { languageManager } from '../translations';

export function showOpponentUsernameModal(onSubmit: (username: string) => void, onClose?: () => void) {
  const t = languageManager.getTranslations();
  // Remove any existing modal
  let oldModal = document.getElementById('username-modal');
  if (oldModal) oldModal.remove();

  // Modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'username-modal';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = `
    position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: 1000;
    display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px);`

  // Modal content
  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.style.cssText = `
    background: rgba(30, 35, 50, 0.95);
    border-radius: 12px; 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 255, 247, 0.3); 
    padding: 1.5rem; 
    min-width: 320px; 
    max-width: 400px;
    color: #fff; 
    position: relative; 
    text-align: center;`

  modal.innerHTML = `
    <span class="close" id="close-username-modal" style="position:absolute;top:10px;right:15px;font-size:1.5rem;cursor:pointer;color:#ccc;">&times;</span>
    <h3 style="font-size:1.2rem;font-weight:600;margin-bottom:1rem;color:#fff;">${t.games.oneVsOne.usernameModal.title}</h3>
    <input type="text" id="opponent-username-input" placeholder="${t.games.oneVsOne.usernameModal.placeholder}" style="width:100%;padding:0.75rem;margin-bottom:1rem;border-radius:6px;border:1px solid #555;background:rgba(40,45,60,0.9);color:#fff;font-size:1rem;outline:none;">
    <button id="submit-username-btn" style="width:100%;padding:0.75rem;border-radius:6px;background:#00fff7;color:#000;font-weight:600;font-size:1rem;cursor:pointer;border:none;">${t.games.oneVsOne.usernameModal.startMatch}</button>
    <div id="username-error" style="display:none;color:#ff6b6b;font-size:0.9rem;margin-top:0.5rem;"></div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Event listeners
  const input = modal.querySelector('#opponent-username-input') as HTMLInputElement;
  const submitBtn = modal.querySelector('#submit-username-btn') as HTMLButtonElement;
  const errorDiv = modal.querySelector('#username-error') as HTMLElement;
  const closeBtn = modal.querySelector('#close-username-modal') as HTMLElement;

  submitBtn.onclick = () => {
    const username = input.value.trim();
    if (!username) {
      errorDiv.textContent = 'You must enter a valid username for your opponent!';
      errorDiv.style.display = 'block';
      return;
    }
    errorDiv.style.display = 'none';
    document.body.removeChild(overlay);
    onSubmit(username);
  };

  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter') submitBtn.click();
  };

  input.focus();
}
