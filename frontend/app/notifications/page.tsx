'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../utils/api';
import {
  Bell,
  MessageSquare,
  ThumbsUp,
  Briefcase,
  FileText,
  UserPlus,
  UserCheck,
  Check,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';

function getInitials(name?: string): string {
  if (!name) return 'CH';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMarkAllRead = async () => {
    if (notifications.length === 0 || !notifications.some((n) => !n.isRead)) {
      toast.info('No unread notifications.');
      return;
    }
    setMarkingAll(true);
    try {
      const res = await api.markNotificationsRead();
      if (res?.message?.includes('read') || res?.message?.includes('success')) {
        toast.success('All notifications marked as read.');
        fetchNotifications();
        // Trigger navbar unread count refresh by dispatching or just updating local state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage')); // to sync with navbar unread counts if any
        }
      }
    } catch {
      toast.error('Failed to update notifications.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    // If unread, mark as read on the backend
    if (!notif.isRead) {
      try {
        await api.markNotificationsRead(notif._id);
        // Update local state immediately
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
    
    // Redirect if a link exists
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Get icon and colors based on notification type
  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'comment':
        return {
          icon: MessageSquare,
          bgColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        };
      case 'like':
        return {
          icon: ThumbsUp,
          bgColor: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
        };
      case 'job_posted':
        return {
          icon: Briefcase,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        };
      case 'job_applied':
        return {
          icon: FileText,
          bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        };
      case 'connection_request':
        return {
          icon: UserPlus,
          bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        };
      case 'connection_accept':
        return {
          icon: UserCheck,
          bgColor: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
        };
      default:
        return {
          icon: Bell,
          bgColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        };
    }
  };

  return (
    <div className="relative min-h-screen page-bg">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[10%] left-[10%] w-[35%] h-[35%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[15%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Widget */}
        <div className="theme-card rounded-2xl p-5 sm:p-6 shadow-xl mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Bell className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold theme-text-primary tracking-tight">Notifications</h1>
              <p className="text-[11px] theme-text-secondary mt-0.5">Stay updated on comments, likes, jobs, and network activity.</p>
            </div>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border theme-border hover:bg-[var(--btn-sec-bg)] text-xs font-bold theme-text-secondary hover:theme-text-primary transition-all disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs theme-text-secondary">Loading updates...</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="theme-card rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <Bell className="w-8 h-8" />
                </div>
                <h2 className="text-sm font-semibold theme-text-secondary font-bold">You're all caught up!</h2>
                <p className="text-xs theme-text-muted mt-1.5 max-w-xs leading-relaxed">
                  Any updates on your posted jobs, applications, likes, comments, or connections will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = getNotificationConfig(notif.type);
                const IconComponent = config.icon;
                const sender = notif.senderId;

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`theme-card rounded-2xl p-4 cursor-pointer hover:border-indigo-500/40 transition-all duration-200 flex items-start gap-4 relative overflow-hidden group shadow-sm ${
                      !notif.isRead ? 'border-indigo-500/30 bg-indigo-500/[0.02]' : 'border-transparent'
                    }`}
                  >
                    {/* Unread highlight bar */}
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md" />
                    )}

                    {/* Sender Avatar & Type Icon Overlaid */}
                    <div className="relative shrink-0 select-none">
                      {sender?.profilePicture ? (
                        <img
                          src={sender.profilePicture}
                          alt={sender.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-[var(--border)]">
                          {getInitials(sender?.name)}
                        </div>
                      )}

                      {/* Small Type Icon overlay at bottom right */}
                      <div className={`absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full border border-[var(--background)] flex items-center justify-center shadow-md ${config.bgColor}`}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs theme-text-primary leading-normal pr-4 ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>
                          {notif.message}
                        </p>
                        
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]/30 text-[10px] theme-text-muted">
                        <span>{formatRelativeTime(notif.createdAt)}</span>
                        {notif.link && (
                          <span className="flex items-center gap-0.5 text-indigo-400 group-hover:underline">
                            View details
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
