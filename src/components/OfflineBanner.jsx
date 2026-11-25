"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        const update = () => setOffline(!navigator.onLine);
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);

    if (!offline) return null;

    return (
        <div role="alert" className="bg-destructive px-4 py-2 text-center text-xs font-medium text-white">
            You're offline. Changes can't be saved until your connection is back.
        </div>
    );
}