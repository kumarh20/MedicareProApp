export class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'meditrack_medicines';
        this.THEME_KEY = 'meditrack_theme';
        this.NOTIFICATIONS_KEY = 'meditrack_notifications';
    }

    getMedicines() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    saveMedicines(medicines) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
    }

    getTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    }

    getNotificationsEnabled() {
        return localStorage.getItem(this.NOTIFICATIONS_KEY) !== 'false';
    }

    saveNotificationsEnabled(enabled) {
        localStorage.setItem(this.NOTIFICATIONS_KEY, enabled.toString());
    }
}