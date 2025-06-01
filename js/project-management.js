// Project Management System

class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.projects = this.loadProjects();
        this.projectTemplates = this.getDefaultTemplates();
        
        this.initProjectUI();
        this.loadLastProject();
    }

    loadProjects() {
        const saved = localStorage.getItem('projectData');
        return saved ? JSON.parse(saved) : [];
    }

    saveProjects() {
        localStorage.setItem('projectData', JSON.stringify(this.projects));
    }

    getDefaultTemplates() {
        return {
            'video-marketing': {
                name: 'Video Marketing',
                description: 'Template untuk video marketing dan promosi',
                icon: 'camera-video',
                categories: ['commercial', 'social-media'],
                themes: ['urban-adventure', 'nature-travel'],
                presets: {
                    'quick-promo': {
                        name: 'Promo Cepat',
                        parameters: {
                            'DURATION': '15 detik',
                            'STYLE': 'energik',
                            'MUSIC': 'upbeat'
                        }
                    }
                }
            },
            'educational-content': {
                name: 'Konten Edukasi',
                description: 'Template untuk video pembelajaran dan tutorial',
                icon: 'book',
                categories: ['education', 'tutorial'],
                themes: ['sci-fi-exploration'],
                presets: {
                    'tutorial-basic': {
                        name: 'Tutorial Dasar',
                        parameters: {
                            'PACE': 'lambat',
                            'STYLE': 'informatif',
                            'COMPLEXITY': 'sederhana'
                        }
                    }
                }
            },
            'entertainment': {
                name: 'Hiburan',
                description: 'Template untuk konten hiburan dan creative',
                icon: 'mask-happy',
                categories: ['entertainment', 'creative'],
                themes: ['fantasy-world'],
                presets: {
                    'fun-content': {
                        name: 'Konten Fun',
                        parameters: {
                            'MOOD': 'ceria',
                            'STYLE': 'kasual',
                            'ENERGY': 'tinggi'
                        }
                    }
                }
            }
        };
    }

    initProjectUI() {
        // Add project management styles
        const style = document.createElement('style');
        style.textContent = `
            .project-container {
                background: var(--bs-body-bg);
                border: 1px solid var(--bs-border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                margin-bottom: 1rem;
            }

            .project-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--bs-border-color);
            }

            .project-title {
                font-weight: 600;
                color: var(--bs-primary);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .project-info {
                font-size: 0.875rem;
                color: var(--bs-text-muted);
                display: flex;
                gap: 1rem;
            }

            .project-card {
                background: var(--bs-body-bg);
                border: 1px solid var(--bs-border-color);
                border-radius: 0.375rem;
                padding: 1rem;
                margin-bottom: 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .project-card:hover {
                border-color: var(--bs-primary);
                box-shadow: 0 0.125rem 0.25rem rgba(var(--bs-primary-rgb), 0.1);
                transform: translateY(-1px);
            }

            .project-card.active {
                border-color: var(--bs-primary);
                background: var(--bs-primary-bg-subtle);
            }

            .project-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.5rem;
            }

            .project-card-title {
                font-weight: 600;
                color: var(--bs-body-color);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .project-card-meta {
                font-size: 0.75rem;
                color: var(--bs-text-muted);
                text-align: right;
            }

            .project-card-description {
                font-size: 0.875rem;
                color: var(--bs-text-muted);
                margin-bottom: 0.75rem;
                line-height: 1.4;
            }

            .project-card-stats {
                display: flex;
                gap: 1rem;
                font-size: 0.75rem;
                color: var(--bs-text-muted);
            }

            .project-actions {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .project-card:hover .project-actions {
                opacity: 1;
            }

            .template-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .template-card {
                background: var(--bs-body-bg);
                border: 2px solid var(--bs-border-color);
                border-radius: 0.5rem;
                padding: 1.5rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .template-card:hover {
                border-color: var(--bs-primary);
                transform: translateY(-2px);
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
            }

            .template-card.selected {
                border-color: var(--bs-primary);
                background: var(--bs-primary-bg-subtle);
            }

            .template-icon {
                font-size: 3rem;
                color: var(--bs-primary);
                margin-bottom: 1rem;
            }

            .template-name {
                font-weight: 600;
                color: var(--bs-body-color);
                margin-bottom: 0.5rem;
            }

            .template-description {
                font-size: 0.875rem;
                color: var(--bs-text-muted);
                line-height: 1.4;
            }

            .recent-projects {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid var(--bs-border-color);
                border-radius: 0.375rem;
                padding: 0.5rem;
            }

            .quick-actions {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-top: 1rem;
            }

            .project-breadcrumb {
                background: var(--bs-secondary-bg);
                border-radius: 0.375rem;
                padding: 0.5rem 1rem;
                margin-bottom: 1rem;
                font-size: 0.875rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .project-status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--bs-success);
                display: inline-block;
                margin-right: 0.5rem;
            }

            .project-status-indicator.unsaved {
                background: var(--bs-warning);
            }

            .project-status-indicator.error {
                background: var(--bs-danger);
            }
        `;
        document.head.appendChild(style);

        this.createProjectControls();
        this.createProjectModal();
    }

    createProjectControls() {
        // Add project button to navbar
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const projectBtn = document.createElement('button');
            projectBtn.id = 'project-btn';
            projectBtn.className = 'btn btn-outline-light btn-sm';
            projectBtn.innerHTML = '<i class="bi bi-folder"></i> Project';
            
            projectBtn.addEventListener('click', () => this.showProjectModal());
            navbar.insertBefore(projectBtn, navbar.firstChild);
        }

        // Add project status to page
        const container = document.querySelector('.container');
        if (container) {
            const projectStatus = document.createElement('div');
            projectStatus.className = 'project-breadcrumb';
            projectStatus.id = 'project-status';
            projectStatus.innerHTML = `
                <span class="project-status-indicator" id="project-indicator"></span>
                <i class="bi bi-folder"></i>
                <span id="project-name">Belum ada project</span>
                <span class="ms-auto">
                    <button class="btn btn-outline-secondary btn-sm" onclick="projectManager.quickSave()">
                        <i class="bi bi-save"></i> Simpan
                    </button>
                </span>
            `;
            
            container.insertBefore(projectStatus, container.firstChild);
        }
    }

    createProjectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'project-modal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-folder"></i> Manajemen Project
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3" id="project-tabs">
                            <li class="nav-item">
                                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#current-project">
                                    Project Saat Ini
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#recent-projects">
                                    Project Terbaru
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#new-project">
                                    Project Baru
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#templates">
                                    Template
                                </button>
                            </li>
                        </ul>

                        <div class="tab-content">
                            <!-- Current Project Tab -->
                            <div class="tab-pane active" id="current-project">
                                <div id="current-project-content">
                                    <div class="text-center text-muted">
                                        <i class="bi bi-folder-x" style="font-size: 4rem;"></i>
                                        <p>Belum ada project yang aktif</p>
                                        <button class="btn btn-primary" onclick="document.querySelector('[data-bs-target=&quot;#new-project&quot;]').click()">
                                            Buat Project Baru
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Projects Tab -->
                            <div class="tab-pane" id="recent-projects">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6>Project Terbaru</h6>
                                    <div class="input-group w-auto">
                                        <input type="text" class="form-control" id="project-search" 
                                               placeholder="Cari project...">
                                        <button class="btn btn-outline-secondary" onclick="projectManager.searchProjects()">
                                            <i class="bi bi-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="recent-projects" id="recent-projects-list">
                                    <!-- Recent projects will be populated here -->
                                </div>
                            </div>

                            <!-- New Project Tab -->
                            <div class="tab-pane" id="new-project">
                                <form id="new-project-form">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Nama Project</label>
                                                <input type="text" class="form-control" id="project-name-input" 
                                                       placeholder="Masukkan nama project..." required>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Deskripsi</label>
                                                <textarea class="form-control" id="project-description" rows="3"
                                                          placeholder="Deskripsi project (opsional)"></textarea>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Kategori</label>
                                                <select class="form-select" id="project-category">
                                                    <option value="">Pilih kategori...</option>
                                                    <option value="marketing">Marketing</option>
                                                    <option value="education">Edukasi</option>
                                                    <option value="entertainment">Hiburan</option>
                                                    <option value="corporate">Korporat</option>
                                                    <option value="personal">Personal</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Template Awal</label>
                                                <select class="form-select" id="project-template">
                                                    <option value="">Mulai kosong</option>
                                                    <option value="video-marketing">Video Marketing</option>
                                                    <option value="educational-content">Konten Edukasi</option>
                                                    <option value="entertainment">Hiburan</option>
                                                </select>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Tags</label>
                                                <input type="text" class="form-control" id="project-tags" 
                                                       placeholder="Tag1, Tag2, Tag3...">
                                                <small class="text-muted">Pisahkan dengan koma</small>
                                            </div>
                                            <div class="mb-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="auto-backup">
                                                    <label class="form-check-label" for="auto-backup">
                                                        Aktifkan auto-backup
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="bi bi-plus-circle"></i> Buat Project
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary" 
                                                onclick="document.getElementById('new-project-form').reset()">
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Templates Tab -->
                            <div class="tab-pane" id="templates">
                                <h6 class="mb-3">Template Project</h6>
                                <div class="template-grid" id="templates-grid">
                                    <!-- Templates will be populated here -->
                                </div>
                                <div class="mt-3">
                                    <button class="btn btn-outline-primary" onclick="projectManager.importTemplate()">
                                        <i class="bi bi-upload"></i> Import Template
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="projectManager.exportTemplate()">
                                        <i class="bi bi-download"></i> Export Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindProjectEvents();
    }

    bindProjectEvents() {
        // New project form submission
        document.getElementById('new-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewProject();
        });

        // Project search
        document.getElementById('project-search').addEventListener('input', (e) => {
            this.searchProjects(e.target.value);
        });

        // Auto-save when parameters change
        document.addEventListener('change', (e) => {
            if (e.target.matches('select[data-param], input[data-param]')) {
                this.autoSave();
            }
        });
    }

    showProjectModal() {
        this.updateCurrentProjectView();
        this.updateRecentProjectsList();
        this.updateTemplatesGrid();
        
        const modal = new bootstrap.Modal(document.getElementById('project-modal'));
        modal.show();
    }

    createNewProject() {
        const form = document.getElementById('new-project-form');
        const formData = new FormData(form);
        
        const projectData = {
            id: 'project_' + Date.now(),
            name: formData.get('project-name-input') || document.getElementById('project-name-input').value,
            description: document.getElementById('project-description').value,
            category: document.getElementById('project-category').value,
            template: document.getElementById('project-template').value,
            tags: document.getElementById('project-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            autoBackup: document.getElementById('auto-backup').checked,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            themes: [],
            settings: {
                currentTheme: null,
                parameters: {},
                presets: []
            }
        };

        // Apply template if selected
        if (projectData.template && this.projectTemplates[projectData.template]) {
            const template = this.projectTemplates[projectData.template];
            projectData.themes = template.themes || [];
            projectData.settings.presets = Object.values(template.presets || {});
        }

        // Save project
        this.projects.push(projectData);
        this.saveProjects();
        
        // Set as current project
        this.setCurrentProject(projectData);
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('project-modal')).hide();
        
        showToast(`Project "${projectData.name}" berhasil dibuat!`, 'success');
        form.reset();
    }

    setCurrentProject(project) {
        this.currentProject = project;
        localStorage.setItem('currentProject', JSON.stringify(project));
        
        this.updateProjectStatus();
        this.updateCurrentProjectView();
        
        // Trigger project change event
        document.dispatchEvent(new CustomEvent('projectChanged', { detail: project }));
    }

    updateProjectStatus() {
        const nameElement = document.getElementById('project-name');
        const indicator = document.getElementById('project-indicator');
        
        if (this.currentProject) {
            nameElement.textContent = this.currentProject.name;
            indicator.className = 'project-status-indicator';
        } else {
            nameElement.textContent = 'Belum ada project';
            indicator.className = 'project-status-indicator error';
        }
    }

    updateCurrentProjectView() {
        const content = document.getElementById('current-project-content');
        
        if (!this.currentProject) {
            content.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-folder-x" style="font-size: 4rem;"></i>
                    <p>Belum ada project yang aktif</p>
                    <button class="btn btn-primary" onclick="document.querySelector('[data-bs-target=&quot;#new-project&quot;]').click()">
                        Buat Project Baru
                    </button>
                </div>
            `;
            return;
        }

        const project = this.currentProject;
        content.innerHTML = `
            <div class="project-container">
                <div class="project-header">
                    <div class="project-title">
                        <i class="bi bi-folder-open"></i>
                        ${project.name}
                    </div>
                    <div class="project-info">
                        <span>Dibuat: ${new Date(project.createdAt).toLocaleDateString()}</span>
                        <span>Update: ${new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-8">
                        <p class="text-muted">${project.description || 'Tidak ada deskripsi'}</p>
                        
                        <div class="mb-3">
                            <strong>Kategori:</strong> ${project.category || 'Tidak ada'}
                            <br>
                            <strong>Tags:</strong> ${project.tags && project.tags.length > 0 ? project.tags.join(', ') : 'Tidak ada'}
                        </div>

                        <div class="mb-3">
                            <h6>Statistik Project</h6>
                            <div class="row">
                                <div class="col-sm-4">
                                    <div class="text-center">
                                        <div class="h4 text-primary">${project.themes?.length || 0}</div>
                                        <small>Tema Tersimpan</small>
                                    </div>
                                </div>
                                <div class="col-sm-4">
                                    <div class="text-center">
                                        <div class="h4 text-success">${project.settings?.presets?.length || 0}</div>
                                        <small>Preset</small>
                                    </div>
                                </div>
                                <div class="col-sm-4">
                                    <div class="text-center">
                                        <div class="h4 text-info">${Object.keys(project.settings?.parameters || {}).length}</div>
                                        <small>Parameter</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="quick-actions">
                            <button class="btn btn-primary btn-sm" onclick="projectManager.quickSave()">
                                <i class="bi bi-save"></i> Simpan
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="projectManager.duplicateProject()">
                                <i class="bi bi-copy"></i> Duplikat
                            </button>
                            <button class="btn btn-outline-info btn-sm" onclick="projectManager.exportProject()">
                                <i class="bi bi-download"></i> Export
                            </button>
                            <button class="btn btn-outline-warning btn-sm" onclick="projectManager.archiveProject()">
                                <i class="bi bi-archive"></i> Arsip
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="projectManager.deleteProject()">
                                <i class="bi bi-trash"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateRecentProjectsList() {
        const list = document.getElementById('recent-projects-list');
        const recentProjects = this.projects
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 10);

        if (recentProjects.length === 0) {
            list.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="bi bi-folder" style="font-size: 2rem;"></i>
                    <p>Belum ada project tersimpan</p>
                </div>
            `;
            return;
        }

        list.innerHTML = recentProjects.map(project => `
            <div class="project-card ${this.currentProject?.id === project.id ? 'active' : ''}" 
                 onclick="projectManager.loadProject('${project.id}')">
                <div class="project-card-header">
                    <div class="project-card-title">
                        <i class="bi bi-folder"></i>
                        ${project.name}
                    </div>
                    <div class="project-card-meta">
                        ${new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="project-card-description">
                    ${project.description || 'Tidak ada deskripsi'}
                </div>
                <div class="project-card-stats">
                    <span><i class="bi bi-collection"></i> ${project.themes?.length || 0} tema</span>
                    <span><i class="bi bi-bookmark"></i> ${project.settings?.presets?.length || 0} preset</span>
                    <span><i class="bi bi-tag"></i> ${project.category || 'Umum'}</span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); projectManager.duplicateProject('${project.id}')">
                        <i class="bi bi-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); projectManager.deleteProject('${project.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateTemplatesGrid() {
        const grid = document.getElementById('templates-grid');
        const templates = Object.entries(this.projectTemplates);

        grid.innerHTML = templates.map(([key, template]) => `
            <div class="template-card" onclick="projectManager.createFromTemplate('${key}')">
                <div class="template-icon">
                    <i class="bi bi-${template.icon}"></i>
                </div>
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
            </div>
        `).join('');
    }

    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.setCurrentProject(project);
            bootstrap.Modal.getInstance(document.getElementById('project-modal')).hide();
            showToast(`Project "${project.name}" berhasil dimuat!`, 'success');
        }
    }

    createFromTemplate(templateKey) {
        const template = this.projectTemplates[templateKey];
        if (template) {
            // Pre-fill new project form with template data
            document.getElementById('project-name-input').value = template.name;
            document.getElementById('project-description').value = template.description;
            document.getElementById('project-template').value = templateKey;
            
            // Switch to new project tab
            document.querySelector('[data-bs-target="#new-project"]').click();
        }
    }

    quickSave() {
        if (!this.currentProject) {
            showToast('Tidak ada project aktif untuk disimpan', 'error');
            return;
        }

        // Save current state
        this.currentProject.updatedAt = new Date().toISOString();
        
        // Save current theme if any
        if (currentTheme) {
            this.currentProject.settings.currentTheme = currentTheme.id;
        }

        // Save current parameters
        if (currentTheme && config.parameters[currentTheme.id]) {
            const parameters = {};
            Object.keys(config.parameters[currentTheme.id]).forEach(paramName => {
                const element = document.querySelector(`[data-param="${paramName}"]`);
                if (element) {
                    parameters[paramName] = element.value;
                }
            });
            this.currentProject.settings.parameters = parameters;
        }

        // Update project in list
        const index = this.projects.findIndex(p => p.id === this.currentProject.id);
        if (index !== -1) {
            this.projects[index] = this.currentProject;
        }

        this.saveProjects();
        localStorage.setItem('currentProject', JSON.stringify(this.currentProject));
        
        showToast('Project berhasil disimpan!', 'success');
        
        // Update indicator
        const indicator = document.getElementById('project-indicator');
        indicator.className = 'project-status-indicator';
    }

    autoSave() {
        if (this.currentProject && this.currentProject.autoBackup) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                this.quickSave();
            }, 5000); // Auto-save after 5 seconds of inactivity
        }
    }

    duplicateProject(projectId = null) {
        const project = projectId ? 
            this.projects.find(p => p.id === projectId) : 
            this.currentProject;
            
        if (!project) return;

        const duplicated = {
            ...project,
            id: 'project_' + Date.now(),
            name: project.name + ' (Copy)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.projects.push(duplicated);
        this.saveProjects();
        
        showToast(`Project "${duplicated.name}" berhasil diduplikat!`, 'success');
        this.updateRecentProjectsList();
    }

    exportProject() {
        if (!this.currentProject) return;

        const exportData = {
            ...this.currentProject,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name.replace(/[^a-z0-9]/gi, '_')}_project.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('Project berhasil di-export!', 'success');
    }

    importProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);
                    
                    // Validate project data
                    if (!projectData.name || !projectData.id) {
                        throw new Error('Invalid project format');
                    }

                    // Generate new ID to avoid conflicts
                    projectData.id = 'project_' + Date.now();
                    projectData.importedAt = new Date().toISOString();

                    this.projects.push(projectData);
                    this.saveProjects();
                    
                    showToast(`Project "${projectData.name}" berhasil di-import!`, 'success');
                    this.updateRecentProjectsList();
                    
                } catch (error) {
                    showToast('Gagal import project: Format file tidak valid', 'error');
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }

    deleteProject(projectId = null) {
        const project = projectId ? 
            this.projects.find(p => p.id === projectId) : 
            this.currentProject;
            
        if (!project) return;

        if (confirm(`Yakin ingin menghapus project "${project.name}"?`)) {
            this.projects = this.projects.filter(p => p.id !== project.id);
            this.saveProjects();
            
            if (this.currentProject?.id === project.id) {
                this.currentProject = null;
                localStorage.removeItem('currentProject');
                this.updateProjectStatus();
            }
            
            showToast(`Project "${project.name}" berhasil dihapus!`, 'success');
            this.updateRecentProjectsList();
            this.updateCurrentProjectView();
        }
    }

    searchProjects(query = '') {
        const searchQuery = query.toLowerCase();
        const filtered = this.projects.filter(project => 
            project.name.toLowerCase().includes(searchQuery) ||
            (project.description && project.description.toLowerCase().includes(searchQuery)) ||
            (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
        );

        // Update display with filtered results
        this.displayFilteredProjects(filtered);
    }

    displayFilteredProjects(projects) {
        const list = document.getElementById('recent-projects-list');
        
        if (projects.length === 0) {
            list.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="bi bi-search" style="font-size: 2rem;"></i>
                    <p>Tidak ada project yang ditemukan</p>
                </div>
            `;
            return;
        }

        list.innerHTML = projects.map(project => `
            <div class="project-card ${this.currentProject?.id === project.id ? 'active' : ''}" 
                 onclick="projectManager.loadProject('${project.id}')">
                <div class="project-card-header">
                    <div class="project-card-title">
                        <i class="bi bi-folder"></i>
                        ${project.name}
                    </div>
                    <div class="project-card-meta">
                        ${new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="project-card-description">
                    ${project.description || 'Tidak ada deskripsi'}
                </div>
                <div class="project-card-stats">
                    <span><i class="bi bi-collection"></i> ${project.themes?.length || 0} tema</span>
                    <span><i class="bi bi-bookmark"></i> ${project.settings?.presets?.length || 0} preset</span>
                    <span><i class="bi bi-tag"></i> ${project.category || 'Umum'}</span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); projectManager.duplicateProject('${project.id}')">
                        <i class="bi bi-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); projectManager.deleteProject('${project.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadLastProject() {
        const saved = localStorage.getItem('currentProject');
        if (saved) {
            try {
                this.currentProject = JSON.parse(saved);
                this.updateProjectStatus();
            } catch (error) {
                console.error('Failed to load last project:', error);
                localStorage.removeItem('currentProject');
            }
        }
    }
}

// Initialize project manager
let projectManager;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectManager;
} else {
    window.ProjectManager = ProjectManager;
} 