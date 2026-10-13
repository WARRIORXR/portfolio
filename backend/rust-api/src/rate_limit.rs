//! Fixed-window rate limiting for the contact endpoint.
//!
//! Deliberately in-process: the gateway is a single binary and the goal is to
//! stop a bot (or a stuck retry loop) from flooding the inbox, not to provide
//! distributed quota accounting.

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

struct Window {
    started_at: Instant,
    count: u32,
}

/// Allows at most `max` hits per `window` per key.
pub struct RateLimiter {
    max: u32,
    window: Duration,
    windows: Mutex<HashMap<String, Window>>,
}

impl RateLimiter {
    /// Create a limiter allowing `max` hits per `window`.
    pub fn new(max: u32, window: Duration) -> Self {
        Self {
            max,
            window,
            windows: Mutex::new(HashMap::new()),
        }
    }

    /// Configured hit budget per window.
    pub fn max(&self) -> u32 {
        self.max
    }

    /// Configured window length.
    pub fn window(&self) -> Duration {
        self.window
    }

    /// Number of tracked keys.
    pub fn tracked(&self) -> usize {
        self.windows.lock().map(|map| map.len()).unwrap_or(0)
    }

    /// Record a hit for `key`. Returns `true` when the request is allowed.
    pub fn check(&self, key: &str) -> bool {
        self.check_at(key, Instant::now())
    }

    /// Remaining hits for `key` inside the current window.
    pub fn remaining(&self, key: &str) -> u32 {
        let now = Instant::now();
        let Ok(map) = self.windows.lock() else {
            return 0;
        };
        match map.get(key) {
            Some(window) if now.duration_since(window.started_at) < self.window => {
                self.max.saturating_sub(window.count)
            }
            _ => self.max,
        }
    }

    /// Seconds until the window for `key` resets.
    pub fn retry_after_secs(&self, key: &str) -> u64 {
        let now = Instant::now();
        let Ok(map) = self.windows.lock() else {
            return 0;
        };
        match map.get(key) {
            Some(window) => {
                let elapsed = now.duration_since(window.started_at);
                self.window.saturating_sub(elapsed).as_secs().max(1)
            }
            None => 0,
        }
    }

    fn check_at(&self, key: &str, now: Instant) -> bool {
        let Ok(mut map) = self.windows.lock() else {
            // A poisoned lock must not take the whole endpoint down.
            return true;
        };

        // Opportunistically drop stale windows so the map cannot grow forever.
        map.retain(|_, window| now.duration_since(window.started_at) < self.window);

        match map.get_mut(key) {
            Some(window) => {
                if window.count >= self.max {
                    return false;
                }
                window.count += 1;
                true
            }
            None => {
                map.insert(
                    key.to_string(),
                    Window {
                        started_at: now,
                        count: 1,
                    },
                );
                true
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_up_to_the_limit_then_blocks() {
        let limiter = RateLimiter::new(2, Duration::from_secs(60));

        assert!(limiter.check("1.2.3.4"));
        assert!(limiter.check("1.2.3.4"));
        assert!(!limiter.check("1.2.3.4"));
        assert_eq!(limiter.remaining("1.2.3.4"), 0);
        assert!(limiter.retry_after_secs("1.2.3.4") > 0);
        assert_eq!(limiter.max(), 2);
        assert_eq!(limiter.tracked(), 1);
    }

    #[test]
    fn keys_are_independent() {
        let limiter = RateLimiter::new(1, Duration::from_secs(60));

        assert!(limiter.check("a"));
        assert!(!limiter.check("a"));
        assert!(limiter.check("b"));
        assert_eq!(limiter.tracked(), 2);
        assert_eq!(limiter.remaining("b"), 0);
    }

    #[test]
    fn zero_window_never_blocks() {
        let limiter = RateLimiter::new(1, Duration::ZERO);
        assert!(limiter.check("k"));
        assert!(limiter.check("k"));
    }
}
