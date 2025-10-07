import './ProfileSettings.css';
import type { UserProfile } from '../types/index.js';
import { languageManager } from '../translations.js';
import { apiService } from '../services/api.js';

export function createProfileSettings(profile: Partial<UserProfile> = {}): HTMLElement {
  const container = document.createElement('div');
  container.className = 'profile-settings';

  const t = languageManager.getTranslations();

  // Initialize default values
  const defaultProfile: UserProfile = {
    username: '',
    displayName: '',
    skillLevel: 'beginner',
    bio: '',
    avatar: '',
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    winRate: 0,
    friends: [],
    matchHistory: [],
    ...profile
  };

  // Create form
  const form = document.createElement('form');
  form.className = 'profile-form';
  form.noValidate = true;

  // Avatar Section - Centered
  const avatarOuterContainer = document.createElement('div');
  avatarOuterContainer.className = 'form-section';
  
  const avatarSection = document.createElement('div');
  avatarSection.className = 'avatar-section';
  
  const avatarLabel = document.createElement('label');
  avatarLabel.className = 'form-label';
  avatarLabel.textContent = 'Customize Avatar';
  
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';
  
  const avatarPreviewContainer = document.createElement('div');
  avatarPreviewContainer.className = 'avatar-preview-container';

  // Center avatar icon above the button
  avatarPreviewContainer.style.display = 'flex';
  avatarPreviewContainer.style.flexDirection = 'column';
  avatarPreviewContainer.style.alignItems = 'center';

  const avatarPreview = document.createElement('div');
  avatarPreview.className = 'avatar-preview';
  // Show if missing or set to 'default.jpg'
  if (!defaultProfile.avatar || defaultProfile.avatar === 'default.jpg') {
    avatarPreview.innerHTML = `<img src="/uploads/default.jpg" alt="Default Avatar" class="avatar-img" />`;
  } else {
    avatarPreview.innerHTML = `<img src="/uploads/${defaultProfile.avatar}" alt="Avatar" class="avatar-img" />`;
  }

  const avatarInput = document.createElement('input');
  avatarInput.type = 'file';
  avatarInput.accept = 'image/*';
  avatarInput.className = 'avatar-input';
  avatarInput.hidden = true;

  // Handle avatar upload and preview
  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    try {
      console.log('[DEBUG] Starting avatar upload for file:', file.name);
      const res = await apiService.users.uploadAvatar(file);
      console.log('[DEBUG] Avatar upload response:', res);
      
      if (res.error) {
        console.error('[DEBUG] Avatar upload failed with error:', res.error);
        showMessage(`Failed to upload avatar: ${res.error}`, 'error');
      } else {
        console.log('[DEBUG] Avatar upload successful, updating preview');
        // Fix: Use res.file instead of res.data.file since response is direct
        const fileName = (res as any).file;
        avatarPreview.innerHTML = `<img src="/uploads/${fileName}" alt="Avatar" class="avatar-img" />`;
        showMessage('Avatar uploaded successfully!', 'success');
        
        // Update the main avatar display as well
        const mainAvatar = document.querySelector('.avatar-img') as HTMLImageElement;
        if (mainAvatar) {
          mainAvatar.src = `/uploads/${fileName}`;
          console.log('[DEBUG] Updated main avatar display');
        }
        
        // Show remove button since user now has a custom avatar
        removeButton.style.display = 'block';
      }
    } catch (err) {
      console.error('[DEBUG] Avatar upload exception:', err);
      console.error('[DEBUG] Exception details:', (err as any).message || err);
      showMessage('Error uploading avatar.', 'error');
    }
  });

  const changeButton = document.createElement('button');
  changeButton.type = 'button';
  changeButton.className = 'secondary-button';
  changeButton.textContent = t.profile.settings.changeAvatar;
  changeButton.style.marginTop = '1rem';
  changeButton.style.display = 'block';
  changeButton.style.marginLeft = 'auto';
  changeButton.style.marginRight = 'auto';
  changeButton.addEventListener('click', () => avatarInput.click());

  // Remove Avatar Button
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'danger-button remove-avatar-btn';
  removeButton.textContent = 'Remove Avatar';
  removeButton.style.marginTop = '0.5rem';
  removeButton.style.display = 'block';
  removeButton.style.marginLeft = 'auto';
  removeButton.style.marginRight = 'auto';
  
  // Show remove button only if user has a custom avatar (not default)
  const hasCustomAvatar = defaultProfile.avatar && defaultProfile.avatar !== 'default.jpg';
  removeButton.style.display = hasCustomAvatar ? 'block' : 'none';
  
  removeButton.addEventListener('click', () => {
    // Show custom confirmation modal
    showConfirmationModal(
      'Remove Avatar',
      'Are you sure you want to remove your avatar? This will reset it to the default avatar.',
      () => handleRemoveAvatar()
    );
  });

  // Function to handle avatar removal with real API call
  async function handleRemoveAvatar() {
    try {
      // Call the real API to remove avatar
      const res = await (apiService.users as any).removeAvatar();
      
      if (res.error) {
        showMessage(`Failed to remove avatar: ${res.error}`, 'error');
        return;
      }
      
      // Reset avatar to default in UI
      avatarPreview.innerHTML = `<img src="/uploads/default.jpg" alt="Default Avatar" class="avatar-img" />`;
      
      // Update the main avatar display as well
      const mainAvatar = document.querySelector('.avatar-img') as HTMLImageElement;
      if (mainAvatar) {
        mainAvatar.src = `/uploads/default.jpg`;
      }
      
      // Hide remove button since we're back to default
      removeButton.style.display = 'none';
      
      const successMessage = res.data?.message || 'Avatar removed successfully! Reset to default avatar.';
      showMessage(successMessage, 'success');
      
    } catch (err) {
      console.error('Avatar removal error:', err);
      showMessage('Error removing avatar. Please try again.', 'error');
    }
  }

  avatarPreviewContainer.appendChild(avatarPreview);

  // Create button container for better layout
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'avatar-button-container';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'column';
  buttonContainer.style.gap = '0.5rem';
  buttonContainer.style.alignItems = 'center';
  
  buttonContainer.appendChild(changeButton);
  buttonContainer.appendChild(removeButton);

  avatarContainer.appendChild(avatarPreviewContainer);
  avatarContainer.appendChild(buttonContainer);
  avatarContainer.appendChild(avatarInput);

  avatarSection.appendChild(avatarLabel);
  avatarSection.appendChild(avatarContainer);
  avatarOuterContainer.appendChild(avatarSection);

  // Username Field
  const usernameField = createFormField({
    label: t.profile.settings.username,
    name: 'username',
    type: 'text',
    value: defaultProfile.username,
    required: true,
    placeholder: 'Enter your username'
  });

  // Display Name Field
  const displayNameField = createFormField({
    label: t.profile.settings.displayName,
    name: 'displayName',
    type: 'text',
    value: defaultProfile.displayName,
    required: true,
    placeholder: 'Enter your display name'
  });


    // Bio Field
  const bioField = createFormField({
    name: 'bio',
    type: 'textarea',
    label: t.profile.settings.bio,
    placeholder: t.profile.settings.bioPlaceholder,
    value: defaultProfile.bio || ''
  });


  // Advanced Settings Toggle - Styled Button
  const advancedToggle = document.createElement('div');
  advancedToggle.className = 'settings-button-container';
  advancedToggle.innerHTML = `
    <button type="button" class="settings-button advanced-toggle-button">
      <span class="button-icon"><i class="fas fa-sliders-h"></i></span>
      <span class="button-text">${t.profile.settings.advancedSettings}</span>
      <span class="button-arrow"><i class="fas fa-chevron-down"></i></span>
    </button>
  `;

  // Advanced Settings Content
  const advancedContent = document.createElement('div');
  advancedContent.className = 'advanced-content';
  advancedContent.style.display = 'none';
  
  // Password Update Section
  // Old Password Field (for password change)
  const oldPasswordField = createFormField({
    label: 'Current Password',
    name: 'oldPassword',
    type: 'password',
    placeholder: 'Enter your current password',
    autoComplete: 'current-password'
  });

  const passwordField = createFormField({
    label: t.profile.settings.newPassword,
    name: 'newPassword',
    type: 'password',
    placeholder: t.profile.settings.passwordPlaceholder,
    autoComplete: 'new-password'
  });

  const confirmPasswordField = createFormField({
    label: t.profile.settings.confirmPassword,
    name: 'confirmPassword',
    type: 'password',
    placeholder: t.profile.settings.confirmPasswordPlaceholder,
    autoComplete: 'new-password'
  });

  advancedContent.appendChild(oldPasswordField);
  advancedContent.appendChild(passwordField);
  advancedContent.appendChild(confirmPasswordField);
  
  // Toggle advanced settings
  const toggleButton = advancedToggle.querySelector('.advanced-toggle-button');
  const chevron = advancedToggle.querySelector('.fa-chevron-down');
  
  toggleButton?.addEventListener('click', () => {
    const isExpanded = advancedContent.style.display !== 'none';
    advancedContent.style.display = isExpanded ? 'none' : 'block';
    if (chevron) {
      chevron.className = isExpanded 
        ? 'fas fa-chevron-down'
        : 'fas fa-chevron-up';
    }
  });

  // Submit Button - Styled
  const submitButton = document.createElement('div');
  submitButton.className = 'settings-button-container';
  submitButton.innerHTML = `
    <button type="submit" class="settings-button save-changes-button">
      <span class="button-icon"><i class="fas fa-save"></i></span>
      <span class="button-text">${t.profile.settings.saveChanges}</span>
      <span class="button-check"><i class="fas fa-check"></i></span>
    </button>
  `;

  // Assemble the form
  form.appendChild(avatarOuterContainer);
  form.appendChild(usernameField);
  form.appendChild(displayNameField);
  form.appendChild(bioField);
  form.appendChild(advancedToggle);
  form.appendChild(advancedContent);
  
  // ...existing code...
  form.appendChild(submitButton);

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const profileData: Record<string, any> = {};

    // Only send display_name if changed, always send bio
    const displayName = formData.get('displayName');
    if (displayName && displayName !== defaultProfile.displayName) {
      profileData.display_name = displayName;
    }
    const bio = formData.get('bio');
    if (typeof bio === 'string') {
      profileData.bio = bio;
    }
    // Password fields (if present)
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    if (oldPassword && newPassword && confirmPassword) {
      profileData.oldPassword = oldPassword;
      profileData.newPassword = newPassword;
      profileData.confirmPassword = confirmPassword;
    }

    // Password update logic
    if (profileData.oldPassword && profileData.newPassword && profileData.confirmPassword) {
        // hanieh debug: log password fields before sending
        console.log('[hanieh debug] PATCH /me payload:', {
          oldPassword: profileData.oldPassword,
          newPassword: profileData.newPassword,
          confirmPassword: profileData.confirmPassword
        });
      if (profileData.newPassword !== profileData.confirmPassword) {
        showMessage('New password and confirmation do not match.', 'error');
        return;
      }
      // Send oldPassword and password to backend (rename newPassword to password)
      try {
        const res = await apiService.users.updateProfile({
          oldPassword: profileData.oldPassword,
          password: profileData.newPassword
        });
        if (res.error) {
          showMessage(`Failed to update password: ${res.error}`, 'error');
          return;
        }
        showMessage(res.data?.message || 'Password updated successfully!', 'success');
        const saveBtn = form.querySelector('.save-changes-button') as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.classList.add('success');
          setTimeout(() => saveBtn.classList.remove('success'), 2000);
        }
      } catch (error) {
        console.error('Error updating password:', error);
        showMessage('Failed to update password. Please try again.', 'error');
      }
      return;
    }

    // Other profile updates (username, bio, etc.)
    try {
      const res = await apiService.users.updateProfile(profileData);
      if (res.error) {
        showMessage(`Failed to update profile: ${res.error}`, 'error');
        return;
      }
      showMessage(res.data?.message || 'Profile updated successfully!', 'success');
      const saveBtn = form.querySelector('.save-changes-button') as HTMLButtonElement;
      if (saveBtn) {
        saveBtn.classList.add('success');
        setTimeout(() => saveBtn.classList.remove('success'), 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('Failed to update profile. Please try again.', 'error');
    }
  });

  container.appendChild(form);
  return container;
}

// Helper function to create form fields
function createFormField({
  label,
  name,
  type,
  value = '',
  required = false,
  placeholder = '',
  autoComplete = '',
  className = ''
}: {
  label: string;
  name: string;
  type: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}): HTMLElement {
  const group = document.createElement('div');
  group.className = `form-group ${className}`.trim();
  
  const labelEl = document.createElement('label');
  labelEl.className = 'form-label';
  labelEl.htmlFor = name;
  labelEl.textContent = label;
  
  let input: HTMLInputElement | HTMLTextAreaElement;
  
  if (type === 'textarea') {
    const textarea = document.createElement('textarea');
    textarea.id = name;
    textarea.name = name;
    textarea.value = value;
    textarea.placeholder = placeholder;
    textarea.required = required;
    textarea.rows = 3;
    input = textarea;
  } else {
    const inputEl = document.createElement('input');
    inputEl.type = type;
    inputEl.id = name;
    inputEl.name = name;
    inputEl.value = value;
    inputEl.placeholder = placeholder;
    inputEl.required = required;
    if (autoComplete) inputEl.autocomplete = autoComplete as any;
    input = inputEl;
  }
  
  input.className = 'form-input';
  
  group.appendChild(labelEl);
  group.appendChild(input);
  
  return group;
}

// Function to show delete profile confirmation modal - REMOVED (unused)
// // function showDeleteProfileModal() { // REMOVED ... }

// Use the global showMessage function from main.ts
const showMessage = (window as any).showMessage || ((text: string, type: string) => {
  console.log(`${type.toUpperCase()}: ${text}`);
  // No alert fallback; only use neon-styled message
});

// Custom confirmation modal function
function showConfirmationModal(title: string, message: string, onConfirm: () => void) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  
  // Create modal content
  modal.innerHTML = `
    <div class="confirmation-modal-content">
      <div class="confirmation-modal-header">
        <div class="confirmation-modal-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="confirmation-modal-title">${title}</h3>
      </div>
      <div class="confirmation-modal-message">
        ${message}
      </div>
      <div class="confirmation-modal-actions">
        <button class="confirmation-btn confirmation-btn-cancel">Cancel</button>
        <button class="confirmation-btn confirmation-btn-confirm">Remove</button>
      </div>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Get buttons
  const cancelBtn = modal.querySelector('.confirmation-btn-cancel') as HTMLButtonElement;
  const confirmBtn = modal.querySelector('.confirmation-btn-confirm') as HTMLButtonElement;
  
  // Close modal function
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  };
  
  // Cancel button
  cancelBtn.addEventListener('click', closeModal);
  
  // Confirm button
  confirmBtn.addEventListener('click', () => {
    closeModal();
    onConfirm();
  });
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}