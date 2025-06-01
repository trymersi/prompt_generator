// Real-time Preview System

class RealTimePreview {
    constructor() {
        this.previewContainer = null;
        this.previewContent = null;
        this.lastUpdateTime = 0;
        this.updateDelay = 300; // Debounce delay in ms
        this.updateTimeout = null;
        
        this.initPreviewUI();
        this.bindEvents();
    }

    initPreviewUI() {
        // Add preview styles
        const style = document.createElement('style');
        style.textContent = `
            .preview-container {
                background: var(--bs-light);
                border: 2px dashed var(--bs-border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                margin-bottom: 1rem;
                min-height: 120px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .preview-container.has-content {
                background: var(--bs-body-bg);
                border: 2px solid var(--bs-primary);
                box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
            }

            .preview-header {
                display: flex;
                justify-content: between;
                align-items: center;
                margin-bottom: 0.75rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--bs-border-color);
            }

            .preview-title {
                font-weight: 600;
                color: var(--bs-primary);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .preview-stats {
                font-size: 0.875rem;
                color: var(--bs-text-muted);
                display: flex;
                gap: 1rem;
            }

            .preview-content {
                line-height: 1.6;
                color: var(--bs-body-color);
                font-size: 0.95rem;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            .preview-content.empty {
                color: var(--bs-text-muted);
                font-style: italic;
                text-align: center;
                padding: 2rem 1rem;
            }

            .preview-animation {
                position: absolute;
                top: 0;
                left: -100%;
                height: 100%;
                width: 100%;
                background: linear-gradient(90deg, transparent, rgba(var(--bs-primary-rgb), 0.1), transparent);
                animation: previewUpdateShimmer 0.8s ease-out;
            }

            @keyframes previewUpdateShimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            .parameter-highlight {
                background: var(--bs-warning-bg-subtle);
                color: var(--bs-warning-text);
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-weight: 500;
                display: inline-block;
                margin: 0.125rem;
                border: 1px solid var(--bs-warning-border-subtle);
            }

            .parameter-missing {
                background: var(--bs-danger-bg-subtle);
                color: var(--bs-danger-text);
                border: 1px solid var(--bs-danger-border-subtle);
            }

            .preview-actions {
                margin-top: 0.75rem;
                padding-top: 0.75rem;
                border-top: 1px solid var(--bs-border-color);
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .preview-toggle {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                z-index: 10;
            }

            .preview-negative {
                background: var(--bs-secondary-bg);
                border-radius: 0.375rem;
                padding: 0.75rem;
                margin-top: 0.75rem;
                border-left: 4px solid var(--bs-warning);
            }

            .preview-negative .preview-title {
                color: var(--bs-warning);
                font-size: 0.9rem;
            }

            .completion-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }

            .completion-bar {
                flex: 1;
                height: 4px;
                background: var(--bs-border-color);
                border-radius: 2px;
                overflow: hidden;
            }

            .completion-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--bs-success), var(--bs-info));
                transition: width 0.3s ease;
                border-radius: 2px;
            }

            .completion-text {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--bs-success);
            }
        `;
        document.head.appendChild(style);
    }

    createPreviewContainer() {
        if (this.previewContainer) return this.previewContainer;

        const container = document.createElement('div');
        container.className = 'preview-container';
        container.innerHTML = `
            <button class="btn btn-outline-secondary btn-sm preview-toggle" onclick="this.closest('.preview-container').style.display='none'">
                <i class="bi bi-x"></i>
            </button>
            <div class="preview-header">
                <div class="preview-title">
                    <i class="bi bi-eye"></i>
                    Preview Real-time
                </div>
                <div class="preview-stats">
                    <span id="preview-words">0 kata</span>
                    <span id="preview-chars">0 karakter</span>
                </div>
            </div>
            <div class="preview-content empty" id="preview-content">
                Pilih tema dan isi parameter untuk melihat preview prompt...
            </div>
            <div class="completion-indicator">
                <div class="completion-bar">
                    <div class="completion-fill" id="completion-fill" style="width: 0%"></div>
                </div>
                <span class="completion-text" id="completion-text">0%</span>
            </div>
            <div class="preview-negative" id="preview-negative" style="display: none;">
                <div class="preview-title">
                    <i class="bi bi-dash-circle"></i>
                    Negative Prompt
                </div>
                <div class="preview-content" id="preview-negative-content"></div>
            </div>
            <div class="preview-actions">
                <button class="btn btn-primary btn-sm" onclick="generatePrompt()">
                    <i class="bi bi-magic"></i> Generate
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="realTimePreview.copyPreview()">
                    <i class="bi bi-clipboard"></i> Copy Preview
                </button>
                <button class="btn btn-outline-info btn-sm" onclick="realTimePreview.toggleHighlight()">
                    <i class="bi bi-highlighter"></i> Highlight
                </button>
            </div>
        `;

        this.previewContainer = container;
        this.previewContent = container.querySelector('#preview-content');
        
        return container;
    }

    addToForm(formContainer) {
        const preview = this.createPreviewContainer();
        formContainer.insertBefore(preview, formContainer.querySelector('form'));
    }

    bindEvents() {
        // Listen for parameter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('select[data-param], input[data-param]')) {
                this.scheduleUpdate();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('input[data-param]')) {
                this.scheduleUpdate();
            }
        });

        // Listen for theme changes
        document.addEventListener('themeChanged', () => {
            this.scheduleUpdate();
        });
    }

    scheduleUpdate() {
        // Clear existing timeout
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        // Schedule new update with debounce
        this.updateTimeout = setTimeout(() => {
            this.updatePreview();
        }, this.updateDelay);
    }

    updatePreview() {
        if (!currentTheme || !this.previewContainer) return;

        const template = currentTheme.template || '';
        const negativeTemplate = currentTheme.negativePrompt || '';
        const parameters = config.parameters[currentTheme.id] || {};

        // Collect current parameter values
        const parameterValues = {};
        let filledCount = 0;
        const totalCount = Object.keys(parameters).length;

        Object.keys(parameters).forEach(paramName => {
            const element = document.querySelector(`[data-param="${paramName}"]`);
            if (element) {
                const value = element.value || '';
                parameterValues[paramName] = value;
                if (value.trim()) filledCount++;
            }
        });

        // Generate preview
        const preview = this.generatePreviewText(template, parameterValues);
        const negativePreview = negativeTemplate ? 
            this.generatePreviewText(negativeTemplate, parameterValues) : '';

        // Update preview content
        this.displayPreview(preview, negativePreview);
        
        // Update stats
        this.updateStats(preview);
        
        // Update completion
        this.updateCompletion(filledCount, totalCount);

        // Add update animation
        this.showUpdateAnimation();
    }

    generatePreviewText(template, parameters) {
        let result = template;
        const missingParams = [];

        // Replace parameters
        Object.keys(parameters).forEach(paramName => {
            const value = parameters[paramName];
            const pattern = new RegExp(`\\[${paramName}\\]`, 'g');
            
            if (value && value.trim()) {
                result = result.replace(pattern, value);
            } else {
                missingParams.push(paramName);
            }
        });

        // Highlight missing parameters
        missingParams.forEach(param => {
            const pattern = new RegExp(`\\[${param}\\]`, 'g');
            result = result.replace(pattern, `[${param}]`);
        });

        return result;
    }

    displayPreview(mainPreview, negativePreview = '') {
        if (!this.previewContent) return;

        const isEmpty = !currentTheme || !mainPreview.trim();
        
        if (isEmpty) {
            this.previewContent.textContent = 'Pilih tema dan isi parameter untuk melihat preview prompt...';
            this.previewContent.className = 'preview-content empty';
            this.previewContainer.className = 'preview-container';
        } else {
            // Process preview for highlighting
            const processedPreview = this.highlightParameters(mainPreview);
            this.previewContent.innerHTML = processedPreview;
            this.previewContent.className = 'preview-content';
            this.previewContainer.className = 'preview-container has-content';
        }

        // Update negative preview
        const negativeContainer = document.getElementById('preview-negative');
        const negativeContent = document.getElementById('preview-negative-content');
        
        if (negativePreview && negativeContent) {
            negativeContent.innerHTML = this.highlightParameters(negativePreview);
            negativeContainer.style.display = 'block';
        } else if (negativeContainer) {
            negativeContainer.style.display = 'none';
        }
    }

    highlightParameters(text) {
        // Highlight remaining parameters (not filled)
        return text.replace(/\[([^\]]+)\]/g, (match, param) => {
            return `<span class="parameter-highlight parameter-missing">${match}</span>`;
        });
    }

    updateStats(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;

        const wordsElement = document.getElementById('preview-words');
        const charsElement = document.getElementById('preview-chars');

        if (wordsElement) wordsElement.textContent = `${words} kata`;
        if (charsElement) charsElement.textContent = `${chars} karakter`;
    }

    updateCompletion(filled, total) {
        const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;
        
        const fillElement = document.getElementById('completion-fill');
        const textElement = document.getElementById('completion-text');

        if (fillElement) fillElement.style.width = `${percentage}%`;
        if (textElement) {
            textElement.textContent = `${percentage}%`;
            textElement.style.color = percentage === 100 ? 'var(--bs-success)' : 
                                   percentage >= 50 ? 'var(--bs-warning)' : 'var(--bs-danger)';
        }
    }

    showUpdateAnimation() {
        if (!this.previewContainer) return;

        // Remove existing animation
        const existingAnimation = this.previewContainer.querySelector('.preview-animation');
        if (existingAnimation) {
            existingAnimation.remove();
        }

        // Add new animation
        const animation = document.createElement('div');
        animation.className = 'preview-animation';
        this.previewContainer.appendChild(animation);

        // Remove animation after it completes
        setTimeout(() => {
            animation.remove();
        }, 800);
    }

    copyPreview() {
        if (!this.previewContent) return;

        const text = this.previewContent.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
            showToast('Preview berhasil di-copy!', 'success');
        }).catch(() => {
            showToast('Gagal copy preview', 'error');
        });
    }

    toggleHighlight() {
        if (!this.previewContent) return;

        const highlights = this.previewContent.querySelectorAll('.parameter-highlight');
        highlights.forEach(highlight => {
            highlight.style.display = highlight.style.display === 'none' ? '' : 'none';
        });
    }

    // Enhanced preview features
    showParameterTooltips() {
        const highlights = this.previewContent.querySelectorAll('.parameter-highlight');
        highlights.forEach(highlight => {
            highlight.addEventListener('mouseenter', (e) => {
                const param = e.target.textContent.replace(/[\[\]]/g, '');
                this.showTooltip(e.target, `Parameter: ${param}\nKlik untuk mengisi nilai`);
            });

            highlight.addEventListener('click', (e) => {
                const param = e.target.textContent.replace(/[\[\]]/g, '');
                this.focusParameter(param);
            });
        });
    }

    focusParameter(paramName) {
        const element = document.querySelector(`[data-param="${paramName}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            
            // Highlight the element temporarily
            element.style.boxShadow = '0 0 0 3px rgba(var(--bs-primary-rgb), 0.25)';
            setTimeout(() => {
                element.style.boxShadow = '';
            }, 2000);
        }
    }

    showTooltip(element, text) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'position-absolute bg-dark text-white p-2 rounded small';
        tooltip.style.zIndex = '9999';
        tooltip.style.top = '100%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.textContent = text;

        element.style.position = 'relative';
        element.appendChild(tooltip);

        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }

    // Auto-save preview state
    savePreviewState() {
        const state = {
            visible: this.previewContainer && this.previewContainer.style.display !== 'none',
            position: 'top' // Could be expanded for different positions
        };
        
        localStorage.setItem('previewState', JSON.stringify(state));
    }

    loadPreviewState() {
        const saved = localStorage.getItem('previewState');
        if (saved) {
            const state = JSON.parse(saved);
            // Apply saved state
            if (this.previewContainer && !state.visible) {
                this.previewContainer.style.display = 'none';
            }
        }
    }
}

// Initialize real-time preview
let realTimePreview;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimePreview;
} else {
    window.RealTimePreview = RealTimePreview;
} 