// Advanced Prompt Generator - Main Script

// Utility Functions - Define early to ensure availability
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        // Fallback if toast container doesn't exist
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

// Make showToast globally available
window.showToast = showToast;

// Make debug functions globally available
window.debugParameters = function() {
    console.log('=== DEBUG PARAMETER STATUS ===');
    console.log('Current theme:', currentTheme);
    console.log('Template content:', templateContent);
    
    if (!currentTheme) {
        console.log('❌ No theme selected');
        alert('❌ Tidak ada tema yang dipilih');
        return;
    }

    const parameters = config.parameters[currentTheme.id];
    console.log('Available parameters:', parameters);
    
    if (!parameters) {
        console.log('❌ No parameters defined for theme');
        alert('❌ Tidak ada parameter untuk tema ini');
        return;
    }

    let debugInfo = `Debug Info untuk tema: ${currentTheme.name}\n\n`;
    let hasEmptyParams = false;

    Object.keys(parameters).forEach(paramKey => {
        const selectElement = document.querySelector(`select[data-param="${paramKey}"]`);
        if (selectElement) {
            const value = selectElement.value;
            console.log(`✅ ${paramKey}:`, value || '(not selected)');
            debugInfo += `${paramKey}: ${value || '(BELUM DIPILIH)'}\n`;
            if (!value) hasEmptyParams = true;
        } else {
            console.log(`❌ ${paramKey}: SELECT ELEMENT NOT FOUND`);
            debugInfo += `${paramKey}: ELEMENT TIDAK DITEMUKAN\n`;
        }
    });
    
    // Check template placeholders
    const placeholders = templateContent.match(/\[[^\]]+\]/g) || [];
    console.log('Template placeholders:', placeholders);
    debugInfo += `\nTemplate placeholders: ${placeholders.join(', ')}\n`;
    
    if (hasEmptyParams) {
        debugInfo += '\n⚠️ Ada parameter yang belum dipilih!';
    }
    
    alert(debugInfo);
};

window.testGenerate = function() {
    console.log('Testing generate function...');
    window.debugParameters();
    
    // Force select all parameters to first option for testing
    if (currentTheme && config.parameters[currentTheme.id]) {
        const parameters = config.parameters[currentTheme.id];
        Object.keys(parameters).forEach(paramKey => {
            const selectElement = document.querySelector(`select[data-param="${paramKey}"]`);
            if (selectElement && parameters[paramKey].length > 0) {
                selectElement.value = parameters[paramKey][0]; // Select first option
                console.log(`Auto-selected ${paramKey}: ${parameters[paramKey][0]}`);
            }
        });
        
        alert('Parameter telah diisi otomatis dengan pilihan pertama. Sekarang akan mencoba generate...');
        setTimeout(() => {
            generatePrompt();
        }, 1000);
    }
};

window.forceGenerate = function() {
    // Debugging: force a simple template replacement
    const testTemplate = "A [TRUCK_TYPE] is driving on [ROAD_TYPE].";
    const testParams = {
        'TRUCK_TYPE': 'red truck',
        'ROAD_TYPE': 'mountain road'
    };
    
    let result = testTemplate;
    Object.keys(testParams).forEach(key => {
        result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), testParams[key]);
    });
    
    document.getElementById('result-prompt').value = result;
    alert(`Test force generate berhasil!\nHasil: ${result}`);
};

// Inisialisasi pengelola tema
let themeManager;
let themeEditor;
let config = null;
let currentTheme = null;
let templateContent = '';

// Advanced Feature Classes
class Analytics {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const saved = localStorage.getItem('promptAnalytics');
        return saved ? JSON.parse(saved) : {
            totalPrompts: 0,
            themeUsage: {},
            parameterUsage: {},
            history: [],
            dailyStats: {}
        };
    }

    saveData() {
        localStorage.setItem('promptAnalytics', JSON.stringify(this.data));
    }

    trackPromptGeneration(themeId, parameters) {
        this.data.totalPrompts++;
        
        // Track theme usage
        this.data.themeUsage[themeId] = (this.data.themeUsage[themeId] || 0) + 1;
        
        // Track parameter usage
        Object.entries(parameters).forEach(([key, value]) => {
            if (!this.data.parameterUsage[key]) {
                this.data.parameterUsage[key] = {};
            }
            this.data.parameterUsage[key][value] = (this.data.parameterUsage[key][value] || 0) + 1;
        });

        // Track daily stats
        const today = new Date().toDateString();
        this.data.dailyStats[today] = (this.data.dailyStats[today] || 0) + 1;

        this.saveData();
    }

    getMostUsedTheme() {
        const themes = Object.entries(this.data.themeUsage);
        if (themes.length === 0) return '-';
        
        return themes.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    getTodayCount() {
        const today = new Date().toDateString();
        return this.data.dailyStats[today] || 0;
    }

    getPopularParameters(limit = 10) {
        const popular = [];
        Object.entries(this.data.parameterUsage).forEach(([param, values]) => {
            Object.entries(values).forEach(([value, count]) => {
                popular.push({ param, value, count });
            });
        });
        
        return popular.sort((a, b) => b.count - a.count).slice(0, limit);
    }
}

class HistoryManager {
    constructor() {
        this.history = this.loadHistory();
    }

    loadHistory() {
        const saved = localStorage.getItem('promptHistory');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        if (this.history.length > 1000) {
            this.history = this.history.slice(-1000);
        }
        localStorage.setItem('promptHistory', JSON.stringify(this.history));
    }

    addEntry(prompt, theme, parameters) {
        const entry = {
            id: Date.now(),
            prompt,
            theme,
            parameters,
            timestamp: new Date().toISOString(),
            wordCount: prompt.split(' ').length,
            charCount: prompt.length
        };
        
        this.history.unshift(entry);
        this.saveHistory();
        return entry;
    }

    search(query) {
        return this.history.filter(entry => 
            entry.prompt.toLowerCase().includes(query.toLowerCase()) ||
            entry.theme.toLowerCase().includes(query.toLowerCase())
        );
    }

    clear() {
        this.history = [];
        this.saveHistory();
    }

    export() {
        const dataStr = JSON.stringify(this.history, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `prompt_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize analytics and history
let analytics = new Analytics();
let historyManager = new HistoryManager();

function updateWordCount(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    document.getElementById('word-count').textContent = `${words} kata`;
    document.getElementById('char-count').textContent = `${chars} karakter`;
}

function highlightTemplate(template) {
    return template.replace(/\[([^\]]+)\]/g, '<span class="parameter-placeholder">[$1]</span>');
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        showToast(`Tema ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
}

// Search functionality
function initSearch() {
    const themeSearch = document.getElementById('theme-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (themeSearch) {
        themeSearch.addEventListener('input', filterThemes);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterThemes);
    }
}

function filterThemes() {
    const query = document.getElementById('theme-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    const themes = config.themes.filter(theme => {
        const matchesQuery = !query || 
            theme.name.toLowerCase().includes(query) ||
            theme.description.toLowerCase().includes(query);
        
        const matchesCategory = !category || theme.category === category;
        
        return matchesQuery && matchesCategory;
    });
    
    populateThemes(themes);
}

// Fungsi untuk inisialisasi aplikasi
function initApp() {
    console.log('Initializing app...');
    
    // Initialize analytics and history
    if (typeof Analytics !== 'undefined') {
        analytics = new Analytics();
    }
    
    if (typeof HistoryManager !== 'undefined') {
        historyManager = new HistoryManager();
    }

    // Initialize advanced features
    if (typeof SmartSuggestions !== 'undefined') {
        smartSuggestions = new SmartSuggestions();
        console.log('Smart Suggestions initialized');
    }

    if (typeof RealTimePreview !== 'undefined') {
        realTimePreview = new RealTimePreview();
        console.log('Real-time Preview initialized');
    }

    if (typeof ProjectManager !== 'undefined') {
        projectManager = new ProjectManager();
        console.log('Project Manager initialized');
    }

    // Load configuration and setup
    fetchConfig().then(() => {
        initThemeToggle();
        initSearch();
        initEventListeners();
        
        // Setup advanced features after config is loaded
        setupAdvancedFeatures();
        
        console.log('App initialized successfully');
    }).catch(error => {
        console.error('Failed to initialize app:', error);
        showToast('Gagal memuat konfigurasi aplikasi', 'error');
    });
}

function setupAdvancedFeatures() {
    // Add real-time preview to parameter form
    if (realTimePreview) {
        const parameterCard = document.querySelector('.card:nth-child(2) .card-body');
        if (parameterCard) {
            realTimePreview.addToForm(parameterCard);
        }
    }

    // Add smart suggestions integration
    if (smartSuggestions) {
        const parameterForm = document.getElementById('parameter-form');
        if (parameterForm) {
            smartSuggestions.addParameterSuggestions(parameterForm);
        }
    }

    // Listen for theme changes to update preview and suggestions
    document.addEventListener('themeChanged', () => {
        if (realTimePreview) {
            realTimePreview.scheduleUpdate();
        }
        if (smartSuggestions) {
            smartSuggestions.updateSmartSuggestions();
        }
    });
}

// Fungsi untuk mendapatkan data konfigurasi
function fetchConfig() {
    console.log('Loading configuration...');
    
    // Check if embedded config is available first
    if (typeof window.embeddedConfig !== 'undefined') {
        console.log('Embedded config detected, will use as fallback if needed');
    } else {
        console.warn('Embedded config not found!');
    }
    
    return fetch('data/config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            config = data;
            console.log('Configuration loaded from file:', config);
            
            // Initialize theme manager after config is loaded
            themeManager = new ThemeManager();
            
            // Setup UI editor tema - always initialize
            themeEditor = new ThemeEditor(themeManager);
            
            // Make themeEditor globally accessible
            window.themeEditor = themeEditor;
            
            populateThemes();
            console.log('Config loaded and themes populated');
            return Promise.resolve();
        })
        .catch(error => {
            console.error('Failed to load config from file:', error);
            
            // Fallback to embedded config if available
            if (typeof window.embeddedConfig !== 'undefined') {
                console.log('🔄 Using embedded config as fallback...');
                config = window.embeddedConfig;
                
                // Initialize basic functionality without complex dependencies
                populateThemes();
                console.log('✅ Embedded config loaded successfully (basic mode)');
                showToast('Mode offline: Menggunakan konfigurasi embedded', 'info');
                return Promise.resolve();
            } else {
                console.error('❌ No embedded config available for fallback');
                showToast('Gagal memuat konfigurasi: ' + error.message + '. Pastikan web server berjalan atau embedded config tersedia.', 'error');
                throw error;
            }
        });
}

// Fungsi untuk menampilkan daftar tema
function populateThemes(themes = null) {
    const themeList = document.getElementById('theme-list');
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
        
        const tags = theme.tags ? theme.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        const category = theme.category ? `<small class="text-muted"><i class="bi bi-collection"></i> ${theme.category}</small>` : '';
        const usageCount = analytics.data.themeUsage[theme.id] || 0;
        
        themeItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${theme.name}</h6>
                <small class="text-muted">${usageCount}x digunakan</small>
            </div>
            <p class="mb-1">${theme.description}</p>
            ${category}
            <div class="mt-2">${tags}</div>
        `;
        themeItem.addEventListener('click', () => selectTheme(theme.id));
        themeList.appendChild(themeItem);
    });

    // Secara default pilih tema pertama
    if (themesToShow.length > 0 && !currentTheme) {
        selectTheme(themesToShow[0].id);
    }
}

// Fungsi untuk memilih tema
function selectTheme(themeId) {
    console.log('Selecting theme:', themeId);
    
    if (!config || !config.themes) {
        console.error('Config not loaded');
        showToast('Konfigurasi belum dimuat', 'error');
        return;
    }

    const theme = config.themes.find(t => t.id === themeId);
    if (!theme) {
        console.error('Theme not found:', themeId);
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

    // Populate parameters
    populateParameters();
    updateCompletionProgress();
    updateTemplatePreview();
    populateExamples();
    updateNegativePromptDisplay();

    // Trigger theme change event for advanced features
    document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: currentTheme, themeId: themeId } 
    }));

    console.log('Theme selected successfully:', currentTheme);
    showToast(`Tema "${theme.name}" dipilih`, 'success');
}

// Fungsi untuk menampilkan parameter sesuai tema yang dipilih
function populateParameters() {
    const parameterForm = document.getElementById('parameter-form');
    parameterForm.innerHTML = '';

    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters || Object.keys(parameters).length === 0) {
        parameterForm.innerHTML = `
            <div class="text-center p-4">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 2rem;"></i>
                <p class="mt-2">Tidak ada parameter untuk tema ini.</p>
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-primary btn-sm" id="add-theme-params">
                        <i class="bi bi-plus-circle"></i> Tambahkan Parameter
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="quick-param-setup">
                        <i class="bi bi-lightning"></i> Setup Cepat
                    </button>
                </div>
            </div>
        `;
        
        // Tambahkan event listener untuk menambahkan parameter
        document.getElementById('add-theme-params').addEventListener('click', (e) => {
            e.preventDefault();
            if (themeEditor) {
                themeEditor.showParameterForm(currentTheme.id);
            }
        });

        // Setup cepat parameter
        document.getElementById('quick-param-setup').addEventListener('click', (e) => {
            e.preventDefault();
            quickParameterSetup();
        });
        return;
    }

    // Header dengan tombol kelola parameter
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-3');
    headerDiv.innerHTML = `
        <h6 class="mb-0">
            <i class="bi bi-sliders"></i> Parameter Tema: ${currentTheme.name}
        </h6>
        <div class="btn-group">
            <button class="btn btn-outline-primary btn-sm" id="manage-params-btn" title="Kelola Parameter">
                <i class="bi bi-gear"></i>
            </button>
            <button class="btn btn-outline-success btn-sm" id="add-single-param-btn" title="Tambah Parameter">
                <i class="bi bi-plus"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" id="edit-negative-btn" title="Edit Negative Prompt">
                <i class="bi bi-x-circle"></i>
            </button>
        </div>
    `;
    parameterForm.appendChild(headerDiv);

    // Event listeners untuk tombol kelola
    document.getElementById('manage-params-btn').addEventListener('click', () => {
        if (themeEditor) {
            themeEditor.manageParameters(currentTheme.id);
        }
    });

    document.getElementById('add-single-param-btn').addEventListener('click', () => {
        showQuickAddParameterModal();
    });

    document.getElementById('edit-negative-btn').addEventListener('click', () => {
        editNegativePrompt();
    });

    // Buat grup untuk setiap parameter
    Object.keys(parameters).forEach((paramKey, index) => {
        const paramGroup = document.createElement('div');
        paramGroup.classList.add('parameter-group');

        // Clean parameter key for display and HTML attributes
        let displayParamKey = paramKey;
        let cleanParamKey = paramKey;
        
        if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
            displayParamKey = paramKey.slice(1, -1); // Remove brackets for display
            cleanParamKey = paramKey.slice(1, -1); // Remove brackets for data-param
        }

        // Header parameter dengan tombol edit/hapus
        const paramHeader = document.createElement('div');
        paramHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');
        paramHeader.innerHTML = `
            <label class="form-label mb-0">
                <i class="bi bi-tag"></i> ${displayParamKey}
            </label>
            <div class="btn-group">
                <button class="btn btn-outline-info btn-sm edit-param-btn" data-param="${cleanParamKey}" title="Edit Parameter">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm delete-param-btn" data-param="${cleanParamKey}" title="Hapus Parameter">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        paramGroup.appendChild(paramHeader);

        const paramSelect = document.createElement('select');
        paramSelect.classList.add('form-select');
        paramSelect.setAttribute('data-param', cleanParamKey); // Use clean key for data-param

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = `Pilih ${displayParamKey}...`;
        paramSelect.appendChild(placeholderOption);

        // Tambahkan opsi untuk setiap nilai parameter
        parameters[paramKey].forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            paramSelect.appendChild(option);
        });

        // Add change event listener
        paramSelect.addEventListener('change', () => {
            updateCompletionProgress();
        });

        paramGroup.appendChild(paramSelect);

        // Event listeners untuk edit/delete parameter
        paramHeader.querySelector('.edit-param-btn').addEventListener('click', (e) => {
            editParameter(paramKey); // Use original key for editing
        });

        paramHeader.querySelector('.delete-param-btn').addEventListener('click', (e) => {
            deleteParameter(paramKey); // Use original key for deletion
        });

        parameterForm.appendChild(paramGroup);
    });

    // Add debug tools
    addDebugTools();
}

function updateCompletionProgress() {
    const selects = document.querySelectorAll('#parameter-form select');
    const completed = Array.from(selects).filter(select => select.value !== '').length;
    const total = selects.length;
    
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const progressBar = document.getElementById('completion-progress');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

function updateTemplatePreview() {
    const templatePreview = document.getElementById('template-preview');
    if (templatePreview && templateContent) {
        templatePreview.innerHTML = highlightTemplate(templateContent);
    }
}

// Fungsi untuk menampilkan contoh prompt
function populateExamples() {
    const exampleList = document.getElementById('example-list');
    exampleList.innerHTML = '';

    const examples = themeManager.getExamples(currentTheme.id);
    if (!examples || examples.length === 0) {
        exampleList.innerHTML = '<div class="text-muted text-center p-3">Tidak ada contoh untuk tema ini.</div>';
        return;
    }

    try {
        examples.forEach((exampleContent, index) => {
            const exampleItem = document.createElement('div');
            exampleItem.classList.add('list-group-item');
            
            exampleItem.innerHTML = `
                <div class="example-prompt">${exampleContent}</div>
                <div class="mt-2 d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm use-example-btn">
                        <i class="bi bi-arrow-right-circle"></i> Gunakan
                    </button>
                    <button class="btn btn-outline-secondary btn-sm copy-example-btn">
                        <i class="bi bi-clipboard"></i> Salin
                    </button>
                </div>
            `;
            
            // Add event listeners
            exampleItem.querySelector('.use-example-btn').addEventListener('click', () => {
                document.getElementById('result-prompt').value = exampleContent;
                updateWordCount(exampleContent);
                showToast('Contoh prompt berhasil dimuat!', 'success');
            });
            
            exampleItem.querySelector('.copy-example-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(exampleContent).then(() => {
                    showToast('Contoh prompt berhasil disalin!', 'success');
                });
            });
            
            exampleList.appendChild(exampleItem);
        });
    } catch (error) {
        console.error(`Error loading examples:`, error);
    }
}

// Fungsi untuk menghasilkan prompt
function generatePrompt() {
    console.log('🚀 Starting generatePrompt function...');
    
    if (!currentTheme) {
        console.log('❌ No current theme');
        showToast('Pilih tema terlebih dahulu.', 'error');
        return;
    }
    console.log('✅ Current theme:', currentTheme);

    if (!templateContent) {
        console.log('❌ No template content');
        showToast('Template tema tidak ditemukan.', 'error');
        return;
    }
    console.log('✅ Template content:', templateContent);

    let result = templateContent;
    console.log('📝 Initial result:', result);
    
    // Dapatkan semua parameter yang dipilih
    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters) {
        console.log('❌ No parameters for theme');
        showToast('Tidak ada parameter untuk tema ini.', 'error');
        return;
    }
    console.log('✅ Available parameters:', parameters);

    const selectedParams = {};
    const emptyParams = [];

    // Ganti placeholder parameter dengan nilai yang dipilih
    Object.keys(parameters).forEach(paramKey => {
        console.log(`🔍 Processing parameter: ${paramKey}`);
        
        // Clean parameter key - remove brackets if they exist in the key name
        let cleanParamKey = paramKey;
        let searchKey = paramKey;
        
        // If parameter key includes brackets, remove them for element selection
        if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
            cleanParamKey = paramKey.slice(1, -1); // Remove brackets
            searchKey = paramKey; // Keep original for template search
        } else {
            // If no brackets in key, add them for template search
            searchKey = `[${paramKey}]`;
        }
        
        console.log(`🔧 Clean key: "${cleanParamKey}", Search pattern: "${searchKey}"`);
        
        const selectElement = document.querySelector(`select[data-param="${cleanParamKey}"]`);
        if (selectElement) {
            const paramValue = selectElement.value;
            console.log(`📋 Select element found for ${cleanParamKey}, value: "${paramValue}"`);
            
            if (paramValue && paramValue.trim() !== '') {
                selectedParams[cleanParamKey] = paramValue;
                
                // Before replacement
                console.log(`🔄 Before replacement for ${searchKey}: ${result}`);
                
                // Create regex pattern - escape brackets for search
                const regexPattern = searchKey.replace(/[\[\]]/g, '\\$&');
                console.log(`🎯 Regex pattern: ${regexPattern}`);
                
                // Ganti semua instance parameter dalam template
                const before = result;
                result = result.replace(new RegExp(regexPattern, 'g'), paramValue);
                
                // After replacement
                console.log(`✅ After replacement for ${searchKey}: ${result}`);
                console.log(`🔄 Replacement summary: "${before}" -> "${result}"`);
                
            } else {
                console.log(`⚠️ Empty value for ${cleanParamKey}`);
                emptyParams.push(cleanParamKey);
            }
        } else {
            console.warn(`❌ Select element not found for parameter: ${cleanParamKey}`);
            emptyParams.push(cleanParamKey);
        }
    });

    console.log('📊 Selected params:', selectedParams);
    console.log('📊 Empty params:', emptyParams);
    console.log('📊 Final result before validation:', result);

    // Check for unfilled parameters
    if (emptyParams.length > 0) {
        console.log(`❌ Empty parameters found: ${emptyParams.join(', ')}`);
        showToast(`Parameter belum dipilih: ${emptyParams.join(', ')}`, 'error');
        return;
    }

    // Final check for any remaining unfilled parameters in template
    const unfilledParams = result.match(/\[[^\]]+\]/g);
    if (unfilledParams) {
        console.log(`❌ Unfilled parameters in result: ${unfilledParams.join(', ')}`);
        showToast(`Parameter belum lengkap: ${unfilledParams.join(', ')}`, 'error');
        return;
    }

    console.log('✅ All validations passed, setting result...');

    // Tampilkan hasil
    const resultTextarea = document.getElementById('result-prompt');
    if (resultTextarea) {
        resultTextarea.value = result;
        console.log('✅ Result set to textarea:', result);
    } else {
        console.log('❌ Result textarea not found!');
    }
    
    updateWordCount(result);
    
    // Generate dan tampilkan negative prompt
    const negativeResult = generateNegativePrompt();
    const negativeTextarea = document.getElementById('result-negative-prompt');
    if (negativeTextarea) {
        negativeTextarea.value = negativeResult;
        updateNegativeWordCount(negativeResult);
    }
    
    // Update tampilan negative prompt section
    updateNegativePromptDisplay();
    
    // Track analytics
    analytics.trackPromptGeneration(currentTheme.id, selectedParams);
    
    // Add to history
    historyManager.addEntry(result, currentTheme.name, selectedParams);
    
    // Update analytics display
    updateAnalyticsDisplay();
    
    console.log('🎉 generatePrompt completed successfully!');
    showToast('Prompt berhasil di-generate!', 'success');
}

// Fungsi untuk mengacak parameter
function randomizeParameters() {
    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters) {
        showToast('Tidak ada parameter untuk tema ini.', 'error');
        return;
    }

    // Acak semua parameter
    Object.keys(parameters).forEach(paramKey => {
        // Clean parameter key for element selection
        let cleanParamKey = paramKey;
        if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
            cleanParamKey = paramKey.slice(1, -1); // Remove brackets for data-param matching
        }
        
        const selectElement = document.querySelector(`select[data-param="${cleanParamKey}"]`);
        if (selectElement) {
            const options = parameters[paramKey];
            const randomIndex = Math.floor(Math.random() * options.length);
            selectElement.value = options[randomIndex];
        }
    });
    
    updateCompletionProgress();
    showToast('Parameter berhasil diacak!', 'success');
}

// Smart randomization
function smartRandomize() {
    const popular = analytics.getPopularParameters();
    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters) return;

    Object.keys(parameters).forEach(paramKey => {
        // Clean parameter key for element selection
        let cleanParamKey = paramKey;
        if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
            cleanParamKey = paramKey.slice(1, -1); // Remove brackets for data-param matching
        }
        
        const selectElement = document.querySelector(`select[data-param="${cleanParamKey}"]`);
        if (selectElement) {
            const popularForParam = popular.filter(p => p.param === cleanParamKey);
            
            if (popularForParam.length > 0 && Math.random() > 0.3) {
                const randomPopular = popularForParam[Math.floor(Math.random() * popularForParam.length)];
                selectElement.value = randomPopular.value;
            } else {
                const options = parameters[paramKey];
                const randomIndex = Math.floor(Math.random() * options.length);
                selectElement.value = options[randomIndex];
            }
        }
    });
    
    updateCompletionProgress();
    showToast('Smart randomization diterapkan!', 'success');
}

// Bulk generation
function bulkGenerate() {
    const count = prompt('Berapa banyak prompt yang ingin di-generate?', '5');
    if (!count || isNaN(count) || count < 1 || count > 50) {
        showToast('Jumlah harus antara 1-50', 'error');
        return;
    }

    const results = [];
    const parameters = config.parameters[currentTheme.id];
    
    if (!parameters) {
        showToast('Tidak ada parameter untuk tema ini.', 'error');
        return;
    }

    for (let i = 0; i < parseInt(count); i++) {
        let result = templateContent;
        const selectedParams = {};
        
        Object.keys(parameters).forEach(paramKey => {
            // Clean parameter key - remove brackets if they exist in the key name
            let cleanParamKey = paramKey;
            let searchKey = paramKey;
            
            // If parameter key includes brackets, remove them for element selection
            if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
                cleanParamKey = paramKey.slice(1, -1); // Remove brackets
                searchKey = paramKey; // Keep original for template search
            } else {
                // If no brackets in key, add them for template search
                searchKey = `[${paramKey}]`;
            }
            
            const options = parameters[paramKey];
            const randomValue = options[Math.floor(Math.random() * options.length)];
            selectedParams[cleanParamKey] = randomValue;
            
            // Create regex pattern - escape brackets for search
            const regexPattern = searchKey.replace(/[\[\]]/g, '\\$&');
            result = result.replace(new RegExp(regexPattern, 'g'), randomValue);
        });
        
        // Generate negative prompt dengan parameter yang sama
        let negativeResult = '';
        const negativeTemplate = themeManager.getNegativePrompt(currentTheme.id);
        if (negativeTemplate && negativeTemplate.trim() !== '') {
            negativeResult = negativeTemplate;
            Object.keys(parameters).forEach(paramKey => {
                let cleanParamKey = paramKey;
                let searchKey = paramKey;
                
                if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
                    cleanParamKey = paramKey.slice(1, -1);
                    searchKey = paramKey;
                } else {
                    searchKey = `[${paramKey}]`;
                }
                
                const randomValue = selectedParams[cleanParamKey];
                const regexPattern = searchKey.replace(/[\[\]]/g, '\\$&');
                negativeResult = negativeResult.replace(new RegExp(regexPattern, 'g'), randomValue);
            });
        }
        
        results.push({
            prompt: result,
            negativePrompt: negativeResult,
            parameters: selectedParams
        });
        
        analytics.trackPromptGeneration(currentTheme.id, selectedParams);
        historyManager.addEntry(result, currentTheme.name, selectedParams);
    }

    displayBulkResults(results);
    showToast(`${count} prompt berhasil di-generate!`, 'success');
}

function displayBulkResults(results) {
    const bulkResultsCard = document.getElementById('bulk-results-card');
    const bulkResults = document.getElementById('bulk-results');
    
    bulkResults.innerHTML = '';
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('list-group-item');
        
        const hasNegative = result.negativePrompt && result.negativePrompt.trim() !== '';
        
        resultItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">Prompt ${index + 1}</h6>
                    <div class="mb-2">
                        <strong class="text-success">Positive:</strong>
                        <p class="mb-1 font-monospace small">${result.prompt}</p>
                    </div>
                    ${hasNegative ? `
                        <div class="mb-2">
                            <strong class="text-danger">Negative:</strong>
                            <p class="mb-1 font-monospace small text-muted">${result.negativePrompt}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="d-flex flex-column gap-1">
                    <button class="btn btn-outline-primary btn-sm copy-bulk-btn" data-prompt="${result.prompt}">
                        <i class="bi bi-clipboard"></i> Copy +
                    </button>
                    ${hasNegative ? `
                        <button class="btn btn-outline-danger btn-sm copy-bulk-negative-btn" data-negative="${result.negativePrompt}">
                            <i class="bi bi-clipboard-x"></i> Copy -
                        </button>
                        <button class="btn btn-outline-info btn-sm copy-bulk-both-btn" data-prompt="${result.prompt}" data-negative="${result.negativePrompt}">
                            <i class="bi bi-clipboard-check"></i> Both
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-success btn-sm use-bulk-btn" data-prompt="${result.prompt}" data-negative="${result.negativePrompt || ''}">
                        <i class="bi bi-arrow-right-circle"></i> Use
                    </button>
                </div>
            </div>
        `;
        
        bulkResults.appendChild(resultItem);
    });
    
    // Add event listeners for bulk results
    document.querySelectorAll('.copy-bulk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            navigator.clipboard.writeText(e.target.closest('button').dataset.prompt).then(() => {
                showToast('Positive prompt berhasil disalin!', 'success');
            });
        });
    });
    
    document.querySelectorAll('.copy-bulk-negative-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            navigator.clipboard.writeText(e.target.closest('button').dataset.negative).then(() => {
                showToast('Negative prompt berhasil disalin!', 'success');
            });
        });
    });
    
    document.querySelectorAll('.copy-bulk-both-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            const combinedText = `POSITIVE PROMPT:\n${button.dataset.prompt}\n\nNEGATIVE PROMPT:\n${button.dataset.negative}`;
            navigator.clipboard.writeText(combinedText).then(() => {
                showToast('Kedua prompt berhasil disalin!', 'success');
            });
        });
    });
    
    document.querySelectorAll('.use-bulk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            document.getElementById('result-prompt').value = button.dataset.prompt;
            document.getElementById('result-negative-prompt').value = button.dataset.negative;
            updateWordCount(button.dataset.prompt);
            updateNegativeWordCount(button.dataset.negative);
            updateNegativePromptDisplay();
            showToast('Prompt berhasil dimuat!', 'success');
        });
    });
    
    bulkResultsCard.style.display = 'block';
    bulkResultsCard.scrollIntoView({ behavior: 'smooth' });
}

// Fungsi untuk menyalin ke clipboard
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

// Fungsi untuk menyimpan ke file
function saveToFile() {
    const prompt = document.getElementById('result-prompt').value;
    if (!prompt) {
        showToast('Tidak ada prompt untuk disimpan.', 'error');
        return;
    }
    
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt_${currentTheme.id}_${Date.now()}.txt`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Prompt berhasil disimpan!', 'success');
}

// Fungsi untuk menyimpan sebagai contoh
function saveAsExample() {
    const prompt = document.getElementById('result-prompt').value;
    if (!prompt) {
        showToast('Tidak ada prompt untuk disimpan sebagai contoh.', 'error');
        return;
    }
    
    try {
        themeManager.addExample(currentTheme.id, prompt);
        populateExamples(); // Refresh examples
        showToast('Prompt berhasil disimpan sebagai contoh!', 'success');
    } catch (error) {
        showToast('Gagal menyimpan contoh.', 'error');
    }
}

// Analytics functions
function updateAnalyticsDisplay() {
    if (!analytics) return;
    
    const totalPromptsEl = document.getElementById('total-prompts');
    const totalThemesEl = document.getElementById('total-themes');
    const mostUsedThemeEl = document.getElementById('most-used-theme');
    const todayPromptsEl = document.getElementById('today-prompts');
    
    if (totalPromptsEl) totalPromptsEl.textContent = analytics.data.totalPrompts;
    if (totalThemesEl) totalThemesEl.textContent = config ? config.themes.length : 0;
    if (mostUsedThemeEl) mostUsedThemeEl.textContent = analytics.getMostUsedTheme();
    if (todayPromptsEl) todayPromptsEl.textContent = analytics.getTodayCount();
}

function showAnalytics() {
    updateAnalyticsDisplay();
    
    const popularParams = analytics.getPopularParameters();
    const popularContainer = document.getElementById('popular-parameters');
    
    if (popularContainer) {
        if (popularParams.length === 0) {
            popularContainer.innerHTML = '<p class="text-muted">Belum ada data parameter.</p>';
        } else {
            popularContainer.innerHTML = popularParams.map(param => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span><strong>${param.param}:</strong> ${param.value}</span>
                    <span class="badge bg-primary">${param.count}x</span>
                </div>
            `).join('');
        }
    }
    
    const modal = new bootstrap.Modal(document.getElementById('analytics-modal'));
    modal.show();
}

function showHistory() {
    const historyList = document.getElementById('history-list');
    const history = historyManager.history;
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-muted text-center p-3">Belum ada history prompt.</div>';
    } else {
        historyList.innerHTML = history.slice(0, 50).map(entry => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${entry.theme}</h6>
                        <p class="mb-1 font-monospace small">${entry.prompt.substring(0, 100)}...</p>
                        <small class="text-muted">
                            <i class="bi bi-clock"></i> ${new Date(entry.timestamp).toLocaleString('id-ID')} |
                            <i class="bi bi-type"></i> ${entry.wordCount} kata
                        </small>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-outline-primary btn-sm copy-history-btn" data-prompt="${entry.prompt}">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="btn btn-outline-success btn-sm use-history-btn" data-prompt="${entry.prompt}">
                            <i class="bi bi-arrow-right-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.copy-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.target.dataset.prompt).then(() => {
                    showToast('Prompt berhasil disalin!', 'success');
                });
            });
        });
        
        document.querySelectorAll('.use-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('result-prompt').value = e.target.dataset.prompt;
                updateWordCount(e.target.dataset.prompt);
                showToast('Prompt berhasil dimuat!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('history-modal')).hide();
            });
        });
    }
    
    const modal = new bootstrap.Modal(document.getElementById('history-modal'));
    modal.show();
}

// Event listeners
function initEventListeners() {
    // Main buttons
    document.getElementById('generate-btn').addEventListener('click', generatePrompt);
    document.getElementById('random-btn').addEventListener('click', randomizeParameters);
    
    // Advanced buttons
    const smartRandomBtn = document.getElementById('smart-random-btn');
    const bulkGenerateBtn = document.getElementById('bulk-generate-btn');
    
    if (smartRandomBtn) smartRandomBtn.addEventListener('click', smartRandomize);
    if (bulkGenerateBtn) bulkGenerateBtn.addEventListener('click', bulkGenerate);
    
    // Result buttons
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    document.getElementById('save-btn').addEventListener('click', saveToFile);
    document.getElementById('save-example-btn').addEventListener('click', saveAsExample);
    
    // Negative prompt buttons
    const copyNegativeBtn = document.getElementById('copy-negative-btn');
    const copyBothBtn = document.getElementById('copy-both-btn');
    
    if (copyNegativeBtn) {
        copyNegativeBtn.addEventListener('click', copyNegativeToClipboard);
    }
    
    if (copyBothBtn) {
        copyBothBtn.addEventListener('click', copyBothToClipboard);
    }
    
    // Navigation buttons
    const analyticsBtn = document.getElementById('analytics-btn');
    const historyBtn = document.getElementById('history-btn');
    
    if (analyticsBtn) analyticsBtn.addEventListener('click', showAnalytics);
    if (historyBtn) historyBtn.addEventListener('click', showHistory);
    
    // Quick add theme button
    const quickAddThemeBtn = document.getElementById('quick-add-theme');
    if (quickAddThemeBtn) {
        quickAddThemeBtn.addEventListener('click', () => {
            if (themeEditor) {
                themeEditor.quickAddTheme();
            }
        });
    }
    
    // History modal buttons
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const exportHistoryBtn = document.getElementById('export-history-btn');
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Yakin ingin menghapus semua history?')) {
                historyManager.clear();
                showHistory();
                showToast('History berhasil dihapus!', 'success');
            }
        });
    }
    
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', () => {
            historyManager.export();
            showToast('History berhasil di-export!', 'success');
        });
    }
    
    // Result prompt text change listener
    document.getElementById('result-prompt').addEventListener('input', (e) => {
        updateWordCount(e.target.value);
    });
}

// Fungsi untuk setup parameter cepat
function quickParameterSetup() {
    const commonParams = {
        'OBJECT': ['car', 'truck', 'bike', 'person', 'building'],
        'ACTION': ['moving', 'stopping', 'turning', 'accelerating', 'slowing down'],
        'LOCATION': ['street', 'highway', 'parking lot', 'city center', 'countryside'],
        'TIME': ['morning', 'afternoon', 'evening', 'night', 'sunset'],
        'WEATHER': ['sunny', 'rainy', 'cloudy', 'foggy', 'stormy']
    };

    if (confirm('Ini akan menambahkan parameter dasar ke tema ini. Lanjutkan?')) {
        try {
            themeManager.updateParameters(currentTheme.id, commonParams);
            fetchConfig();
            selectTheme(currentTheme.id);
            showToast('Parameter dasar berhasil ditambahkan!', 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}

// Fungsi untuk menampilkan modal tambah parameter cepat
function showQuickAddParameterModal() {
    const paramName = prompt('Nama parameter (format: NAMA_PARAMETER):', 'NEW_PARAMETER');
    if (!paramName) return;

    // Validasi nama parameter
    if (!/^[A-Z_]+$/.test(paramName)) {
        showToast('Nama parameter harus menggunakan huruf besar dan underscore!', 'error');
        return;
    }

    const paramValues = prompt('Nilai parameter (pisahkan dengan koma):', 'nilai1, nilai2, nilai3');
    if (!paramValues) return;

    const values = paramValues.split(',').map(v => v.trim()).filter(v => v);
    
    if (values.length === 0) {
        showToast('Minimal harus ada satu nilai parameter!', 'error');
        return;
    }

    try {
        themeManager.addParameter(currentTheme.id, paramName, values);
        fetchConfig();
        selectTheme(currentTheme.id);
        showToast(`Parameter ${paramName} berhasil ditambahkan!`, 'success');
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Fungsi untuk mengedit parameter
function editParameter(paramName) {
    const parameters = config.parameters[currentTheme.id];
    const currentValues = parameters[paramName];
    
    const newValues = prompt(`Edit nilai untuk ${paramName} (pisahkan dengan koma):`, currentValues.join(', '));
    if (newValues === null) return; // User cancelled
    
    const values = newValues.split(',').map(v => v.trim()).filter(v => v);
    
    if (values.length === 0) {
        if (confirm(`Ini akan menghapus parameter ${paramName}. Lanjutkan?`)) {
            deleteParameter(paramName);
        }
        return;
    }

    try {
        const updatedParams = { ...parameters };
        updatedParams[paramName] = values;
        themeManager.updateParameters(currentTheme.id, updatedParams);
        fetchConfig();
        selectTheme(currentTheme.id);
        showToast(`Parameter ${paramName} berhasil diperbarui!`, 'success');
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Fungsi untuk menghapus parameter
function deleteParameter(paramName) {
    if (confirm(`Yakin ingin menghapus parameter ${paramName}?\nTindakan ini tidak dapat dibatalkan.`)) {
        try {
            themeManager.removeParameter(currentTheme.id, paramName);
            fetchConfig();
            selectTheme(currentTheme.id);
            showToast(`Parameter ${paramName} berhasil dihapus!`, 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}

// Add debug button to interface
function addDebugTools() {
    // Debug tools dihapus sesuai permintaan user
    return;
}

// Fungsi untuk mengedit negative prompt
function editNegativePrompt() {
    if (!currentTheme) {
        showToast('Pilih tema terlebih dahulu.', 'error');
        return;
    }
    
    const currentNegative = themeManager.getNegativePrompt(currentTheme.id);
    const newNegative = prompt(`Edit Negative Prompt untuk tema "${currentTheme.name}":`, currentNegative);
    
    if (newNegative !== null) { // User didn't cancel
        try {
            themeManager.setNegativePrompt(currentTheme.id, newNegative.trim());
            showToast('Negative prompt berhasil diperbarui!', 'success');
            
            // Update display if currently showing
            updateNegativePromptDisplay();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}

// Fungsi untuk mengupdate tampilan negative prompt
function updateNegativePromptDisplay() {
    if (!currentTheme) return;
    
    const negativePrompt = themeManager.getNegativePrompt(currentTheme.id);
    const negativeSection = document.getElementById('negative-prompt-section');
    const negativeTextarea = document.getElementById('result-negative-prompt');
    const copyNegativeBtn = document.getElementById('copy-negative-btn');
    const copyBothBtn = document.getElementById('copy-both-btn');
    
    if (negativePrompt && negativePrompt.trim() !== '') {
        negativeSection.style.display = 'block';
        copyNegativeBtn.style.display = 'inline-block';
        copyBothBtn.style.display = 'inline-block';
    } else {
        negativeSection.style.display = 'none';
        copyNegativeBtn.style.display = 'none';
        copyBothBtn.style.display = 'none';
    }
}

// Fungsi untuk generate negative prompt (dengan parameter replacement)
function generateNegativePrompt() {
    if (!currentTheme) return '';
    
    let negativePrompt = themeManager.getNegativePrompt(currentTheme.id);
    if (!negativePrompt || negativePrompt.trim() === '') return '';
    
    const parameters = config.parameters[currentTheme.id];
    if (!parameters) return negativePrompt;
    
    // Replace parameters in negative prompt sama seperti main prompt
    Object.keys(parameters).forEach(paramKey => {
        let cleanParamKey = paramKey;
        let searchKey = paramKey;
        
        if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
            cleanParamKey = paramKey.slice(1, -1);
            searchKey = paramKey;
        } else {
            searchKey = `[${paramKey}]`;
        }
        
        const selectElement = document.querySelector(`select[data-param="${cleanParamKey}"]`);
        if (selectElement && selectElement.value && selectElement.value.trim() !== '') {
            const regexPattern = searchKey.replace(/[\[\]]/g, '\\$&');
            negativePrompt = negativePrompt.replace(new RegExp(regexPattern, 'g'), selectElement.value);
        }
    });
    
    return negativePrompt;
}

// Fungsi untuk update word count negative prompt
function updateNegativeWordCount(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    document.getElementById('negative-word-count').textContent = `${words} kata`;
    document.getElementById('negative-char-count').textContent = `${chars} karakter`;
}

// Fungsi untuk menyalin negative prompt ke clipboard
function copyNegativeToClipboard() {
    const negativePrompt = document.getElementById('result-negative-prompt').value;
    if (!negativePrompt) {
        showToast('Tidak ada negative prompt untuk disalin.', 'error');
        return;
    }
    
    navigator.clipboard.writeText(negativePrompt).then(() => {
        showToast('Negative prompt berhasil disalin ke clipboard!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin negative prompt.', 'error');
    });
}

// Fungsi untuk menyalin kedua prompt ke clipboard
function copyBothToClipboard() {
    const mainPrompt = document.getElementById('result-prompt').value;
    const negativePrompt = document.getElementById('result-negative-prompt').value;
    
    if (!mainPrompt) {
        showToast('Tidak ada prompt untuk disalin.', 'error');
        return;
    }
    
    let combinedText = `POSITIVE PROMPT:\n${mainPrompt}`;
    
    if (negativePrompt && negativePrompt.trim() !== '') {
        combinedText += `\n\nNEGATIVE PROMPT:\n${negativePrompt}`;
    }
    
    navigator.clipboard.writeText(combinedText).then(() => {
        showToast('Kedua prompt berhasil disalin ke clipboard!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin prompt.', 'error');
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', initApp); 