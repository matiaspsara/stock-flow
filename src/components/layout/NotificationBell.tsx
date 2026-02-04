"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotifications, useUnreadCount, useMarkNotificationRead } from "@/hooks/useNotifications";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils/time";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkNotificationRead();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-md p-2 hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="px-3 py-2 text-sm font-semibold">Notificaciones</div>
        {notifications.slice(0, 5).map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex items-start gap-2"
            onClick={() => markRead.mutate({ id: notification.id, is_read: true })}
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{notification.title}</div>
              <div className="text-xs text-muted-foreground">{notification.message}</div>
              <div className="text-xs text-muted-foreground">{timeAgo(notification.created_at)}</div>
            </div>
            {!notification.is_read && <Badge variant="warning">Nuevo</Badge>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href="/notifications">Ver todas</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
