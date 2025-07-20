
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Check, AlertTriangle, Wallet, Calendar, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        toast({
          title: 'Failed to load notifications',
          description: 'There was an error loading your notifications. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast({
        title: 'Failed to update notification',
        description: 'There was an error marking the notification as read.',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: 'All notifications marked as read',
        description: 'All your notifications have been marked as read.',
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: 'Failed to update notifications',
        description: 'There was an error marking all notifications as read.',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'balance':
        return <Wallet className="h-5 w-5 text-green-500" />;
      case 'zakat':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'order':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No notifications yet</p>
          <p className="text-sm text-gray-400">
            You'll receive notifications about balance updates, zakat reminders, and system alerts here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <Button 
          variant="outline" 
          onClick={markAllAsRead}
          disabled={!notifications.some(n => !n.is_read)}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={notification.is_read ? 'opacity-70' : 'border-l-4 border-l-blue-500'}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={
                        notification.type === 'balance' ? 'bg-green-100 text-green-800 border-green-300' :
                        notification.type === 'zakat' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        notification.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
                        notification.type === 'order' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }>
                        {notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 px-2"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;