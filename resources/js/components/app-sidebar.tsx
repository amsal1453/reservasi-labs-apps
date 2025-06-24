import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, CalendarCheck, LayoutGrid, School, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kelola Lab',
        href: '/admin/labs',
        icon: School,
    },
    {
        title: 'Jadwal',
        href: '/admin/lab-manager',
        icon: Calendar,
    },
    {
        title: 'Reservasi',
        href: '/admin/reservations',
        icon: CalendarCheck,
    },
    {
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Notifikasi',
        href: '/admin/notifications',
        icon: null,
        customIcon: true,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props as any;

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-[#800000] text-white">
            {/* Header: Logo */}
            <SidebarHeader className="bg-[#800000] flex items-center justify-center h-20 border-b border-[#a52a2a]/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="bg-[#800000] hover:bg-[#800000] flex items-center justify-center p-4"
                        >
                            <Link href="/" prefetch className="flex items-center justify-center">
                                <AppLogo className="h-14 w-auto" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Menu Utama */}
            <SidebarContent>
                <NavMain items={mainNavItems} userId={auth?.user?.id} />
            </SidebarContent>

            {/* Footer & User Info */}
            <SidebarFooter className="bg-[#800000] border-t border-[#a52a2a]/40 mt-auto">
                <NavFooter items={footerNavItems} className="mb-2" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
