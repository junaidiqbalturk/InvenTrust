"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/providers/TranslationProvider";
import {
    LayoutDashboard,
    Users,
    Ship,
    Plane,
    FileText,
    Receipt,
    BookOpen,
    PieChart,
    Settings,
    Warehouse,
    Folder,
    Anchor,
    Factory,
    ShoppingCart,
    FileCheck,
    ChevronLeft,
    ChevronRight,
    Search,
    TrendingUp,
    HelpCircle,
    Languages,
    Check
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onHelpClick: () => void;
}

export function Sidebar({ isCollapsed, onToggle, onHelpClick }: SidebarProps) {
    const { user, can } = useAuth();
    const pathname = usePathname();
    const { t, language, setLanguage } = useTranslation();

    if (!user) return null;

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, id: "sidebar-dashboard" },
        { name: "Inventory", href: "/inventory", icon: Warehouse, permission: "view_inventory" },
        { name: "Sales & Invoicing", href: "/sales", icon: FileText, permission: "view_invoices" },
        { name: "Purchases", href: "/purchases", icon: ShoppingCart, permission: "view_pos" },
        { name: "Ledger", href: "/ledger", icon: BookOpen, permission: "view_clients" },
        { name: "Payments", href: "/payments", icon: Receipt, permission: "view_vouchers" },
        { name: "Reports", href: "/reports", icon: PieChart },
    ];


    const adminNavigation = [
        { name: "Settings", href: "/settings", icon: Settings, permission: "manage_roles" },
        { name: "Roles & Permissions", href: "/admin/roles", icon: FileCheck, permission: "manage_roles" },
        { name: "User Management", href: "/admin/users", icon: Users, permission: "manage_users" },
    ];

    const filteredNav = navigation.filter(item => !item.permission || can(item.permission));
    const filteredAdminNav = adminNavigation.filter(item => !item.permission || can(item.permission));

    return (
        <aside className={cn(
            "bg-[#1C2434] text-[#8A99AF] flex-shrink-0 flex flex-col h-screen sticky top-0 hidden md:flex z-50 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64 lg:w-72"
        )}>
            <div className={cn("h-20 flex items-center py-4 relative", isCollapsed ? "justify-center px-0" : "px-6")}>
                <Logo size="md" isCollapsed={isCollapsed} className="w-full justify-center" />
                
                {/* Toggle Button */}
                <button 
                    onClick={onToggle}
                    className="absolute -right-3 top-7 bg-primary text-white rounded-full p-1 border-2 border-[#1C2434] hover:scale-110 transition-transform shadow-lg z-[60]"
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            </div>

            <nav className={cn("flex-1 py-4 space-y-1.5 overflow-y-auto no-scrollbar mb-4 mt-2", isCollapsed ? "px-2" : "px-4")}>
                {!isCollapsed && <h3 className="mb-4 ml-4 text-xs font-semibold text-[#8A99AF] tracking-widest uppercase">General</h3>}
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : ""}
                            id={item.id}
                            className={`group relative flex items-center rounded-sm py-2.5 font-medium duration-300 ease-in-out hover:bg-[#333A48] hover:text-white ${isActive
                                ? "bg-[#333A48] text-white"
                                : "text-[#8A99AF]"
                                } ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}`}
                        >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                            {isCollapsed && isActive && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                />
                            )}
                        </Link>
                    )
                })}

                {filteredAdminNav.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-[#333A48]">
                        {!isCollapsed && <h3 className="mb-4 ml-4 text-xs font-semibold text-[#8A99AF] tracking-widest uppercase">Admin Panel</h3>}
                        {filteredAdminNav.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    title={isCollapsed ? item.name : ""}
                                    className={`group relative flex items-center rounded-sm py-2.5 font-medium duration-300 ease-in-out hover:bg-[#333A48] hover:text-white ${isActive
                                        ? "bg-[#333A48] text-white"
                                        : "text-[#8A99AF]"
                                        } ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}`}
                                >
                                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                                </Link>
                            )
                        })}
                    </div>
                )}
                
                {/* Help & Language Switcher Section */}
                <div className="mt-8 pt-8 border-t border-[#333A48] space-y-2">
                    <button
                        onClick={onHelpClick}
                        className={cn(
                            "w-full group relative flex items-center rounded-sm py-2.5 font-medium duration-300 ease-in-out hover:bg-[#333A48] hover:text-white text-[#8A99AF]",
                            isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                        )}
                    >
                        <HelpCircle className="h-5 w-5 flex-shrink-0 group-hover:text-primary transition-colors" />
                        {!isCollapsed && <span className="truncate">Help Center</span>}
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "w-full group relative flex items-center rounded-sm py-2.5 font-medium duration-300 ease-in-out hover:bg-[#333A48] hover:text-white text-[#8A99AF]",
                                    isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                                )}
                            >
                                <Languages className="h-5 w-5 flex-shrink-0 group-hover:text-primary transition-colors" />
                                {!isCollapsed && (
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                        <span className="truncate uppercase">{language}</span>
                                        <ChevronRight className="h-4 w-4 opacity-50" />
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1C2434] border-[#333A48] text-[#8A99AF] min-w-[140px] z-[100]">
                            <DropdownMenuItem onClick={() => setLanguage('en')} className="hover:bg-[#333A48] focus:bg-[#333A48] focus:text-white gap-3 cursor-pointer">
                                <span>English</span>
                                {language === 'en' && <Check className="h-4 w-4 ml-auto text-primary" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('es')} className="hover:bg-[#333A48] focus:bg-[#333A48] focus:text-white gap-3 cursor-pointer">
                                <span>Español</span>
                                {language === 'es' && <Check className="h-4 w-4 ml-auto text-primary" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('fr')} className="hover:bg-[#333A48] focus:bg-[#333A48] focus:text-white gap-3 cursor-pointer">
                                <span>Français</span>
                                {language === 'fr' && <Check className="h-4 w-4 ml-auto text-primary" />}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            <div className={cn("p-4 mt-auto transition-all", isCollapsed && "px-2")}>
                <div className={cn("bg-[#333A48] p-3 rounded-sm flex items-center gap-3 border border-[#333A48] overflow-hidden transition-all", isCollapsed ? "justify-center px-0" : "px-3")}>
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#1C2434] flex items-center justify-center text-white font-bold border border-[#2E3A47]">
                        {user.name.charAt(0)}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">{user.name}</p>
                            <p className="text-xs text-[#8A99AF] truncate flex flex-col">
                                <span>{user.email}</span>
                                <span className="text-[10px] font-bold text-primary uppercase mt-0.5">{user.role?.name || 'User'}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
