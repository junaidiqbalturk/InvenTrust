"use client";

import { useAuth } from "@/context/AuthContext";
import {
    LogOut,
    User as UserIcon,
    Bell,
    Search,
    Menu,
    Ship,
    LayoutDashboard,
    Users,
    FileText,
    Package,
    PlaneTakeoff,
    Settings,
    Receipt,
    UserCircle,
    FolderOpen,
    PieChart,
    Factory,
    FileCheck
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

export function Navigation() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Clients", href: "/clients", icon: Users },
        { name: "Vendors", href: "/vendors", icon: Factory },
        { name: "Vendor Bills", href: "/vendor-bills", icon: FileCheck },
        { name: "Documents", href: "/documents", icon: FolderOpen },
        { name: "Shipments", href: "/shipments", icon: Ship },
        { name: "Import Orders", href: "/imports", icon: Package },
        { name: "Export Orders", href: "/exports", icon: PlaneTakeoff },
        { name: "Invoices", href: "/invoices", icon: FileText },
        { name: "Vouchers", href: "/vouchers", icon: Receipt },
        { name: "Reports", href: "/reports", icon: PieChart },
    ];

    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 flex w-full bg-card shadow-sm dark:bg-card">
            <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
                <div className="flex items-center gap-4 flex-1">
                    <button className="md:hidden inline-flex items-center justify-center shrink-0 rounded-sm h-9 w-9 text-muted-foreground hover:bg-muted transition-colors focus:outline-none">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="relative w-full max-w-md hidden sm:block">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Type to search..."
                            className="w-full bg-transparent pl-9 pr-4 text-foreground focus:outline-none xl:w-125 placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-4 focus:outline-none ml-2">
                            <span className="hidden text-right lg:block">
                                <span className="block text-sm font-medium text-foreground">{user.name}</span>
                                <span className="block text-xs font-medium text-muted-foreground">{user.role?.name || 'User'}</span>
                            </span>
                            <span className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                <UserIcon className="h-5 w-5" />
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer font-medium">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
