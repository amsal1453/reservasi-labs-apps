import LecturerLayout from '@/layouts/LecturerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
    user_id: number;
}

interface PageProps {
    notifications: {
        data: Notification[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    unreadCount: number;
    filters: {
        filter: string;
        perPage: number;
    };
}

export default function Index({ notifications, unreadCount, filters }: PageProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return formatDistance(date, new Date(), {
            addSuffix: true,
            locale: id
        });
    };

    const handleFilterChange = (value: string) => {
        router.get(route('lecturer.notifications.index'), {
            filter: value,
            per_page: filters.perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePerPageChange = (value: string) => {
        router.get(route('lecturer.notifications.index'), {
            filter: filters.filter,
            per_page: value
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('lecturer.notifications.mark-all-read'));
    };

    const handlePageChange = (page: number) => {
        router.get(route('lecturer.notifications.index'), {
            page,
            filter: filters.filter,
            per_page: filters.perPage
        }, {
            preserveState: true
        });
    };

    return (
        <LecturerLayout breadcrumbs={[
            { title: 'Dashboard', href: route('lecturer.dashboard') },
            { title: 'Notifications', href: route('lecturer.notifications.index') },
        ]}>
            <Head title="Notifications" />
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-bold">Notifikasi Saya</h1>

                    <div className="flex flex-col md:flex-row gap-3">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCircle className="h-4 w-4" />
                                <span>Tandai Semua Dibaca</span>
                            </Button>
                        )}

                        <div className="flex items-center gap-2">
                            <Select value={filters.filter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="read">Sudah Dibaca</SelectItem>
                                    <SelectItem value="unread">Belum Dibaca</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.perPage.toString()} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Per Page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
                        <BellOff className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 text-lg">Anda tidak memiliki notifikasi.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2 mb-6">
                            {notifications.data.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={route('lecturer.notifications.show', notif.id)}
                                    className={`block p-4 border rounded-lg hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <Bell className={`h-5 w-5 ${!notif.is_read ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className={`font-medium ${!notif.is_read ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                {notif.message.replace(/<[^>]*>/g, '')}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">{formatDate(notif.sent_at)}</p>
                                        </div>
                                        {!notif.is_read && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {notifications.meta.last_page > 1 && (
                            <div className="flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => notifications.meta.current_page > 1 && handlePageChange(notifications.meta.current_page - 1)}
                                                disabled={notifications.meta.current_page === 1}
                                            />
                                        </PaginationItem>

                                        {notifications.meta.links.slice(1, -1).map((link, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={link.active}
                                                    onClick={() => !link.active && handlePageChange(Number(link.label))}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => notifications.meta.current_page < notifications.meta.last_page && handlePageChange(notifications.meta.current_page + 1)}
                                                disabled={notifications.meta.current_page === notifications.meta.last_page}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </LecturerLayout>
    );
}
