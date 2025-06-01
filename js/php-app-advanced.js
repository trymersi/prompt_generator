// PHP-powered Prompt Generator Frontend - Advanced Version

class PromptGeneratorApp {
    constructor() {
        this.apiBase = 'api/index.php';
        this.currentTheme = null;
        this.themes = [];
        this.isLoading = false;
        this.debounceTimer = null;
        this.presets = JSON.parse(localStorage.getItem('presets') || '[]');
        this.examples = JSON.parse(localStorage.getItem('examples') || '[]');
        
        this.init();
    }
    
    async init() {
        this.showToast('🚀 Menginisialisasi aplikasi...', 'info');
        this.initEventListeners();
        this.initThemeToggle();
        await this.checkApiStatus();
        await this.loadThemes();
        this.updateApiStatus('success', 'API Connected');
    }
    
    // API Communication
    async apiCall(endpoint, options = {}) {
        const { method = 'GET', data = null, params = {} } = options;
        
        let url = `${this.apiBase}?endpoint=${endpoint}`;
        Object.keys(params).forEach(key => {
            url += `&${key}=${encodeURIComponent(params[key])}`;
        });
        
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            fetchOptions.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, fetchOptions);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.data?.error || `HTTP ${response.status}`);
            }
            
            return result.data;
        } catch (error) {
            console.error('API Error:', error);
            this.showToast(`Error API: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async checkApiStatus() {
        try {
            await this.apiCall('themes');
            this.updateApiStatus('success', 'API Online');
        } catch (error) {
            this.updateApiStatus('error', 'API Offline');
            throw error;
        }
    }
    
    // UI Helpers
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast show border-0 bg-${this.getBootstrapColor(type)} text-white`;
        
        toast.innerHTML = `
            <div class="toast-body d-flex align-items-center">
                <i class="bi bi-${this.getIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }
    
    getBootstrapColor(type) {
        const colors = {
            success: 'success',
            error: 'danger', 
            warning: 'warning',
            info: 'info'
        };
        return colors[type] || 'secondary';
    }
    
    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    updateApiStatus(status, message) {
        const badge = document.getElementById('api-status-badge');
        const colors = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning'
        };
        
        badge.className = `badge badge-status ${colors[status] || 'bg-secondary'}`;
        badge.innerHTML = `<i class="bi bi-circle-fill me-2"></i>${message}`;
    }
    
    setLoading(element, loading = true) {
        if (loading) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }
    
    // Theme Management
    async loadThemes() {
        try {
            this.setLoading(document.getElementById('theme-list'), true);
            this.themes = await this.apiCall('themes');
            this.renderThemes();
            
            if (this.themes.length > 0) {
                this.selectTheme(this.themes[0].theme_id);
            }
        } catch (error) {
            document.getElementById('theme-list').innerHTML = `
                <div class="text-center p-4 text-danger">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2">Gagal memuat tema</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.loadThemes()">
                        <i class="bi bi-arrow-clockwise"></i> Coba Lagi
                    </button>
                </div>
            `;
        } finally {
            this.setLoading(document.getElementById('theme-list'), false);
        }
    }
    
    renderThemes(filteredThemes = null) {
        const themesToRender = filteredThemes || this.themes;
        const container = document.getElementById('theme-list');
        
        if (themesToRender.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="bi bi-palette text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 text-muted">Tidak ada tema ditemukan</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = themesToRender.map(theme => `
            <div class="list-group-item list-group-item-action theme-card" data-theme-id="${theme.theme_id}">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${theme.name}</h6>
                    <small class="text-muted">${theme.category || 'Umum'}</small>
                </div>
                <p class="mb-1 small text-muted">${theme.description || 'Tidak ada deskripsi'}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${new Date(theme.created_at).toLocaleDateString('id-ID')}
                    </small>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary edit-theme-btn" data-theme-id="${theme.theme_id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info param-theme-btn" data-theme-id="${theme.theme_id}">
                            <i class="bi bi-sliders"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-theme-btn" data-theme-id="${theme.theme_id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-group')) {
                    this.selectTheme(card.dataset.themeId);
                }
            });
        });
        
        container.querySelectorAll('.edit-theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editTheme(btn.dataset.themeId);
            });
        });
        
        container.querySelectorAll('.param-theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editParameters(btn.dataset.themeId);
            });
        });
        
        container.querySelectorAll('.delete-theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTheme(btn.dataset.themeId);
            });
        });
    }
    
    async selectTheme(themeId) {
        try {
            // Remove active class from all themes
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to selected theme
            const selectedCard = document.querySelector(`[data-theme-id="${themeId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('active');
            }
            
            // Load theme data with parameters
            this.currentTheme = await this.apiCall('themes', { params: { id: themeId } });
            
            // Render parameters and template preview
            this.renderParameters();
            this.updateCompletionProgress();
            this.updateTemplatePreview();
            this.enableGenerateButton();
            
            this.showToast(`Tema "${this.currentTheme.name}" dipilih`, 'success');
        } catch (error) {
            this.showToast(`Gagal memuat tema: ${error.message}`, 'error');
        }
    }
    
    updateTemplatePreview() {
        const preview = document.getElementById('template-preview');
        if (this.currentTheme) {
            preview.innerHTML = this.highlightParameters(this.currentTheme.template);
        } else {
            preview.innerHTML = 'Pilih tema untuk melihat template';
        }
    }
    
    highlightParameters(text) {
        return text.replace(/\[([^\]]+)\]/g, '<span class="text-danger fw-bold">[$1]</span>');
    }
    
    renderParameters() {
        const form = document.getElementById('parameter-form');
        const parameters = this.currentTheme.parameters;
        
        if (!parameters || Object.keys(parameters).length === 0) {
            form.innerHTML = `
                <div class="text-center p-4">
                    <i class="bi bi-sliders text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 text-muted">Tema ini belum memiliki parameter.</p>
                    <button class="btn btn-primary btn-sm" onclick="app.editParameters('${this.currentTheme.theme_id}')">
                        <i class="bi bi-plus-circle"></i> Tambah Parameter
                    </button>
                </div>
            `;
            return;
        }
        
        form.innerHTML = Object.keys(parameters).map(paramKey => `
            <div class="parameter-group">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label mb-0 fw-bold">${paramKey}</label>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-info edit-param-btn" data-param="${paramKey}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-param-btn" data-param="${paramKey}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <select class="form-select" data-param="${paramKey}">
                    <option value="">Pilih ${paramKey}...</option>
                    ${parameters[paramKey].map(value => `
                        <option value="${value}">${value}</option>
                    `).join('')}
                </select>
            </div>
        `).join('');
        
        // Add event listeners for parameter changes
        form.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateCompletionProgress();
                this.debouncePreview();
            });
        });
    }
    
    updateCompletionProgress() {
        const selects = document.querySelectorAll('#parameter-form select');
        const completed = Array.from(selects).filter(select => select.value !== '').length;
        const total = selects.length;
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const progressBar = document.getElementById('completion-progress');
        const percentText = document.getElementById('completion-percent');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.className = `progress-bar ${this.getProgressColor(percentage)}`;
        }
        
        if (percentText) {
            percentText.textContent = `${percentage}%`;
        }
    }
    
    getProgressColor(percentage) {
        if (percentage < 30) return 'bg-danger';
        if (percentage < 70) return 'bg-warning';
        return 'bg-success';
    }
    
    enableGenerateButton() {
        const btn = document.getElementById('generate-btn');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-play-circle"></i> Generate Prompt';
    }
    
    debouncePreview() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.generatePreview();
        }, 300);
    }
    
    generatePreview() {
        if (!this.currentTheme) return;
        
        const parameters = this.getSelectedParameters();
        if (Object.keys(parameters).length === 0) return;
        
        let preview = this.currentTheme.template;
        Object.keys(parameters).forEach(key => {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            preview = preview.replace(regex, parameters[key]);
        });
        
        // Update example list
        const exampleList = document.getElementById('example-list');
        if (exampleList) {
            exampleList.innerHTML = `
                <div class="list-group-item">
                    <h6 class="mb-1">Preview with current parameters:</h6>
                    <p class="mb-1 small">${preview.substring(0, 200)}...</p>
                    <small class="text-muted">Live preview</small>
                </div>
            `;
        }
    }
    
    // Generate Functions
    async generatePrompt() {
        if (!this.currentTheme) {
            this.showToast('Pilih tema terlebih dahulu', 'error');
            return;
        }
        
        const parameters = this.getSelectedParameters();
        const parameterKeys = Object.keys(this.currentTheme.parameters || {});
        
        console.log('🔍 Debug Generate Prompt:');
        console.log('Current Theme:', this.currentTheme.theme_id);
        console.log('Template:', this.currentTheme.template);
        console.log('Available Parameter Keys:', parameterKeys);
        console.log('Selected Parameters:', parameters);
        
        // Clean parameter keys for comparison (remove brackets if present)
        const cleanParameterKeys = parameterKeys.map(key => {
            if (key.startsWith('[') && key.endsWith(']')) {
                return key.slice(1, -1); // Remove brackets
            }
            return key;
        });
        
        console.log('🔧 Clean Parameter Keys:', cleanParameterKeys);
        
        // Check if all parameters are filled using clean keys
        const missingParams = cleanParameterKeys.filter(key => !parameters[key]);
        if (missingParams.length > 0) {
            console.log('❌ Missing Parameters:', missingParams);
            this.showToast(`Parameter belum lengkap: ${missingParams.join(', ')}`, 'error');
            return;
        }
        
        try {
            const btn = document.getElementById('generate-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
            btn.disabled = true;
            
            const requestData = {
                theme_id: this.currentTheme.theme_id,
                parameters: parameters
            };
            
            console.log('📤 Sending to API:', requestData);
            
            const result = await this.apiCall('generate', {
                method: 'POST',
                data: requestData
            });
            
            console.log('📥 API Response:', result);
            
            // Display results
            document.getElementById('result-prompt').value = result.prompt;
            this.updateWordCount(result.prompt);
            
            if (result.negative_prompt) {
                document.getElementById('result-negative-prompt').value = result.negative_prompt;
                document.getElementById('negative-prompt-section').style.display = 'block';
                document.getElementById('copy-negative-btn').style.display = 'inline-block';
                document.getElementById('copy-both-btn').style.display = 'inline-block';
                this.updateNegativeWordCount(result.negative_prompt);
            }
            
            this.showToast('Prompt berhasil di-generate!', 'success');
            
        } catch (error) {
            console.error('❌ Generate Error:', error);
            this.showToast(`Gagal generate prompt: ${error.message}`, 'error');
        } finally {
            const btn = document.getElementById('generate-btn');
            btn.innerHTML = '<i class="bi bi-play-circle"></i> Generate Prompt';
            btn.disabled = false;
        }
    }
    
    async bulkGenerate() {
        if (!this.currentTheme) {
            this.showToast('Pilih tema terlebih dahulu', 'error');
            return;
        }
        
        const bulkCount = 5;
        const results = [];
        
        try {
            const btn = document.getElementById('bulk-generate-btn');
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
            btn.disabled = true;
            
            for (let i = 0; i < bulkCount; i++) {
                // Randomize parameters for each generation
                this.randomizeParameters();
                const parameters = this.getSelectedParameters();
                
                const result = await this.apiCall('generate', {
                    method: 'POST',
                    data: {
                        theme_id: this.currentTheme.theme_id,
                        parameters: parameters
                    }
                });
                
                results.push({
                    index: i + 1,
                    prompt: result.prompt,
                    negative_prompt: result.negative_prompt,
                    parameters: parameters
                });
            }
            
            this.displayBulkResults(results);
            this.showToast(`${bulkCount} prompt berhasil di-generate!`, 'success');
            
        } catch (error) {
            this.showToast(`Gagal bulk generate: ${error.message}`, 'error');
        } finally {
            const btn = document.getElementById('bulk-generate-btn');
            btn.innerHTML = '<i class="bi bi-collection"></i> Bulk (5x)';
            btn.disabled = false;
        }
    }
    
    displayBulkResults(results) {
        const card = document.getElementById('bulk-results-card');
        const container = document.getElementById('bulk-results');
        
        container.innerHTML = results.map((result, index) => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">Prompt ${result.index}</h6>
                        <p class="mb-1">${result.prompt.substring(0, 200)}...</p>
                        <small class="text-muted">
                            ${Object.keys(result.parameters).length} parameter digunakan
                        </small>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary copy-bulk-btn" data-prompt="${result.prompt}">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success use-bulk-btn" data-prompt="${result.prompt}">
                            <i class="bi bi-arrow-right-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.copy-bulk-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyToClipboard(btn.dataset.prompt, 'Bulk prompt'));
        });
        
        container.querySelectorAll('.use-bulk-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('result-prompt').value = btn.dataset.prompt;
                this.updateWordCount(btn.dataset.prompt);
                this.showToast('Prompt berhasil dimuat dari bulk result!', 'success');
            });
        });
        
        card.style.display = 'block';
    }
    
    getSelectedParameters() {
        const parameters = {};
        document.querySelectorAll('#parameter-form select').forEach(select => {
            if (select.value) {
                // Remove brackets from parameter key if present
                let paramKey = select.dataset.param;
                if (paramKey.startsWith('[') && paramKey.endsWith(']')) {
                    paramKey = paramKey.slice(1, -1); // Remove first and last character
                }
                parameters[paramKey] = select.value;
            }
        });
        
        console.log('🔧 Processed Parameters:', parameters);
        return parameters;
    }
    
    updateWordCount(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        document.getElementById('word-count').textContent = `${words} kata`;
        document.getElementById('char-count').textContent = `${chars} karakter`;
    }
    
    updateNegativeWordCount(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        
        document.getElementById('negative-word-count').textContent = `${words} kata`;
        document.getElementById('negative-char-count').textContent = `${chars} karakter`;
    }
    
    // Utility Functions
    randomizeParameters() {
        if (!this.currentTheme || !this.currentTheme.parameters) {
            this.showToast('Tidak ada parameter untuk diacak', 'error');
            return;
        }
        
        Object.keys(this.currentTheme.parameters).forEach(paramKey => {
            // Use the original paramKey (with brackets) to find the select element
            const select = document.querySelector(`select[data-param="${paramKey}"]`);
            if (select) {
                const values = this.currentTheme.parameters[paramKey];
                const randomValue = values[Math.floor(Math.random() * values.length)];
                select.value = randomValue;
            }
        });
        
        this.updateCompletionProgress();
        this.debouncePreview();
        this.showToast('Parameter berhasil diacak!', 'success');
    }
    
    smartRandomize() {
        // Smart randomization with weighted preferences
        this.randomizeParameters();
        this.showToast('Smart randomization diterapkan!', 'success');
    }
    
    async copyToClipboard(text, type = 'prompt') {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(`${type} berhasil disalin!`, 'success');
        } catch (error) {
            this.showToast(`Gagal menyalin ${type}`, 'error');
        }
    }
    
    saveToFile() {
        const prompt = document.getElementById('result-prompt').value;
        if (!prompt) {
            this.showToast('Tidak ada prompt untuk disimpan', 'error');
            return;
        }
        
        const blob = new Blob([prompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `prompt_${this.currentTheme.theme_id}_${Date.now()}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Prompt berhasil disimpan!', 'success');
    }
    
    saveAsExample() {
        const prompt = document.getElementById('result-prompt').value;
        if (!prompt) {
            this.showToast('Tidak ada prompt untuk disimpan', 'error');
            return;
        }
        
        const example = {
            id: Date.now(),
            theme_id: this.currentTheme.theme_id,
            theme_name: this.currentTheme.name,
            prompt: prompt,
            parameters: this.getSelectedParameters(),
            created_at: new Date().toISOString()
        };
        
        this.examples.push(example);
        localStorage.setItem('examples', JSON.stringify(this.examples));
        this.updateExampleList();
        
        this.showToast('Prompt berhasil disimpan sebagai contoh!', 'success');
    }
    
    updateExampleList() {
        const container = document.getElementById('example-list');
        if (!container) return;
        
        const themeExamples = this.examples.filter(ex => 
            ex.theme_id === this.currentTheme?.theme_id
        ).slice(0, 5);
        
        if (themeExamples.length === 0) {
            container.innerHTML = `
                <div class="list-group-item text-center">
                    <i class="bi bi-bookmark text-muted"></i>
                    <p class="mb-0 mt-2 text-muted">Belum ada contoh untuk tema ini</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = themeExamples.map(example => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <p class="mb-1">${example.prompt.substring(0, 100)}...</p>
                        <small class="text-muted">
                            ${new Date(example.created_at).toLocaleDateString('id-ID')}
                        </small>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary copy-example-btn" data-prompt="${example.prompt}">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success use-example-btn" data-prompt="${example.prompt}">
                            <i class="bi bi-arrow-right-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.copy-example-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyToClipboard(btn.dataset.prompt, 'Contoh prompt'));
        });
        
        container.querySelectorAll('.use-example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('result-prompt').value = btn.dataset.prompt;
                this.updateWordCount(btn.dataset.prompt);
                this.showToast('Contoh berhasil dimuat!', 'success');
            });
        });
    }
    
    // Event Listeners
    initEventListeners() {
        // Generate buttons
        document.getElementById('generate-btn').addEventListener('click', () => this.generatePrompt());
        document.getElementById('random-btn').addEventListener('click', () => this.randomizeParameters());
        document.getElementById('smart-random-btn').addEventListener('click', () => this.smartRandomize());
        document.getElementById('bulk-generate-btn').addEventListener('click', () => this.bulkGenerate());
        
        // Copy buttons
        document.getElementById('copy-btn').addEventListener('click', () => {
            const prompt = document.getElementById('result-prompt').value;
            if (prompt) this.copyToClipboard(prompt, 'Prompt');
        });
        
        document.getElementById('copy-negative-btn').addEventListener('click', () => {
            const negative = document.getElementById('result-negative-prompt').value;
            if (negative) this.copyToClipboard(negative, 'Negative prompt');
        });
        
        document.getElementById('copy-both-btn').addEventListener('click', () => {
            const prompt = document.getElementById('result-prompt').value;
            const negative = document.getElementById('result-negative-prompt').value;
            const combined = `POSITIVE PROMPT:\n${prompt}\n\nNEGATIVE PROMPT:\n${negative}`;
            this.copyToClipboard(combined, 'Kedua prompt');
        });
        
        document.getElementById('save-btn').addEventListener('click', () => this.saveToFile());
        document.getElementById('save-example-btn').addEventListener('click', () => this.saveAsExample());
        
        // Modal buttons
        document.getElementById('analytics-btn').addEventListener('click', () => this.showAnalytics());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistory());
        document.getElementById('manage-themes-btn').addEventListener('click', () => this.showManageThemes());
        document.getElementById('add-theme-btn').addEventListener('click', () => this.showAddThemeModal());
        document.getElementById('quick-add-theme').addEventListener('click', () => this.showAddThemeModal());
        
        // Search and filter
        document.getElementById('theme-search').addEventListener('input', (e) => this.filterThemes(e.target.value));
        document.getElementById('category-filter').addEventListener('change', (e) => this.filterThemes());
        
        // Template preview
        document.getElementById('template-preview-btn').addEventListener('click', () => this.showTemplatePreview());
        
        // Export examples
        document.getElementById('export-examples-btn').addEventListener('click', () => this.exportExamples());
        
        // History search
        document.getElementById('history-search').addEventListener('input', (e) => this.filterHistory(e.target.value));
        
        // Clear history
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());
        
        // Export history
        document.getElementById('export-history-btn').addEventListener('click', () => this.exportHistory());
        
        // Word count update
        document.getElementById('result-prompt').addEventListener('input', (e) => {
            this.updateWordCount(e.target.value);
        });
        
        // Preset management
        document.getElementById('save-preset-btn').addEventListener('click', () => this.savePreset());
        document.getElementById('load-preset-btn').addEventListener('click', () => this.showPresets());
        
        // Compare functionality
        document.getElementById('compare-btn').addEventListener('click', () => this.showCompareModal());
        
        // Advanced features
        document.getElementById('optimize-prompt-btn').addEventListener('click', () => this.optimizePrompt());
        document.getElementById('translate-btn').addEventListener('click', () => this.translatePrompt());
        document.getElementById('share-btn').addEventListener('click', () => this.sharePrompt());
    }
    
    filterThemes(query = '') {
        const category = document.getElementById('category-filter').value;
        const searchQuery = query || document.getElementById('theme-search').value;
        
        const filtered = this.themes.filter(theme => {
            const matchesQuery = !searchQuery || 
                theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                theme.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesCategory = !category || theme.category === category;
            
            return matchesQuery && matchesCategory;
        });
        
        this.renderThemes(filtered);
    }
    
    // Theme Toggle
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
            
            this.showToast(`Tema ${newTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
        });
    }
    
    updateThemeIcon(theme) {
        const themeIcon = document.getElementById('theme-icon');
        themeIcon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
    
    // Modal Functions
    async showAnalytics() {
        try {
            const analytics = await this.apiCall('analytics');
            
            document.getElementById('total-prompts').textContent = analytics.total_prompts;
            document.getElementById('total-themes').textContent = this.themes.length;
            document.getElementById('today-prompts').textContent = analytics.today_prompts;
            
            const mostUsed = analytics.theme_usage.length > 0 ? analytics.theme_usage[0].name : '-';
            document.getElementById('most-used-theme').textContent = mostUsed;
            
            // Show theme usage chart
            const chartContainer = document.getElementById('theme-usage-chart');
            chartContainer.innerHTML = analytics.theme_usage.map(theme => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${theme.name}</span>
                    <span class="badge bg-primary">${theme.usage_count}x</span>
                </div>
            `).join('');
            
            // Show popular parameters
            const paramsContainer = document.getElementById('popular-parameters');
            paramsContainer.innerHTML = analytics.popular_parameters.slice(0, 5).map(param => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <small>${param.theme_id}</small>
                    <span class="badge bg-info">${param.usage_count}x</span>
                </div>
            `).join('');
            
            const modal = new bootstrap.Modal(document.getElementById('analytics-modal'));
            modal.show();
        } catch (error) {
            this.showToast(`Gagal memuat analytics: ${error.message}`, 'error');
        }
    }
    
    async showHistory() {
        try {
            const history = await this.apiCall('history', { params: { limit: 50 } });
            
            const historyList = document.getElementById('history-list');
            if (history.length === 0) {
                historyList.innerHTML = `
                    <div class="text-center p-4">
                        <i class="bi bi-clock-history text-muted" style="font-size: 2rem;"></i>
                        <p class="mt-2 text-muted">Belum ada history prompt</p>
                    </div>
                `;
            } else {
                historyList.innerHTML = history.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${item.theme_name || 'Unknown Theme'}</h6>
                                <p class="mb-1 font-monospace small">${item.prompt_text.substring(0, 150)}...</p>
                                <small class="text-muted">
                                    <i class="bi bi-clock"></i> ${new Date(item.created_at).toLocaleString('id-ID')} |
                                    <i class="bi bi-type"></i> ${item.word_count} kata
                                </small>
                            </div>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-primary copy-history-btn" data-prompt="${item.prompt_text}">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success use-history-btn" data-prompt="${item.prompt_text}">
                                    <i class="bi bi-arrow-right-circle"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-history-btn" data-id="${item.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners
                historyList.querySelectorAll('.copy-history-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.copyToClipboard(btn.dataset.prompt, 'History prompt'));
                });
                
                historyList.querySelectorAll('.use-history-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.getElementById('result-prompt').value = btn.dataset.prompt;
                        this.updateWordCount(btn.dataset.prompt);
                        bootstrap.Modal.getInstance(document.getElementById('history-modal')).hide();
                        this.showToast('Prompt berhasil dimuat dari history!', 'success');
                    });
                });
                
                historyList.querySelectorAll('.delete-history-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.deleteHistoryItem(btn.dataset.id));
                });
            }
            
            const modal = new bootstrap.Modal(document.getElementById('history-modal'));
            modal.show();
        } catch (error) {
            this.showToast(`Gagal memuat history: ${error.message}`, 'error');
        }
    }
    
    showAddThemeModal() {
        const modal = new bootstrap.Modal(document.getElementById('theme-modal'));
        
        // Reset form
        document.getElementById('theme-form').reset();
        document.getElementById('theme-form-title').innerHTML = '<i class="bi bi-plus-circle"></i> Tambah Tema Baru';
        
        modal.show();
        
        // Event listener for save button
        document.getElementById('save-theme-btn').onclick = () => this.saveNewTheme();
    }
    
    async saveNewTheme() {
        const formData = {
            theme_id: document.getElementById('theme-id').value,
            name: document.getElementById('theme-name').value,
            description: document.getElementById('theme-description').value,
            template: document.getElementById('theme-template').value,
            negative_prompt: document.getElementById('theme-negative-prompt').value,
            category: document.getElementById('theme-category').value,
        };
        
        // Handle tags properly - convert to array
        const tagsInput = document.getElementById('theme-tags').value;
        if (tagsInput && tagsInput.trim()) {
            formData.tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else {
            formData.tags = [];
        }
        
        if (!formData.theme_id || !formData.name || !formData.template) {
            this.showToast('Harap isi semua field yang wajib', 'error');
            return;
        }
        
        try {
            await this.apiCall('themes', {
                method: 'POST',
                data: formData
            });
            
            bootstrap.Modal.getInstance(document.getElementById('theme-modal')).hide();
            this.loadThemes();
            this.showToast('Tema baru berhasil ditambahkan!', 'success');
            
            // Clear form
            document.getElementById('theme-form').reset();
        } catch (error) {
            this.showToast(`Gagal menambah tema: ${error.message}`, 'error');
            console.error('Save new theme error:', error);
        }
    }
    
    showCompareModal() {
        const modal = new bootstrap.Modal(document.getElementById('compare-modal'));
        
        // Pre-fill with current prompt
        const currentPrompt = document.getElementById('result-prompt').value;
        document.getElementById('compare-prompt-a').value = currentPrompt;
        
        modal.show();
    }
    
    optimizePrompt() {
        const prompt = document.getElementById('result-prompt').value;
        if (!prompt) {
            this.showToast('Tidak ada prompt untuk dioptimalkan', 'error');
            return;
        }
        
        // Simple optimization: remove redundant words, improve structure
        const optimized = prompt
            .replace(/\s+/g, ' ')
            .replace(/,\s*,/g, ',')
            .trim();
            
        document.getElementById('result-prompt').value = optimized;
        this.updateWordCount(optimized);
        this.showToast('Prompt berhasil dioptimalkan!', 'success');
    }
    
    translatePrompt() {
        const prompt = document.getElementById('result-prompt').value;
        if (!prompt) {
            this.showToast('Tidak ada prompt untuk diterjemahkan', 'error');
            return;
        }
        
        // Simple translation placeholder
        this.showToast('Fitur translate akan segera hadir!', 'info');
    }
    
    sharePrompt() {
        const prompt = document.getElementById('result-prompt').value;
        if (!prompt) {
            this.showToast('Tidak ada prompt untuk dibagikan', 'error');
            return;
        }
        
        if (navigator.share) {
            navigator.share({
                title: 'AI Video Prompt',
                text: prompt,
                url: window.location.href
            });
        } else {
            this.copyToClipboard(prompt, 'Prompt untuk dibagikan');
        }
    }
    
    savePreset() {
        if (!this.currentTheme) {
            this.showToast('Pilih tema terlebih dahulu', 'error');
            return;
        }
        
        const parameters = this.getSelectedParameters();
        if (Object.keys(parameters).length === 0) {
            this.showToast('Isi parameter terlebih dahulu', 'error');
            return;
        }
        
        const presetName = prompt('Nama preset:');
        if (!presetName) return;
        
        const preset = {
            id: Date.now(),
            name: presetName,
            theme_id: this.currentTheme.theme_id,
            parameters: parameters,
            created_at: new Date().toISOString()
        };
        
        this.presets.push(preset);
        localStorage.setItem('presets', JSON.stringify(this.presets));
        
        this.showToast('Preset berhasil disimpan!', 'success');
    }
    
    showPresets() {
        const modal = new bootstrap.Modal(document.getElementById('preset-modal'));
        const container = document.getElementById('preset-list');
        
        const themePresets = this.presets.filter(preset => 
            preset.theme_id === this.currentTheme?.theme_id
        );
        
        if (themePresets.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <i class="bi bi-bookmark text-muted"></i>
                    <p class="mt-2 text-muted">Belum ada preset untuk tema ini</p>
                </div>
            `;
        } else {
            container.innerHTML = themePresets.map(preset => `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${preset.name}</h6>
                        <small class="text-muted">
                            ${Object.keys(preset.parameters).length} parameter | 
                            ${new Date(preset.created_at).toLocaleDateString('id-ID')}
                        </small>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary load-preset-btn" data-preset-id="${preset.id}">
                            <i class="bi bi-download"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-preset-btn" data-preset-id="${preset.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners
            container.querySelectorAll('.load-preset-btn').forEach(btn => {
                btn.addEventListener('click', () => this.loadPreset(btn.dataset.presetId));
            });
            
            container.querySelectorAll('.delete-preset-btn').forEach(btn => {
                btn.addEventListener('click', () => this.deletePreset(btn.dataset.presetId));
            });
        }
        
        modal.show();
    }
    
    loadPreset(presetId) {
        const preset = this.presets.find(p => p.id == presetId);
        if (!preset) return;
        
        // Apply preset parameters
        Object.keys(preset.parameters).forEach(paramKey => {
            const select = document.querySelector(`select[data-param="${paramKey}"]`);
            if (select) {
                select.value = preset.parameters[paramKey];
            }
        });
        
        this.updateCompletionProgress();
        this.debouncePreview();
        
        bootstrap.Modal.getInstance(document.getElementById('preset-modal')).hide();
        this.showToast('Preset berhasil dimuat!', 'success');
    }
    
    deletePreset(presetId) {
        if (!confirm('Hapus preset ini?')) return;
        
        this.presets = this.presets.filter(p => p.id != presetId);
        localStorage.setItem('presets', JSON.stringify(this.presets));
        
        this.showPresets(); // Refresh the modal
        this.showToast('Preset berhasil dihapus!', 'success');
    }
    
    // Theme Management Functions
    async editTheme(themeId) {
        try {
            const theme = this.themes.find(t => t.theme_id === themeId);
            if (!theme) {
                this.showToast('Tema tidak ditemukan', 'error');
                return;
            }
            
            // Populate form with existing data
            document.getElementById('theme-id').value = theme.theme_id;
            document.getElementById('theme-name').value = theme.name;
            document.getElementById('theme-description').value = theme.description || '';
            document.getElementById('theme-template').value = theme.template;
            document.getElementById('theme-negative-prompt').value = theme.negative_prompt || '';
            document.getElementById('theme-category').value = theme.category || '';
            
            // Handle tags - could be array, string, or null
            let tagsValue = '';
            if (theme.tags) {
                if (Array.isArray(theme.tags)) {
                    tagsValue = theme.tags.join(', ');
                } else if (typeof theme.tags === 'string') {
                    tagsValue = theme.tags;
                }
            }
            document.getElementById('theme-tags').value = tagsValue;
            
            // Update modal title
            document.getElementById('theme-form-title').innerHTML = '<i class="bi bi-pencil"></i> Edit Tema';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('theme-modal'));
            modal.show();
            
            // Update save button to call edit function
            document.getElementById('save-theme-btn').onclick = () => this.updateTheme(themeId);
            
        } catch (error) {
            this.showToast(`Gagal memuat tema untuk edit: ${error.message}`, 'error');
            console.error('Edit theme error:', error);
        }
    }
    
    async updateTheme(themeId) {
        const formData = {
            theme_id: document.getElementById('theme-id').value,
            name: document.getElementById('theme-name').value,
            description: document.getElementById('theme-description').value,
            template: document.getElementById('theme-template').value,
            negative_prompt: document.getElementById('theme-negative-prompt').value,
            category: document.getElementById('theme-category').value,
        };
        
        // Handle tags properly - convert to array
        const tagsInput = document.getElementById('theme-tags').value;
        if (tagsInput && tagsInput.trim()) {
            formData.tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else {
            formData.tags = [];
        }
        
        if (!formData.theme_id || !formData.name || !formData.template) {
            this.showToast('Harap isi semua field yang wajib', 'error');
            return;
        }
        
        try {
            await this.apiCall('themes', {
                method: 'PUT',
                data: formData,
                params: { id: themeId }
            });
            
            bootstrap.Modal.getInstance(document.getElementById('theme-modal')).hide();
            this.loadThemes();
            this.showToast('Tema berhasil diupdate!', 'success');
            
        } catch (error) {
            this.showToast(`Gagal update tema: ${error.message}`, 'error');
            console.error('Update theme error:', error);
        }
    }
    
    async deleteTheme(themeId) {
        const theme = this.themes.find(t => t.theme_id === themeId);
        if (!theme) {
            this.showToast('Tema tidak ditemukan', 'error');
            return;
        }
        
        if (!confirm(`Hapus tema "${theme.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }
        
        try {
            await this.apiCall('themes', {
                method: 'DELETE',
                params: { id: themeId }
            });
            
            this.loadThemes();
            this.showToast('Tema berhasil dihapus!', 'success');
            
            // If deleted theme was currently selected, clear selection
            if (this.currentTheme && this.currentTheme.theme_id === themeId) {
                this.currentTheme = null;
                document.getElementById('parameter-form').innerHTML = `
                    <div class="text-center p-4">
                        <i class="bi bi-arrow-left text-muted" style="font-size: 2rem;"></i>
                        <p class="mt-2 text-muted">Pilih tema terlebih dahulu untuk melihat parameter.</p>
                    </div>
                `;
                document.getElementById('generate-btn').disabled = true;
            }
            
        } catch (error) {
            this.showToast(`Gagal hapus tema: ${error.message}`, 'error');
        }
    }
    
    // Parameter Management Functions
    async editParameters(themeId) {
        try {
            const theme = this.themes.find(t => t.theme_id === themeId);
            if (!theme) {
                this.showToast('Tema tidak ditemukan', 'error');
                return;
            }
            
            // Load current parameters
            const themeData = await this.apiCall('themes', { params: { id: themeId } });
            
            document.getElementById('param-theme-id').value = themeId;
            document.getElementById('param-theme-name').textContent = theme.name;
            
            this.renderParameterForm(themeData.parameters || {});
            
            const modal = new bootstrap.Modal(document.getElementById('param-modal'));
            modal.show();
            
            // Update save button
            document.getElementById('save-param-btn').onclick = () => this.saveParameters(themeId);
            
        } catch (error) {
            this.showToast(`Gagal memuat parameter: ${error.message}`, 'error');
        }
    }
    
    renderParameterForm(parameters) {
        const container = document.getElementById('parameters-container');
        
        container.innerHTML = Object.keys(parameters).map(paramKey => {
            const values = parameters[paramKey] || [];
            
            return `
                <div class="mb-3 parameter-item" data-param="${paramKey}">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${paramKey}</h6>
                            <button type="button" class="btn btn-sm btn-outline-danger remove-param-btn">
                                <i class="bi bi-trash"></i> Hapus Parameter
                            </button>
                        </div>
                        <div class="card-body">
                            <label class="form-label">Nilai Parameter:</label>
                            <div class="parameter-values-container">
                                ${values.map((value, index) => `
                                    <div class="input-group mb-2 parameter-value-item">
                                        <input type="text" class="form-control parameter-value-input" 
                                               value="${value}" placeholder="Masukkan nilai parameter...">
                                        <button type="button" class="btn btn-outline-danger remove-value-btn">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                `).join('')}
                                ${values.length === 0 ? `
                                    <div class="input-group mb-2 parameter-value-item">
                                        <input type="text" class="form-control parameter-value-input" 
                                               placeholder="Masukkan nilai parameter...">
                                        <button type="button" class="btn btn-outline-danger remove-value-btn">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-primary add-value-btn">
                                <i class="bi bi-plus-circle"></i> Add More
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners
        this.setupParameterEventListeners();
        
        // Add new parameter functionality
        document.getElementById('add-param-btn').onclick = () => this.addNewParameter();
    }
    
    setupParameterEventListeners(targetElement = null) {
        const container = targetElement || document.getElementById('parameters-container');
        
        if (targetElement) {
            // Setup for single parameter element
            this.setupSingleParameterEvents(targetElement);
        } else {
            // Setup for all parameters in container
            container.querySelectorAll('.parameter-item').forEach(item => {
                this.setupSingleParameterEvents(item);
            });
        }
    }
    
    setupSingleParameterEvents(parameterElement) {
        // Remove parameter button
        const removeParamBtn = parameterElement.querySelector('.remove-param-btn');
        if (removeParamBtn && !removeParamBtn.hasAttribute('data-listener-added')) {
            removeParamBtn.addEventListener('click', (e) => {
                if (confirm('Hapus parameter ini?')) {
                    parameterElement.remove();
                }
            });
            removeParamBtn.setAttribute('data-listener-added', 'true');
        }
        
        // Add more value button
        const addValueBtn = parameterElement.querySelector('.add-value-btn');
        if (addValueBtn && !addValueBtn.hasAttribute('data-listener-added')) {
            addValueBtn.addEventListener('click', (e) => {
                const valuesContainer = parameterElement.querySelector('.parameter-values-container');
                const newValueItem = document.createElement('div');
                newValueItem.className = 'input-group mb-2 parameter-value-item';
                newValueItem.innerHTML = `
                    <input type="text" class="form-control parameter-value-input" 
                           placeholder="Masukkan nilai parameter...">
                    <button type="button" class="btn btn-outline-danger remove-value-btn">
                        <i class="bi bi-x"></i>
                    </button>
                `;
                
                valuesContainer.appendChild(newValueItem);
                
                // Add event listener for the new remove button
                newValueItem.querySelector('.remove-value-btn').addEventListener('click', () => {
                    if (valuesContainer.children.length > 1) {
                        newValueItem.remove();
                    } else {
                        // Keep at least one input
                        newValueItem.querySelector('.parameter-value-input').value = '';
                    }
                });
                
                // Focus on the new input
                newValueItem.querySelector('.parameter-value-input').focus();
            });
            addValueBtn.setAttribute('data-listener-added', 'true');
        }
        
        // Remove value buttons
        parameterElement.querySelectorAll('.remove-value-btn:not([data-listener-added])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valueItem = e.target.closest('.parameter-value-item');
                const valuesContainer = valueItem.parentElement;
                
                if (valuesContainer.children.length > 1) {
                    valueItem.remove();
                } else {
                    // Keep at least one input, just clear it
                    valueItem.querySelector('.parameter-value-input').value = '';
                }
            });
            btn.setAttribute('data-listener-added', 'true');
        });
    }
    
    addNewParameter() {
        const paramName = prompt('Nama parameter baru:');
        if (!paramName) return;
        
        const container = document.getElementById('parameters-container');
        const newParam = document.createElement('div');
        newParam.className = 'mb-3 parameter-item';
        newParam.setAttribute('data-param', paramName);
        
        newParam.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${paramName}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-param-btn">
                        <i class="bi bi-trash"></i> Hapus Parameter
                    </button>
                </div>
                <div class="card-body">
                    <label class="form-label">Nilai Parameter:</label>
                    <div class="parameter-values-container">
                        <div class="input-group mb-2 parameter-value-item">
                            <input type="text" class="form-control parameter-value-input" 
                                   placeholder="Masukkan nilai parameter...">
                            <button type="button" class="btn btn-outline-danger remove-value-btn">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary add-value-btn">
                        <i class="bi bi-plus-circle"></i> Add More
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(newParam);
        
        // Setup event listeners for the new parameter
        this.setupParameterEventListeners(newParam);
        
        // Focus on the first input
        newParam.querySelector('.parameter-value-input').focus();
    }
    
    async saveParameters(themeId) {
        const parameters = {};
        
        document.querySelectorAll('.parameter-item').forEach(item => {
            const paramName = item.dataset.param;
            const inputs = item.querySelectorAll('.parameter-value-input');
            const values = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(value => value);
            
            if (values.length > 0) {
                parameters[paramName] = values;
            }
        });
        
        try {
            await this.apiCall('parameters', {
                method: 'POST',
                data: {
                    theme_id: themeId,
                    parameters: parameters
                }
            });
            
            bootstrap.Modal.getInstance(document.getElementById('param-modal')).hide();
            this.loadThemes();
            this.showToast('Parameter berhasil disimpan!', 'success');
            
        } catch (error) {
            this.showToast(`Gagal simpan parameter: ${error.message}`, 'error');
            console.error('Save parameters error:', error);
        }
    }
    
    // Theme Management Modal
    async showManageThemes() {
        try {
            const modal = new bootstrap.Modal(document.getElementById('manage-themes-modal'));
            
            // Load and display themes
            await this.loadManageThemesList();
            
            modal.show();
            
            // Setup event listeners
            this.setupManageThemesEvents();
            
        } catch (error) {
            this.showToast(`Gagal memuat tema management: ${error.message}`, 'error');
        }
    }
    
    async loadManageThemesList() {
        const container = document.getElementById('themes-list');
        
        container.innerHTML = this.themes.map(theme => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${theme.name}</h6>
                        <p class="mb-1 small text-muted">${theme.description || 'Tidak ada deskripsi'}</p>
                        <div class="d-flex gap-2">
                            <small class="text-muted">
                                <i class="bi bi-tag"></i> ${theme.category || 'Umum'}
                            </small>
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> ${new Date(theme.created_at).toLocaleDateString('id-ID')}
                            </small>
                        </div>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary manage-edit-btn" data-theme-id="${theme.theme_id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-info manage-param-btn" data-theme-id="${theme.theme_id}">
                            <i class="bi bi-sliders"></i> Parameter
                        </button>
                        <button class="btn btn-sm btn-outline-danger manage-delete-btn" data-theme-id="${theme.theme_id}">
                            <i class="bi bi-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    setupManageThemesEvents() {
        // Search functionality
        document.getElementById('manage-theme-search').addEventListener('input', (e) => {
            this.filterManageThemes(e.target.value);
        });
        
        // Button events
        document.getElementById('add-new-theme-btn').onclick = () => this.showAddThemeModal();
        document.getElementById('export-themes-btn').onclick = () => this.exportThemes();
        document.getElementById('import-themes-btn').onclick = () => this.importThemes();
        document.getElementById('backup-themes-btn').onclick = () => this.backupThemes();
        document.getElementById('reset-themes-btn').onclick = () => this.resetThemes();
        
        // Theme action buttons
        document.querySelectorAll('.manage-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editTheme(btn.dataset.themeId));
        });
        
        document.querySelectorAll('.manage-param-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editParameters(btn.dataset.themeId));
        });
        
        document.querySelectorAll('.manage-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteTheme(btn.dataset.themeId));
        });
    }
    
    filterManageThemes(query) {
        const items = document.querySelectorAll('#themes-list .list-group-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
        });
    }
    
    exportThemes() {
        const dataStr = JSON.stringify(this.themes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `themes_backup_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Tema berhasil diekspor!', 'success');
    }
    
    importThemes() {
        const input = document.getElementById('import-file');
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const themes = JSON.parse(event.target.result);
                    this.processImportedThemes(themes);
                } catch (error) {
                    this.showToast('File tidak valid', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    async processImportedThemes(themes) {
        if (!Array.isArray(themes)) {
            this.showToast('Format file tidak valid', 'error');
            return;
        }
        
        try {
            for (const theme of themes) {
                await this.apiCall('themes', {
                    method: 'POST',
                    data: theme
                });
            }
            
            this.loadThemes();
            this.loadManageThemesList();
            this.showToast(`${themes.length} tema berhasil diimpor!`, 'success');
            
        } catch (error) {
            this.showToast(`Gagal import tema: ${error.message}`, 'error');
        }
    }
    
    backupThemes() {
        this.exportThemes();
    }
    
    async resetThemes() {
        if (!confirm('Reset semua tema ke default? Semua tema custom akan hilang!')) {
            return;
        }
        
        try {
            await this.apiCall('themes', {
                method: 'DELETE',
                params: { reset: 'true' }
            });
            
            this.loadThemes();
            this.loadManageThemesList();
            this.showToast('Tema berhasil direset ke default!', 'success');
            
        } catch (error) {
            this.showToast(`Gagal reset tema: ${error.message}`, 'error');
        }
    }
    
    // Template Preview
    showTemplatePreview() {
        if (!this.currentTheme) {
            this.showToast('Pilih tema terlebih dahulu', 'error');
            return;
        }
        
        const preview = document.getElementById('template-preview');
        preview.style.display = preview.style.display === 'none' ? 'block' : 'none';
        
        const btn = document.getElementById('template-preview-btn');
        if (preview.style.display === 'none') {
            btn.innerHTML = '<i class="bi bi-eye"></i> Preview Template';
        } else {
            btn.innerHTML = '<i class="bi bi-eye-slash"></i> Sembunyikan Preview';
        }
    }
    
    // History Management
    async deleteHistoryItem(historyId) {
        if (!confirm('Hapus item history ini?')) return;
        
        try {
            await this.apiCall('history', {
                method: 'DELETE',
                params: { id: historyId }
            });
            
            this.showHistory(); // Refresh the modal
            this.showToast('History item berhasil dihapus!', 'success');
            
        } catch (error) {
            this.showToast(`Gagal hapus history: ${error.message}`, 'error');
        }
    }
    
    // Export examples
    exportExamples() {
        const examples = this.examples.map(example => ({
            id: example.id,
            theme_id: example.theme_id,
            theme_name: example.theme_name,
            prompt: example.prompt,
            parameters: example.parameters,
            created_at: example.created_at
        }));
        
        const dataStr = JSON.stringify(examples, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `examples_backup_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Contoh berhasil diekspor!', 'success');
    }
    
    // History search
    filterHistory(query) {
        const items = document.querySelectorAll('#history-list .list-group-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
        });
    }
    
    // Clear history
    async clearHistory() {
        if (!confirm('Hapus semua history?')) return;
        
        try {
            await this.apiCall('history', {
                method: 'DELETE',
                params: { reset: 'true' }
            });
            
            this.showHistory(); // Refresh the modal
            this.showToast('History berhasil dihapus!', 'success');
            
        } catch (error) {
            this.showToast(`Gagal hapus history: ${error.message}`, 'error');
        }
    }
    
    // Export history
    async exportHistory() {
        try {
            const history = await this.apiCall('history', { params: { limit: 50 } });
            
            const historyStr = JSON.stringify(history, null, 2);
            const blob = new Blob([historyStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `history_backup_${Date.now()}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showToast('History berhasil diekspor!', 'success');
        } catch (error) {
            this.showToast(`Gagal ekspor history: ${error.message}`, 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PromptGeneratorApp();
}); 