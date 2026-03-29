"use client";

import { useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface BrandingProviderProps {
    children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
    const { user } = useAuth();

    useEffect(() => {
        if (user?.company?.settings) {
            const settings = user.company.settings as any;
            const primary = settings.primary_color || "#059669";
            const secondary = settings.secondary_color || "#115E59";

            // Inject CSS variables into the root element
            document.documentElement.style.setProperty("--primary", primary);
            document.documentElement.style.setProperty("--ring", primary);
            document.documentElement.style.setProperty("--accent", primary);
            document.documentElement.style.setProperty("--secondary", secondary);
            
            // Handle hover/active states if necessary (can be derived in globals.css or here)
            // For now, simple overrides
        } else {
            // Reset to defaults if no company settings (Emerald Executive Theme)
            document.documentElement.style.setProperty("--primary", "#059669");
            document.documentElement.style.setProperty("--ring", "#059669");
            document.documentElement.style.setProperty("--accent", "#059669");
            document.documentElement.style.setProperty("--secondary", "#115E59");
        }
    }, [user?.company?.settings]);

    return <>{children}</>;
}
