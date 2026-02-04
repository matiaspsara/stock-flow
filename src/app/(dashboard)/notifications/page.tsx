"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/hooks/useNotifications";
import { timeAgo } from "@/lib/utils/time";
import { CardListSkeleton } from "@/components/ui/loading-skeletons";

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const { data: notifications = [], isLoading } = useNotifications({ type: tab, unreadOnly: tab === "unread" });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Notificaciones</CardTitle>
        <Button variant="outline" onClick={() => markAll.mutate()}>Marcar todas como leídas</Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">No leídas</TabsTrigger>
            <TabsTrigger value="low_stock">Stock bajo</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            {isLoading ? (
              <CardListSkeleton count={4} />
            ) : (
              <div className="grid gap-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.message}</div>
                        <div className="text-xs text-muted-foreground">{timeAgo(notification.created_at)}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markRead.mutate({ id: notification.id, is_read: !notification.is_read })}
                      >
                        {notification.is_read ? "Marcar como no leída" : "Marcar como leída"}
                      </Button>
                    </div>
                    {notification.reference_id && (
                      <Link href={`/products/${notification.reference_id}/history`} className="text-xs text-primary underline">
                        Ver detalle
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
