import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

interface NotificationBellProps {
    href: string;
    className?: string;
}

export function NotificationBell({ href, className }: NotificationBellProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM d, h:mm a');
        } catch {
            return dateString;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("relative", className)}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => markAllAsRead()}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} asChild>
                                <Link
                                    href={notification.data.url || href}
                                    className={cn(
                                        "flex flex-col p-3 cursor-pointer",
                                        !notification.read_at && "bg-gray-50"
                                    )}
                                    onClick={() => {
                                        if (!notification.read_at) {
                                            markAsRead(notification.id);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium">{notification.data.title}</span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(notification.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notification.data.message}</p>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={href} className="justify-center text-center text-sm font-medium">
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
