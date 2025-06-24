import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (state === 'collapsed' && !isMobile) {
        // Sidebar collapsed: hanya tampilkan avatar user kecil, tanpa latar keras
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="icon"
                        className="bg-transparent shadow-none p-0 m-0 flex items-center justify-center rounded-full w-10 h-10"
                    >
                        <UserInfo user={auth.user} showEmail={false} />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // Sidebar expanded atau mobile
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="bg-white hover:bg-gray-100 border text-gray-800 font-medium rounded-xl shadow-sm transition-all duration-200 px-4 py-2 flex items-center gap-2"
                        >
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4 text-gray-500" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-xl border border-gray-200 shadow-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                    ? 'left'
                                    : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
