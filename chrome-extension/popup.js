// Configuration - Change this to your production URL
const API_BASE_URL = 'https://dokolekta.vercel.app/';

// Storage keys
const STORAGE_KEYS = {
  API_TOKEN: 'apiToken',
  USER: 'user'
};

// DOM Elements
const elements = {
  loadingView: document.getElementById('loading-view'),
  configView: document.getElementById('config-view'),
  saveView: document.getElementById('save-view'),
  settingsBtn: document.getElementById('settings-btn'),
  apiTokenInput: document.getElementById('api-token'),
  configError: document.getElementById('config-error'),
  connectBtn: document.getElementById('connect-btn'),
  userInfo: document.getElementById('user-info'),
  pageFavicon: document.getElementById('page-favicon'),
  pageTitle: document.getElementById('page-title'),
  pageUrl: document.getElementById('page-url'),
  groupSelect: document.getElementById('group-select'),
  saveError: document.getElementById('save-error'),
  saveSuccess: document.getElementById('save-success'),
  saveBtn: document.getElementById('save-btn')
};

// Current page info
let currentPage = {
  url: '',
  title: '',
  favicon: ''
};

// API Client
const api = {
  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  },

  async validateToken(token) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/extension/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { valid: false, error: 'Invalid API token' };
        }
        return { valid: false, error: 'Server error' };
      }

      const data = await response.json();
      return { valid: true, user: data.user, error: null };
    } catch (error) {
      return { valid: false, error: 'Connection failed. Please try again.' };
    }
  },

  async getGroups(token) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/extension/groups`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { groups: [], error: 'Failed to load groups' };
      }

      const data = await response.json();
      return { groups: data.groups || [], error: null };
    } catch (error) {
      return { groups: [], error: 'Connection failed' };
    }
  },

  async saveBookmark(token, bookmarkData) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/extension/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookmarkData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: 'Invalid API token' };
        }
        const data = await response.json().catch(() => ({}));
        return { success: false, error: data.error || 'Failed to save bookmark' };
      }

      const data = await response.json();
      return { success: true, bookmark: data.bookmark, error: null };
    } catch (error) {
      return { success: false, error: 'Connection failed' };
    }
  }
};

// Storage helpers
const storage = {
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  },

  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  },

  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }
};

// View management
function showView(viewName) {
  elements.loadingView.style.display = 'none';
  elements.configView.style.display = 'none';
  elements.saveView.style.display = 'none';
  elements.settingsBtn.style.display = 'none';

  switch (viewName) {
    case 'loading':
      elements.loadingView.style.display = 'flex';
      break;
    case 'config':
      elements.configView.style.display = 'flex';
      break;
    case 'save':
      elements.saveView.style.display = 'flex';
      elements.settingsBtn.style.display = 'flex';
      break;
  }
}

function showConfigError(message) {
  elements.configError.textContent = message;
  elements.configError.style.display = 'block';
}

function hideConfigError() {
  elements.configError.style.display = 'none';
}

function showSaveError(message) {
  elements.saveError.textContent = message;
  elements.saveError.style.display = 'block';
  elements.saveSuccess.style.display = 'none';
}

function hideSaveMessages() {
  elements.saveError.style.display = 'none';
  elements.saveSuccess.style.display = 'none';
}

function showSaveSuccess() {
  elements.saveSuccess.style.display = 'flex';
  elements.saveError.style.display = 'none';
}

// Update UI with user info
function updateUserInfo(user) {
  if (user) {
    elements.userInfo.querySelector('.user-name').textContent = user.name || 'User';
    elements.userInfo.querySelector('.user-email').textContent = user.email || '';
    elements.userInfo.style.display = 'flex';
  } else {
    elements.userInfo.style.display = 'none';
  }
}

// Update UI with page info
function updatePageInfo(page) {
  elements.pageTitle.textContent = page.title || 'Untitled';
  elements.pageUrl.textContent = page.url || '';

  if (page.favicon) {
    elements.pageFavicon.src = page.favicon;
    elements.pageFavicon.style.display = 'block';
  } else {
    elements.pageFavicon.style.display = 'none';
  }
}

// Populate group selector
function populateGroups(groups) {
  // Clear existing options except the first one
  while (elements.groupSelect.options.length > 1) {
    elements.groupSelect.remove(1);
  }

  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = group.name;
    option.style.paddingLeft = '24px';
    elements.groupSelect.appendChild(option);
  });
}

// Get current tab info
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Initialize popup
async function initialize() {
  showView('loading');

  try {
    // Get current tab info
    const tab = await getCurrentTab();
    currentPage = {
      url: tab.url || '',
      title: tab.title || '',
      favicon: tab.favIconUrl || ''
    };

    // Check for stored token
    const stored = await storage.get([STORAGE_KEYS.API_TOKEN, STORAGE_KEYS.USER]);

    if (!stored[STORAGE_KEYS.API_TOKEN]) {
      // No token, show config
      showView('config');
      return;
    }

    // Validate stored token
    const validation = await api.validateToken(stored[STORAGE_KEYS.API_TOKEN]);

    if (!validation.valid) {
      // Token invalid, show config with error
      showConfigError(validation.error || 'Token expired. Please reconnect.');
      showView('config');
      return;
    }

    // Save user info
    await storage.set({ [STORAGE_KEYS.USER]: validation.user });

    // Fetch groups
    const groupsResult = await api.getGroups(stored[STORAGE_KEYS.API_TOKEN]);

    // Update UI
    updateUserInfo(validation.user);
    updatePageInfo(currentPage);
    populateGroups(groupsResult.groups);

    showView('save');
  } catch (error) {
    showConfigError('An error occurred. Please try again.');
    showView('config');
  }
}

// Handle connect button click
async function handleConnect() {
  hideConfigError();

  const apiToken = elements.apiTokenInput.value.trim();

  if (!apiToken) {
    showConfigError('Please enter your API token');
    return;
  }

  if (!apiToken.startsWith('kolekta_')) {
    showConfigError('Invalid token format. Token should start with "kolekta_"');
    return;
  }

  elements.connectBtn.disabled = true;
  elements.connectBtn.textContent = 'Connecting...';

  try {
    const validation = await api.validateToken(apiToken);

    if (!validation.valid) {
      showConfigError(validation.error || 'Invalid token');
      elements.connectBtn.disabled = false;
      elements.connectBtn.textContent = 'Connect';
      return;
    }

    // Save token and user
    await storage.set({
      [STORAGE_KEYS.API_TOKEN]: apiToken,
      [STORAGE_KEYS.USER]: validation.user
    });

    // Fetch groups
    const groupsResult = await api.getGroups(apiToken);

    // Update UI
    updateUserInfo(validation.user);
    updatePageInfo(currentPage);
    populateGroups(groupsResult.groups);

    showView('save');
  } catch (error) {
    showConfigError('Connection failed. Please try again.');
  } finally {
    elements.connectBtn.disabled = false;
    elements.connectBtn.textContent = 'Connect';
  }
}

// Handle save button click
async function handleSave() {
  hideSaveMessages();

  const stored = await storage.get([STORAGE_KEYS.API_TOKEN]);

  if (!stored[STORAGE_KEYS.API_TOKEN]) {
    showView('config');
    return;
  }

  if (!currentPage.url) {
    showSaveError('Cannot save this page');
    return;
  }

  // Don't allow saving chrome:// or extension pages
  if (currentPage.url.startsWith('chrome://') || currentPage.url.startsWith('chrome-extension://')) {
    showSaveError('Cannot save browser internal pages');
    return;
  }

  elements.saveBtn.disabled = true;
  elements.saveBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Saving...
  `;

  try {
    const bookmarkData = {
      url: currentPage.url,
      title: currentPage.title,
      favicon: currentPage.favicon,
      groupId: elements.groupSelect.value || undefined
    };

    const result = await api.saveBookmark(stored[STORAGE_KEYS.API_TOKEN], bookmarkData);

    if (!result.success) {
      if (result.error === 'Invalid API token') {
        // Token expired, go to config
        showConfigError('Token expired. Please reconnect.');
        showView('config');
        return;
      }
      showSaveError(result.error || 'Failed to save bookmark');
      return;
    }

    showSaveSuccess();

    // Close popup after success
    setTimeout(() => {
      window.close();
    }, 1000);
  } catch (error) {
    showSaveError('An error occurred. Please try again.');
  } finally {
    elements.saveBtn.disabled = false;
    elements.saveBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      </svg>
      Save Bookmark
    `;
  }
}

// Handle settings button click
async function handleSettings() {
  // Clear stored token and show config
  await storage.clear();
  elements.apiTokenInput.value = '';
  hideConfigError();
  showView('config');
}

// Event listeners
elements.connectBtn.addEventListener('click', handleConnect);
elements.saveBtn.addEventListener('click', handleSave);
elements.settingsBtn.addEventListener('click', handleSettings);

// Allow Enter key to submit
elements.apiTokenInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleConnect();
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);
