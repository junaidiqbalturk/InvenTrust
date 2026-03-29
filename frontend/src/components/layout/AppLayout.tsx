"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navigation } from "./Navigation";
import { HelpCenter } from "./HelpCenter";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import { InvenIqWidget } from "@/components/chat/InvenIqWidget";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Persist sidebar state
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) setIsSidebarCollapsed(saved === "true");
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("sidebar-collapsed", String(newState));
    };

    // During hydration or if not logged in (like login page)
    if (isLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
                <div className="relative h-12 w-12 pt-1">
                    <div className="absolute top-0 left-0 h-10 w-10 border-4 border-primary/20 rounded-full animate-ping"></div>
                    <div className="relative h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex flex-col items-center space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">InvenTrust</h2>
                    <div className="h-1 w-24 bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary animate-[shimmer_1.5s_infinite] w-full" style={{ transform: 'translateX(-100%)' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={toggleSidebar} 
                onHelpClick={() => setIsHelpOpen(true)} 
            />
            <div className={cn(
                "flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "ml-0" : "ml-0" 
            )}>
                <Navigation />
                <main className="flex-1 overflow-y-auto w-full relative z-0 p-0 md:p-0">
                    {children}
                </main>
            </div>

            <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
            <InvenIqWidget />
        </div>
    );
}
