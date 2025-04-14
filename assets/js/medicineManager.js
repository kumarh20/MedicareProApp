export class MedicineManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.medicines = [];
        this.LOW_STOCK_THRESHOLD = 10;
    }

    loadMedicines() {
        this.medicines = this.storageManager.getMedicines();
    }

    addMedicine(medicine) {
        medicine.id = Date.now().toString();
        this.medicines.push(medicine);
        this.storageManager.saveMedicines(this.medicines);
        return medicine;
    }

    updateMedicine(id, updates) {
        const index = this.medicines.findIndex(m => m.id === id);
        if (index !== -1) {
            this.medicines[index] = { ...this.medicines[index], ...updates };
            this.storageManager.saveMedicines(this.medicines);
            return this.medicines[index];
        }
        return null;
    }

    deleteMedicine(id) {
        this.medicines = this.medicines.filter(m => m.id !== id);
        this.storageManager.saveMedicines(this.medicines);
    }

    getMedicine(id) {
        return this.medicines.find(m => m.id === id);
    }

    findMedicineByName(name) {
        return this.medicines.find(m => 
            m.name.toLowerCase() === name.toLowerCase()
        );
    }

    getAllMedicines() {
        return this.medicines;
    }

    updateQuantity(id, change) {
        const medicine = this.getMedicine(id);
        if (medicine) {
            const newQuantity = medicine.quantity + change;
            if (newQuantity >= 0) {
                return this.updateMedicine(id, { quantity: newQuantity });
            }
        }
        return null;
    }

    searchMedicines(query) {
        query = query.toLowerCase();
        return this.medicines.filter(m => 
            m.name.toLowerCase().includes(query)
        );
    }

    getLowStockMedicines() {
        return this.medicines.filter(m => m.quantity < this.LOW_STOCK_THRESHOLD);
    }

    getInventorySummary() {
        return {
            totalMedicines: this.medicines.length,
            lowStockCount: this.getLowStockMedicines().length,
            expiringCount: this.getExpiringMedicines().length
        };
    }

    getExpiringMedicines() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        return this.medicines.filter(medicine => {
            const expiryDate = new Date(medicine.expiryDate);
            return expiryDate <= thirtyDaysFromNow;
        });
    }

    importData(data) {
        try {
            if (Array.isArray(data)) {
                this.medicines = data;
                this.storageManager.saveMedicines(this.medicines);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    exportData() {
        return this.medicines;
    }
}