/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

// Force immediate activation
self.skipWaiting()
self.clients.claim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Runtime Caching for Cloudinary Images
registerRoute(
    /^https:\/\/res\.cloudinary\.com\/.*/i,
    new CacheFirst({
        cacheName: 'cloudinary-images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Runtime Caching for API
registerRoute(
    /^https:\/\/harris-backend\.onrender\.com\/api\/.*/i,
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: data.icon || '/favicon.ico',
            badge: '/favicon.ico',
            data: {
                url: data.data?.url || '/'
            }
        }

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        )
    }
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        self.clients.openWindow(event.notification.data.url)
    )
})
