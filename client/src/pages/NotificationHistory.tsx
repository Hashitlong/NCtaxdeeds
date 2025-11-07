import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/PageHeader";

export default function NotificationHistory() {
  const { data: notifications, isLoading, refetch } = trpc.notifications.getUnread.useQuery();
  
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Notification marked as read");
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("All notifications marked as read");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Notifications" />
      <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        {notifications && notifications.length > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification History
          </h1>
          <p className="text-muted-foreground mt-2">
            View your recent property alerts
          </p>
        </div>

        {!notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground mb-4">
                You'll see alerts here when new properties match your preferences
              </p>
              <Link href="/notification-settings">
                <Button>Configure Notifications</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => (
              <Card key={notif.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        New Property Alert
                      </CardTitle>
                      <CardDescription>
                        {notif.sentAt && formatDistanceToNow(new Date(notif.sentAt), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(notif.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as Read
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">{notif.address || "Address not available"}</p>
                      <p className="text-sm text-muted-foreground">{notif.county} County</p>
                    </div>
                    
                    {notif.openingBid && (
                      <div>
                        <span className="text-sm text-muted-foreground">Opening Bid: </span>
                        <span className="font-semibold">${notif.openingBid.toLocaleString()}</span>
                      </div>
                    )}

                    <Link href={`/properties`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Property
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
