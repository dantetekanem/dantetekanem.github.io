class StorageManager {
    constructor() {
        this.preferencesKey = 'astar_preferences';
        this.mazeKey = 'astar_maze_state';
        this.defaultPreferences = {
            heuristic: 'manhattan',
            weight: 1.0,
            speed: 10
        };
        this.defaultMazeState = {
            start: { x: 0, y: 0 },
            target: { x: 49, y: 39 },
            walls: [],
            lastSaved: null
        };
    }

    savePreferences(preferences) {
        try {
            localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.warn('Failed to save preferences:', error);
            return false;
        }
    }

    loadPreferences() {
        try {
            const stored = localStorage.getItem(this.preferencesKey);
            if (stored) {
                const preferences = JSON.parse(stored);
                return { ...this.defaultPreferences, ...preferences };
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
        return { ...this.defaultPreferences };
    }

    savePreference(key, value) {
        const preferences = this.loadPreferences();
        preferences[key] = value;
        return this.savePreferences(preferences);
    }

    getPreference(key) {
        const preferences = this.loadPreferences();
        return preferences[key];
    }

    clearPreferences() {
        try {
            localStorage.removeItem(this.preferencesKey);
            return true;
        } catch (error) {
            console.warn('Failed to save preferences:', error);
            return false;
        }
    }

    saveMazeState(mazeState) {
        try {
            const stateToSave = {
                ...mazeState,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(this.mazeKey, JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.warn('Failed to save maze state:', error);
            return false;
        }
    }

    loadMazeState() {
        try {
            const stored = localStorage.getItem(this.mazeKey);
            if (stored) {
                const mazeState = JSON.parse(stored);
                return { ...this.defaultMazeState, ...mazeState };
            }
        } catch (error) {
            console.warn('Failed to load maze state:', error);
        }
        return { ...this.defaultMazeState };
    }

    clearMazeState() {
        try {
            localStorage.removeItem(this.mazeKey);
            return true;
        } catch (error) {
            console.warn('Failed to clear maze state:', error);
            return false;
        }
    }

    clearAll() {
        return this.clearPreferences() && this.clearMazeState();
    }
}
