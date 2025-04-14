import { MedicineManager } from './medicineManager.js';
import { UIManager } from './uiManager.js';
import { StorageManager } from './storageManager.js';
import { ThemeManager } from './themeManager.js';

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.medicineManager = new MedicineManager(this.storageManager);
        this.themeManager = new ThemeManager();
        this.uiManager = new UIManager(this.medicineManager, this.themeManager);

        this.initialize();
    }

    initialize() {
        // Initialize managers
        this.medicineManager.loadMedicines();
        this.themeManager.initialize();
        this.uiManager.setupEventListeners();
        this.uiManager.renderMedicineGrid();
        this.uiManager.updateStats();
        this.checkLowStock();

        // Initialize views
        this.setupNavigationHandlers();
    }

    checkLowStock() {
        const lowStockMedicines = this.medicineManager.getLowStockMedicines();
        if (lowStockMedicines.length > 0) {
            this.uiManager.showLowStockNotification(lowStockMedicines);
        }
    }

    setupNavigationHandlers() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const views = {
            grid: document.querySelector('.main-content'),
            stats: document.getElementById('statsView'),
            settings: document.getElementById('settingsView')
        };

        navButtons.forEach(btn => {
            if (btn.dataset.view) {
                btn.addEventListener('click', () => {
                    // Update active state
                    navButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Show selected view
                    Object.values(views).forEach(view => {
                        if (view) view.style.display = 'none';
                    });
                    const selectedView = views[btn.dataset.view];
                    if (selectedView) {
                        selectedView.style.display = 'block';
                        if (btn.dataset.view === 'stats') {
                            this.uiManager.updateStats();
                        }
                    }
                });
            }
        });
    }
}

// Initialize the application
window.app = new App();