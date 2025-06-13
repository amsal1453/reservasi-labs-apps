import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, LayoutDashboard, LogOut, User, Calendar } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NotificationBell } from '@/components/NotificationBell';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { ChevronsUpDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import { router } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

const lecturerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/lecturer/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'My Reservations',
        href: '/lecturer/reservations',
        icon: CalendarDays,
    },
    {
        title: 'Lab Schedules',
        href: '/lecturer/lab-schedules',
        icon: Calendar,
    },
];

function LecturerSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-0 shadow-lg"
        >
            <SidebarHeader className="pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="flex items-center justify-center">
                            <Link href="/lecturer/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {lecturerNavItems.map((item) => {
                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton size="lg" asChild className="hover:bg-accent transition-colors">
                                    <Link href={item.href} prefetch>
                                        {item.customIcon ? (
                                            <div className="mr-3">
                                                <NotificationBell
                                                    href={item.href}
                                                />
                                            </div>
                                        ) : (
                                            item.icon && <item.icon className="mr-3 size-5" />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="hover:bg-accent data-[state=open]:bg-accent transition-colors">
                                    <UserInfo user={auth.user} />
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="min-w-56 rounded-lg w-[var(--radix-dropdown-menu-trigger-width)]"
                                align="end"
                                side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <UserInfo user={auth.user} showEmail={true} />
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                                            <User className="mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                                        <LogOut className="mr-2" />
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function LecturerHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-4">
                <NotificationBell
                    href={route('lecturer.notifications.index')}
                />
            </div>
        </header>
    );
}

interface LecturerLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function LecturerLayout({ children, breadcrumbs = [] }: LecturerLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <LecturerSidebar />
            <AppContent variant="sidebar" className="px-6 py-6 bg-gray-50">
                <LecturerHeader breadcrumbs={breadcrumbs} />
                <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
