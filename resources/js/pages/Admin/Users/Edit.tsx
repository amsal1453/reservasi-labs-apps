import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import * as React from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';

interface RoleOption {
    value: string;
    label: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    nim_nip: string | null;
    role: string | null;
}

interface Props {
    user: UserData;
    roles: RoleOption[];
    errors: Partial<Record<keyof FormData, string>>;
}

interface FormData {
    name: string;
    email: string;
    nim_nip: string;
    role: string;
    password?: string;
    password_confirmation?: string;
    [key: string]: string | number | boolean | File | null | undefined;
}

export default function Edit({ user, roles, errors: initialErrors }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        name: user.name,
        email: user.email,
        nim_nip: user.nim_nip || '' /* Handle null nim_nip */,
        role: user.role || (roles.length > 0 ? roles[0].value : ''),
        password: '',
        password_confirmation: '',
    });

    React.useEffect(() => {
        if (initialErrors) {
            const initialErrorKeys = Object.keys(initialErrors) as Array<keyof typeof initialErrors>;
            initialErrorKeys.forEach((key) => {
                if (key in data) {
                    setData(key as keyof FormData, initialErrors[key] as string);
                }
            });
        }
    }, [initialErrors, setData, data]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Users', href: route('admin.users.index') },
        { title: `Edit User: ${user.name}`, href: route('admin.users.edit', user.id) },
    ];

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const dataToSend: Partial<FormData> = { ...data };
        if (dataToSend.password === '' || dataToSend.password === undefined) {
            delete dataToSend.password;
            delete dataToSend.password_confirmation;
        }

        put(route('admin.users.update', user.id), {
            // @ts-expect-error - Inertia types might not fully align with optional fields here
            data: dataToSend,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />

            <div className="container py-12">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.users.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{`Edit User: ${user.name}`}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Update User Details</CardTitle>
                        <CardDescription>Modify the form below to update the user information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nim_nip">NIM/NIP</Label>
                                    <Input
                                        id="nim_nip"
                                        type="text"
                                        value={data.nim_nip}
                                        onChange={(e) => setData('nim_nip', e.target.value)}
                                        placeholder="Leave empty if not applicable"
                                    />
                                    <InputError message={errors.nim_nip} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger id="role" className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password || ''}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation || ''}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-8">
                                <Link href={route('admin.users.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="animate-spin h-4 w-4 mr-2" />}
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
