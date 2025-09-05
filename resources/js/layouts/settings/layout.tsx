import { Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { type SharedData } from '@/types';

export default function SettingsLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.role;

    // Tentukan route dashboard berdasarkan role
    const getDashboardRoute = () => {
        switch (userRole) {
            case 'admin':
                return route('admin.dashboard');
            case 'lecturer':
                return route('lecturer.dashboard');
            case 'student':
                return route('student.dashboard');
            default:
                return '/';
        }
    };

    return (
        <div className="space-y-6 p-1">
            <div className="flex items-center gap-4">
                <Link
                    href={getDashboardRoute()}
                    className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <span className="sr-only">Back to dashboard</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back
                </Link>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        <Link
                            href={route('profile.edit')}
                            className={`${route().current('profile.edit')
                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                                } inline-flex w-fit items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all`}
                        >
                            Profile
                        </Link>
                        <Link
                            href={route('password.edit')}
                            className={`${route().current('password.edit')
                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                                } inline-flex w-fit items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all`}
                        >
                            Password
                        </Link>
                        <Link
                            href={route('appearance')}
                            className={`${route().current('appearance')
                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                                } inline-flex w-fit items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all`}
                        >
                            Appearance
                        </Link>
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
        </div>
    );
}
