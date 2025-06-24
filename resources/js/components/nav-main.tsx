import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';

interface NavMainProps {
    items: NavItem[];
    userId?: number;
}

export function NavMain({ items = [], userId }: NavMainProps) {
    const page = usePage();

    const navItems = [
        ...items,
        {
            title: 'Pengaturan',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <SidebarGroup className="px-0 py-0 bg-[#800000] min-h-screen">
            <SidebarGroupLabel className="bg-[#800000] text-xs font-bold uppercase px-0 flex items-center h-12 border-b border-gray-400 tracking-wider text-white pl-4">
                MAIN NAVIGATION
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0 min-h-screen bg-[#800000]">
                {navItems.map((item) => {
                    const isActive = item.href === page.url;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className={cn(
                                    "flex items-center gap-3 px-2 py-2 pl-4 text-base font-semibold border-l-4 transition-all rounded-lg mb-2 justify-start",
                                    isActive
                                        ? "bg-[#980000] text-white border-[#980000]"
                                        : "bg-[#800000] text-white border-transparent hover:bg-[#a00000] active:bg-[#a00000] focus:bg-[#a00000]"
                                )}
                                tooltip={{ children: item.title }}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className="flex items-center gap-3 w-full justify-start"
                                >
                                    {item.customIcon ? (
                                        <NotificationBell
                                            href={item.href}
                                            className="w-7 h-7"
                                        />
                                    ) : (
                                        item.icon && <item.icon className="w-7 h-7" />
                                    )}
                                    <span className="truncate text-left">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
