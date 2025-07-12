import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import LecturerLayout from '@/layouts/LecturerLayout';
import StudentLayout from '@/layouts/StudentLayout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: '/settings/profile',
    },
    {
        title: 'Password',
        href: '/settings/password',
    },
];

export default function Password() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.roles[0]?.name;

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    // Render content
    const renderContent = () => (
        <>
            <Head title="Pengaturan Password" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Perbarui Password" description="Pastikan akun Anda menggunakan password yang panjang dan acak untuk tetap aman" />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Password saat ini</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder="Password saat ini"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password baru</Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Password baru"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Konfirmasi password</Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Konfirmasi password"
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className="bg-[#800000] hover:bg-[#800000]/90 text-white font-bold">Simpan password</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Tersimpan</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </>
    );

    // Render with appropriate layout based on user role
    switch (userRole) {
        case 'admin':
            return <AppLayout breadcrumbs={breadcrumbs}>{renderContent()}</AppLayout>;
        case 'lecturer':
            return <LecturerLayout breadcrumbs={breadcrumbs}>{renderContent()}</LecturerLayout>;
        case 'student':
            return <StudentLayout breadcrumbs={breadcrumbs}>{renderContent()}</StudentLayout>;
        default:
            return <AppLayout breadcrumbs={breadcrumbs}>{renderContent()}</AppLayout>;
    }
}
