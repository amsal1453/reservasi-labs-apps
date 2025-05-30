import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCircle, Eye, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
}

interface Props {
    notifications: Notification[];
}

export default function Index({ notifications }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Notifications', href: route('admin.notifications.index') },
    ];

    const handleDelete = (id: number) => {
        setNotificationToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (notificationToDelete) {
            router.delete(route('admin.notifications.destroy', notificationToDelete));
        }
        setIsDeleteDialogOpen(false);
    };

    const markAllAsRead = () => {
        router.post(route('admin.notifications.mark-all-read'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Notifications" />

            <div className="container py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Notifications</CardTitle>
                        </div>
                        <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark All as Read</span>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {notifications.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Status</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead className="w-40">Sent At</TableHead>
                                        <TableHead className="w-32 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notifications.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell>
                                                {notification.is_read ? (
                                                    <Badge variant="outline" className="bg-gray-100">Read</Badge>
                                                ) : (
                                                    <Badge>New</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {notification.title}
                                            </TableCell>
                                            <TableCell>{notification.sent_at}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link href={route('admin.notifications.show', notification.id)}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">View</span>
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(notification.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium">No notifications</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    You don't have any notifications at the moment.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the notification.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
