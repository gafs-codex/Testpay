"use client";

import { useEffect } from "react";
import ErrorState from "@/components/ErrorState";
import { friendlyError } from "@/lib/error";

export default function DashboardError({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorState
            title="This page ran into a problem"
            message={friendlyError(error, "Something unexpected happened on this page.")}
            onRetry={reset}
        />
    );
}