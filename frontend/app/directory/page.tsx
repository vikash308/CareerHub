'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../utils/api';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Loader2,
  Mail,
  Building2,
  Check,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

function getInitials(name: string): string {
  if (!name) return 'CH';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function DirectoryPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'incoming' | 'sent'>('discover');
  
  // Search state
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Sync searchQuery with URL params if it changes
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get all profiles
      const profilesRes = await api.getAllUserProfiles();
      if (profilesRes && Array.isArray(profilesRes.profiles)) {
        setProfiles(profilesRes.profiles);
      }

      if (user) {
        // 2. Get incoming requests
        const incomingRes = await api.getIncomingRequests();
        if (Array.isArray(incomingRes)) {
          setIncomingRequests(incomingRes);
        }

        // 3. Get sent requests
        const sentRes = await api.getSentRequests();
        if (sentRes && Array.isArray(sentRes.connections)) {
          setSentRequests(sentRes.connections);
        }
      }
    } catch (error) {
      toast.error('Failed to load directory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Actions
  const handleConnect = async (targetUserId: string, name: string) => {
    setActionInProgress(targetUserId);
    try {
      const res = await api.sendConnectionRequest(targetUserId);
      if (res?.message === 'request sent') {
        toast.success(`Connection request sent to ${name}!`);
        // Refresh sent requests
        const sentRes = await api.getSentRequests();
        if (sentRes && Array.isArray(sentRes.connections)) {
          setSentRequests(sentRes.connections);
        }
      } else {
        toast.error(res?.message || 'Failed to send connection request.');
      }
    } catch {
      toast.error('Network error. Could not connect.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAcceptOrReject = async (requestId: string, actionType: 'accept' | 'reject', name: string) => {
    setActionInProgress(requestId);
    try {
      const res = await api.acceptConnectionRequest(requestId, actionType);
      if (res?.message === 'request updated') {
        if (actionType === 'accept') {
          toast.success(`You are now connected with ${name}!`);
        } else {
          toast.info(`Request from ${name} declined.`);
        }
        // Refresh requests
        const incomingRes = await api.getIncomingRequests();
        if (Array.isArray(incomingRes)) {
          setIncomingRequests(incomingRes);
        }
        const sentRes = await api.getSentRequests();
        if (sentRes && Array.isArray(sentRes.connections)) {
          setSentRequests(sentRes.connections);
        }
      } else {
        toast.error(res?.message || 'Failed to update request.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Helper to determine status
  const getConnectionState = (targetUserId: string) => {
    // 1. Check incoming requests
    const incoming = incomingRequests.find(
      (req) => req.userId && req.userId._id === targetUserId
    );
    if (incoming) {
      if (incoming.status_accepted === true) return 'connected';
      if (incoming.status_accepted === null) return 'incoming_pending';
      return 'none';
    }

    // 2. Check sent requests
    const sent = sentRequests.find(
      (req) => req.connectionId && req.connectionId._id === targetUserId
    );
    if (sent) {
      if (sent.status_accepted === true) return 'connected';
      if (sent.status_accepted === null) return 'sent_pending';
      return 'none';
    }

    return 'none';
  };

  // Filter profiles for display
  const filteredProfiles = profiles
    .filter((p) => p.userId && p.userId._id !== user?._id) // exclude current user
    .filter((p) => {
      const name = p.userId.name || '';
      const username = p.userId.username || '';
      const currentPost = p.currentPost || '';
      const bio = p.bio || '';
      const search = searchQuery.toLowerCase();
      
      return (
        name.toLowerCase().includes(search) ||
        username.toLowerCase().includes(search) ||
        currentPost.toLowerCase().includes(search) ||
        bio.toLowerCase().includes(search)
      );
    });

  const pendingIncomingCount = incomingRequests.filter(req => req.status_accepted === null).length;

  return (
    <div className="relative min-h-screen page-bg overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[15%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[20%] right-[5%] w-[45%] h-[45%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 theme-card p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold theme-text-primary tracking-tight">Professional Network</h1>
              <p className="text-xs theme-text-secondary">Connect with peers, view requests, and grow your career hub.</p>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by name, role, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full theme-input rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b theme-border mb-6 gap-2">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-3 text-sm font-semibold relative transition-colors ${
              activeTab === 'discover' ? 'text-indigo-600 dark:text-indigo-400' : 'theme-text-secondary hover:text-[var(--text-primary)]'
            }`}
          >
            Discover People
            {activeTab === 'discover' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-3 text-sm font-semibold relative transition-colors flex items-center gap-2 ${
              activeTab === 'incoming' ? 'text-indigo-600 dark:text-indigo-400' : 'theme-text-secondary hover:text-[var(--text-primary)]'
            }`}
          >
            Received Requests
            {pendingIncomingCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {pendingIncomingCount}
              </span>
            )}
            {activeTab === 'incoming' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-3 text-sm font-semibold relative transition-colors ${
              activeTab === 'sent' ? 'text-indigo-600 dark:text-indigo-400' : 'theme-text-secondary hover:text-[var(--text-primary)]'
            }`}
          >
            Sent Requests
            {activeTab === 'sent' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm theme-text-secondary">Loading connection data...</p>
          </div>
        )}

        {/* Tabs Content */}
        {!loading && (
          <>
            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <>
                {filteredProfiles.length === 0 ? (
                  <div className="theme-card rounded-2xl p-12 text-center shadow-xl">
                    <Users className="w-10 h-10 theme-text-muted mx-auto mb-3" />
                    <p className="text-sm theme-text-secondary font-semibold">No professionals found</p>
                    <p className="text-xs theme-text-muted mt-1">Try expanding your search query or check back later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
                    {filteredProfiles.map((profile, index) => {
                      const person = profile.userId;
                      const connectionState = getConnectionState(person._id);
                      const initials = getInitials(person.name);
                      
                      return (
                        <div
                          key={profile._id}
                          className="theme-card rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 shadow-lg flex flex-col group"
                          style={{ animationDelay: `${index * 40}ms` }}
                        >
                          {/* Card Cover Banner */}
                          <div className="h-16 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-900/30 dark:to-violet-950/20" />
                          
                          {/* User Avatar + Content */}
                          <div className="px-5 pb-5 -mt-8 flex-1 flex flex-col">
                            <div className="flex items-end justify-between mb-4">
                              <Link href={`/profile?id=${person._id}`} className="block relative">
                                {person.profilePicture ? (
                                  <img
                                    src={person.profilePicture}
                                    alt={person.name}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-[var(--background)] shadow-md group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold border-4 border-[var(--background)] shadow-md group-hover:scale-105 transition-transform select-none">
                                    {initials}
                                  </div>
                                )}
                              </Link>
                              
                              {/* Connection Action Button */}
                              {connectionState === 'none' && (
                                <button
                                  onClick={() => handleConnect(person._id, person.name)}
                                  disabled={actionInProgress === person._id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {actionInProgress === person._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <UserPlus className="w-3.5 h-3.5" />
                                  )}
                                  Connect
                                </button>
                              )}
                              {connectionState === 'sent_pending' && (
                                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl theme-btn-secondary text-xs font-semibold">
                                  <Clock className="w-3 h-3 text-indigo-400" />
                                  Pending
                                </span>
                              )}
                              {connectionState === 'incoming_pending' && (
                                <div className="flex gap-1.5">
                                  {/* Accept / Reject triggers */}
                                  {(() => {
                                    const req = incomingRequests.find(r => r.userId && r.userId._id === person._id);
                                    if (!req) return null;
                                    return (
                                      <>
                                        <button
                                          onClick={() => handleAcceptOrReject(req._id, 'accept', person.name)}
                                          disabled={actionInProgress === req._id}
                                          className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-500 dark:text-indigo-400 rounded-lg border border-indigo-500/20 transition-all"
                                          aria-label="Accept Request"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleAcceptOrReject(req._id, 'reject', person.name)}
                                          disabled={actionInProgress === req._id}
                                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg border border-red-500/10 transition-all"
                                          aria-label="Decline Request"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                              {connectionState === 'connected' && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold shadow-sm">
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Connected
                                </span>
                              )}
                            </div>

                            <Link href={`/profile?id=${person._id}`} className="block">
                              <h2 className="text-sm font-bold theme-text-primary hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-tight truncate">
                                {person.name}
                              </h2>
                              <p className="text-[11px] theme-text-muted leading-tight mt-0.5 truncate">
                                @{person.username}
                              </p>
                            </Link>

                            <p className="text-[12px] theme-text-secondary mt-2 font-medium line-clamp-1">
                              {profile.currentPost || 'Professional'}
                            </p>

                            <p className="text-xs theme-text-secondary leading-relaxed mt-2 line-clamp-2 italic">
                              {profile.bio ? `"${profile.bio}"` : 'No bio provided.'}
                            </p>

                            {/* Additional Info */}
                            <div className="mt-auto pt-4 border-t theme-border flex items-center justify-between text-[11px] theme-text-muted">
                              <span className="flex items-center gap-1 truncate max-w-[65%]">
                                <Building2 className="w-3 h-3 text-indigo-400" />
                                {profile.pastWork && profile.pastWork.length > 0
                                  ? profile.pastWork[0].company
                                  : 'Not specified'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {person.email ? 'Email Verified' : 'No email'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Received Requests Tab */}
            {activeTab === 'incoming' && (
              <div className="max-w-3xl mx-auto space-y-4 fade-in-up">
                {incomingRequests.filter(req => req.status_accepted === null).length === 0 ? (
                  <div className="theme-card rounded-2xl p-10 text-center shadow-xl">
                    <Clock className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                    <p className="text-xs theme-text-secondary font-semibold">No pending connection requests</p>
                    <p className="text-[11px] theme-text-muted mt-0.5">When someone requests to connect with you, it will show up here.</p>
                  </div>
                ) : (
                  incomingRequests
                    .filter((req) => req.status_accepted === null)
                    .map((req) => {
                      const sender = req.userId;
                      if (!sender) return null;
                      const initials = getInitials(sender.name);
                      
                      return (
                        <div
                          key={req._id}
                          className="theme-card rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-indigo-500/20 transition-all shadow-md"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {sender.profilePicture ? (
                              <img
                                src={sender.profilePicture}
                                alt={sender.name}
                                className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold border border-white/10 shrink-0 select-none">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold theme-text-primary truncate leading-tight">
                                {sender.name}
                              </h3>
                              <p className="text-xs theme-text-secondary mt-0.5 truncate">
                                @{sender.username} • wants to connect
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleAcceptOrReject(req._id, 'accept', sender.name)}
                              disabled={actionInProgress === req._id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-95 disabled:opacity-50"
                            >
                              {actionInProgress === req._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleAcceptOrReject(req._id, 'reject', sender.name)}
                              disabled={actionInProgress === req._id}
                              className="flex items-center gap-1.5 px-3 py-2 theme-btn-secondary text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Ignore
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}

                {/* Already Accepted Incoming Requests (History) */}
                {incomingRequests.filter(req => req.status_accepted === true).length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xs font-bold theme-text-muted uppercase tracking-widest px-1 mb-3">
                      Accepted Requests History
                    </h2>
                    <div className="space-y-3">
                      {incomingRequests
                        .filter(req => req.status_accepted === true)
                        .map(req => {
                          const sender = req.userId;
                          if (!sender) return null;
                          return (
                            <div
                              key={req._id}
                              className="bg-white/40 dark:bg-white/[0.02] border theme-border rounded-xl p-3 flex items-center justify-between gap-4 text-xs theme-text-secondary"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="font-semibold theme-text-primary truncate">{sender.name}</span>
                                <span className="truncate theme-text-muted">(@{sender.username})</span>
                              </div>
                              <span className="text-[11px] theme-text-muted">Connected</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sent Requests Tab */}
            {activeTab === 'sent' && (
              <div className="max-w-3xl mx-auto space-y-4 fade-in-up">
                {sentRequests.length === 0 ? (
                  <div className="theme-card rounded-2xl p-10 text-center shadow-xl">
                    <UserPlus className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                    <p className="text-xs theme-text-secondary font-semibold">No sent connection requests</p>
                    <p className="text-[11px] theme-text-muted mt-0.5">Profiles you request to connect with will be listed here.</p>
                  </div>
                ) : (
                  sentRequests.map((req) => {
                    const receiver = req.connectionId;
                    if (!receiver) return null;
                    const initials = getInitials(receiver.name);
                    
                    return (
                      <div
                        key={req._id}
                        className="theme-card rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-indigo-500/20 transition-all shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {receiver.profilePicture ? (
                            <img
                              src={receiver.profilePicture}
                              alt={receiver.name}
                              className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold border border-white/10 shrink-0 select-none">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold theme-text-primary truncate leading-tight">
                              {receiver.name}
                            </h3>
                            <p className="text-xs theme-text-secondary mt-0.5 truncate">
                              @{receiver.username}
                            </p>
                          </div>
                        </div>

                        <div>
                          {req.status_accepted === true ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                              <UserCheck className="w-3.5 h-3.5" />
                              Connected
                            </span>
                          ) : req.status_accepted === false ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-300 text-xs font-semibold">
                              <UserX className="w-3.5 h-3.5" />
                              Declined
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-secondary text-xs font-semibold">
                              <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                              Awaiting Approval
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
