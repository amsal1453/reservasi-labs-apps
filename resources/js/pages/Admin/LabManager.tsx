import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';

interface Lab {
    id: number;
    name: string;
}

interface Props {
    labs: Lab[];
}

export default function LabManager({ labs }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Manajemen Lab', href: route('admin.lab-manager.index') },
    ];

    const handleLabClick = (labId: number) => {
        // Redirect to schedules page with lab_id query parameter
        router.visit(route('admin.schedules.index', { lab_id: labId }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Lab" />

            <div className="container py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">Manajemen Lab</h1>
                    <p className="text-gray-600 mb-6">Pilih lab untuk melihat jadwal yang tersedia.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {labs.map((lab) => (
                            <Card
                                key={lab.id}
                                className="cursor-pointer transition-all hover:shadow-md hover:border-primary bg-gray-300"
                                onClick={() => handleLabClick(lab.id)}
                            >
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center bg-[#800000] text-white">
                                    <h3 className="font-medium text-lg mb-2">{lab.name}</h3>
                                    <p className="text-sm text-white/80">Klik untuk melihat jadwal</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
