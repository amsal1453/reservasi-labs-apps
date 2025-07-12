import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    ChevronDown,
    User,
    Settings,
    School,
    Calendar,
    CalendarCheck,
    Users,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/NotificationBell';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Ambil tanggal hari ini untuk header
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${days[today.getDay()]}, ${today.getDate().toString().padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`;

    const navItems = [
        {
            title: 'Dashboard',
            href: route('admin.dashboard'),
            icon: <LayoutDashboard className="h-5 w-5" />,
            active: route().current('admin.dashboard'),
        },
        {
            title: 'Kelola Lab',
            href: route('admin.labs.index'),
            icon: <School className="h-5 w-5" />,
            active: route().current('admin.labs.*'),
        },
        {
            title: 'Jadwal',
            href: route('admin.lab-manager.index'),
            icon: <Calendar className="h-5 w-5" />,
            active: route().current('admin.lab-manager.*'),
        },
        {
            title: 'Reservasi',
            href: route('admin.reservations.index'),
            icon: <CalendarCheck className="h-5 w-5" />,
            active: route().current('admin.reservations.*'),
        },
        {
            title: 'Pengguna',
            href: route('admin.users.index'),
            icon: <Users className="h-5 w-5" />,
            active: route().current('admin.users.*'),
        },
        {
            title: 'Notifikasi',
            href: route('admin.notifications.index'),
            icon: <Bell className="h-5 w-5" />,
            active: route().current('admin.notifications.*'),
        },
        {
            title: 'Pengaturan',
            href: '/settings/profile',
            icon: <Settings className="h-5 w-5" />,
            active: route().current('profile.edit') || route().current('password.edit') || route().current('appearance'),
        },
    ];

    return (
        <div className="min-h-screen bg-white">
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
                            <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white">
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
                                    href="/settings/profile"
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
                    "fixed inset-y-0 left-0 z-20 w-64 bg-[#800000] transform transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full text-white">
                    {/* Sidebar header with logo */}
                    <div className="h-20 flex items-center justify-center border-b border-white/20 p-2">
                        <div className="flex gap-2 items-center">
                            <img src="/logouui.png" alt="UUI Logo" className="h-24 w-auto" />
                            <h1 className="text-lg font-bold text-white mt-1">LAB FST-UUI</h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="px-4 py-2 text-sm font-medium text-white/70 uppercase">
                        MAIN NAVIGATION
                    </div>
                    <nav className="flex-1 overflow-y-auto py-2">
                        <ul className="space-y-1 px-2">
                            {navItems.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                                            item.active
                                                ? "bg-white/10 text-white"
                                                : "text-white/80 hover:bg-white/10 hover:text-white"
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
                    <div className="mt-auto border-t border-white/20 p-4">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#800000]">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{auth.user.name}</div>
                                    <div className="text-xs text-white/70">Admin</div>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-white/70" />
                        </div>

                        {isProfileOpen && (
                            <div className="mt-3 space-y-1 border-t border-white/20 pt-3">
                                <Link
                                    href="/settings/profile"
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-white/80 rounded-md hover:bg-white/10 hover:text-white"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-white/80 rounded-md hover:bg-white/10 hover:text-white"
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
                {/* Header with date, breadcrumbs and notification bell */}
                <div className="bg-white border-b">
                    <div className="flex items-center justify-between gap-4 px-6 py-4">
                        {/* Left: Breadcrumbs */}
                        <div className="flex items-center gap-4">
                            {breadcrumbs.length > 0 && (
                                <div className="flex items-center h-7">
                                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                                </div>
                            )}
                        </div>
                        {/* Right: Date and Notification */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold whitespace-nowrap text-[#800000] flex items-center h-7">
                                {formattedDate}
                            </span>
                            <NotificationBell
                                href={route('admin.notifications.index')}
                                className="w-7 h-7 text-[#800000]"
                            />
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
