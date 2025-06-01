// Advanced Prompt Generator - No Fetch Version

// Utility Functions
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
        <div class="toast-body">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

window.showToast = showToast;

// Variables
let themeManager;
let themeEditor;
let config = null;
let currentTheme = null;
let templateContent = '';
let analytics;
let historyManager;
let smartSuggestions;
let realTimePreview;
let projectManager;

// Analytics Class (simplified)
class Analytics {
    constructor() {
        this.data = {
            totalPrompts: 0,
            themeUsage: {},
            parameterUsage: {},
            history: [],
            dailyStats: {}
        };
    }
    
    trackPromptGeneration(themeId, parameters) {
        this.data.totalPrompts++;
        this.data.themeUsage[themeId] = (this.data.themeUsage[themeId] || 0) + 1;
    }
    
    getMostUsedTheme() {
        const themes = Object.entries(this.data.themeUsage);
        return themes.length > 0 ? themes.reduce((a, b) => a[1] > b[1] ? a : b)[0] : '-';
    }
    
    getTodayCount() {
        return 0;
    }
    
    getPopularParameters(limit = 10) {
        return [];
    }
}

// History Manager (simplified)
class HistoryManager {
    constructor() {
        this.history = [];
    }
    
    addEntry(prompt, theme, parameters) {
        const entry = {
            id: Date.now(),
            prompt,
            theme,
            parameters,
            timestamp: new Date().toISOString()
        };
        this.history.unshift(entry);
        return entry;
    }
}

// Initialize
function initApp() {
    console.log('🚀 Initializing app (no-fetch version)...');
    
    // Check for embedded config
    if (typeof window.embeddedConfig === 'undefined') {
        showToast('❌ Embedded config tidak ditemukan!', 'error');
        return;
    }
    
    // Use embedded config directly
    config = window.embeddedConfig;
    console.log('✅ Using embedded config:', config);
    
    // Initialize analytics and history
    analytics = new Analytics();
    historyManager = new HistoryManager();
    
    // Initialize basic functionality
    initThemeToggle();
    initEventListeners();
    populateThemes();
    
    console.log('✅ App initialized successfully (offline mode)');
    showToast('Aplikasi berjalan dalam mode offline', 'success');
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            showToast(`Tema ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
        });
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
}

// Populate themes
function populateThemes(themes = null) {
    const themeList = document.getElementById('theme-list');
    if (!themeList) return;
    
    const themesToShow = themes || config.themes;
    themeList.innerHTML = '';

    if (themesToShow.length === 0) {
        themeList.innerHTML = '<div class="text-muted text-center p-3">Tidak ada tema ditemukan</div>';
        return;
    }

    themesToShow.forEach(theme => {
        const themeItem = document.createElement('a');
        themeItem.classList.add('list-group-item', 'list-group-item-action');
        themeItem.setAttribute('data-id', theme.id);
        
        themeItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${theme.name}</h6>
                <small class="text-muted">Offline</small>
            </div>
            <p class="mb-1">${theme.description}</p>
        `;
        themeItem.addEventListener('click', () => selectTheme(theme.id));
        themeList.appendChild(themeItem);
    });

    // Auto select first theme
    if (themesToShow.length > 0 && !currentTheme) {
        selectTheme(themesToShow[0].id);
    }
}

// Select theme
function selectTheme(themeId) {
    console.log('Selecting theme:', themeId);
    
    const theme = config.themes.find(t => t.id === themeId);
    if (!theme) {
        showToast('Tema tidak ditemukan', 'error');
        return;
    }

    currentTheme = theme;
    templateContent = theme.template;

    // Update UI
    document.querySelectorAll('#theme-list .list-group-item').forEach(item => {
        item.classList.remove('active');
    });

    const selectedItem = document.querySelector(`[data-id="${themeId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }

    populateParameters();
    
    console.log('Theme selected successfully:', currentTheme);
    showToast(`Tema "${theme.name}" dipilih`, 'success');
}

// Populate parameters
function populateParameters() {
    const parameterForm = document.getElementById('parameter-form');
    if (!parameterForm) return;
    
    parameterForm.innerHTML = '';

    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters || Object.keys(parameters).length === 0) {
        parameterForm.innerHTML = `
            <div class="text-center p-4">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 2rem;"></i>
                <p class="mt-2">Tidak ada parameter untuk tema ini.</p>
            </div>
        `;
        return;
    }

    // Create parameter controls
    Object.keys(parameters).forEach((paramKey) => {
        const paramGroup = document.createElement('div');
        paramGroup.classList.add('parameter-group', 'mb-3');

        const label = document.createElement('label');
        label.className = 'form-label';
        label.innerHTML = `<i class="bi bi-tag"></i> ${paramKey}`;
        
        const select = document.createElement('select');
        select.classList.add('form-select');
        select.setAttribute('data-param', paramKey);

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = `Pilih ${paramKey}...`;
        select.appendChild(placeholderOption);

        // Add parameter options
        parameters[paramKey].forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });

        paramGroup.appendChild(label);
        paramGroup.appendChild(select);
        parameterForm.appendChild(paramGroup);
    });
}

// Generate prompt
function generatePrompt() {
    console.log('🚀 Generating prompt...');
    
    if (!currentTheme) {
        showToast('Pilih tema terlebih dahulu.', 'error');
        return;
    }

    if (!templateContent) {
        showToast('Template tema tidak ditemukan.', 'error');
        return;
    }

    let result = templateContent;
    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters) {
        showToast('Tidak ada parameter untuk tema ini.', 'error');
        return;
    }

    const selectedParams = {};
    const emptyParams = [];

    // Replace parameters
    Object.keys(parameters).forEach(paramKey => {
        const selectElement = document.querySelector(`select[data-param="${paramKey}"]`);
        if (selectElement && selectElement.value) {
            selectedParams[paramKey] = selectElement.value;
            const pattern = new RegExp(`\\[${paramKey}\\]`, 'g');
            result = result.replace(pattern, selectElement.value);
        } else {
            emptyParams.push(paramKey);
        }
    });

    if (emptyParams.length > 0) {
        showToast(`Parameter belum dipilih: ${emptyParams.join(', ')}`, 'error');
        return;
    }

    // Display result
    const resultTextarea = document.getElementById('result-prompt');
    if (resultTextarea) {
        resultTextarea.value = result;
        updateWordCount(result);
    }
    
    // Track analytics
    analytics.trackPromptGeneration(currentTheme.id, selectedParams);
    historyManager.addEntry(result, currentTheme.name, selectedParams);
    
    console.log('✅ Prompt generated successfully!');
    showToast('Prompt berhasil di-generate!', 'success');
}

function updateWordCount(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    const wordCountEl = document.getElementById('word-count');
    const charCountEl = document.getElementById('char-count');
    
    if (wordCountEl) wordCountEl.textContent = `${words} kata`;
    if (charCountEl) charCountEl.textContent = `${chars} karakter`;
}

function copyToClipboard() {
    const prompt = document.getElementById('result-prompt').value;
    if (!prompt) {
        showToast('Tidak ada prompt untuk disalin.', 'error');
        return;
    }
    
    navigator.clipboard.writeText(prompt).then(() => {
        showToast('Prompt berhasil disalin ke clipboard!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin prompt.', 'error');
    });
}

// Event listeners
function initEventListeners() {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resultPrompt = document.getElementById('result-prompt');
    
    if (generateBtn) generateBtn.addEventListener('click', generatePrompt);
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
    if (resultPrompt) resultPrompt.addEventListener('input', (e) => updateWordCount(e.target.value));
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp); 