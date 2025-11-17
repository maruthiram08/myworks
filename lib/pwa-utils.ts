/**
 * PWA utilities for service worker registration and offline support
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    })
  }
}

export function checkOnlineStatus(): boolean {
  return navigator.onLine
}

export function addOnlineStatusListener(callback: (isOnline: boolean) => void) {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))
}

export function removeOnlineStatusListener(callback: (isOnline: boolean) => void) {
  window.removeEventListener('online', () => callback(true))
  window.removeEventListener('offline', () => callback(false))
}
