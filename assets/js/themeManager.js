export class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'meditrack_theme';
        this.themeColor = document.getElementById('themeColor');
    }

    initialize() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.body.className = theme;
        localStorage.setItem(this.STORAGE_KEY, theme);
        
        // Update theme color meta tag
        this.themeColor.content = theme === 'dark' ? '#111827' : '#ffffff';
    }

    toggleTheme() {
        const newTheme = document.body.className === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getCurrentTheme() {
        return document.body.className;
    }
}