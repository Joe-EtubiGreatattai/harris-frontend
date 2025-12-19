import { useEffect } from 'react';
import { socket } from '../../services/socket';
import { useUser } from '../../context/UserContext';
import { pushNotificationService } from '../../services/pushNotificationService';
import { toaster } from '../ui/toaster';

export const OrderUpdateHandler = () => {
    const { user } = useUser();

    useEffect(() => {
        if (!user?.email) return;

        // Try to subscribe to push notifications when user is logged in
        const initPush = async () => {
            if (pushNotificationService.checkPermission() === 'default') {
                // We'll ask for permission on the first order or a specific button later?
                // For now, let's try to subscribe if they already gave permission
                // or if we want to be proactive.
            }

            if (pushNotificationService.checkPermission() === 'granted') {
                try {
                    await pushNotificationService.subscribeUser(user.email);
                } catch (err) {
                    console.error('Push subscription failed:', err);
                }
            }
        };

        initPush();

        const handleOrderUpdate = (updatedOrder: any) => {
            // Only show toast if it's the current user's order
            if (updatedOrder.user.email === user.email) {
                toaster.create({
                    title: 'Order Status Update',
                    description: `Your order #${updatedOrder.orderId.slice(-6)} is now ${updatedOrder.status}`,
                    type: 'info'
                });
            }
        };

        socket.on('orderUpdated', handleOrderUpdate);

        return () => {
            socket.off('orderUpdated', handleOrderUpdate);
        };
    }, [user?.email]);

    return null; // This is a logic-only component
};
