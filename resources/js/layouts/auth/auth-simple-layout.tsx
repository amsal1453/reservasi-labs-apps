import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden"
            style={{
                backgroundImage: 'url(/background.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Overlay gelap transparan tanpa blur */}
            <div className="absolute inset-0 bg-black/40 z-0" />
            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col gap-8 bg-white/20 rounded-2xl shadow-xl p-10 border border-white/30 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                        <Link href="/" className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex items-center justify-center">
                                <img src="/logouui.png" alt="Logo UUI" className="h-20 w-20 object-contain" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium ">{title}</h1>
                            <p className="text-black text-center text-sm ">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
