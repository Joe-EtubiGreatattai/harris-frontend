/// <reference lib="webworker" />

export default null
declare let self: ServiceWorkerGlobalScope

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
