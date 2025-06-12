import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface NotificationBellProps {
    count?: number;
    userId?: number;
    href: string;
    className?: string;
}

export function NotificationBell({ count = 0, userId, href, className }: NotificationBellProps) {
    const [notificationCount, setNotificationCount] = useState(count);

    useEffect(() => {
        if (!userId) return;

        // Listen for notifications on the private channel
        // TypeScript definition for window with Echo
        interface WindowWithEcho extends Window {
            Echo?: {
                private: (channel: string) => {
                    notification: (callback: () => void) => void;
                    stopListening: (event: string) => void;
                };
            };
        }

        const echoWindow = window as WindowWithEcho;
        if (echoWindow.Echo) {
            const channel = echoWindow.Echo.private(`users.${userId}`);

            channel.notification(() => {
                // Increment notification count when a new notification is received
                setNotificationCount((prev) => prev + 1);
            });

            return () => {
                channel.stopListening('notification');
            };
        }
    }, [userId]);

    return (
        <Link href={href} className={cn("relative", className)}>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                </span>
            )}
        </Link>
    );
}
