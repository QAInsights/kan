/**
 * IndexedDB Manager for Eye Blink Tracker
 * Handles all data persistence in the browser
 */

class BlinkDatabase {
    constructor() {
        this.dbName = 'EyeBlinkTrackerDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Blinks store
                if (!db.objectStoreNames.contains('blinks')) {
                    const blinkStore = db.createObjectStore('blinks', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    blinkStore.createIndex('timestamp', 'timestamp', { unique: false });
                    blinkStore.createIndex('date', 'date', { unique: false });
                    blinkStore.createIndex('sessionId', 'sessionId', { unique: false });
                }

                // Sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    sessionStore.createIndex('startTime', 'startTime', { unique: false });
                    sessionStore.createIndex('date', 'date', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Save a blink event
     */
    async saveBlink(sessionId) {
        const now = new Date();
        const blink = {
            timestamp: now.getTime(),
            date: now.toISOString().split('T')[0],
            sessionId: sessionId,
            hour: now.getHours()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blinks'], 'readwrite');
            const store = transaction.objectStore('blinks');
            const request = store.add(blink);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Start a new session
     */
    async startSession() {
        const now = new Date();
        const session = {
            startTime: now.getTime(),
            endTime: null,
            date: now.toISOString().split('T')[0],
            blinkCount: 0,
            duration: 0
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.add(session);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * End a session
     */
    async endSession(sessionId, blinkCount) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const getRequest = store.get(sessionId);

            getRequest.onsuccess = () => {
                const session = getRequest.result;
                if (session) {
                    const now = new Date();
                    session.endTime = now.getTime();
                    session.blinkCount = blinkCount;
                    session.duration = session.endTime - session.startTime;

                    const updateRequest = store.put(session);
                    updateRequest.onsuccess = () => resolve(session);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('Session not found'));
                }
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Get total blink count
     */
    async getTotalBlinks() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blinks'], 'readonly');
            const store = transaction.objectStore('blinks');
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get blinks for today
     */
    async getTodayBlinks() {
        const today = new Date().toISOString().split('T')[0];
        return this.getBlinksByDate(today);
    }

    /**
     * Get blinks by date
     */
    async getBlinksByDate(date) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blinks'], 'readonly');
            const store = transaction.objectStore('blinks');
            const index = store.index('date');
            const request = index.count(date);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get weekly statistics
     */
    async getWeeklyStats() {
        const days = [];
        const counts = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            days.push(dayName);
            const count = await this.getBlinksByDate(dateStr);
            counts.push(count);
        }

        return { days, counts };
    }

    /**
     * Get hourly distribution for today
     */
    async getHourlyDistribution() {
        const today = new Date().toISOString().split('T')[0];
        const hours = Array(24).fill(0);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blinks'], 'readonly');
            const store = transaction.objectStore('blinks');
            const index = store.index('date');
            const request = index.openCursor(IDBKeyRange.only(today));

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    hours[cursor.value.hour]++;
                    cursor.continue();
                } else {
                    resolve(hours);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get recent sessions
     */
    async getRecentSessions(limit = 10) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const index = store.index('startTime');
            const request = index.openCursor(null, 'prev');
            const sessions = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && sessions.length < limit) {
                    sessions.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(sessions);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get daily average
     */
    async getDailyAverage() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blinks'], 'readonly');
            const store = transaction.objectStore('blinks');
            const request = store.getAll();

            request.onsuccess = () => {
                const blinks = request.result;
                if (blinks.length === 0) {
                    resolve(0);
                    return;
                }

                const dates = new Set(blinks.map(b => b.date));
                const average = Math.round(blinks.length / dates.size);
                resolve(average);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get average blinks per minute
     */
    async getAverageBPM() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.getAll();

            request.onsuccess = () => {
                const sessions = request.result.filter(s => s.endTime && s.duration > 0);
                if (sessions.length === 0) {
                    resolve(0);
                    return;
                }

                const totalBlinks = sessions.reduce((sum, s) => sum + s.blinkCount, 0);
                const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration / 60000), 0);
                const avgBPM = totalMinutes > 0 ? (totalBlinks / totalMinutes).toFixed(1) : 0;
                resolve(parseFloat(avgBPM));
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save setting
     */
    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get setting
     */
    async getSetting(key, defaultValue = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export all data as JSON
     */
    async exportData() {
        const blinks = await this.getAllBlinks();
        const sessions = await this.getAllSessions();
        const settings = await this.getAllSettings();

        return {
            exportDate: new Date().toISOString(),
            blinks,
            sessions,
            settings
        };
    }

    async getAllBlinks() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['blinks'], 'readonly');
            const store = transaction.objectStore('blinks');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllSessions() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        const stores = ['blinks', 'sessions'];
        const transaction = this.db.transaction(stores, 'readwrite');

        for (const storeName of stores) {
            transaction.objectStore(storeName).clear();
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}
