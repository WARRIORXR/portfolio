//! A tiny thread-safe TTL cache.
//!
//! Reference-counted values keep cloned entries cheap, and the lock is only
//! held for the map access — never across an `.await`.

use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

struct Entry<T> {
    stored_at: Instant,
    value: T,
}

/// String-keyed cache with per-entry expiry.
pub struct TtlCache<T> {
    ttl: Duration,
    entries: RwLock<HashMap<String, Entry<T>>>,
}

impl<T> TtlCache<T> {
    /// Create a cache whose entries live for `ttl`.
    pub fn new(ttl: Duration) -> Self {
        Self {
            ttl,
            entries: RwLock::new(HashMap::new()),
        }
    }

    /// Configured entry lifetime.
    pub fn ttl(&self) -> Duration {
        self.ttl
    }

    /// Number of entries currently held (expired entries included).
    pub fn len(&self) -> usize {
        self.entries.read().map(|map| map.len()).unwrap_or(0)
    }

    /// Whether the cache holds no entries.
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Remove every entry.
    pub fn clear(&self) {
        if let Ok(mut map) = self.entries.write() {
            map.clear();
        }
    }

    /// Age of an entry in seconds, or `None` when absent/expired.
    pub fn age_secs(&self, key: &str) -> Option<u64> {
        let map = self.entries.read().ok()?;
        let entry = map.get(key)?;
        let age = entry.stored_at.elapsed();
        if age >= self.ttl {
            return None;
        }
        Some(age.as_secs())
    }
}

impl<T: Clone> TtlCache<T> {
    /// Get a live value, dropping it first when it has expired.
    pub fn get(&self, key: &str) -> Option<T> {
        {
            let map = self.entries.read().ok()?;
            match map.get(key) {
                Some(entry) if entry.stored_at.elapsed() < self.ttl => {
                    return Some(entry.value.clone());
                }
                Some(_) => {}
                None => return None,
            }
        }

        if let Ok(mut map) = self.entries.write() {
            map.remove(key);
        }
        None
    }

    /// Insert or replace a value.
    pub fn insert(&self, key: &str, value: T) {
        if let Ok(mut map) = self.entries.write() {
            map.insert(
                key.to_string(),
                Entry {
                    stored_at: Instant::now(),
                    value,
                },
            );
        }
    }
}

/// Convenience alias for the caches used by the gateway.
pub type SharedCache<T> = Arc<TtlCache<Arc<T>>>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stores_and_returns_values() {
        let cache: TtlCache<Arc<Vec<i32>>> = TtlCache::new(Duration::from_secs(60));
        assert!(cache.is_empty());
        cache.insert("k", Arc::new(vec![1, 2, 3]));

        let hit = cache.get("k").expect("value should be live");
        assert_eq!(*hit, vec![1, 2, 3]);
        assert_eq!(cache.len(), 1);
        assert_eq!(cache.ttl(), Duration::from_secs(60));
        assert!(cache.age_secs("k").is_some());

        cache.clear();
        assert!(cache.get("k").is_none());
        assert!(cache.is_empty());
    }

    #[test]
    fn expires_entries_immediately_with_zero_ttl() {
        let cache: TtlCache<u32> = TtlCache::new(Duration::ZERO);
        cache.insert("k", 1);
        assert!(cache.get("k").is_none());
        assert!(cache.age_secs("k").is_none());
    }
}
