// Antarmuka untuk mengedit tema dan parameter
class ThemeEditor {
    constructor(themeManager) {
        this.themeManager = themeManager;
        this.currentThemeId = null;
        this.initEventListeners();
    }
    
    // Memasang event listener untuk UI
    initEventListeners() {
        // Tombol untuk menampilkan panel pengelolaan tema
        const manageThemesBtn = document.getElementById('manage-themes-btn');
        if (manageThemesBtn) {
            manageThemesBtn.addEventListener('click', () => this.showManageThemesModal());
        }
        
        // Tombol untuk menambah tema baru
        const addThemeBtn = document.getElementById('add-theme-btn');
        if (addThemeBtn) {
            addThemeBtn.addEventListener('click', () => this.showThemeForm());
        }
        
        // Form penyimpanan tema baru
        const themeForm = document.getElementById('theme-form');
        if (themeForm) {
            themeForm.addEventListener('submit', (e) => this.handleThemeSubmit(e));
        }
        
        // Form penyimpanan parameter
        const paramForm = document.getElementById('param-form');
        if (paramForm) {
            paramForm.addEventListener('submit', (e) => this.handleParameterSubmit(e));
        }
        
        // Tombol untuk menambah parameter
        const addParamBtn = document.getElementById('add-param-btn');
        if (addParamBtn) {
            addParamBtn.addEventListener('click', () => this.addParameterField());
        }
        
        // Import/Export buttons
        this.initImportExportListeners();
    }
    
    initImportExportListeners() {
        // Export themes
        const exportBtn = document.getElementById('export-themes-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.themeManager.exportThemes();
                showToast('Tema berhasil di-export!', 'success');
            });
        }

        // Import themes
        const importBtn = document.getElementById('import-themes-btn');
        const importFile = document.getElementById('import-file');
        
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.handleImport(e));
        }

        // Backup themes
        const backupBtn = document.getElementById('backup-themes-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.createBackup());
        }

        // Reset themes
        const resetBtn = document.getElementById('reset-themes-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetThemes());
        }
    }
    
    // Menampilkan panel pengelolaan tema
    showManageThemesModal() {
        this.populateThemesList();
        const modal = new bootstrap.Modal(document.getElementById('manage-themes-modal'));
        modal.show();
    }
    
    // Mengisi daftar tema untuk panel pengelolaan
    populateThemesList() {
        const themesList = document.getElementById('themes-list');
        const themes = this.themeManager.getAllThemes();
        
        themesList.innerHTML = '';

        if (themes.length === 0) {
            themesList.innerHTML = '<div class="text-muted text-center p-3">Tidak ada tema tersedia</div>';
            return;
        }

        themes.forEach(theme => {
            const themeItem = document.createElement('div');
            themeItem.classList.add('list-group-item');
            
            const paramCount = Object.keys(this.themeManager.getParameters(theme.id)).length;
            const exampleCount = this.themeManager.getExamples(theme.id).length;
            
            themeItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${theme.name}</h6>
                        <p class="mb-1 text-muted">${theme.description}</p>
                        <small class="text-muted">
                            <i class="bi bi-sliders"></i> ${paramCount} parameter | 
                            <i class="bi bi-collection"></i> ${exampleCount} contoh
                            ${theme.category ? ` | <i class="bi bi-tag"></i> ${theme.category}` : ''}
                        </small>
                    </div>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="themeEditor.editTheme('${theme.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="themeEditor.manageParameters('${theme.id}')">
                            <i class="bi bi-sliders"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm" onclick="themeEditor.duplicateTheme('${theme.id}')">
                            <i class="bi bi-files"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="themeEditor.deleteTheme('${theme.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            themesList.appendChild(themeItem);
        });
    }
    
    // Menampilkan form untuk menambah tema baru
    showThemeForm(themeId = null) {
        const modal = new bootstrap.Modal(document.getElementById('theme-modal'));
        const form = document.getElementById('theme-form');
        const title = document.getElementById('theme-form-title');
        
        // Reset form
        form.reset();
        
        if (themeId) {
            // Edit mode
            const theme = this.themeManager.getTheme(themeId);
            title.innerHTML = '<i class="bi bi-pencil"></i> Edit Tema';
            
            document.getElementById('theme-id').value = theme.id;
            document.getElementById('theme-id').readOnly = true;
            document.getElementById('theme-name').value = theme.name;
            document.getElementById('theme-description').value = theme.description || '';
            document.getElementById('theme-category').value = theme.category || '';
            document.getElementById('theme-tags').value = theme.tags ? theme.tags.join(', ') : '';
            document.getElementById('theme-template').value = theme.templateContent;
            document.getElementById('theme-negative-prompt').value = theme.negativePrompt || '';
            
            form.dataset.editMode = 'true';
            form.dataset.themeId = themeId;
        } else {
            // Add mode
            title.innerHTML = '<i class="bi bi-plus-circle"></i> Tambah Tema Baru';
            document.getElementById('theme-id').readOnly = false;
            document.getElementById('theme-negative-prompt').value = '';
            form.dataset.editMode = 'false';
        }
        
        modal.show();
    }
    
    // Menampilkan form untuk mengelola parameter
    manageParameters(themeId) {
        this.currentThemeId = themeId;
        const theme = this.themeManager.getTheme(themeId);
        const parameters = this.themeManager.getParameters(themeId);
        
        // Set theme name in modal
        document.getElementById('param-theme-name').textContent = theme.name;
        document.getElementById('param-theme-id').value = themeId;
        
        // Populate parameters
        this.populateParameterFields(parameters);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('param-modal'));
        modal.show();
    }
    
    populateParameterFields(parameters) {
        const container = document.getElementById('parameters-container');
        container.innerHTML = '';

        Object.entries(parameters).forEach(([paramName, paramValues]) => {
            this.addParameterField(paramName, paramValues);
        });

        // Add one empty field if no parameters
        if (Object.keys(parameters).length === 0) {
            this.addParameterField();
        }
    }
    
    // Menambahkan field parameter ke form
    addParameterField(paramName = '', paramValues = []) {
        const container = document.getElementById('parameters-container');
        const paramIndex = container.children.length;
        
        const paramField = document.createElement('div');
        paramField.classList.add('parameter-field', 'border', 'rounded', 'p-3', 'mb-3');
        paramField.dataset.paramIndex = paramIndex;
        
        paramField.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Parameter ${paramIndex + 1}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm remove-param-btn">
                    <i class="bi bi-trash"></i> Hapus Parameter
                </button>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Nama Parameter:</label>
                <input type="text" class="form-control param-name" value="${paramName}" 
                       placeholder="NAMA_PARAMETER (huruf besar, underscore)" required>
                <small class="text-muted">Gunakan format HURUF_BESAR_UNDERSCORE</small>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Nilai Parameter:</label>
                <div class="values-container">
                    ${paramValues.map((value, index) => `
                        <div class="input-group mb-2 value-input-group">
                            <input type="text" class="form-control param-value" value="${value}" placeholder="Nilai parameter...">
                            <button type="button" class="btn btn-outline-danger remove-value-btn">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm add-value-btn">
                    <i class="bi bi-plus"></i> Tambah Nilai
                </button>
            </div>
        `;
        
        // Add event listeners
        this.addParameterFieldListeners(paramField);
        
        container.appendChild(paramField);
        
        // Add initial value if empty
        if (paramValues.length === 0) {
            this.addValueField(paramField.querySelector('.values-container'));
        }
    }
    
    addParameterFieldListeners(paramField) {
        // Remove parameter button
        paramField.querySelector('.remove-param-btn').addEventListener('click', () => {
            if (confirm('Yakin ingin menghapus parameter ini?')) {
                paramField.remove();
                this.updateParameterIndexes();
            }
        });

        // Add value button
        paramField.querySelector('.add-value-btn').addEventListener('click', () => {
            const container = paramField.querySelector('.values-container');
            this.addValueField(container);
        });

        // Remove value buttons
        paramField.querySelectorAll('.remove-value-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.value-input-group').remove();
            });
        });
    }
    
    addValueField(container, value = '') {
        const valueField = document.createElement('div');
        valueField.classList.add('input-group', 'mb-2', 'value-input-group');
        
        valueField.innerHTML = `
            <input type="text" class="form-control param-value" value="${value}" placeholder="Nilai parameter...">
            <button type="button" class="btn btn-outline-danger remove-value-btn">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        // Add remove listener
        valueField.querySelector('.remove-value-btn').addEventListener('click', () => {
            valueField.remove();
        });
        
        container.appendChild(valueField);
    }
    
    updateParameterIndexes() {
        const paramFields = document.querySelectorAll('.parameter-field');
        paramFields.forEach((field, index) => {
            field.dataset.paramIndex = index;
            field.querySelector('h6').textContent = `Parameter ${index + 1}`;
        });
    }
    
    // Menyimpan tema dari form
    handleThemeSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const editMode = form.dataset.editMode === 'true';
        const themeId = editMode ? form.dataset.themeId : document.getElementById('theme-id').value;
        
        const themeData = {
            id: themeId,
            name: document.getElementById('theme-name').value,
            description: document.getElementById('theme-description').value,
            category: document.getElementById('theme-category').value,
            tags: document.getElementById('theme-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            templateContent: document.getElementById('theme-template').value,
            negativePrompt: document.getElementById('theme-negative-prompt').value
        };

        try {
            if (editMode) {
                this.themeManager.updateTheme(themeId, themeData);
                showToast('Tema berhasil diperbarui!', 'success');
            } else {
                this.themeManager.addTheme(themeData, {}, []);
                showToast('Tema berhasil ditambahkan!', 'success');
            }

            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('theme-modal')).hide();
            this.populateThemesList();
            
            // Refresh main theme list if function exists
            if (typeof populateThemes === 'function') {
                fetchConfig();
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
    
    // Menyimpan parameter dari form
    handleParameterSubmit(e) {
        e.preventDefault();
        
        const themeId = this.currentThemeId;
        const paramFields = document.querySelectorAll('.parameter-field');
        const parameters = {};

        paramFields.forEach(field => {
            const paramName = field.querySelector('.param-name').value.trim();
            const paramValues = Array.from(field.querySelectorAll('.param-value'))
                .map(input => input.value.trim())
                .filter(value => value);

            if (paramName && paramValues.length > 0) {
                parameters[paramName] = paramValues;
            }
        });

        try {
            this.themeManager.updateParameters(themeId, parameters);
            showToast('Parameter berhasil diperbarui!', 'success');
            
            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('param-modal')).hide();
            this.populateThemesList();
            
            // Refresh main interface if current theme
            if (typeof currentTheme !== 'undefined' && currentTheme && currentTheme.id === themeId) {
                fetchConfig();
                selectTheme(themeId);
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
    
    // Menghapus tema
    deleteTheme(themeId) {
        const theme = this.themeManager.getTheme(themeId);
        
        if (confirm(`Yakin ingin menghapus tema "${theme.name}"?\nTindakan ini tidak dapat dibatalkan.`)) {
            try {
                this.themeManager.removeTheme(themeId);
                showToast('Tema berhasil dihapus!', 'success');
                this.populateThemesList();
                
                if (typeof fetchConfig === 'function') {
                    fetchConfig();
                }
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            }
        }
    }
    
    async handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await this.themeManager.importThemes(e.target);
            showToast('Tema berhasil di-import!', 'success');
            this.populateThemesList();
            
            if (typeof fetchConfig === 'function') {
                fetchConfig();
            }
        } catch (error) {
            showToast('Error import: ' + error.message, 'error');
        }
        
        // Reset file input
        e.target.value = '';
    }
    
    resetThemes() {
        if (confirm('Yakin ingin reset semua tema ke default?\nSemua tema custom akan hilang!')) {
            this.themeManager.resetToDefault();
            showToast('Tema berhasil di-reset ke default!', 'success');
            this.populateThemesList();
            
            if (typeof fetchConfig === 'function') {
                fetchConfig();
            }
        }
    }
    
    // Quick add theme function
    quickAddTheme() {
        const name = prompt('Nama tema:');
        if (!name) return;
        
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const template = prompt('Template dasar:', `A [OBJECT] is [ACTION] in [LOCATION].`);
        
        if (template) {
            try {
                const themeData = {
                    id: id,
                    name: name,
                    description: `Tema ${name}`,
                    category: '',
                    tags: [],
                    templateContent: template
                };
                
                this.themeManager.addTheme(themeData, {}, []);
                showToast('Tema berhasil ditambahkan!', 'success');
                
                if (typeof fetchConfig === 'function') {
                    fetchConfig();
                }
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            }
        }
    }
    
    // Show parameter form for specific theme
    showParameterForm(themeId) {
        this.manageParameters(themeId);
    }

    editTheme(themeId) {
        this.showThemeForm(themeId);
    }

    duplicateTheme(themeId) {
        const theme = this.themeManager.getTheme(themeId);
        const newId = prompt('ID untuk tema duplikat:', `${themeId}_copy`);
        const newName = prompt('Nama untuk tema duplikat:', `${theme.name} (Copy)`);
        
        if (newId && newName) {
            try {
                this.themeManager.duplicateTheme(themeId, newId, newName);
                showToast('Tema berhasil diduplikasi!', 'success');
                this.populateThemesList();
                
                if (typeof fetchConfig === 'function') {
                    fetchConfig();
                }
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            }
        }
    }

    createBackup() {
        try {
            const backup = this.themeManager.createBackup();
            const dataStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `prompt_generator_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('Backup berhasil dibuat!', 'success');
        } catch (error) {
            showToast('Error creating backup: ' + error.message, 'error');
        }
    }
}

// Ekspor modul
window.ThemeEditor = ThemeEditor; 