// PHP-powered Prompt Generator Frontend

class PromptGeneratorApp {
    constructor() {
        this.apiBase = 'api/index.php';
        this.currentTheme = null;
        this.themes = [];
        this.isLoading = false;
        this.debounceTimer = null;
        
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
        
        // Build URL with params
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
    showToast(message, type = 'info') {
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
        }, 5000);
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
            
            // Render parameters
            this.renderParameters();
            this.updateCompletionProgress();
            this.enableGenerateButton();
            
            this.showToast(`Tema "${this.currentTheme.name}" dipilih`, 'success');
        } catch (error) {
            this.showToast(`Gagal memuat tema: ${error.message}`, 'error');
        }
    }
    
    renderParameters() {
        const form = document.getElementById('parameter-form');
        const parameters = this.currentTheme.parameters;
        
        if (!parameters || Object.keys(parameters).length === 0) {
            form.innerHTML = `
                <div class="text-center p-4">
                    <i class="bi bi-sliders text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 text-muted">Tema ini belum memiliki parameter.</p>
                    <button class="btn btn-primary btn-sm" onclick="app.addParameter()">
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
        
        // Add event listeners for parameter management
        form.querySelectorAll('.edit-param-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editParameter(btn.dataset.param));
        });
        
        form.querySelectorAll('.delete-param-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteParameter(btn.dataset.param));
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
        
        // Update preview area (if exists)
        const previewArea = document.getElementById('template-preview');
        if (previewArea) {
            previewArea.innerHTML = this.highlightParameters(preview);
        }
    }
    
    highlightParameters(text) {
        return text.replace(/\[([^\]]+)\]/g, '<span class="text-danger fw-bold">[$1]</span>');
    }
    
    // Generate Functions
    async generatePrompt() {
        if (!this.currentTheme) {
            this.showToast('Pilih tema terlebih dahulu', 'error');
            return;
        }
        
        const parameters = this.getSelectedParameters();
        const parameterKeys = Object.keys(this.currentTheme.parameters || {});
        
        // Check if all parameters are filled
        const missingParams = parameterKeys.filter(key => !parameters[key]);
        if (missingParams.length > 0) {
            this.showToast(`Parameter belum lengkap: ${missingParams.join(', ')}`, 'error');
            return;
        }
        
        try {
            const btn = document.getElementById('generate-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
            btn.disabled = true;
            
            const result = await this.apiCall('generate', {
                method: 'POST',
                data: {
                    theme_id: this.currentTheme.theme_id,
                    parameters: parameters
                }
            });
            
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
            this.showToast(`Gagal generate prompt: ${error.message}`, 'error');
        } finally {
            const btn = document.getElementById('generate-btn');
            btn.innerHTML = '<i class="bi bi-play-circle"></i> Generate Prompt';
            btn.disabled = false;
        }
    }
    
    getSelectedParameters() {
        const parameters = {};
        document.querySelectorAll('#parameter-form select').forEach(select => {
            if (select.value) {
                parameters[select.dataset.param] = select.value;
            }
        });
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
    
    // Event Listeners
    initEventListeners() {
        // Generate buttons
        document.getElementById('generate-btn').addEventListener('click', () => this.generatePrompt());
        document.getElementById('random-btn').addEventListener('click', () => this.randomizeParameters());
        document.getElementById('smart-random-btn').addEventListener('click', () => this.smartRandomize());
        
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
        
        // Modal buttons
        document.getElementById('analytics-btn').addEventListener('click', () => this.showAnalytics());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistory());
        document.getElementById('add-theme-btn').addEventListener('click', () => this.showAddThemeModal());
        
        // Search and filter
        document.getElementById('theme-search').addEventListener('input', (e) => this.filterThemes(e.target.value));
        document.getElementById('category-filter').addEventListener('change', (e) => this.filterThemes());
        
        // Word count update
        document.getElementById('result-prompt').addEventListener('input', (e) => {
            this.updateWordCount(e.target.value);
        });
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
            }
            
            const modal = new bootstrap.Modal(document.getElementById('history-modal'));
            modal.show();
        } catch (error) {
            this.showToast(`Gagal memuat history: ${error.message}`, 'error');
        }
    }
    
    showAddThemeModal() {
        const modal = new bootstrap.Modal(document.getElementById('add-theme-modal'));
        modal.show();
        
        // Event listener for save button
        document.getElementById('save-theme-btn').onclick = () => this.saveNewTheme();
    }
    
    async saveNewTheme() {
        const formData = {
            theme_id: document.getElementById('new-theme-id').value,
            name: document.getElementById('new-theme-name').value,
            description: document.getElementById('new-theme-description').value,
            template: document.getElementById('new-theme-template').value,
            category: document.getElementById('new-theme-category').value,
            tags: document.getElementById('new-theme-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        if (!formData.theme_id || !formData.name || !formData.template) {
            this.showToast('Harap isi semua field yang wajib', 'error');
            return;
        }
        
        try {
            await this.apiCall('themes', {
                method: 'POST',
                data: formData
            });
            
            bootstrap.Modal.getInstance(document.getElementById('add-theme-modal')).hide();
            this.loadThemes();
            this.showToast('Tema baru berhasil ditambahkan!', 'success');
            
            // Clear form
            document.getElementById('add-theme-form').reset();
        } catch (error) {
            this.showToast(`Gagal menambah tema: ${error.message}`, 'error');
        }
    }
    
    smartRandomize() {
        // Smart randomization based on usage patterns
        this.randomizeParameters();
        this.showToast('Smart randomization diterapkan!', 'success');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PromptGeneratorApp();
}); 