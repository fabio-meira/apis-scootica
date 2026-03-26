class SimpleTtlCache {
    constructor(defaultTtlMs = 300000, maxEntries = 1000) {
        this.defaultTtlMs = defaultTtlMs;
        this.maxEntries = maxEntries;
        this.store = new Map();
    }

    get(key) {
        const cachedEntry = this.store.get(key);

        if (!cachedEntry) {
            return null;
        }

        if (cachedEntry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return null;
        }

        return cachedEntry.value;
    }

    set(key, value, ttlMs = this.defaultTtlMs) {
        this.pruneExpired();

        if (this.store.size >= this.maxEntries) {
            const firstKey = this.store.keys().next().value;

            if (firstKey !== undefined) {
                this.store.delete(firstKey);
            }
        }

        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }

    pruneExpired() {
        const now = Date.now();

        for (const [key, entry] of this.store.entries()) {
            if (entry.expiresAt <= now) {
                this.store.delete(key);
            }
        }
    }
}

module.exports = SimpleTtlCache;
