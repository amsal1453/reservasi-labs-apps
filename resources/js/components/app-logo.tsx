import React from 'react';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center">
                <img
                    src="/logo.png"
                    alt="Universitas Ubudiyah Indonesia"
                    className="h-24"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-bold">LAB FST-UUI</span>
            </div>
        </>
    );
}
