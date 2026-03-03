// AutoCar — Service Worker para Push Notifications
// Este arquivo vive em /public e é registrado pelo PushProvider.

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic fetch listener para PWA installation criteria
});

self.addEventListener('push', (event) => {
    let data = { title: 'AutoCar', body: 'Você tem uma nova notificação.', icon: '/favicon.ico', url: '/' };

    try {
        if (event.data) {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        }
    } catch (e) {
        // fallback ao default
    }

    const options = {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' },
        actions: [{ action: 'open', title: 'Abrir' }],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
});
