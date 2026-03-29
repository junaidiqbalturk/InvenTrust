"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, FileText, Receipt, Package, Ship, Trash2, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface NotificationData {
    id: string;
    data: {
        title: string;
        message: string;
        entity_type: string;
        entity_id: number;
        entity_number: string;
        action_type: string;
    };
    read_at: string | null;
    created_at: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                api.get("/notifications"),
                api.get("/notifications/count")
            ]);
            setNotifications(notifsRes.data.data);
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const handleNotificationClick = (notification: NotificationData) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        
        // Navigate based on entity type
        const type = notification.data.entity_type;
        const id = notification.data.entity_id;
        
        if (type === 'invoice') router.push(`/invoices?view=${id}`);
        else if (type === 'voucher') router.push(`/vouchers?view=${id}`);
        else if (type === 'shipment') router.push(`/shipments/${id}`);
        else if (type === 'purchaseorder') router.push(`/purchase-orders/${id}`);
        
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'invoice': return <FileText className="h-4 w-4 text-primary" />;
            case 'voucher': return <Receipt className="h-4 w-4 text-emerald-500" />;
            case 'shipment': return <Ship className="h-4 w-4 text-blue-500" />;
            case 'purchaseorder': return <Package className="h-4 w-4 text-orange-500" />;
            default: return <Bell className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground transition-colors focus:outline-none">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-[1.5px] border-card">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <DropdownMenuLabel className="p-0 font-bold text-base">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <CheckCheck className="h-3 w-3" />
                            Mark all read
                        </button>
                    )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem 
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 p-4 cursor-pointer focus:bg-muted/50 border-b last:border-0",
                                    !notification.read_at && "bg-primary/5 dark:bg-primary/10"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={cn(
                                    "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border",
                                    !notification.read_at && "border-primary/30"
                                )}>
                                    {getIcon(notification.data.entity_type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                        <p className={cn(
                                            "text-sm font-semibold leading-none",
                                            !notification.read_at ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {notification.data.title}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {notification.data.message}
                                    </p>
                                    {!notification.read_at && (
                                        <button 
                                            onClick={(e) => markAsRead(notification.id, e)}
                                            className="text-[10px] text-primary hover:underline font-medium pt-1"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                
                {notifications.length > 0 && (
                    <div className="p-2 border-t text-center">
                        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 w-full font-medium">
                            View all notifications
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
