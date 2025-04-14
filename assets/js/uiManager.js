export class UIManager {
    constructor(medicineManager, themeManager) {
        this.medicineManager = medicineManager;
        this.themeManager = themeManager;
        this.storageManager = medicineManager.storageManager;
        this.initializeElements();
        this.setupBottomSheets();
    }

    initializeElements() {
        // Main elements
        this.medicineGrid = document.getElementById('medicineGrid');
        this.searchInput = document.getElementById('searchInput');
        
        // Buttons
        this.addMedicineBtn = document.getElementById('addMedicineBtn');
        this.lowStockBtn = document.getElementById('lowStockBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Sheets
        this.medicineSheet = document.getElementById('medicineSheet');
        this.lowStockSheet = document.getElementById('lowStockSheet');
        
        // Forms
        this.medicineForm = document.getElementById('medicineForm');

        // Settings
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.notificationToggle = document.getElementById('notificationToggle');
    }

    setupEventListeners() {
        // Button click handlers
        this.addMedicineBtn.addEventListener('click', () => this.showMedicineSheet());
        this.lowStockBtn.addEventListener('click', () => this.showLowStockSheet());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Search handler
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));

        // Form submission
        this.medicineForm.addEventListener('submit', (e) => this.handleMedicineFormSubmit(e));

        // Import/Export handlers
        document.getElementById('exportDataBtn').addEventListener('click', () => this.handleExport());
        document.getElementById('importDataBtn').addEventListener('click', () => this.handleImport());
        document.getElementById('importDataInput').addEventListener('change', (e) => this.handleFileImport(e));

        // Settings handlers
        this.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        this.notificationToggle.addEventListener('click', () => this.toggleNotifications());

        // Initialize settings state
        this.updateSettingsUI();
    }

    setupBottomSheets() {
        const sheets = document.querySelectorAll('.bottom-sheet');
        sheets.forEach(sheet => {
            // Close button handler
            const closeBtn = sheet.querySelector('.close-sheet');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (sheet === this.medicineSheet) {
                        this.medicineForm.reset();
                        delete this.medicineForm.dataset.editId;
                    }
                    this.closeSheet(sheet);
                });
            }

            // Click outside to close
            sheet.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('bottom-sheet')) {
                    if (sheet === this.medicineSheet) {
                        this.medicineForm.reset();
                        delete this.medicineForm.dataset.editId;
                    }
                    this.closeSheet(sheet);
                }
            });

            // Touch handling for swipe to close
            let startY = 0;
            let currentY = 0;

            sheet.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                sheet.style.transition = 'none';
            });

            sheet.addEventListener('touchmove', (e) => {
                currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                
                if (diff > 0) {
                    sheet.style.transform = `translateY(${diff}px)`;
                }
            });

            sheet.addEventListener('touchend', () => {
                sheet.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                if (currentY - startY > 100) {
                    if (sheet === this.medicineSheet) {
                        this.medicineForm.reset();
                        delete this.medicineForm.dataset.editId;
                    }
                    this.closeSheet(sheet);
                } else {
                    sheet.style.transform = '';
                }
            });
        });
    }

    showSheet(sheet) {
        sheet.classList.add('active');
    }

    closeSheet(sheet) {
        sheet.classList.remove('active');
    }

    showMedicineSheet(medicine = null) {
        const sheet = this.medicineSheet;
        const title = sheet.querySelector('#sheetTitle');
        const form = sheet.querySelector('#medicineForm');

        if (medicine) {
            title.textContent = 'Edit Medicine';
            form.elements.medicineName.value = medicine.name;
            form.elements.medicineQuantity.value = medicine.quantity;
            form.elements.medicineExpiry.value = medicine.expiryDate;
            form.dataset.editId = medicine.id;
        } else {
            title.textContent = 'Add Medicine';
            form.reset();
            delete form.dataset.editId;
        }

        this.showSheet(sheet);
    }

    showLowStockSheet() {
        const lowStockMedicines = this.medicineManager.getLowStockMedicines();
        const lowStockList = document.getElementById('lowStockList');
        
        lowStockList.innerHTML = lowStockMedicines.map(medicine => `
            <div class="low-stock-item">
                <h4>${medicine.name}</h4>
                <p>Current Stock: ${medicine.quantity}</p>
                <p>Expires: ${new Date(medicine.expiryDate).toLocaleDateString()}</p>
            </div>
        `).join('');
        
        this.showSheet(this.lowStockSheet);
    }

    createMedicineCard(medicine) {
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryClass = '';
        if (daysUntilExpiry <= 30) {
            expiryClass = 'expiring-soon';
        }
        if (daysUntilExpiry <= 0) {
            expiryClass = 'expired';
        }

        return `
            <div class="medicine-card ${expiryClass}" data-id="${medicine.id}">
                <h3>${medicine.name}</h3>
                <div class="medicine-info">
                    <p>Expiry: ${expiryDate.toLocaleDateString()}</p>
                    <p>Quantity: ${medicine.quantity}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" onclick="handleQuantityChange('${medicine.id}', -1)">-</button>
                    <span>${medicine.quantity}</span>
                    <button class="quantity-btn increase" onclick="handleQuantityChange('${medicine.id}', 1)">+</button>
                    <button class="btn secondary" onclick="handleEditMedicine('${medicine.id}')">Edit</button>
                    <button class="btn warning" onclick="handleDeleteMedicine('${medicine.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    renderMedicineGrid(medicines = null) {
        const medicineList = medicines || this.medicineManager.getAllMedicines();
        this.medicineGrid.innerHTML = medicineList.map(medicine => this.createMedicineCard(medicine)).join('');
    }

    handleSearch(e) {
        const query = e.target.value;
        const filteredMedicines = this.medicineManager.searchMedicines(query);
        this.renderMedicineGrid(filteredMedicines);
    }

    async handleMedicineFormSubmit(e) {
        e.preventDefault();
        
        const medicineData = {
            name: e.target.elements.medicineName.value.trim(),
            quantity: parseInt(e.target.elements.medicineQuantity.value),
            expiryDate: e.target.elements.medicineExpiry.value
        };

        const editId = e.target.dataset.editId;
        
        // Check for existing medicine with the same name
        const existingMedicine = this.medicineManager.findMedicineByName(medicineData.name);
        
        if (existingMedicine && !editId) {
            // If medicine exists and we're not in edit mode
            const confirmUpdate = confirm(
                `A medicine with the name "${medicineData.name}" already exists. \n\n` +
                `Current details:\n` +
                `Quantity: ${existingMedicine.quantity}\n` +
                `Expiry: ${new Date(existingMedicine.expiryDate).toLocaleDateString()}\n\n` +
                `Would you like to update the existing medicine instead?`
            );

            if (confirmUpdate) {
                // Update existing medicine
                this.medicineManager.updateMedicine(existingMedicine.id, medicineData);
                this.showToast('Medicine updated successfully!');
            } else {
                // Add as new medicine with a slightly modified name
                medicineData.name = `${medicineData.name} (New)`;
                this.medicineManager.addMedicine(medicineData);
                this.showToast('New medicine added successfully!');
            }
        } else {
            // Normal add/edit flow
            if (editId) {
                this.medicineManager.updateMedicine(editId, medicineData);
                this.showToast('Medicine updated successfully!');
            } else {
                this.medicineManager.addMedicine(medicineData);
                this.showToast('Medicine added successfully!');
            }
        }

        this.renderMedicineGrid();
        this.updateStats();
        this.closeSheet(this.medicineSheet);
        this.medicineForm.reset();
    }

    handleExport() {
        const data = this.medicineManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meditrack_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleImport() {
        document.getElementById('importDataInput').click();
    }

    handleFileImport(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.medicineManager.importData(data)) {
                        this.renderMedicineGrid();
                        this.updateStats();
                        this.showToast('Data imported successfully!');
                    } else {
                        this.showToast('Invalid data format!', 'error');
                    }
                } catch (error) {
                    this.showToast('Error importing data!', 'error');
                }
            };
            reader.readAsText(file);
        }
    }

    updateStats() {
        const summary = this.medicineManager.getInventorySummary();
        document.getElementById('totalMedicines').textContent = summary.totalMedicines;
        document.getElementById('lowStockCount').textContent = summary.lowStockCount;
        document.getElementById('expiringCount').textContent = summary.expiringCount;
    }

    toggleTheme() {
        this.themeManager.toggleTheme();
        this.updateSettingsUI();
    }

    toggleNotifications() {
        const enabled = this.notificationToggle.classList.toggle('active');
        this.storageManager.saveNotificationsEnabled(enabled);
    }

    updateSettingsUI() {
        const isDark = this.themeManager.getCurrentTheme() === 'dark';
        this.darkModeToggle.classList.toggle('active', isDark);
        
        const notificationsEnabled = this.storageManager.getNotificationsEnabled();
        this.notificationToggle.classList.toggle('active', notificationsEnabled);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showLowStockNotification(medicines) {
        if (this.storageManager.getNotificationsEnabled()) {
            const message = `Low stock alert: ${medicines.length} medicine(s) need attention!`;
            this.showToast(message, 'warning');
        }
    }
}

// Global handlers for the medicine card buttons
window.handleQuantityChange = (id, change) => {
    const medicine = window.app.medicineManager.updateQuantity(id, change);
    if (medicine) {
        window.app.uiManager.renderMedicineGrid();
        window.app.uiManager.updateStats();
        if (medicine.quantity < window.app.medicineManager.LOW_STOCK_THRESHOLD) {
            window.app.uiManager.showToast(`Low stock alert: ${medicine.name}`, 'warning');
        }
    }
};

window.handleEditMedicine = (id) => {
    const medicine = window.app.medicineManager.getMedicine(id);
    if (medicine) {
        window.app.uiManager.showMedicineSheet(medicine);
    }
};

window.handleDeleteMedicine = (id) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
        window.app.medicineManager.deleteMedicine(id);
        window.app.uiManager.renderMedicineGrid();
        window.app.uiManager.updateStats();
        window.app.uiManager.showToast('Medicine deleted successfully!');
    }
};