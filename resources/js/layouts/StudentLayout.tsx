import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    LogOut,
    Menu,
    X,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/NotificationBell';

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    active: boolean;
}

interface Breadcrumb {
    title: string;
    href: string;
}

interface StudentLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    auth: {
        user: User
    };
    [key: string]: unknown;
}

export default function StudentLayout({ children, breadcrumbs = [] }: StudentLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('student.dashboard'),
            icon: <LayoutDashboard className="h-5 w-5" />,
            active: route().current('student.dashboard'),
        },
        {
            title: 'Reservasi',
            href: route('student.reservations.index'),
            icon: <ClipboardList className="h-5 w-5" />,
            active: route().current('student.reservations.*'),
        },
        {
            title: 'Jadwal Lab',
            href: route('student.lab-schedules.index'),
            icon: <Calendar className="h-5 w-5" />,
            active: route().current('student.lab-schedules.*'),
        },
        // Notification removed from sidebar and moved to header
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-2">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                    >
                        {isSidebarOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                    <div className="text-lg font-semibold">Reservasi Labs</div>
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {auth.user.name.charAt(0)}
                            </div>
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                    <div className="font-medium">{auth.user.name}</div>
                                    <div className="text-gray-500">{auth.user.email}</div>
                                </div>
                                <Link
                                    href={route('profile.edit')}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar header */}
                    <div className="h-16 flex items-center justify-center border-b">
                        <h1 className="text-xl font-bold text-blue-600">Reservasi Labs</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-2">
                            {navItems.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                                            item.active
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        {item.icon}
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User profile */}
                    <div className="border-t p-4">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{auth.user.name}</div>
                                    <div className="text-xs text-gray-500">Mahasiswa</div>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>

                        {isProfileOpen && (
                            <div className="mt-3 space-y-1 border-t pt-3">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                <div className="lg:py-6 lg:px-8 pt-16 lg:pt-0">
                    {/* Header with Breadcrumbs and Notification Bell */}
                    <div className="mb-4 flex items-center justify-between">
                        {breadcrumbs.length > 0 && (
                            <nav className="hidden lg:block">
                                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                                    {breadcrumbs.map((crumb, index) => (
                                        <React.Fragment key={index}>
                                            {index > 0 && <span>/</span>}
                                            <li>
                                                {index === breadcrumbs.length - 1 ? (
                                                    <span className="font-medium text-gray-900">{crumb.title}</span>
                                                ) : (
                                                    <Link href={crumb.href} className="hover:text-blue-600">
                                                        {crumb.title}
                                                    </Link>
                                                )}
                                            </li>
                                        </React.Fragment>
                                    ))}
                                </ol>
                            </nav>
                        )}
                        <div className="ml-auto">
                            <NotificationBell
                                href={route('student.notifications.index')}
                                userId={auth.user.id}
                                count={0}
                            />
                        </div>
                    </div>

                    {/* Page content */}
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
