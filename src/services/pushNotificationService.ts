import { api } from "./api";

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const pushNotificationService = {
    checkPermission: () => {
        return Notification.permission;
    },

    requestPermission: async () => {
        const permission = await Notification.requestPermission();
        return permission;
    },

    subscribeUser: async (email: string) => {
        if (!('serviceWorker' in navigator)) return;

        const registration = await navigator.serviceWorker.ready;

        // Use existing subscription if available
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const { publicKey } = await api.getVapidPublicKey();
            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
        }

        // Send subscription to backend
        await api.subscribeToPush(email, subscription);
        return subscription;
    }
};
