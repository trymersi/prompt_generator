// Smart Parameter Suggestions System

class SmartSuggestions {
    constructor() {
        this.parameterCategories = {
            'character': ['karakter', 'person', 'orang', 'manusia', 'figure'],
            'vehicle': ['kendaraan', 'mobil', 'motor', 'truck', 'vehicle', 'car'],
            'background': ['background', 'latar', 'scene', 'tempat', 'lokasi', 'setting'],
            'style': ['style', 'gaya', 'artistic', 'cinematic', 'mood'],
            'lighting': ['lighting', 'cahaya', 'illumination', 'brightness'],
            'weather': ['cuaca', 'weather', 'climate', 'kondisi'],
            'time': ['waktu', 'time', 'period', 'era'],
            'action': ['aksi', 'action', 'movement', 'activity'],
            'emotion': ['emosi', 'emotion', 'feeling', 'mood', 'expression'],
            'color': ['warna', 'color', 'hue', 'tone']
        };

        this.commonParameters = {
            'character': [
                'seorang pria dewasa',
                'seorang wanita muda',
                'anak-anak bermain',
                'orang tua bijaksana',
                'superhero',
                'karakter anime',
                'robot futuristik'
            ],
            'vehicle': [
                'mobil sport merah',
                'truck besar',
                'motor klasik',
                'pesawat terbang',
                'kapal layar',
                'kereta api',
                'sepeda vintage'
            ],
            'background': [
                'kota metropolitan',
                'hutan lebat',
                'pantai tropis',
                'gunung tinggi',
                'padang rumput',
                'ruang angkasa',
                'kastil tua'
            ],
            'style': [
                'realistis',
                'kartun',
                'anime',
                'cyberpunk',
                'steampunk',
                'minimalis',
                'vintage'
            ],
            'lighting': [
                'cahaya matahari pagi',
                'sinar golden hour',
                'lampu neon',
                'cahaya bulan',
                'pencahayaan dramatis',
                'soft lighting',
                'harsh shadows'
            ],
            'weather': [
                'cerah berawan',
                'hujan lebat',
                'salju turun',
                'badai petir',
                'kabut tebal',
                'angin kencang',
                'cuaca sempurna'
            ]
        };

        this.analytics = new Analytics();
        this.initSuggestionUI();
    }

    categorizeParameter(paramName) {
        const name = paramName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.parameterCategories)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    getSuggestionsForParameter(paramName, currentValue = '') {
        const category = this.categorizeParameter(paramName);
        const suggestions = new Set();

        // Add common suggestions for category
        if (this.commonParameters[category]) {
            this.commonParameters[category].forEach(suggestion => {
                if (suggestion.toLowerCase().includes(currentValue.toLowerCase())) {
                    suggestions.add(suggestion);
                }
            });
        }

        // Add frequently used values from analytics
        const popularParams = this.analytics.getPopularParameters();
        popularParams.forEach(({ param, value }) => {
            if (param.toLowerCase().includes(paramName.toLowerCase()) && 
                value.toLowerCase().includes(currentValue.toLowerCase())) {
                suggestions.add(value);
            }
        });

        return Array.from(suggestions).slice(0, 8);
    }

    createAutoCompleteInput(paramName, existingValues = []) {
        const container = document.createElement('div');
        container.className = 'autocomplete-container';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control autocomplete-input';
        input.placeholder = `Masukkan nilai untuk ${paramName}`;
        input.setAttribute('data-param', paramName);

        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'suggestions-list';

        container.appendChild(input);
        container.appendChild(suggestionsList);

        // Add existing values as options if available
        if (existingValues.length > 0) {
            const select = document.createElement('select');
            select.className = 'form-select mt-2';
            select.innerHTML = '<option value="">Pilih dari yang sudah ada...</option>';
            
            existingValues.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });

            select.addEventListener('change', (e) => {
                if (e.target.value) {
                    input.value = e.target.value;
                    input.dispatchEvent(new Event('input'));
                }
            });

            container.appendChild(select);
        }

        // Auto-complete functionality
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            const suggestions = this.getSuggestionsForParameter(paramName, value);
            
            this.showSuggestions(suggestionsList, suggestions, input);
        });

        input.addEventListener('focus', (e) => {
            const suggestions = this.getSuggestionsForParameter(paramName, e.target.value);
            this.showSuggestions(suggestionsList, suggestions, input);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                suggestionsList.innerHTML = '';
                suggestionsList.style.display = 'none';
            }
        });

        return container;
    }

    showSuggestions(container, suggestions, input) {
        container.innerHTML = '';
        
        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            
            item.addEventListener('click', () => {
                input.value = suggestion;
                container.innerHTML = '';
                container.style.display = 'none';
                input.dispatchEvent(new Event('input'));
            });
            
            container.appendChild(item);
        });
    }

    initSuggestionUI() {
        // Add suggestion toggle button to parameter form
        const style = document.createElement('style');
        style.textContent = `
            .autocomplete-container {
                position: relative;
                margin-bottom: 1rem;
            }
            
            .suggestions-list {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--bs-body-bg);
                border: 1px solid var(--bs-border-color);
                border-radius: 0.375rem;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
                box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            }
            
            .suggestion-item {
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                border-bottom: 1px solid var(--bs-border-color);
                transition: background-color 0.15s ease-in-out;
            }
            
            .suggestion-item:hover {
                background-color: var(--bs-secondary-bg);
            }
            
            .suggestion-item:last-child {
                border-bottom: none;
            }
            
            .parameter-suggestions {
                background: var(--bs-info-bg-subtle);
                border: 1px solid var(--bs-info-border-subtle);
                border-radius: 0.375rem;
                padding: 0.75rem;
                margin-bottom: 1rem;
            }
            
            .suggestion-chip {
                display: inline-block;
                background: var(--bs-primary);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                margin: 0.125rem;
                cursor: pointer;
                transition: all 0.15s ease-in-out;
            }
            
            .suggestion-chip:hover {
                background: var(--bs-primary-dark);
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }

    addParameterSuggestions(parameterForm) {
        // Add smart suggestions panel
        const suggestionsPanel = document.createElement('div');
        suggestionsPanel.className = 'parameter-suggestions';
        suggestionsPanel.innerHTML = `
            <h6><i class="bi bi-lightbulb"></i> Saran Parameter Cerdas</h6>
            <p class="small text-muted">Klik pada saran di bawah untuk mengisi parameter dengan cepat</p>
            <div id="smart-suggestions-content"></div>
        `;

        const formParent = parameterForm.parentNode;
        formParent.insertBefore(suggestionsPanel, parameterForm);

        this.updateSmartSuggestions();
    }

    updateSmartSuggestions() {
        const content = document.getElementById('smart-suggestions-content');
        if (!content || !currentTheme) return;

        const parameters = config.parameters[currentTheme.id];
        if (!parameters) return;

        content.innerHTML = '';

        // Popular combinations from analytics
        const popularParams = this.analytics.getPopularParameters(6);
        if (popularParams.length > 0) {
            const popularSection = document.createElement('div');
            popularSection.innerHTML = '<small class="text-muted">Populer:</small><br>';
            
            popularParams.forEach(({ param, value }) => {
                const chip = document.createElement('span');
                chip.className = 'suggestion-chip';
                chip.textContent = `${param}: ${value}`;
                chip.addEventListener('click', () => {
                    this.applyParameterSuggestion(param, value);
                });
                popularSection.appendChild(chip);
            });
            
            content.appendChild(popularSection);
        }

        // Category-based suggestions
        const categories = Object.keys(this.commonParameters);
        categories.forEach(category => {
            const categoryParams = Object.keys(parameters).filter(param => 
                this.categorizeParameter(param) === category
            );

            if (categoryParams.length > 0) {
                const categorySection = document.createElement('div');
                categorySection.className = 'mt-2';
                categorySection.innerHTML = `<small class="text-muted">${category.charAt(0).toUpperCase() + category.slice(1)}:</small><br>`;
                
                const suggestions = this.commonParameters[category].slice(0, 3);
                suggestions.forEach(suggestion => {
                    const chip = document.createElement('span');
                    chip.className = 'suggestion-chip';
                    chip.textContent = suggestion;
                    chip.addEventListener('click', () => {
                        // Apply to first parameter of this category
                        if (categoryParams.length > 0) {
                            this.applyParameterSuggestion(categoryParams[0], suggestion);
                        }
                    });
                    categorySection.appendChild(chip);
                });
                
                content.appendChild(categorySection);
            }
        });
    }

    applyParameterSuggestion(paramName, value) {
        const select = document.querySelector(`select[data-param="${paramName}"]`);
        const input = document.querySelector(`input[data-param="${paramName}"]`);
        
        if (select) {
            // Add value to select if not exists
            const exists = Array.from(select.options).some(option => option.value === value);
            if (!exists) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            }
            select.value = value;
            select.dispatchEvent(new Event('change'));
        } else if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input'));
        }

        showToast(`Parameter ${paramName} diisi dengan: ${value}`, 'success');
    }

    // Generate parameter suggestions based on theme context
    generateContextualSuggestions(themeId) {
        const theme = config.themes.find(t => t.id === themeId);
        if (!theme) return [];

        const suggestions = [];
        const themeName = theme.name.toLowerCase();

        // Analyze theme name for context
        if (themeName.includes('urban') || themeName.includes('kota')) {
            suggestions.push({
                category: 'background',
                values: ['gedung pencakar langit', 'jalan raya sibuk', 'taman kota']
            });
        }

        if (themeName.includes('nature') || themeName.includes('alam')) {
            suggestions.push({
                category: 'background',
                values: ['hutan rimba', 'danau jernih', 'padang bunga']
            });
        }

        return suggestions;
    }
}

// Initialize smart suggestions
let smartSuggestions;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartSuggestions;
} else {
    window.SmartSuggestions = SmartSuggestions;
} 