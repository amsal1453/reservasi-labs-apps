import React, { useEffect, useState } from 'react';

let triggerDashboardNotification: ((msg: string) => void) | null = null;

export default function AppLogo({ className = "" }: { className?: string }) {
    const [showNotif, setShowNotif] = useState(false);
    const [notifMsg, setNotifMsg] = useState('');

    useEffect(() => {
        triggerDashboardNotification = (msg: string) => {
            setNotifMsg(msg);
            setShowNotif(true);
            setTimeout(() => setShowNotif(false), 10000);
        };
        return () => {
            triggerDashboardNotification = null;
        };
    }, []);

    return (
        <div className={`relative flex flex-row items-center w-full h-full gap-3 ${className}`}>
            <img
                src="/komputer.png"
                alt="Lab Komputer"
                className="h-15 w-10 object-contain drop-shadow-md"
            />
            <span className="font-extrabold text-white tracking-wide text-lg truncate" style={{ textShadow: '0 1px 4px #400000' }}>
                LAB FST-UUI
            </span>
            {showNotif && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow z-10 animate-bounce">
                    {notifMsg}
                </span>
            )}
        </div>
    );
}

export function showDashboardNotification(msg: string) {
    if (triggerDashboardNotification) triggerDashboardNotification(msg);
}
