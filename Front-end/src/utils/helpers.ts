// Utility functions for the application

/**
 * Utility function to navigate between pages
 */
export function navigateTo(path: string, setupRoutes: (app: HTMLElement) => void) {
  showLoading();
  // Simulate network delay for a smoother loading experience
  setTimeout(() => {
    history.pushState(null, "", path);
    const app = document.getElementById("app");
    if (app) {
      setupRoutes(app); // Render new page based on route
      document.title = getPageTitle(path); // Update document title
      const liveRegion = document.getElementById("screen-reader-live-region");
      if (liveRegion) {
        liveRegion.textContent = ""; // Clear first to ensure re-announcement
        liveRegion.textContent = `Navigated to ${document.title}.`;
      }
      window.scrollTo(0, 0); // Scroll to top on navigation
    }
    hideLoading();
  }, 300); // Simulate 300ms loading
}

/**
 * Helper to get page title based on path
 */
export function getPageTitle(path: string): string {
  switch (path) {
    case "/":
      return "Home - Neon Pong";
    case "/tournament":
      return "Tournaments - Neon Pong";
    case "/register":
      return "Register - Neon Pong";
    case "/login":
      return "Login - Neon Pong";
    default:
      return "Page Not Found - Neon Pong";
  }
}

/**
 * Function to create a generic loading overlay
 */
export function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay hidden"; // Start hidden
  overlay.id = "loading-overlay";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "assertive");
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  overlay.appendChild(spinner);
  const loadingText = document.createElement("p");
  loadingText.className = "loading-text";
  loadingText.textContent = "Loading...";
  loadingText.setAttribute("aria-label", "Content is loading");
  overlay.appendChild(loadingText);
  return overlay;
}

/**
 * Function to show the loading overlay
 */
export function showLoading() {
  const app = document.getElementById("app");
  if (app) {
    let overlay = document.getElementById("loading-overlay");
    if (!overlay) {
      overlay = createLoadingOverlay();
      app.appendChild(overlay);
    }
    overlay.classList.remove("hidden");
  }
}

/**
 * Function to hide the loading overlay
 */
export function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

/**
 * Function to display messages (error/success/info)
 */
export function showMessage(
  text: string,
  type: "success" | "error" | "info" = "info"
) {
  // Clear existing messages and timeouts
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }
  if (window.messageTimeout) {
    clearTimeout(window.messageTimeout);
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;
  
  // Create message content container
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = text;
  
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.className = "close-button";
  closeButton.innerHTML = "&times;";
  closeButton.setAttribute("aria-label", "Close message");
  closeButton.addEventListener("click", () => {
    messageDiv.remove();
    if (window.messageTimeout) {
      clearTimeout(window.messageTimeout);
    }
  });
  
  // Add icon based on message type
  let icon = "";
  if (type === "success") icon = "✓";
  else if (type === "error") icon = "✕";
  else icon = "ℹ";
  
  const iconSpan = document.createElement("span");
  iconSpan.className = "message-icon";
  iconSpan.textContent = icon;
  
  // Assemble the message
  messageDiv.appendChild(iconSpan);
  messageDiv.appendChild(messageContent);
  messageDiv.appendChild(closeButton);
  
  // Accessibility
  messageDiv.setAttribute("role", "status");
  messageDiv.setAttribute("aria-live", "polite");
  messageDiv.setAttribute("aria-atomic", "true");
  
  // Add to DOM
  document.body.appendChild(messageDiv);
  
  // Auto-hide after delay
  window.messageTimeout = window.setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-20px)';
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}
