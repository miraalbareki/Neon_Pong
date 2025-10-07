import "./styles/style.css"; // Ensure your CSS is imported
import "./styles/game-page.css"; // Game page styles
import { createProfileSettings } from "./components/ProfileSettings";
import { showTournamentBracketModal } from './components/TournamentModal';
import { createFriendsSection } from "./components/FriendsSection";
import { languageManager } from "./translations";
import { create1v1GamePage, createAIGamePage } from "./gamePage.js";
import { apiService } from "./services/api";

// Global variables for message display
window.messageTimeout = null;
let currentUser: { id: number; username: string } | null = null;

// Translation update function
function updateAllTranslations(): void {
  const t = languageManager.getTranslations();
  
  // Update navigation links
  const homeLink = document.querySelector('.navbar-link[href="/"]') as HTMLElement;
  const gamesLink = document.querySelector('.navbar-link[href="/tournament"]') as HTMLElement;
  const accountLink = document.querySelector('.navbar-link[href="/ACCOUNT"], .navbar-link[href="/logout"]') as HTMLElement;
  const profileLink = document.querySelector('.navbar-link[href="/profile"]') as HTMLElement;
  
  if (homeLink) homeLink.textContent = t.nav.home;
  if (gamesLink) gamesLink.textContent = t.nav.games;
  if (profileLink) profileLink.textContent = t.nav.profile;
  if (accountLink) {
    accountLink.textContent = isLoggedIn ? t.nav.logout : t.nav.account;
  }
  
  // Update logo
  const logo = document.querySelector('.navbar-logo') as HTMLElement;
  if (logo) logo.textContent = t.common.neonPong;
  
  // Update font size controls
  const fontSizeLabel = document.querySelector('.font-size-controls .sr-only') as HTMLElement;
  if (fontSizeLabel) fontSizeLabel.textContent = t.fontControls.label;
  
  const decreaseFontBtn = document.querySelector('.font-size-btn i.fa-minus') as HTMLElement;
  if (decreaseFontBtn && decreaseFontBtn.parentElement) {
    const srText = decreaseFontBtn.parentElement.querySelector('.sr-only') as HTMLElement;
    if (srText) srText.textContent = t.fontControls.decrease;
    decreaseFontBtn.parentElement.setAttribute('title', t.fontControls.decrease);
  }
  
  const increaseFontBtn = document.querySelector('.font-size-btn i.fa-plus') as HTMLElement;
  if (increaseFontBtn && increaseFontBtn.parentElement) {
    const srText = increaseFontBtn.parentElement.querySelector('.sr-only') as HTMLElement;
    if (srText) srText.textContent = t.fontControls.increase;
    increaseFontBtn.parentElement.setAttribute('title', t.fontControls.increase);
  }
  
  // Re-render current page content with new translations
  const app = document.getElementById("app");
  if (app) {
    setupRoutes(app);
  }
}

// Utility function to navigate between pages
// Expose navigateTo globally for use in other modules
export function navigateTo(path: string) {
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

// Helper to get page title based on path
function getPageTitle(path: string): string {
  switch (path) {
    case "/":
      return "Home - Neon Pong";
    case "/tournament":
      return "Games - Neon Pong";
    case "/register":
      return "Register - Neon Pong";
    case "/login":
      return "Login - Neon Pong";
    case "/profile":
      return "Profile - Neon Pong";
    case "/logout":
      return "Logged Out - Neon Pong";
    default:
      return "Page Not Found - Neon Pong";
  }
}
// Function to show the loading overlay
function showLoading(): void {
  let overlay = document.getElementById("loading-overlay");
  if (!overlay) {
    overlay = createLoadingOverlay();
  }
  overlay.classList.remove("hidden");
}
// Function to create a generic loading overlay
function createLoadingOverlay(): HTMLElement {
  // Basic loading overlay implementation
  const overlay = document.createElement("div");
  overlay.id = "loading-overlay";
  overlay.className = "loading-overlay";
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
  return overlay;
}
// Function to hide the loading overlay
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}
// Function to display messages (error/success/info)
function showMessage(text: string, type: "success" | "error" | "info" = "info"): void {
  // Remove any existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    setTimeout(() => existingMessage.remove(), 300);
  }
  if ((window as any).messageTimeout) {
    clearTimeout((window as any).messageTimeout);
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;

  // Add icon based on message type
  let iconClass = "";
  if (type === "success") iconClass = "fas fa-check-circle";
  else if (type === "error") iconClass = "fas fa-exclamation-circle";
  else iconClass = "fas fa-info-circle";

  const icon = document.createElement("i");
  icon.className = iconClass;

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
    messageDiv.classList.add("removing");
    setTimeout(() => messageDiv.remove(), 300);
    if (window.messageTimeout) {
      clearTimeout(window.messageTimeout);
    }
  });
  
  // Assemble the message
  messageDiv.appendChild(icon);
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
    messageDiv.classList.add("removing");
    setTimeout(() => messageDiv.remove(), 300);
  }, 4000);
}

// Special premium design for account deletion success
// @ts-ignore
function showAccountDeletionSuccess() {
  // Use the neon .message success popup instead of overlay
  showMessage('Account deleted successfully! Redirecting...', 'success');
}
// Global variables for accessibility features
let isHighContrast = false;
let fontSizeMultiplier = 0.8;

// Global authentication state
let isLoggedIn = false;
// Make these variables globally accessible
(window as any).isLoggedIn = isLoggedIn;
// Function to toggle high contrast mode
function toggleHighContrast(): void {
  isHighContrast = !isHighContrast;
  document.body.classList.toggle('high-contrast', isHighContrast);
  localStorage.setItem('highContrast', isHighContrast.toString());
}
// Function to adjust font size
function adjustFontSize(increase: boolean): void {
  const step = 0.1;
  const minSize = 0.8;
  const maxSize = 2.0;
  // Update the multiplier
  const newMultiplier = Math.max(minSize, Math.min(maxSize,
    fontSizeMultiplier + (increase ? step : -step)));
  // Only update if changed
  if (newMultiplier !== fontSizeMultiplier) {
    fontSizeMultiplier = newMultiplier;
    // Apply to root element
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultiplier.toString());
    // Force a reflow to ensure styles are recalculated
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
    // Update display
    const display = document.querySelector('.font-size-display') as HTMLElement;
    if (display) {
      const size = Math.round(fontSizeMultiplier * 100);
      const announcement = `Font size set to ${size}%`;
      display.textContent = `${size}%`;
      // Save preference
      localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier.toString());
      // Visual feedback
      display.classList.add('active');
      setTimeout(() => display.classList.remove('active'), 500);
      // Announce change for screen readers
      const liveRegion = document.getElementById('a11y-announcement');
      if (liveRegion) {
        liveRegion.textContent = announcement;
        setTimeout(() => liveRegion.textContent = '', 1000);
      } else {
        showMessage(announcement, 'info');
      }
    }
  }
}
// Initialize accessibility features from localStorage
function initAccessibility() {
  // Load high contrast preference
  const savedHighContrast = localStorage.getItem('highContrast') === 'true';
  if (savedHighContrast) {
    isHighContrast = true;
    document.body.classList.add('high-contrast');
  }
  // Load font size preference
  const savedFontSize = parseFloat(localStorage.getItem('fontSizeMultiplier') || '0.8');
  if (savedFontSize >= 0.8 && savedFontSize <= 1.5) {
    fontSizeMultiplier = savedFontSize;
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultiplier.toString());
  } else {
    // Apply default font size if no valid saved preference
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultiplier.toString());
  }
}
// Call init on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAccessibility);
}

// Function to update navbar based on login state
function updateNavbar(): void {
  const t = languageManager.getTranslations();
  const profileLink = document.querySelector('.navbar-link[href="/profile"]') as HTMLElement;
  // Look for account link by either href value since it changes between states
  let accountLink = document.querySelector('.navbar-link[href="/ACCOUNT"]') as HTMLAnchorElement;
  if (!accountLink) {
    accountLink = document.querySelector('.navbar-link[href="/logout"]') as HTMLAnchorElement;
  }
  
  if (profileLink) {
    profileLink.style.display = isLoggedIn ? 'flex' : 'none';
  }
  
  if (accountLink) {
    accountLink.textContent = isLoggedIn ? t.nav.logout : t.nav.account;
    accountLink.href = isLoggedIn ? '/logout' : '/ACCOUNT';
  }
}

// Function to handle login
function handleLogin(username: string, token?: string, userId?: number): void {
  isLoggedIn = true;
  currentUser = { id: userId || Date.now(), username: username };
  // Update global variables
  (window as any).isLoggedIn = isLoggedIn;
  (window as any).currentUser = currentUser;
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
  if (token) {
    sessionStorage.setItem('token', token);
  }
  updateNavbar();
  showMessage(`WELCOME BACK, ${username.toUpperCase()}!`, "success");
  navigateTo("/profile");
}

// Function to handle logout
function handleLogout(): void {
  // Call backend logout API to set status offline
  callLogoutAPI();
  
  isLoggedIn = false;
  currentUser = null;
  // Update global variables
  (window as any).isLoggedIn = isLoggedIn;
  (window as any).currentUser = currentUser;
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('token');
  updateNavbar();
  showMessage("Logged out successfully!", "success");
  navigateTo("/");
}

// Function to call logout API
async function callLogoutAPI(): Promise<void> {
  try {
    const token = sessionStorage.getItem('token');
    if (token) {
      console.log('[🚪 LOGOUT] Logout completed - session cleared');
      // No API call needed as the backend doesn't require explicit logout
    }
  } catch (error) {
    console.error('[❌ LOGOUT] Logout failed:', error);
    // Don't show error to user, just log it
  }
}

// Function to check stored login state
function checkLoginState(): void {
  const storedLoginState = sessionStorage.getItem('isLoggedIn');
  const storedUser = sessionStorage.getItem('currentUser');
  const storedToken = sessionStorage.getItem('token');
  
  if (storedLoginState === 'true' && storedUser && storedToken) {
    isLoggedIn = true;
    currentUser = JSON.parse(storedUser);
    // Update global variables
    (window as any).isLoggedIn = isLoggedIn;
    (window as any).currentUser = currentUser;
    updateNavbar();
  } else if (storedLoginState === 'true' && (!storedUser || !storedToken)) {
    // Clear invalid login state
    isLoggedIn = false;
    currentUser = null;
    (window as any).isLoggedIn = isLoggedIn;
    (window as any).currentUser = currentUser;
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
  }
}
// Navbar Component
function createNavbar(): HTMLElement {
  const t = languageManager.getTranslations();
  const navbar = document.createElement("nav");
  navbar.className = "navbar";
  navbar.setAttribute("aria-label", "Main navigation");
  
  const logo = document.createElement("a");
  logo.className = "navbar-logo";
  logo.textContent = t.common.neonPong;
  logo.href = "/";
  logo.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/");
  });
  const mobileMenuToggle = document.createElement("div");
  mobileMenuToggle.id = "mobile-menu";
  mobileMenuToggle.className = "menu-toggle";
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-controls", "navbarLinksContainer");
  for (let i = 0; i < 3; i++) {
    const bar = document.createElement("span");
    bar.className = "bar";
    mobileMenuToggle.appendChild(bar);
  }
  const navbarLinksContainer = document.createElement("div");
  navbarLinksContainer.id = "navbarLinksContainer";
  navbarLinksContainer.className = "navbar-links-container";
  
  const navLinks = document.createElement("div");
  navLinks.className = "navbar-links";
  
  navLinks.setAttribute("role", "menubar"); // Role for menu bar
  const homeLink = document.createElement("a");
  homeLink.href = "/";
  homeLink.className = "navbar-link";
  homeLink.textContent = t.nav.home;
  homeLink.setAttribute("role", "menuitem");
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/");
  });
  const gamesLink = document.createElement("a");
  gamesLink.href = "/tournament";
  gamesLink.className = "navbar-link";
  gamesLink.textContent = t.nav.games;
  gamesLink.setAttribute("role", "menuitem");
  gamesLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/tournament");
  });
  // Combined ACCOUNT tab that toggles between login/register
  const ACCOUNTLink = document.createElement("a");
  ACCOUNTLink.href = "/ACCOUNT";
  ACCOUNTLink.className = "navbar-link";
  ACCOUNTLink.textContent = t.nav.account;
  ACCOUNTLink.setAttribute("role", "menuitem");
  ACCOUNTLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      // Handle logout
      handleLogout();
    } else {
      const currentPath = window.location.pathname;
      if (currentPath === "/login" || currentPath === "/register") {
        // Toggle between login and register
        const newPath = currentPath === "/login" ? "/register" : "/login";
        navigateTo(newPath);
      } else {
        // Default to login page
        navigateTo("/login");
      }
    }
  });
  navLinks.appendChild(homeLink);
  navLinks.appendChild(gamesLink);
  navLinks.appendChild(ACCOUNTLink);
  
  // Profile Link
  const profileLink = document.createElement("a");
  profileLink.href = "/profile";
  profileLink.className = "navbar-link";
  profileLink.textContent = t.nav.profile;
  profileLink.setAttribute("role", "menuitem");
  profileLink.style.display = "none"; // Initially hidden
  profileLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/profile");
  });
  
  navLinks.appendChild(profileLink);
  
  // Language Selector
  const languageSelector = document.createElement('div');
  languageSelector.className = 'language-selector';
  languageSelector.setAttribute('aria-label', 'Language selection');
  
  const languageBtn = document.createElement('button');
  languageBtn.className = 'language-btn';
  languageBtn.innerHTML = '🌐 <span class="language-text">EN</span> <i class="fas fa-chevron-down" aria-hidden="true"></i>';
  languageBtn.setAttribute('aria-label', 'Select language');
  languageBtn.setAttribute('aria-expanded', 'false');
  
  const languageDropdown = document.createElement('div');
  languageDropdown.className = 'language-dropdown';
  languageDropdown.setAttribute('role', 'menu');
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];
  
  languages.forEach(lang => {
    const langOption = document.createElement('button');
    langOption.className = 'language-option';
    langOption.innerHTML = `${lang.flag} ${lang.name}`;
    langOption.setAttribute('role', 'menuitem');
    langOption.dataset.lang = lang.code;
    
    langOption.addEventListener('click', () => {
      const currentLang = languageManager.getCurrentLanguage();
      
      // Don't show confirmation if it's the same language
      if (lang.code === currentLang) {
        languageDropdown.style.display = 'none';
        languageBtn.setAttribute('aria-expanded', 'false');
        return;
      }
      
      // Use confirmation dialog for language change
      languageManager.setLanguageWithConfirmation(lang.code);
      
      // Close dropdown immediately
      languageDropdown.style.display = 'none';
      languageBtn.setAttribute('aria-expanded', 'false');
      
      // Update button text will happen when the language actually changes
      // via the listener system
    });
    
    languageDropdown.appendChild(langOption);
  });
  
  languageBtn.addEventListener('click', () => {
    const isOpen = languageDropdown.style.display === 'block';
    languageDropdown.style.display = isOpen ? 'none' : 'block';
    languageBtn.setAttribute('aria-expanded', (!isOpen).toString());
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!languageSelector.contains(e.target as Node)) {
      languageDropdown.style.display = 'none';
      languageBtn.setAttribute('aria-expanded', 'false');
    }
  });
  
  languageSelector.appendChild(languageBtn);
  languageSelector.appendChild(languageDropdown);
  
  // Add listener to update language button when language changes
  languageManager.addListener(() => {
    const currentLang = languageManager.getCurrentLanguage();
    const currentLangData = languages.find(l => l.code === currentLang);
    if (currentLangData) {
      languageBtn.innerHTML = `🌐 <span class="language-text">${currentLang.toUpperCase()}</span> <i class="fas fa-chevron-down" aria-hidden="true"></i>`;
    }
    updateAllTranslations();
  });
  
  // Initialize button with current language
  const currentLang = languageManager.getCurrentLanguage();
  const currentLangData = languages.find(l => l.code === currentLang);
  if (currentLangData) {
    languageBtn.innerHTML = `🌐 <span class="language-text">${currentLang.toUpperCase()}</span> <i class="fas fa-chevron-down" aria-hidden="true"></i>`;
  }
  
  // Accessibility Controls
  const accessibilityControls = document.createElement('div');
  accessibilityControls.className = 'accessibility-controls';
  accessibilityControls.setAttribute('aria-label', 'Accessibility controls');
  
  // High Contrast Toggle
  const highContrastBtn = document.createElement('button');
  highContrastBtn.className = 'accessibility-btn';
  highContrastBtn.innerHTML = '<i class="fas fa-adjust" aria-hidden="true"></i>';
  highContrastBtn.setAttribute('aria-label', 'Toggle high contrast mode');
  highContrastBtn.setAttribute('title', 'Toggle high contrast mode');
  highContrastBtn.addEventListener('click', toggleHighContrast);
  // Font Size Controls
  const fontSizeContainer = document.createElement('div');
  fontSizeContainer.className = 'font-size-controls';
  fontSizeContainer.setAttribute('aria-label', 'Font size controls');
  // Add a label for screen readers
  const fontSizeLabel = document.createElement('span');
  fontSizeLabel.className = 'sr-only';
  fontSizeLabel.textContent = t.fontControls.label;
  fontSizeContainer.appendChild(fontSizeLabel);
  // Decrease button with minus icon
  const decreaseFontBtn = document.createElement('button');
  decreaseFontBtn.className = 'font-size-btn';
  decreaseFontBtn.innerHTML = `<i class="fas fa-minus" aria-hidden="true"></i> <span class="sr-only">${t.fontControls.decrease}</span>`;
  decreaseFontBtn.setAttribute('aria-label', t.fontControls.decrease);
  decreaseFontBtn.setAttribute('title', t.fontControls.decrease);
  decreaseFontBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adjustFontSize(false);
  });
  // Current font size display
  const fontSizeDisplay = document.createElement('span');
  fontSizeDisplay.className = 'font-size-display';
  fontSizeDisplay.textContent = 'A';
  fontSizeDisplay.setAttribute('aria-hidden', 'true');
  // Increase button with plus icon
  const increaseFontBtn = document.createElement('button');
  increaseFontBtn.className = 'font-size-btn';
  increaseFontBtn.innerHTML = `<i class="fas fa-plus" aria-hidden="true"></i> <span class="sr-only">${t.fontControls.increase}</span>`;
  increaseFontBtn.setAttribute('aria-label', t.fontControls.increase);
  increaseFontBtn.setAttribute('title', t.fontControls.increase);
  increaseFontBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adjustFontSize(true);
  });
  // Add all elements to container
  fontSizeContainer.appendChild(decreaseFontBtn);
  fontSizeContainer.appendChild(fontSizeDisplay);
  fontSizeContainer.appendChild(increaseFontBtn);
  // Skip to main content link (hidden until focused)
  const skipToContent = document.createElement('a');
  skipToContent.href = '#main-content';
  skipToContent.className = 'skip-to-content';
  skipToContent.textContent = 'Skip to main content';
  skipToContent.setAttribute('tabindex', '0');
  
  // Create a container for accessibility controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  
  // Add language selector first
  controlsContainer.appendChild(languageSelector);
  
  // Add font size controls second
  controlsContainer.appendChild(fontSizeContainer);
  
  // Add high contrast toggle last
  controlsContainer.appendChild(highContrastBtn);
  
  // Add all controls to accessibility controls
  accessibilityControls.appendChild(controlsContainer);
  
  // Add nav links and accessibility controls to container
  navbarLinksContainer.appendChild(navLinks);
  navbarLinksContainer.appendChild(accessibilityControls);
  
  // Add other navbar elements
  navbar.prepend(skipToContent);
  navbar.appendChild(logo);
  navbar.appendChild(mobileMenuToggle);
  navbar.appendChild(navbarLinksContainer);
  // Mobile menu toggle logic
  mobileMenuToggle.addEventListener("click", () => {
    navbarLinksContainer.classList.toggle("active");
    mobileMenuToggle.classList.toggle("active");
    const expanded = mobileMenuToggle.classList.contains("active");
    mobileMenuToggle.setAttribute("aria-expanded", String(expanded));
  });
  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll(".navbar-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        navbarLinksContainer.classList.remove("active");
        mobileMenuToggle.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
  // Close mobile menu if clicked outside
  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 768 &&
      !navbarLinksContainer.contains(event.target as Node) &&
      !mobileMenuToggle.contains(event.target as Node) &&
      navbarLinksContainer.classList.contains("active")
    ) {
      navbarLinksContainer.classList.remove("active");
      mobileMenuToggle.classList.remove("active");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
    }
  });
  return navbar;
}
// Footer Component
function createFooter(): HTMLElement {
  return document.createElement("footer");
}
// Home Page
function renderHomePage(): HTMLElement {
  const t = languageManager.getTranslations();
  const home = document.createElement("div");
  home.className = "page"; // Removed home-page specific class as it's handled by 'page'
  home.setAttribute("role", "main");
  home.id = "home"; // Add ID for nav link highlighting
  // Hero Section
  const heroSection = document.createElement("section");
  heroSection.className = "hero-section content-section";
  const paddleImage = document.createElement("img");
  paddleImage.className = "ping-pong-paddle";
  const heroTitle = document.createElement("h1");
  heroTitle.className = "hero-title";
  heroTitle.textContent = t.home.title;
  
  const heroSubtitle = document.createElement("h2");
  heroSubtitle.className = "hero-subtitle";
  heroSubtitle.textContent = t.home.tagline;
  
  const heroDescription = document.createElement("p");
  heroDescription.className = "hero-description";
  heroDescription.textContent = t.home.description;
  const heroCta = document.createElement("div");
  heroCta.className = "hero-cta";
  const registerCtaBtn = document.createElement("button");
  registerCtaBtn.className = "primary-button register-cta-button";
  registerCtaBtn.innerHTML = `<i class="fas fa-user-plus"></i> ${t.home.registerNow}`;
  registerCtaBtn.addEventListener("click", () => navigateTo("/register"));
  heroCta.appendChild(registerCtaBtn);
  heroSection.appendChild(paddleImage);
  heroSection.appendChild(heroTitle);
  heroSection.appendChild(heroSubtitle);
  heroSection.appendChild(heroDescription);
  heroSection.appendChild(heroCta);
  home.appendChild(heroSection);
  // Meet The Team Section
  const teamSection = document.createElement("section");
  teamSection.id = "team"; // Add ID for nav link highlighting
  teamSection.className = "content-section";
  const teamTitle = document.createElement("h2");
  teamTitle.className = "section-title";
  teamTitle.textContent = t.home.meetTheTeam;
  teamSection.appendChild(teamTitle);
  const teamGrid = document.createElement("div");
  teamGrid.className = "team-grid";
  const teamMembers = [
    { name: "Hanieh", avatar: "/pic1.png" },
    { name: "Mira", avatar: "/pic2.png" },
    { name: "Fatima Fidha", avatar: "/pic3.png" },
  ];
  teamMembers.forEach((member) => {
    const memberCard = document.createElement("div");
    memberCard.className = "team-member-card";
    const avatar = document.createElement("img");
    avatar.src = member.avatar;
    avatar.alt = `Avatar of ${member.name}`;
    avatar.className = "team-member-avatar";
    const name = document.createElement("p");
    name.className = "team-member-name";
    name.textContent = member.name;
    memberCard.appendChild(avatar);
    memberCard.appendChild(name);
    teamGrid.appendChild(memberCard);
  });
  teamSection.appendChild(teamGrid);
  home.appendChild(teamSection);
  // Add footer
  home.appendChild(createFooter());
  // Always hide loading overlay after rendering home page
  hideLoading();
  return home;
}
// Games Page (1v1 and Tournaments)
function renderTournamentPage(): HTMLElement {
  const t = languageManager.getTranslations();
  const gamesPage = document.createElement("div");
  gamesPage.className = "page content-section";
  gamesPage.id = "games-page";
  gamesPage.setAttribute("role", "main");
  
  // Hero Section
  const heroSection = document.createElement("div");
  heroSection.className = "games-hero-section";
  heroSection.innerHTML = `
    <div class="hero-background-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>
    
    <div class="games-hero-content">
      <div class="hero-icon">
        <div class="icon-glow"></div>
        <i class="fas fa-gamepad"></i>
      </div>
      
      <h1 class="games-hero-title">
        <span class="title-main">${t.games.title}</span>
        <span class="title-sub">${t.games.subtitle}</span>
      </h1>
      
      <div class="games-stats-bar">
        <div class="stat-item">
          <span class="stat-number">1,247</span>
          <span class="stat-label">${t.games.stats.activePlayers}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">89</span>
          <span class="stat-label">${t.games.stats.ongoingMatches}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">12</span>
          <span class="stat-label">${t.games.stats.tournaments}</span>
        </div>
      </div>
    </div>
  `;
  
  // Game Modes Section
  const gameModesSection = document.createElement("div");
  gameModesSection.className = "game-modes-section";
  
  if (isLoggedIn && currentUser) {
    gameModesSection.innerHTML = `
      <div class="game-modes-header">

      </div>
      <div class="game-modes-container">
        <!-- 1v1 Battle Mode -->
        <div class="game-mode-card onevsone">
          <div class="card-background">
            <div class="card-glow"></div>
            <div class="card-particles"></div>
          </div>
          
          <div class="mode-header">
            <div class="mode-icon">
              <div class="icon-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
              </div>
              <i class="fas fa-bolt"></i>
            </div>
            <div class="mode-title">
              <h2>${t.games.oneVsOne.title}</h2>
              <p>${t.games.oneVsOne.subtitle}</p>
            </div>
          </div>
          
          <div class="mode-content">
            <p class="mode-description">${t.games.oneVsOne.description}</p>
            
            <div class="mode-features">
              <div class="feature-item">
                <i class="fas fa-zap"></i>
                <span>${t.games.oneVsOne.features.instant}</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-chart-line"></i>
                <span>${t.games.oneVsOne.features.ranked}</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-balance-scale"></i>
                <span>${t.games.oneVsOne.features.skill}</span>
              </div>
            </div>
            
            <div class="mode-actions">
              <button class="premium-game-btn" id="play-1v1-btn">
                <span class="btn-bg"></span>
                <span class="btn-content">
                  <i class="fas fa-bolt"></i>
                  ${t.games.oneVsOne.playNow}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- AI Challenge Mode -->
        <div class="game-mode-card ai">
          <div class="card-background">
            <div class="card-glow"></div>
            <div class="card-particles"></div>
          </div>
          
          <div class="mode-header">
            <div class="mode-icon">
              <div class="icon-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
                <div class="ring ring-3"></div>
              </div>
              <i class="fas fa-robot"></i>
            </div>
            <div class="mode-title">
              <h2>${t.games.ai.title}</h2>
              <p>${t.games.ai.subtitle}</p>
            </div>
          </div>
          
          <div class="mode-content">
            <p class="mode-description">${t.games.ai.description}</p>
            
            <div class="mode-features">
              <div class="feature-item">
                <i class="fas fa-brain"></i>
                <span>${t.games.ai.features.adaptive}</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-dumbbell"></i>
                <span>${t.games.ai.features.practice}</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-trophy"></i>
                <span>${t.games.ai.features.skills}</span>
              </div>
            </div>
            
            <div class="mode-actions">
              <button class="premium-game-btn" id="play-ai-btn">
                <span class="btn-bg"></span>
                <span class="btn-content">
                  <i class="fas fa-robot"></i>
                  ${t.games.ai.playNow}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tournament Mode -->
        <div class="game-mode-card tournament">
          <div class="card-background">
            <div class="card-glow"></div>
            <div class="card-particles"></div>
          </div>
          
          <div class="mode-header">
            <div class="mode-icon">
              <div class="icon-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
                <div class="ring ring-3"></div>
              </div>
              <i class="fas fa-crown"></i>
            </div>
            <div class="mode-title">
              <h2>${t.games.tournaments.title}</h2>
              <p>${t.games.tournaments.subtitle}</p>
            </div>
          </div>
          
          <div class="mode-content">
            <p class="mode-description">${t.games.tournaments.description}</p>
            
            <div class="mode-features">
              <div class="feature-item">
                <i class="fas fa-chess"></i>
                <span>${t.games.tournaments.features.strategic}</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-medal"></i>
                <span>${t.games.tournaments.features.prestige}</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-fire"></i>
                <span>${t.games.tournaments.features.competition}</span>
              </div>
            </div>
            
            <div class="mode-actions">
              <button class="premium-game-btn" id="create-tournament-btn">
                <span class="btn-bg"></span>
                <span class="btn-content">
                  <i class="fas fa-crown"></i>
                  ${t.games.tournaments.createTournament}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const play1v1Btn = gameModesSection.querySelector('#play-1v1-btn') as HTMLButtonElement;
    const playAiBtn = gameModesSection.querySelector('#play-ai-btn') as HTMLButtonElement;
    const createTournamentBtn = gameModesSection.querySelector('#create-tournament-btn') as HTMLButtonElement;
    
    // Replace the existing AI Challenge event listener with this:
    if (playAiBtn) {
      console.log('AI Button found and adding event listener');
      playAiBtn.addEventListener('click', () => {
        console.log('AI Challenge button clicked!');
        // Show difficulty selection modal
        showAIDifficultyModal();
      });
    } else {
      console.error('AI Button not found!');
    }
    
    // Add the AI difficulty selection modal function
    // @ts-ignore
function showAIDifficultyModal(): void {
      const t = languageManager.getTranslations();
      const modal = document.createElement('div');
      modal.className = 'ai-difficulty-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>${t.games.ai.difficultyModal.title}</h3>
            <p>${t.games.ai.difficultyModal.subtitle}</p>
          </div>
          <div class="difficulty-options">
            <button class="difficulty-btn easy" data-difficulty="easy">
              <div class="difficulty-icon">🟢</div>
              <div class="difficulty-info">
                <h4>${t.games.ai.difficultyModal.easy.name}</h4>
                <p>${t.games.ai.difficultyModal.easy.description}</p>
                <small>${t.games.ai.difficultyModal.easy.details}</small>
              </div>
            </button>
            <button class="difficulty-btn medium" data-difficulty="medium">
              <div class="difficulty-icon">🟡</div>
              <div class="difficulty-info">
                <h4>${t.games.ai.difficultyModal.medium.name}</h4>
                <p>${t.games.ai.difficultyModal.medium.description}</p>
                <small>${t.games.ai.difficultyModal.medium.details}</small>
              </div>
            </button>
            <button class="difficulty-btn hard" data-difficulty="hard">
              <div class="difficulty-icon">🔴</div>
              <div class="difficulty-info">
                <h4>${t.games.ai.difficultyModal.hard.name}</h4>
                <p>${t.games.ai.difficultyModal.hard.description}</p>
                <small>${t.games.ai.difficultyModal.hard.details}</small>
              </div>
            </button>
          </div>
          <div class="modal-actions">
            <button class="cancel-btn" id="cancel-ai-btn">${t.games.ai.difficultyModal.cancel}</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners for difficulty selection
      modal.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const difficulty = (e.currentTarget as HTMLElement).dataset.difficulty as 'easy' | 'medium' | 'hard';
          startAIGame(difficulty);
          document.body.removeChild(modal);
        });
      });
      
      // Add cancel button listener
      modal.querySelector('#cancel-ai-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    }
    
    // Add the start AI game function
    function startAIGame(difficulty: 'easy' | 'medium' | 'hard'): void {
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
        
        // Create navigation back function
        const navigateBack = () => {
          navigateTo('/tournament'); // Navigate back to games page
        };
        
        // Create and render the AI game
        createAIGamePage(gameContainer, difficulty, navigateBack);
        showMessage(`🤖 Starting AI Challenge (${difficulty})...`, 'info');
      }
    }
    
    play1v1Btn?.addEventListener('click', () => {
      // Create game page and render inside a dedicated container
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
        // Create navigation back function
        const navigateBack = () => {
          navigateTo('/tournament'); // Navigate back to games page
        };
        // Create and render the 1v1 game
        create1v1GamePage(gameContainer, navigateBack);
        showMessage('🎮 Starting 1v1 match...', 'info');
      }
    });
    

    // Add tournament start logic: fetch matches and start first match
    createTournamentBtn?.addEventListener('click', async () => {
      // Show modal to enter 4 player names and display bracket
      showTournamentBracketModal();
    });
    
    
  } else {
    // Login required section
    gameModesSection.innerHTML = `
      <div class="login-required-section">
        <div class="login-card">
          <div class="card-glow"></div>
          <div class="login-icon">
            <i class="fas fa-lock"></i>
          </div>
          <h2>${t.games.loginRequired.title}</h2>
          <p>${t.games.loginRequired.description}</p>
          <button class="login-access-btn" onclick="navigateTo('/ACCOUNT')">
            <span class="btn-glow"></span>
            <span class="btn-content">
              <i class="fas fa-key"></i>
              ${t.games.loginRequired.button}
            </span>
          </button>
        </div>
      </div>
    `;
  }
  
  gamesPage.appendChild(heroSection);
  gamesPage.appendChild(gameModesSection);
  gamesPage.appendChild(createFooter());
  // Always hide loading overlay after rendering
  hideLoading();
  return gamesPage;
}

// Combined Login/Register Page
function renderAuthPage(isLogin = true): HTMLElement {
  const t = languageManager.getTranslations();
  const authPage = document.createElement("div");
  authPage.className = "page content-section";
  authPage.id = isLogin ? "login" : "register";
  authPage.setAttribute("role", "main");
  
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";
  
  // Toggle between login/register
  const toggleText = document.createElement("p");
  toggleText.className = "text-center mt-4";
  const toggleLink = document.createElement("a");
  toggleLink.href = "#";
  toggleLink.className = "text-blue-500 hover:underline";
  toggleLink.textContent = isLogin ? t.auth.login.createAccount : t.auth.register.signIn;
  toggleLink.addEventListener("click", (e: Event) => {
    e.preventDefault();
    const newPath = isLogin ? "/register" : "/login";
    navigateTo(newPath);
  });
  // Create container for the toggle text
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'toggle-text-container';
  
  // Create the text node with proper styling
  const textNode = document.createElement('span');
  textNode.className = 'toggle-text';
  textNode.textContent = isLogin ? t.auth.login.noAccount : t.auth.register.hasAccount;
  
  // Style the toggle link
  toggleLink.className = 'toggle-link neon-text';
  toggleLink.style.marginLeft = '4px';
  toggleLink.style.textDecoration = 'none';
  toggleLink.style.transition = 'all 0.3s ease';
  toggleLink.style.fontWeight = '600';
  
  // Add hover effect
  toggleLink.addEventListener('mouseenter', () => {
    toggleLink.style.textShadow = '0 0 10px rgba(99, 102, 241, 0.8)';
  });
  
  toggleLink.addEventListener('mouseleave', () => {
    toggleLink.style.textShadow = 'none';
  });
  
  // Append elements
  toggleContainer.appendChild(textNode);
  toggleContainer.appendChild(toggleLink);
  toggleText.appendChild(toggleContainer);

  // Form title
  const title = document.createElement("h2");
  title.className = "form-title";
  title.textContent = isLogin ? t.auth.login.title : t.auth.register.title;
  
  // Form element
  const form = document.createElement("form");
  form.noValidate = true;

  let emailInput: HTMLInputElement | null = null;
  if (!isLogin) {
    const emailLabel = document.createElement("label");
    emailLabel.className = "form-label";
    emailLabel.textContent = t.auth.register.email;
    emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.className = "form-input";
    emailInput.required = true;
    emailInput.placeholder = "Enter your email";
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
  }

  // Username field (always shown)
  const usernameLabel = document.createElement("label");
  usernameLabel.className = "form-label";
  usernameLabel.textContent = isLogin ? t.auth.login.username : t.auth.register.username;
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.className = "form-input";
  usernameInput.required = true;
  usernameInput.placeholder = "Write your username";
  
  // Password field (always shown)
  const passwordLabel = document.createElement("label");
  passwordLabel.className = "form-label";
  passwordLabel.textContent = isLogin ? t.auth.login.password : t.auth.register.password;
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.className = "form-input";
  passwordInput.required = true;
  passwordInput.placeholder = "Enter your password";

  // Confirm Password (only for registration)
  let confirmPasswordInput: HTMLInputElement | null = null;
  let confirmLabel: HTMLLabelElement | null = null;
  if (!isLogin) {
    confirmLabel = document.createElement("label");
    confirmLabel.className = "form-label";
    confirmLabel.textContent = t.auth.register.confirmPassword;
    confirmPasswordInput = document.createElement("input");
    confirmPasswordInput.type = "password";
    confirmPasswordInput.className = "form-input";
    confirmPasswordInput.required = true;
    confirmPasswordInput.placeholder = "Confirm your password";
  }

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "primary-button w-full";
  submitButton.textContent = isLogin ? t.auth.login.button : t.auth.register.button;

  // Back button
  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "secondary-button w-full mt-2";
  backButton.textContent = isLogin ? t.auth.login.backToHome : t.auth.register.backToHome;
  backButton.addEventListener("click", () => navigateTo("/"));

  // Add elements to form in the correct order
  if (!isLogin) {
    // Email field is already added for registration
    form.appendChild(document.createElement('br'));
  }
  
  // Add username
  form.appendChild(usernameLabel);
  form.appendChild(usernameInput);
  form.appendChild(document.createElement('br'));
  
  // Add password
  form.appendChild(passwordLabel);
  form.appendChild(passwordInput);
  
  // Add confirm password for registration
  if (!isLogin && confirmPasswordInput && confirmLabel) {
    form.appendChild(document.createElement('br'));
    form.appendChild(confirmLabel);
    form.appendChild(confirmPasswordInput);
  }
  
  if (isLogin) {
    form.appendChild(document.createElement('br'));
  }
    // Google Sign-In button
  const googleSignInButton = document.createElement("button");
  googleSignInButton.type = "button";
  googleSignInButton.className = "google-signin-button";
  googleSignInButton.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Sign in with Google
  `;
  googleSignInButton.addEventListener("click", () => {
    window.location.href = "/auth/google";
  });

  // Divider
  const divider = document.createElement("div");
  divider.className = "auth-divider";
  divider.innerHTML = `<span>or</span>`;

  form.appendChild(submitButton);
  form.appendChild(divider);
  form.appendChild(googleSignInButton);
  form.appendChild(backButton);
  
  formContainer.appendChild(title);
  formContainer.appendChild(form);
  formContainer.appendChild(toggleText);
  
  authPage.appendChild(formContainer);
  authPage.appendChild(createFooter());

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!isLogin && passwordInput.value !== confirmPasswordInput?.value) {
      showMessage("Passwords do not match", "error");
      return;
    }

    showLoading();
    try {
      if (isLogin) {
        // Call backend login endpoint
        if (usernameInput.value.trim() && passwordInput.value.trim()) {
          const username = usernameInput.value.trim();
          const password = passwordInput.value;
          const res = await apiService.users.login(username, password);
          if (res.error || !res.data) {
            showMessage(res.error || 'Login failed', 'error');
          } else {
            // Use returned data from API response
            const data = res.data as any;
            handleLogin(data.username || username, data.token, data.userId);
            showMessage('Login successful', 'success');
          }
        } else {
          showMessage("Please enter both username and password", "error");
        }
      } else if (emailInput) {
        // Call backend registration endpoint
        if (usernameInput.value.trim() && passwordInput.value.trim() && emailInput.value.trim()) {
          const username = usernameInput.value.trim();
          const password = passwordInput.value;
          const email = emailInput.value.trim();
          const res = await apiService.users.register(username, password, email);
          if (res.error || !res.data) {
            showMessage(res.error || 'Registration failed', 'error');
          } else {
            // Registration succeeded; auto-login with same credentials
            const loginRes = await apiService.users.login(username, password);
            if (loginRes.error || !loginRes.data) {
              showMessage(loginRes.error || 'Auto-login failed after registration', 'error');
            } else {
              const loginData = loginRes.data as any;
              handleLogin(username, loginData.token, loginData.userId);
              showMessage('Registration & login successful!', 'success');
            }
          }
        } else {
          showMessage("Please fill in all fields", "error");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      showMessage("An error occurred. Please try again.", "error");
    } finally {
      hideLoading();
    }
  });

  // Always hide loading overlay after rendering auth page
  hideLoading();
  return authPage;
}

// Profile Page
function renderProfilePage(): HTMLElement {
  const t = languageManager.getTranslations();
  const profilePage = document.createElement("div");
  profilePage.className = "page content-section";
  profilePage.id = "profile";
  profilePage.setAttribute("role", "main");
  
  // Add a page title
  const pageTitle = document.createElement("h1");
  pageTitle.className = "section-title";
  pageTitle.textContent = t.profile.title;
  profilePage.appendChild(pageTitle);
  
  const tabContainer = document.createElement("div");
  tabContainer.className = "profile-tabs";
  
  const tabButtons = document.createElement("div");
  tabButtons.className = "tab-buttons";
  
  const tabs = [
    { id: "dashboard", label: t.profile.tabs.dashboard, icon: "fa-tachometer-alt" },
    { id: "profile-info", label: t.profile.tabs.settings, icon: "fa-user-edit" },
    { id: "stats", label: t.profile.tabs.statistics, icon: "fa-chart-bar" },
    { id: "friends", label: t.profile.tabs.friends, icon: "fa-users" },
    { id: "match-history", label: t.profile.tabs.history, icon: "fa-history" }
  ];
  
  // Always default to dashboard tab on load
  const lastActiveTab = 'dashboard';
  tabs.forEach((tab) => {
    const tabButton = document.createElement("button");
    tabButton.className = `tab-button${tab.id === lastActiveTab ? ' active' : ''}`;
    tabButton.dataset.tab = tab.id;
    tabButton.innerHTML = `<i class="fas ${tab.icon}"></i> ${tab.label}`;
    tabButton.addEventListener("click", () => {
      switchTab(tab.id);
    });
    tabButtons.appendChild(tabButton);
  });
  
  tabContainer.appendChild(tabButtons);
  
  // Create tab content area
  const tabContent = document.createElement("div");
  tabContent.className = "tab-content";
  
  // Mock user data - in real app this would come from API
  // @ts-ignore
  const mockUserData = {
    username: 'player123',
    displayName: 'Pro Player',
    skillLevel: 'intermediate' as const,
    bio: 'Passionate ping pong player with 5 years of experience!',
    avatar: '/pic1.png',
    wins: 45,
    losses: 23,
    gamesPlayed: 68,
    winRate: 66.2,
    currentStreak: 5,
    longestStreak: 12,
    averageMatchDuration: 22,
    totalPlayTime: 1456, // minutes
    ranking: 42,
    totalPlayers: 1337,
    averageScore: 18.5,
    perfectGames: 3,
    comebacks: 8,
    friends: [
      { id: 1, username: 'friend1', displayName: 'Alice', avatar: '/pic2.png', isOnline: true },
      { id: 2, username: 'friend2', displayName: 'Bob', avatar: '/pic3.png', isOnline: false, lastSeen: new Date('2024-01-15') },
      { id: 3, username: 'friend3', displayName: 'Carol', avatar: '/pic1.png', isOnline: true }
    ],
    matchHistory: [
      { id: 1, opponent: 'Alice', opponentAvatar: '/pic2.png', result: 'win' as const, score: '21-18', date: new Date('2024-01-20'), gameType: '1v1' as const, duration: 25 },
      { id: 2, opponent: 'Bob', opponentAvatar: '/pic3.png', result: 'loss' as const, score: '19-21', date: new Date('2024-01-19'), gameType: '1v1' as const, duration: 30 },
      { id: 3, opponent: 'Carol', opponentAvatar: '/pic1.png', result: 'win' as const, score: '21-15', date: new Date('2024-01-18'), gameType: 'tournament' as const, duration: 20 },
      { id: 4, opponent: 'David', opponentAvatar: '/pic2.png', result: 'win' as const, score: '21-12', date: new Date('2024-01-17'), gameType: '1v1' as const, duration: 18 },
      { id: 5, opponent: 'Eve', opponentAvatar: '/pic3.png', result: 'win' as const, score: '21-16', date: new Date('2024-01-16'), gameType: 'tournament' as const, duration: 28 },
      { id: 6, opponent: 'Frank', opponentAvatar: '/pic1.png', result: 'win' as const, score: '21-19', date: new Date('2024-01-15'), gameType: '1v1' as const, duration: 35 },
      { id: 7, opponent: 'Grace', opponentAvatar: '/pic2.png', result: 'loss' as const, score: '18-21', date: new Date('2024-01-14'), gameType: 'tournament' as const, duration: 22 }
    ],
    weeklyStats: [
      { week: 'Week 1', wins: 8, losses: 2, gamesPlayed: 10 },
      { week: 'Week 2', wins: 12, losses: 3, gamesPlayed: 15 },
      { week: 'Week 3', wins: 6, losses: 4, gamesPlayed: 10 },
      { week: 'Week 4', wins: 10, losses: 5, gamesPlayed: 15 },
      { week: 'Week 5', wins: 9, losses: 9, gamesPlayed: 18 }
    ],
    skillProgression: [
      { month: 'Sep', rating: 1200 },
      { month: 'Oct', rating: 1350 },
      { month: 'Nov', rating: 1420 },
      { month: 'Dec', rating: 1465 },
      { month: 'Jan', rating: 1520 }
    ]
  };
  
  // Dashboard Tab (new)
  const dashboardTab = document.createElement("div");
  dashboardTab.className = "tab-pane active";
  dashboardTab.id = "dashboard";
  // Fetch real user profile and render dashboard
  apiService.users.getMyProfile().then((res) => {
    if (res.data && res.data.user) {
      const userData = {
        ...res.data.user,
        ...(res.data.stats || {}),
        matchHistory: res.data.gameHistory || [],
        friends: res.data.user.friends || []
      };
      dashboardTab.appendChild(createDashboardSection(userData));
    } else {
      dashboardTab.textContent = "Failed to load dashboard.";
    }
    hideLoading();
  }).catch(() => {
    dashboardTab.textContent = "Failed to load dashboard.";
    hideLoading();
  });
  
  // Profile Settings Tab
  const profileInfoTab = document.createElement("div");
  profileInfoTab.className = "tab-pane";
  profileInfoTab.id = "profile-info";

  // Fetch real user profile and render settings
  apiService.users.getMyProfile().then((res) => {
    if (res.data && res.data.user) {
      const userData = {
        ...res.data.user,
        displayName: res.data.user.alias || '',
        bio: typeof res.data.user.bio === 'string' ? res.data.user.bio : '',
        matchHistory: res.data.gameHistory || [],
        friends: res.data.user.friends || []
      };
      const profileSettings = createProfileSettings(userData);
      profileInfoTab.appendChild(profileSettings);
    } else {
      profileInfoTab.textContent = "Failed to load profile.";
    }
    hideLoading();
  }).catch(() => {
    profileInfoTab.textContent = "Failed to load profile.";
    hideLoading();
  });
  
  // Statistics Tab
  const statsTab = document.createElement("div");
  statsTab.className = "tab-pane";
  statsTab.id = "stats";
  apiService.users.getMyProfile().then((res) => {
    if (res.data && res.data.user) {
      const userData = {
        ...res.data.user,
        ...(res.data.stats || {}),
        matchHistory: res.data.gameHistory || [],
        friends: res.data.user.friends || []
      };
      statsTab.appendChild(createStatsSection(userData));
    } else {
      statsTab.textContent = "Failed to load stats.";
    }
  });
  
  // Friends Tab
  const friendsTab = document.createElement("div");
  friendsTab.className = "tab-pane";
  friendsTab.id = "friends";
  friendsTab.appendChild(createFriendsSection());
  
  // Match History Tab
  const historyTab = document.createElement("div");
  historyTab.className = "tab-pane";
  historyTab.id = "match-history";
  apiService.users.getMyProfile().then((res) => {
    if (res.data && res.data.user) {
      const userData = {
        ...res.data.user,
        matchHistory: res.data.gameHistory || [],
        friends: res.data.user.friends || []
      };
      historyTab.appendChild(createMatchHistorySection(userData.matchHistory));
    } else {
      historyTab.textContent = "Failed to load match history.";
    }
    hideLoading();
  }).catch(() => {
    historyTab.textContent = "Failed to load match history.";
    hideLoading();
  });
  
  tabContent.appendChild(dashboardTab);
  tabContent.appendChild(profileInfoTab);
  tabContent.appendChild(statsTab);
  tabContent.appendChild(friendsTab);
  tabContent.appendChild(historyTab);

  // Show last active tab on load, or dashboard if none stored
  setTimeout(() => {
    const lastActiveTab = localStorage.getItem('activeProfileTab') || 'dashboard';
    switchTab(lastActiveTab);
  }, 0);
  
  tabContainer.appendChild(tabContent);
  profilePage.appendChild(tabContainer);
  
  // Always hide loading overlay after rendering profile page
  hideLoading();
  return profilePage;
}

// Comprehensive Dashboard Section
function createDashboardSection(userData: any): HTMLElement {
  const t = languageManager.getTranslations();
  const dashboardContainer = document.createElement("div");
  dashboardContainer.className = "dashboard-section";
  
  // Dashboard Header with Welcome Message
  const dashboardHeader = document.createElement("div");
  dashboardHeader.className = "dashboard-header";
  dashboardHeader.innerHTML = `
    <div class="welcome-banner">
      <h2>WELCOME BACK, ${(userData && userData.username ? userData.username.toUpperCase() : 'PLAYER')}!</h2>
      <p>${t.profile.dashboard.overview}</p>
    </div>
  `;
  dashboardContainer.appendChild(dashboardHeader);
  
  // Key Performance Indicators (KPIs)
  const kpiSection = document.createElement("div");
  kpiSection.className = "dashboard-kpis";
  
  const kpiTitle = document.createElement("h3");
  // Short label for KPI section to avoid duplicating the welcome banner text
  kpiTitle.textContent = "Overview";
  kpiTitle.className = "dashboard-section-title";
  kpiSection.appendChild(kpiTitle);
  
  const kpiGrid = document.createElement("div");
  kpiGrid.className = "kpi-grid";
  
  const kpis = [
    { 
      label: t.profile.dashboard.rank, 
      value: `#${userData.ranking}`, 
      subtitle: `${t.profile.dashboard.of} ${userData.totalPlayers} ${t.profile.dashboard.players}`,
      icon: "fa-crown", 
      color: "gold",
      trend: "up"
    },
    { 
      label: t.profile.dashboard.winRate, 
      value: `${userData.winRate}%`, 
      subtitle: `${userData.wins}W / ${userData.losses}L`,
      icon: "fa-trophy", 
      color: "success",
      trend: "up"
    },
    { 
      label: t.profile.dashboard.streak, 
      value: userData.currentStreak, 
      subtitle: `${t.profile.dashboard.best}: ${userData.longestStreak}`,
      icon: "fa-fire", 
      color: "warning",
      trend: "up"
    },
    { 
      label: t.profile.dashboard.playTime, 
      value: `${Math.floor(userData.totalPlayTime / 60)}h ${userData.totalPlayTime % 60}m`, 
      subtitle: `${t.profile.dashboard.avg}: ${userData.averageMatchDuration}min/game`,
      icon: "fa-clock", 
      color: "info",
      trend: "up"
    }
  ];
  
  kpis.forEach(kpi => {
    const kpiCard = document.createElement("div");
    kpiCard.className = `kpi-card ${kpi.color}`;
    kpiCard.innerHTML = `
      <div class="kpi-icon"><i class="fas ${kpi.icon}"></i></div>
      <div class="kpi-content">
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-sub">${kpi.subtitle}</div>
      </div>
      <div class="kpi-trend ${kpi.trend}"></div>
    `;
    kpiGrid.appendChild(kpiCard);
  });
  kpiSection.appendChild(kpiGrid);
  dashboardContainer.appendChild(kpiSection);
  
  // Charts and Analytics Section
  const analyticsSection = document.createElement("div");
  analyticsSection.className = "dashboard-analytics";
  
  const analyticsTitle = document.createElement("h3");
  analyticsTitle.textContent = t.profile.dashboard.analytics;
  analyticsTitle.className = "dashboard-section-title";
  analyticsSection.appendChild(analyticsTitle);
  
  const chartsContainer = document.createElement("div");
  chartsContainer.className = "charts-container";
  
  // Weekly Performance Chart
  const weeklyChart = createWeeklyPerformanceChart(userData.weeklyStats);
  chartsContainer.appendChild(weeklyChart);
  
  // Skill Progression Chart
  const skillChart = createSkillProgressionChart(userData.skillProgression);
  chartsContainer.appendChild(skillChart);
  
  analyticsSection.appendChild(chartsContainer);
  dashboardContainer.appendChild(analyticsSection);
  
  // Recent Activity and Quick Stats
  const activitySection = document.createElement("div");
  activitySection.className = "dashboard-activity";
  
  const activityRow = document.createElement("div");
  activityRow.className = "activity-row";
  
  // Recent Matches Summary
  const recentMatches = createRecentMatchesSummary(userData.matchHistory.slice(0, 5));
  activityRow.appendChild(recentMatches);
  
  // Advanced Statistics
  const advancedStats = createAdvancedStatsPanel(userData);
  activityRow.appendChild(advancedStats);
  
  activitySection.appendChild(activityRow);
  dashboardContainer.appendChild(activitySection);
  
  // Achievement and Goals Section
  const achievementsSection = createAchievementsSection(userData);
  dashboardContainer.appendChild(achievementsSection);
  
  return dashboardContainer;
}

// Weekly Performance Chart
function createWeeklyPerformanceChart(weeklyStats: any[]): HTMLElement {
  const t = languageManager.getTranslations();
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container weekly-chart";
  
  const chartTitle = document.createElement("h4");
  chartTitle.textContent = t.profile.dashboard.weekly;
  chartContainer.appendChild(chartTitle);
  
  const chartWrapper = document.createElement("div");
  chartWrapper.className = "chart-wrapper";
  
  if (!weeklyStats || weeklyStats.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chart-empty';
    empty.textContent = 'No weekly data available';
    chartContainer.appendChild(empty);
    return chartContainer;
  }

  const maxGames = Math.max(...weeklyStats.map(week => week.gamesPlayed || 0));
  
  weeklyStats.forEach(week => {
    const weekBar = document.createElement("div");
    weekBar.className = "week-bar";
    
    const winHeight = (week.wins / maxGames) * 100;
    const lossHeight = (week.losses / maxGames) * 100;
    
    weekBar.innerHTML = `
      <div class="bar-stack">
        <div class="bar-segment wins" style="height: ${winHeight}%" 
             title="${week.wins} wins"></div>
        <div class="bar-segment losses" style="height: ${lossHeight}%" 
             title="${week.losses} losses"></div>
      </div>
      <div class="bar-label">${week.week}</div>
      <div class="bar-stats">
        <span class="win-count">${week.wins}W</span>
        <span class="loss-count">${week.losses}L</span>
      </div>
    `;
    
    chartWrapper.appendChild(weekBar);
  });
  
  chartContainer.appendChild(chartWrapper);
  
  const chartLegend = document.createElement("div");
  chartLegend.className = "chart-legend";
  chartLegend.innerHTML = `
    <div class="legend-item">
      <div class="legend-color wins"></div>
      <span>${t.profile.dashboard.wins}</span>
    </div>
    <div class="legend-item">
      <div class="legend-color losses"></div>
      <span>${t.profile.dashboard.losses}</span>
    </div>
  `;
  chartContainer.appendChild(chartLegend);
  
  return chartContainer;
}

// Skill Progression Chart
function createSkillProgressionChart(skillProgression: any[]): HTMLElement {
  const t = languageManager.getTranslations();
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container skill-chart";
  
  const chartTitle = document.createElement("h4");
  chartTitle.textContent = t.profile.dashboard.rating;
  chartContainer.appendChild(chartTitle);
  
  const chartWrapper = document.createElement("div");
  chartWrapper.className = "line-chart-wrapper";
  
  if (!skillProgression || skillProgression.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chart-empty';
    empty.textContent = 'No skill progression data';
    chartContainer.appendChild(empty);
    return chartContainer;
  }

  const maxRating = Math.max(...skillProgression.map(point => point.skill || point.rating || 0));
  const minRating = Math.min(...skillProgression.map(point => point.skill || point.rating || 0));
  const ratingRange = maxRating - minRating || 1; // avoid divide by zero
  
  const svgContainer = document.createElement("div");
  svgContainer.className = "svg-chart";
  
  let pathData = "";
  const points: string[] = [];
  
  skillProgression.forEach((point, index) => {
    // Fix division by zero when only one data point
    const x = skillProgression.length === 1 ? 50 : (index / (skillProgression.length - 1)) * 100;
    const rating = point.skill || point.rating || 0;
    const y = ((maxRating - rating) / ratingRange) * 100;
    
    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
    
    points.push(`
      <div class="chart-point" style="left: ${x}%; top: ${y}%"
           title="${point.date}: ${rating}">
        <div class="point-value">${rating}</div>
      </div>
    `);
  });
  
  svgContainer.innerHTML = `
    <svg viewBox="0 0 100 100" class="line-chart">
      <path d="${pathData}" class="chart-line" />
      <path d="${pathData}" class="chart-line-glow" />
    </svg>
    ${points.join('')}
  `;
  
  chartWrapper.appendChild(svgContainer);
  
  const xAxis = document.createElement("div");
  xAxis.className = "chart-x-axis";
  skillProgression.forEach(point => {
    const label = document.createElement("span");
    label.textContent = point.month;
    xAxis.appendChild(label);
  });
  chartWrapper.appendChild(xAxis);
  
  chartContainer.appendChild(chartWrapper);
  
  return chartContainer;
}

// Recent Matches Summary
function createRecentMatchesSummary(recentMatches: any[]): HTMLElement {
  const t = languageManager.getTranslations();
  const container = document.createElement("div");
  container.className = "recent-matches-summary";
  
  const title = document.createElement("h4");
  title.textContent = t.profile.dashboard.recent;
  container.appendChild(title);
  
  const matchesList = document.createElement("div");
  matchesList.className = "recent-matches-list";
  
  recentMatches.forEach(match => {
    const matchItem = document.createElement("div");
    
    // Handle different match results for recent matches
    let resultIcon, cardClass;
    if (match.result === 'DID_NOT_PARTICIPATE') {
      cardClass = 'did-not-participate';
      resultIcon = 'fa-eye';
    } else if (match.result === 'win') {
      cardClass = 'win';
      resultIcon = 'fa-check-circle';
    } else if (match.result === 'loss') {
      cardClass = 'loss';
      resultIcon = 'fa-times-circle';
    } else {
      cardClass = match.result;
      resultIcon = 'fa-minus-circle';
    }
    
    matchItem.className = `recent-match-item ${cardClass}`;
    
    const durationText = (typeof match.duration === 'number' && !isNaN(match.duration)) ? ` • ${match.duration}min` : '';
    const scoreText = match.result === 'DID_NOT_PARTICIPATE' ? 'Tournament match' : match.score;
    
    matchItem.innerHTML = `
      <div class="match-result-icon">
        <i class="fas ${resultIcon}"></i>
      </div>
      <div class="match-info">
        <div class="opponent-name">${match.opponent}</div>
        <div class="match-details">${scoreText}${durationText}</div>
      </div>
  <div class="match-date">${match.date && typeof match.date.toLocaleDateString === 'function' ? match.date.toLocaleDateString() : ''}</div>
    `;
    
    matchesList.appendChild(matchItem);
  });
  
  container.appendChild(matchesList);
  
  const viewAllBtn = document.createElement("button");
  viewAllBtn.className = "secondary-button";
  viewAllBtn.textContent = t.profile.dashboard.viewAll;
  viewAllBtn.addEventListener("click", () => switchTab("match-history"));
  container.appendChild(viewAllBtn);
  
  return container;
}

// Advanced Statistics Panel
function createAdvancedStatsPanel(userData: any): HTMLElement {
  const t = languageManager.getTranslations();
  const container = document.createElement("div");
  container.className = "advanced-stats-panel";
  
  const title = document.createElement("h4");
  title.textContent = t.profile.dashboard.advanced;
  container.appendChild(title);
  
  const statsGrid = document.createElement("div");
  statsGrid.className = "advanced-stats-grid";
  
  const advancedStats = [
    { label: t.profile.dashboard.avgScore, value: userData.averageScore, unit: "pts" },
    { label: t.profile.dashboard.perfectGames, value: userData.perfectGames, unit: "" },
    { label: t.profile.dashboard.comebacks, value: userData.comebacks, unit: "" },
    { label: t.profile.dashboard.winRate, value: userData.winRate ? userData.winRate + '%' : '0%', unit: "" }
  ];
  
  advancedStats.forEach(stat => {
    const statItem = document.createElement("div");
    statItem.className = "advanced-stat-item";
    statItem.innerHTML = `
      <div class="stat-value">${stat.value}${stat.unit}</div>
      <div class="stat-label">${stat.label}</div>
    `;
    statsGrid.appendChild(statItem);
  });
  
  container.appendChild(statsGrid);
  
  return container;
}

// Achievements Section
function createAchievementsSection(userData: any): HTMLElement {
  const t = languageManager.getTranslations();
  const container = document.createElement("div");
  container.className = "achievements-section";
  
  const title = document.createElement("h3");
  title.textContent = t.profile.dashboard.achievements;
  title.className = "dashboard-section-title";
  container.appendChild(title);
  
  const achievementsGrid = document.createElement("div");
  achievementsGrid.className = "achievements-grid";
  
  const achievements = [
    {
      title: t.profile.dashboard.winStreakMaster,
      description: t.profile.dashboard.winStreakDesc,
      progress: userData.currentStreak,
      target: 10,
      icon: "fa-fire",
      unlocked: userData.longestStreak >= 10
    },
    {
      title: t.profile.dashboard.centuryClub,
      description: t.profile.dashboard.centuryDesc,
      progress: userData.gamesPlayed,
      target: 100,
      icon: "fa-medal",
      unlocked: userData.gamesPlayed >= 100
    },
    {
      title: t.profile.dashboard.perfectPlayer,
      description: t.profile.dashboard.perfectDesc,
      progress: userData.perfectGames,
      target: 1,
      icon: "fa-star",
      unlocked: userData.perfectGames >= 1
    },
    {
      title: t.profile.dashboard.socialButterfly,
      description: t.profile.dashboard.socialDesc,
      progress: userData.friends.length,
      target: 10,
      icon: "fa-users",
      unlocked: userData.friends.length >= 10
    }
  ];
  
  achievements.forEach(achievement => {
    const achievementCard = document.createElement("div");
    achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    
    const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);
    
    achievementCard.innerHTML = `
      <div class="achievement-icon">
        <i class="fas ${achievement.icon}"></i>
        ${achievement.unlocked ? '<div class="unlock-badge"><i class="fas fa-check"></i></div>' : ''}
      </div>
      <div class="achievement-content">
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="progress-text">${achievement.progress}/${achievement.target}</div>
        </div>
      </div>
    `;
    
    achievementsGrid.appendChild(achievementCard);
  });
  
  container.appendChild(achievementsGrid);
  
  return container;
}

function switchTab(tabId: string) {
  // Store active tab in localStorage to persist across refreshes
  localStorage.setItem('activeProfileTab', tabId);
  
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(tabId)?.classList.add('active');
}

function createStatsSection(userData: any): HTMLElement {
  const t = languageManager.getTranslations();
  const statsContainer = document.createElement("div");
  statsContainer.className = "stats-section";
  
  const statsTitle = document.createElement("h2");
  statsTitle.textContent = t.profile.statistics.title;
  statsContainer.appendChild(statsTitle);
  
  const statsGrid = document.createElement("div");
  statsGrid.className = "stats-grid";
  
  const stats = [
    { label: t.profile.statistics.gamesPlayed, value: userData.gamesPlayed, icon: "fa-gamepad" },
    { label: t.profile.statistics.wins, value: userData.wins, icon: "fa-trophy", color: "success" },
    { label: t.profile.statistics.losses, value: userData.losses, icon: "fa-times-circle", color: "danger" },
    { label: t.profile.statistics.winRate, value: `${userData.winRate}%`, icon: "fa-percentage", color: "info" }
  ];
  
  stats.forEach(stat => {
    const statCard = document.createElement("div");
    statCard.className = `stat-card ${stat.color || ''}`;
    statCard.innerHTML = `
      <div class="stat-icon">
        <i class="fas ${stat.icon}"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `;
    statsGrid.appendChild(statCard);
  });
  
  statsContainer.appendChild(statsGrid);
  return statsContainer;
}
function createMatchHistorySection(matchHistory: any[]): HTMLElement {
  const t = languageManager.getTranslations();
  const historyContainer = document.createElement("div");
  historyContainer.className = "match-history-section";
  
  const historyTitle = document.createElement("h2");
  historyTitle.textContent = t.profile.history.title;
  historyContainer.appendChild(historyTitle);
  
  if (matchHistory.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <i class="fas fa-history"></i>
      <p>No matches played yet. Start playing to build your history!</p>
    `;
    historyContainer.appendChild(emptyState);
    return historyContainer;
  }
  
  const historyList = document.createElement("div");
  historyList.className = "match-history-list";
  
  matchHistory.forEach(match => {
    const matchCard = document.createElement("div");
    
    // Handle different match results
    let resultIcon, resultText, cardClass;
    if (match.result === 'DID_NOT_PARTICIPATE') {
      cardClass = 'did-not-participate';
      resultIcon = 'fa-eye';
      resultText = 'Did not participate';
    } else if (match.result === 'win') {
      cardClass = 'win';
      resultIcon = 'fa-trophy';
      resultText = t.profile.history.victory;
    } else if (match.result === 'loss') {
      cardClass = 'loss';
      resultIcon = 'fa-times-circle';
      resultText = t.profile.history.defeat;
    } else {
      cardClass = match.result;
      resultIcon = 'fa-minus-circle';
      resultText = 'Draw';
    }
    
    matchCard.className = `match-card ${cardClass}`;
    
    matchCard.innerHTML = `
      <div class="match-result">
        <i class="fas ${resultIcon}"></i>
        <span class="result-text">${resultText}</span>
      </div>
      <div class="match-opponent">
        <img src="${match.opponentAvatar}" alt="${match.opponent}'s avatar" class="opponent-avatar" />
        <div class="opponent-info">
          <div class="opponent-name">${match.opponent}</div>
          <div class="game-type">${match.gameType === '1v1' ? t.profile.history.match1v1 : t.profile.history.tournament}</div>
        </div>
      </div>
      <div class="match-details">
        <div class="match-score">${match.result === 'DID_NOT_PARTICIPATE' ? 'Tournament match' : match.score}</div>
  <div class="match-date">${match.date && typeof match.date.toLocaleDateString === 'function' ? match.date.toLocaleDateString() : ''}</div>
        <div class="match-duration">${match.duration ? `${match.duration} ${t.profile.history.min}` : ''}</div>
      </div>
    `;
    historyList.appendChild(matchCard);
  });
  historyContainer.appendChild(historyList);
  return historyContainer;
}

// @ts-ignore
function showAddFriendModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Add Friend</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-field">
          <label for="friend-username">Username or Display Name</label>
          <input type="text" id="friend-username" placeholder="Enter username..." />
        </div>
      </div>
      <div class="modal-footer">
        <button class="secondary-button modal-close">Cancel</button>
        <button class="primary-button" onclick="addFriend()">Add Friend</button>
      </div>
    </div>
  `;
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal || (e.target as HTMLElement).classList.contains('modal-close')) {
      modal.remove();
    }
  });
  
  document.body.appendChild(modal);
}

function addFriend() {
  const usernameInput = document.getElementById("friend-username") as HTMLInputElement;
  const username = usernameInput.value.trim();
  
  if (username) {
    showMessage(`Friend request sent to ${username}!`, "success");
    document.querySelector(".modal-overlay")?.remove();
  } else {
    showMessage("Please enter a username", "error");
  }
}

function challengeFriend(username: string) {
  showMessage(`Challenge sent to ${username}!`, "info");
}

function removeFriend(friendId: number) {
  if (confirm("Are you sure you want to remove this friend?")) {
    console.log(`Removing friend with ID: ${friendId}`);
    showMessage("Friend removed", "info");
    // In real app, would call API and refresh the friends list
  }
}

// Make functions global so they can be called from HTML onclick handlers
if (typeof window !== 'undefined') {
  (window as any).addFriend = addFriend;
  (window as any).challengeFriend = challengeFriend;
  (window as any).removeFriend = removeFriend;
}

// Create Tournament Modal
// @ts-ignore
function showCreateTournamentModal() {
  console.log("showCreateTournamentModal called - isLoggedIn:", isLoggedIn, "currentUser:", currentUser);
  
  // Check if user is logged in
  if (!isLoggedIn || !currentUser) {
    showMessage("Please login to create tournaments.", "error");
    navigateTo("/ACCOUNT");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.style.cssText = `
    background: linear-gradient(135deg, rgba(15, 18, 40, 0.95), rgba(8, 10, 28, 0.98));
    backdrop-filter: blur(20px);
    border: 2px solid rgba(0, 230, 255, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 230, 255, 0.2);
    max-height: 90vh;
    overflow-y: auto;
  `;
  
  modalContent.innerHTML = `
    <h2 style="color: #00e6ff; margin-bottom: 1.5rem; text-align: center; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Create Local Tournament</h2>
    
    <form id="create-tournament-form">
      <div style="margin-bottom: 1.5rem;">
        <label for="tournament-name" style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.9rem;">Tournament Name:</label>
        <input type="text" id="tournament-name" required placeholder="Enter tournament name..." style="width: 100%; padding: 1rem; border: 1px solid rgba(0, 230, 255, 0.3); border-radius: 8px; background: linear-gradient(135deg, rgba(15, 18, 40, 0.8), rgba(8, 10, 28, 0.9)); color: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); font-size: 0.95rem;">
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(0, 230, 255, 0.05), rgba(255, 0, 255, 0.05)); border: 1px solid rgba(0, 230, 255, 0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <h3 style="color: #00e6ff; margin-bottom: 1rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.5px;">
          <i class="fas fa-users"></i> Enter 4 Player Names
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label for="player1" style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8); font-weight: 600; font-size: 0.9rem;">Player 1:</label>
            <input type="text" id="player1" required placeholder="Enter player 1 name..." style="width: 100%; padding: 0.8rem; border: 1px solid rgba(0, 230, 255, 0.3); border-radius: 6px; background: linear-gradient(135deg, rgba(15, 18, 40, 0.8), rgba(8, 10, 28, 0.9)); color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">
          </div>
          
          <div>
            <label for="player2" style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8); font-weight: 600; font-size: 0.9rem;">Player 2:</label>
            <input type="text" id="player2" required placeholder="Enter player 2 name..." style="width: 100%; padding: 0.8rem; border: 1px solid rgba(0, 230, 255, 0.3); border-radius: 6px; background: linear-gradient(135deg, rgba(15, 18, 40, 0.8), rgba(8, 10, 28, 0.9)); color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">
          </div>
          
          <div>
            <label for="player3" style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8); font-weight: 600; font-size: 0.9rem;">Player 3:</label>
            <input type="text" id="player3" required placeholder="Enter player 3 name..." style="width: 100%; padding: 0.8rem; border: 1px solid rgba(0, 230, 255, 0.3); border-radius: 6px; background: linear-gradient(135deg, rgba(15, 18, 40, 0.8), rgba(8, 10, 28, 0.9)); color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">
          </div>
          
          <div>
            <label for="player4" style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.8); font-weight: 600; font-size: 0.9rem;">Player 4:</label>
            <input type="text" id="player4" required placeholder="Enter player 4 name..." style="width: 100%; padding: 0.8rem; border: 1px solid rgba(0, 230, 255, 0.3); border-radius: 6px; background: linear-gradient(135deg, rgba(15, 18, 40, 0.8), rgba(8, 10, 28, 0.9)); color: rgba(255, 255, 255, 0.9); font-size: 0.9rem;">
          </div>
        </div>
        
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(0, 230, 255, 0.1); border-radius: 8px; border: 1px solid rgba(0, 230, 255, 0.2);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <i class="fas fa-trophy" style="color: #ffd700;"></i>
            <span style="color: rgba(255, 255, 255, 0.9); font-weight: 600; font-size: 0.9rem;">Tournament Format:</span>
          </div>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; line-height: 1.4;">
            <strong>Semi-Finals:</strong> Player 1 vs Player 2, Player 3 vs Player 4<br>
            <strong>Finals:</strong> Winners advance to championship match
          </p>
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
        <button type="button" id="cancel-tournament" class="secondary-button" style="padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Cancel</button>
        <button type="submit" class="primary-button" style="padding: 1rem 1.5rem; border-radius: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: linear-gradient(135deg, #00e6ff, #ff00ff);">
          <i class="fas fa-trophy"></i> Start Tournament
        </button>
      </div>
    </form>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  const form = modal.querySelector("#create-tournament-form") as HTMLFormElement;
  const cancelBtn = modal.querySelector("#cancel-tournament") as HTMLButtonElement;
  
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nameInput = modal.querySelector("#tournament-name") as HTMLInputElement;
    const player1Input = modal.querySelector("#player1") as HTMLInputElement;
    const player2Input = modal.querySelector("#player2") as HTMLInputElement;
    const player3Input = modal.querySelector("#player3") as HTMLInputElement;
    const player4Input = modal.querySelector("#player4") as HTMLInputElement;
    
    const tournamentName = nameInput.value.trim();
    const player1 = player1Input.value.trim();
    const player2 = player2Input.value.trim();
    const player3 = player3Input.value.trim();
    const player4 = player4Input.value.trim();
    
    if (!tournamentName || !player1 || !player2 || !player3 || !player4) {
      showMessage("Please fill in all fields.", "error");
      return;
    }
    
    // Check for duplicate names
    const players = [player1, player2, player3, player4];
    const uniquePlayers = new Set(players);
    if (uniquePlayers.size !== 4) {
      showMessage("All player names must be unique.", "error");
      return;
    }
    
    // Create tournament
    showLoading();
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create tournament data
      const tournament = {
        id: Date.now(),
        name: tournamentName,
        players: [player1, player2, player3, player4],
  // createdBy and createdDate removed to simplify bracket header
        status: 'active',
        bracket: {
          semifinals: [
            { player1: player1, player2: player2, winner: null },
            { player1: player3, player2: player4, winner: null }
          ],
          finals: { player1: null, player2: null, winner: null }
        }
      };
      
      // Store tournament in localStorage for demo
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      tournaments.push(tournament);
      localStorage.setItem('tournaments', JSON.stringify(tournaments));
      
      document.body.removeChild(modal);
      showMessage(`Tournament "${tournamentName}" created successfully! 🏆`, "success");
      
      // Navigate to tournament bracket view
      showTournamentBracket(tournament);
      
    } catch (error) {
      showMessage("Error creating tournament. Please try again.", "error");
    } finally {
      hideLoading();
    }
  });
}

// Function to show tournament bracket
function showTournamentBracket(tournament: any) {
  const app = document.getElementById("app");
  if (!app) return;
  
  app.innerHTML = `
    <div class="tournament-bracket-page">
      <div class="tournament-header">
        <div class="back-button">
          <i class="fas fa-arrow-left"></i> Back to Tournaments
        </div>
        <h1 class="tournament-title">${tournament.name}</h1>
  <!-- tournament meta removed -->
      </div>
      
      <div class="bracket-container">
        <div class="bracket-round">
          <h2 class="round-title">Semi-Finals</h2>
          
          <div class="match-container">
            <div class="match" id="match-1">
              <div class="match-header">Match 1 - Semi-Final</div>
              <div class="players">
                <div class="player ${tournament.bracket.semifinals[0].winner === tournament.bracket.semifinals[0].player1 ? 'winner' : ''}" data-player="${tournament.bracket.semifinals[0].player1}">
                  ${tournament.bracket.semifinals[0].player1}
                </div>
                <div class="vs">VS</div>
                <div class="player ${tournament.bracket.semifinals[0].winner === tournament.bracket.semifinals[0].player2 ? 'winner' : ''}" data-player="${tournament.bracket.semifinals[0].player2}">
                  ${tournament.bracket.semifinals[0].player2}
                </div>
              </div>
              ${!tournament.bracket.semifinals[0].winner ? `
                <div class="match-actions">
                  <button class="start-match-btn" onclick="startMatch(0, '${tournament.bracket.semifinals[0].player1}', '${tournament.bracket.semifinals[0].player2}')">
                    <i class="fas fa-play"></i> Start Match 1
                  </button>
                </div>
              ` : `
                <div class="winner-announcement">
                  <i class="fas fa-trophy"></i>
                  Winner: ${tournament.bracket.semifinals[0].winner}
                </div>
              `}
            </div>
            
            <div class="match ${!tournament.bracket.semifinals[0].winner ? 'match-locked' : ''}" id="match-2">
              <div class="match-header">
                Match 2 - Semi-Final
                ${!tournament.bracket.semifinals[0].winner ? '<span class="locked-indicator"><i class="fas fa-lock"></i> Locked</span>' : ''}
              </div>
              <div class="players">
                <div class="player ${tournament.bracket.semifinals[1].winner === tournament.bracket.semifinals[1].player1 ? 'winner' : ''}" data-player="${tournament.bracket.semifinals[1].player1}">
                  ${tournament.bracket.semifinals[1].player1}
                </div>
                <div class="vs">VS</div>
                <div class="player ${tournament.bracket.semifinals[1].winner === tournament.bracket.semifinals[1].player2 ? 'winner' : ''}" data-player="${tournament.bracket.semifinals[1].player2}">
                  ${tournament.bracket.semifinals[1].player2}
                </div>
              </div>
              ${!tournament.bracket.semifinals[1].winner ? `
                <div class="match-actions">
                  ${tournament.bracket.semifinals[0].winner ? `
                    <button class="start-match-btn" onclick="startMatch(1, '${tournament.bracket.semifinals[1].player1}', '${tournament.bracket.semifinals[1].player2}')">
                      <i class="fas fa-play"></i> Start Match 2
                    </button>
                  ` : `
                    <button class="start-match-btn locked-btn" disabled>
                      <i class="fas fa-lock"></i> Waiting for Match 1
                    </button>
                    <p class="waiting-message">Match 1 must finish first</p>
                  `}
                </div>
              ` : `
                <div class="winner-announcement">
                  <i class="fas fa-trophy"></i>
                  Winner: ${tournament.bracket.semifinals[1].winner}
                </div>
              `}
            </div>
          </div>
        </div>
        
        <div class="bracket-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
        
        <div class="bracket-round">
          <h2 class="round-title">Finals</h2>
          
          <div class="match-container">
            <div class="match finals-match" id="finals-match">
              <div class="match-header">Championship Finals</div>
              ${tournament.bracket.semifinals[0].winner && tournament.bracket.semifinals[1].winner ? `
                <div class="players">
                  <div class="player ${tournament.bracket.finals.winner === tournament.bracket.semifinals[0].winner ? 'winner' : ''}" data-player="${tournament.bracket.semifinals[0].winner}">
                    ${tournament.bracket.semifinals[0].winner}
                  </div>
                  <div class="vs">VS</div>
                  <div class="player ${tournament.bracket.finals.winner === tournament.bracket.semifinals[1].winner ? 'winner' : ''}" data-player="${tournament.bracket.semifinals[1].winner}">
                    ${tournament.bracket.semifinals[1].winner}
                  </div>
                </div>
                ${!tournament.bracket.finals.winner ? `
                  <div class="match-actions">
                    <button class="start-match-btn" onclick="startFinalsMatch('${tournament.bracket.semifinals[0].winner}', '${tournament.bracket.semifinals[1].winner}')">
                      <i class="fas fa-crown"></i> Start Finals
                    </button>
                  </div>
                ` : `
                  <div class="champion-announcement">
                    <i class="fas fa-crown"></i>
                    <span>Tournament Champion:</span>
                    <div class="champion-name">${tournament.bracket.finals.winner}</div>
                  </div>
                `}
              ` : `
                <div class="waiting-players">
                  <div class="waiting-text">Waiting for semi-final winners...</div>
                  <div class="vs">VS</div>
                  <div class="waiting-text">Waiting for semi-final winners...</div>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add event listener for back button AFTER setting innerHTML
  const backBtn = app.querySelector('.back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigateTo('/tournament'));
  }

  // Store current tournament in global scope for match functions
  (window as any).currentTournament = tournament;
}

// Match handling functions
(window as any).startMatch = function(matchIndex: number, player1: string, player2: string) {
  console.log('[DEBUG] startMatch called for tournament. matchIndex:', matchIndex, 'player1:', player1, 'player2:', player2);
  showMessage(`Starting match: ${player1} vs ${player2}`, "info");
  (window as any).currentTournamentMatch = true;
  (window as any).gamePageSuppressModal = true;
  (window as any).gamePageMode = 'tournament';
  const app = document.getElementById("app");
  if (app) {
    console.log('[DEBUG] Found app container, clearing and creating game container.');
    app.innerHTML = '';
    const gameContainer = document.createElement("div");
    gameContainer.className = "game-container-wrapper";
    app.appendChild(gameContainer);
    const navigateBack = () => {
      console.log('[DEBUG] Navigating back to tournament bracket.');
      showTournamentBracket((window as any).currentTournament);
    };
    console.log('[DEBUG] Creating 1v1 game page for tournament match. Flags:', {
      currentTournamentMatch: (window as any).currentTournamentMatch,
      gamePageSuppressModal: (window as any).gamePageSuppressModal,
      gamePageMode: (window as any).gamePageMode
    });
    const gamePage = create1v1GamePage(gameContainer, navigateBack);
    gamePage.setPlayerNames(player1, player2);
    console.log('[DEBUG] Set player names:', player1, player2);
    // Clear flags only after game is initialized
    setTimeout(() => {
      delete (window as any).currentTournamentMatch;
      delete (window as any).gamePageSuppressModal;
      delete (window as any).gamePageMode;
    }, 1000);
    gamePage.game?.onGameEndCallback((winner, _gameTime) => {
      console.log('[DEBUG] Game ended. Winner:', winner.name, 'MatchIndex:', matchIndex);
      const tournament = (window as any).currentTournament;
      tournament.bracket.semifinals[matchIndex].winner = winner.name;
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      const tournamentIndex = tournaments.findIndex((t: any) => t.id === tournament.id);
      if (tournamentIndex !== -1) {
        tournaments[tournamentIndex] = tournament;
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
      }
      console.log('[DEBUG] Showing bracket again after match.');
      showTournamentBracket(tournament);
      showMessage(`🏆 ${winner.name} wins Match ${matchIndex + 1}!`, "success");
    });
  } else {
    console.error('[DEBUG] App container not found!');
  }
};

(window as any).declareWinner = function(matchIndex: number, winner: string) {
  const tournament = (window as any).currentTournament;
  
  // Update tournament data
  tournament.bracket.semifinals[matchIndex].winner = winner;
  
  // Update localStorage
  const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
  const tournamentIndex = tournaments.findIndex((t: any) => t.id === tournament.id);
  if (tournamentIndex !== -1) {
    tournaments[tournamentIndex] = tournament;
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }
  
  // Remove modal
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
  
  // Refresh bracket display
  showTournamentBracket(tournament);
  
  // Show appropriate message based on which match finished
  if (matchIndex === 0) {
    showMessage(`🏆 ${winner} wins Match 1! Match 2 is now unlocked! 🎉`, "success");
  } else {
    showMessage(`🏆 ${winner} wins Match 2! Both semi-finals complete! 🎉`, "success");
  }
};

(window as any).startFinalsMatch = function(player1: string, player2: string) {
  showMessage(`Starting Finals: ${player1} vs ${player2}`, "info");
  // Find the app container and replace content with the game
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = '';
    const gameContainer = document.createElement("div");
    gameContainer.className = "game-container-wrapper";
    app.appendChild(gameContainer);
    // Navigation back to bracket after match
    const navigateBack = () => {
      showTournamentBracket((window as any).currentTournament);
    };
    // Create and render the 1v1 game with player names
    const gamePage = create1v1GamePage(gameContainer, navigateBack);
    gamePage.setPlayerNames(player1, player2);
    // When the game ends, update the bracket and return
  gamePage.game?.onGameEndCallback((winner, _gameTime) => {
      // Update tournament data
      const tournament = (window as any).currentTournament;
      tournament.bracket.champion = winner.name;
      // Update localStorage
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
      const tournamentIndex = tournaments.findIndex((t: any) => t.id === tournament.id);
      if (tournamentIndex !== -1) {
        tournaments[tournamentIndex] = tournament;
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
      }
      // Show bracket again
      showTournamentBracket(tournament);
      showMessage(`👑 ${winner.name} is the Tournament Champion!`, "success");
    });
  }
};

(window as any).declareChampion = function(champion: string) {
  const tournament = (window as any).currentTournament;
  
  // Update tournament data
  tournament.bracket.finals.winner = champion;
  tournament.status = 'completed';
  
  // Update localStorage
  const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
  const tournamentIndex = tournaments.findIndex((t: any) => t.id === tournament.id);
  if (tournamentIndex !== -1) {
    tournaments[tournamentIndex] = tournament;
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }
  
  // Remove modal
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
  
  // Refresh bracket display
  showTournamentBracket(tournament);
  
  showMessage(`🏆 ${champion} is the Tournament Champion! 🏆`, "success");
};

// Router setup function
function setupRoutes(app: HTMLElement): void {
  const path = window.location.pathname;
  app.innerHTML = ""; // This clears everything inside #app
  // Create a live region for screen reader announcements.
  let liveRegion = document.getElementById("screen-reader-live-region");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "screen-reader-live-region";
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "hidden-visually";
    document.body.appendChild(liveRegion); // Append to body to ensure it's always available
  }
  // Define route mapping
  const routes: { [key: string]: () => HTMLElement } = {
    "/": renderHomePage,
    "/login": () => renderAuthPage(true),
    "/register": () => renderAuthPage(false),
    "/tournament": renderTournamentPage,
    "/profile": renderProfilePage,
    "/ACCOUNT": () => renderAuthPage(true),
    "/logout": () => {
      handleLogout();
      return renderHomePage();
    },
    "/game": renderGameRoute
  };
  // For /game, ignore query params
  let routePath = path;
  if (routePath.startsWith('/game')) routePath = '/game';
  const renderFunction = routes[routePath];
  // The main content container within the page that will hold dynamic content
  const pageContentContainer = document.createElement("div");
  pageContentContainer.className = "page-content-wrapper"; // A new wrapper for dynamic content
  app.appendChild(pageContentContainer);
  if (renderFunction) {
    pageContentContainer.appendChild(renderFunction());
    document.title = getPageTitle(routePath);
  } else {
    const notFound = document.createElement("div");
    notFound.className = "page content-section";
    notFound.id = "not-found";
    notFound.setAttribute("role", "main");
    notFound.innerHTML =
      '<h1 class="section-title">404 - Page Not Found</h1><p style="text-align:center; color: var(--text-color-light);">The page you are looking for does not exist.</p>';
    const backHomeBtn = document.createElement("button");
    backHomeBtn.className = "primary-button back-button";
    backHomeBtn.textContent = "Go to Home";
    backHomeBtn.addEventListener("click", () => navigateTo("/"));
    notFound.appendChild(backHomeBtn);
    notFound.appendChild(createFooter());
    pageContentContainer.appendChild(notFound);
    document.title = "404 - Page Not Found - Neon Pong";
  }
// Render function for /game route
function renderGameRoute(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'game-container-wrapper';
  // Get match info from sessionStorage
  let matchInfo = null;
  try {
    matchInfo = JSON.parse(sessionStorage.getItem('tournamentMatch') || 'null');
  } catch {}
  // Default player names if not found
  const playerA = matchInfo?.playerA || 'Player 1';
  const playerB = matchInfo?.playerB || 'Player 2';
  // Navigation back to tournament bracket
  const navigateBack = () => {
    navigateTo('/tournament');
  };
  // Create and render the 1v1 game with player names
  const gamePage = create1v1GamePage(container, navigateBack);
  if (gamePage.setPlayerNames) {
    gamePage.setPlayerNames(playerA, playerB);
  }
  // Optionally, set match number or tournament info if needed
  return container;
}
  // The navbar is appended to the body or a specific fixed container, not necessarily #app.
  // We need to ensure it's outside the dynamic content area if it's fixed.
  // For simplicity here, I'll still attach it to app, but if it needs to be fixed at top,
  // HTML structure needs to handle it (e.g., a div above #app or directly in body)
  // Re-append the navbar to ensure it's always there, or manage its position via CSS fixed.
  // Given your index.html has a fixed navbar outside #app's dynamic content,
  // we just need to ensure the correct element is updated.
  // Update active navbar link after page render
  document.querySelectorAll(".navbar-link").forEach((link) => {
    link.classList.remove("active");
    // Ensure that '/tournament' matches both '/tournament' and the tournaments page's content ID
    const linkHref = link.getAttribute("href");
    const currentPath = window.location.pathname;
    if (linkHref === currentPath) {
      link.classList.add("active");
    } else if (linkHref === "/" && currentPath === "/") {
      link.classList.add("active");
    }
    // Specific handling for tournament link if it points to /tournament but also highlights based on content ID
    if (currentPath === "/tournament" && linkHref === "/tournament") {
      link.classList.add("active");
    } else if (currentPath === "/register" && linkHref === "/register") {
      link.classList.add("active");
    }
  });
}

// Initial page load
document.addEventListener("DOMContentLoaded", async () => {
  console.log('[App] DOM fully loaded, initializing application...');
  
  // Initialize translation system
  console.log('[App] Initializing translation system...');
  languageManager.addListener(() => {
    // Update the navbar when language changes
    updateNavbar();
  });
  
  console.log('[App] Finding app container...');
  const app = document.getElementById("app");
  if (!app) {
    console.error('[App] Failed to find #app element');
    return;
  }

  // Create and append the navbar first
  console.log('[App] Creating navigation bar...');
  const navbar = createNavbar();
  document.body.insertBefore(navbar, app);
  
  // Check login state after navbar is created
  console.log('[App] Checking login state...');
  checkLoginState();
    // Check for Google OAuth token in URL hash
  checkGoogleOAuthToken();
function checkGoogleOAuthToken(): void {
  console.log("[Google OAuth] Checking for token in URL hash...");
  console.log("[Google OAuth] Current hash:", window.location.hash);
  const hash = window.location.hash;
  if (hash && hash.includes("token=")) {
    const tokenMatch = hash.match(/token=([^&]+)/);
    if (tokenMatch) {
      const token = decodeURIComponent(tokenMatch[1]);
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.id && payload.username) {
          handleLogin(payload.username, token, payload.id);
          // Clear the hash from URL
          window.location.hash = "";
          showMessage("Google Sign-In successful!", "success");
        }
      } catch (error) {
        console.error("Error processing Google OAuth token:", error);
        showMessage("Error processing Google Sign-In. Please try again.", "error");
        window.location.hash = "";
      }
    }
  }
}

  // Add loading overlay if it doesn't exist
  if (!document.getElementById("loading-overlay")) {
    const loadingOverlay = createLoadingOverlay();
    document.body.appendChild(loadingOverlay);
  }

  // Always render the current route after login state is checked
  console.log('[App] Setting up routes...');
  setupRoutes(app);
  
  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    setupRoutes(app);
  });

  // Ensure home page is shown by default if no route matches
  if (window.location.pathname === '/' || window.location.pathname === '') {
    navigateTo('/');
  }

  console.log('[App] Initialization complete');
});
// Handle browser history changes (back/forward buttons)
window.addEventListener("popstate", () => {
  const app = document.getElementById("app");
  if (app) {
    setupRoutes(app);
  }
});

// Global functions for dashboard and profile features
(window as any).switchTab = switchTab;
(window as any).showMessage = showMessage;

// Browser event listeners for automatic logout
window.addEventListener('beforeunload', () => {
  // Call logout API when user closes browser/tab or refreshes
  if (isLoggedIn && sessionStorage.getItem('token')) {
    console.log('[🚪 BEFOREUNLOAD] User closing browser, calling logout API...');
    
    // Use the existing API service logout method
    callLogoutAPI();
  }
});

// Also handle page visibility changes (when user switches tabs)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isLoggedIn) {
    console.log('[👁️ VISIBILITY] Page hidden, user might be leaving...');
    // Don't logout immediately on tab switch, just log it
    // The 5-minute inactivity timer will handle this
  } else if (document.visibilityState === 'visible' && isLoggedIn) {
    console.log('[👁️ VISIBILITY] Page visible, user is back');
    // User is back, they're still active
  }
});

// Add this function after the existing functions
// @ts-ignore
function showAIDifficultyModal(): void {
  const t = languageManager.getTranslations();
  // Create modal HTML
  const modalHTML = `
    <div id="ai-difficulty-modal" class="modal-overlay">
      <div class="modal-content">
        <h2>${t.games.ai.difficultyModal.title}</h2>
        <div class="difficulty-options">
          <button class="difficulty-btn easy" data-difficulty="easy">
            <div class="difficulty-icon">🟢</div>
            <div class="difficulty-name">${t.games.ai.difficultyModal.easy.name}</div>
            <div class="difficulty-desc">${t.games.ai.difficultyModal.easy.description}</div>
          </button>
          <button class="difficulty-btn medium" data-difficulty="medium">
            <div class="difficulty-icon">🟡</div>
            <div class="difficulty-name">${t.games.ai.difficultyModal.medium.name}</div>
            <div class="difficulty-desc">${t.games.ai.difficultyModal.medium.description}</div>
          </button>
          <button class="difficulty-btn hard" data-difficulty="hard">
            <div class="difficulty-icon">🔴</div>
            <div class="difficulty-name">${t.games.ai.difficultyModal.hard.name}</div>
            <div class="difficulty-desc">${t.games.ai.difficultyModal.hard.description}</div>
          </button>
        </div>
        <button class="close-modal-btn">${t.games.ai.difficultyModal.cancel}</button>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners
  const modal = document.getElementById('ai-difficulty-modal');
  const difficultyBtns = modal?.querySelectorAll('.difficulty-btn');
  const closeBtn = modal?.querySelector('.close-modal-btn');
  
  // Handle difficulty selection
  difficultyBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      const difficulty = btn.getAttribute('data-difficulty') as 'easy' | 'medium' | 'hard';
      startAIGame(difficulty);
      modal?.remove();
    });
  });
  
  // Handle close button
  closeBtn?.addEventListener('click', () => {
    modal?.remove();
  });
  
  // Handle clicking outside modal
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function startAIGame(difficulty: 'easy' | 'medium' | 'hard'): void {
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
    
    // Create navigation back function
    const navigateBack = () => {
      navigateTo('/tournament'); // Navigate back to games page
    };
    
    // Create and render the AI game
    createAIGamePage(gameContainer, difficulty, navigateBack);
    showMessage(`🤖 Starting AI Challenge (${difficulty})...`, 'info');
  }
}