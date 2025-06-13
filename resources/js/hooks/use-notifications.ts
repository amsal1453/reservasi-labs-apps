import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface NotificationData {
    title: string;
    message: string;
    url?: string;
}

interface Notification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

interface WindowWithEcho extends Window {
    Echo?: {
        private: (channel: string) => {
            notification: (callback: (notification: Notification) => void) => void;
            stopListening: (event: string) => void;
        };
    };
}

interface UserAuth {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface PageProps {
    auth: UserAuth;
    [key: string]: unknown;
}

export function useNotifications() {
    const { auth } = usePage<PageProps>().props;
    const userId = auth?.user?.id;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch notifications from the database
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark a notification as read
    const markAsRead = async (id: string) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, read_at: new Date().toISOString() } : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications(notifications.map(notification => ({
                ...notification,
                read_at: notification.read_at || new Date().toISOString()
            })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Listen for real-time notifications
    useEffect(() => {
        if (!userId) return;

        // Fetch initial notifications
        fetchNotifications();

        // Listen for new notifications
        const echoWindow = window as WindowWithEcho;
        if (echoWindow.Echo) {
            const channel = echoWindow.Echo.private(`users.${userId}`);

            channel.notification((notification: Notification) => {
                // Add the new notification to the list
                setNotifications(prev => [notification, ...prev]);

                // Increment unread count
                setUnreadCount(prev => prev + 1);

                // Show toast notification
                toast.success(notification.data.message, {
                    duration: 5000,
                    position: 'top-right',
                    icon: '🔔',
                });

                // If URL exists, redirect on click
                if (notification.data.url) {
                    const toastId = toast.success(`Click to view details`, {
                        duration: 3000,
                        position: 'top-right',
                    });

                    // Add click event listener to the toast element
                    const toastElement = document.getElementById(`toast-${toastId}`);
                    if (toastElement) {
                        toastElement.style.cursor = 'pointer';
                        toastElement.addEventListener('click', () => {
                            window.location.href = notification.data.url!;
                        });
                    }
                }
            });

            return () => {
                channel.stopListening('notification');
            };
        }
    }, [userId]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
    };
}
