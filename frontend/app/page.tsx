'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPosts } from '../store/postSlice';
import { api } from '../utils/api';
import { Sparkles, UserPlus, RefreshCw, Upload, Loader2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import CreatePostWidget from '../components/CreatePostWidget';

const SKELETON_COUNT = 3;

export default function FeedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const posts = useAppSelector((state) => state.posts.posts);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showStickyWidget, setShowStickyWidget] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [connectionCount, setConnectionCount] = useState<number | null>(null);
  const lastScrollYRef = useRef(0);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getAllPosts();
      if (data && Array.isArray(data.posts)) {
        const sorted = [...data.posts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        dispatch(setPosts(sorted));
      } else {
        setFetchError('Could not load posts. The backend may be offline.');
      }
    } catch {
      setFetchError('Network error. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const data = await api.getAllUserProfiles();
      if (data && Array.isArray(data.profiles)) {
        const filtered = data.profiles.filter(
          (p: any) => p.userId && p.userId._id !== user?._id
        );
        // Take first 3
        setRecommendations(filtered.slice(0, 3));
      }
    } catch {
      // ignore silently
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchConnectionCount = async () => {
    try {
      const [sentRes, incomingRes] = await Promise.all([
        api.getSentRequests(),
        api.getIncomingRequests(),
      ]);

      const sentAccepted = Array.isArray(sentRes?.connections)
        ? sentRes.connections.filter((req: any) => req.status_accepted === true).length
        : 0;
      const incomingAccepted = Array.isArray(incomingRes)
        ? incomingRes.filter((req: any) => req.status_accepted === true).length
        : 0;

      setConnectionCount(sentAccepted + incomingAccepted);
    } catch {
      setConnectionCount(null);
    }
  };

  const handleConnect = async (targetUserId: string, targetName: string) => {
    try {
      const res = await api.sendConnectionRequest(targetUserId);
      if (res?.message === 'request sent') {
        toast.success(`Connection request sent to ${targetName}!`);
        setRecommendations((prev) => prev.filter((p) => p.userId._id !== targetUserId));
      } else {
        toast.error(res?.message || 'Failed to send request.');
      }
    } catch {
      toast.error('Network error. Could not send request.');
    }
  };

  const handleResumeAnalyze = async () => {
    if (!resumeFile) {
      toast.warning('Please upload a resume PDF first.');
      return;
    }
    if (resumeFile.type !== 'application/pdf') {
      toast.error('Only PDF resumes are supported.');
      return;
    }

    setAnalyzingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('resumeName', resumeFile.name);

      const result = await api.resumeAtsAnalyze(formData);
      if (result && typeof result.score === 'number') {
        sessionStorage.setItem(
          'ats_improvement_payload',
          JSON.stringify({
            result,
            resumeName: result.resumeName || resumeFile.name,
            profileName: user?.name || 'Your Resume',
            resumeUrl: result.resumeUrl || '',
          })
        );
        toast.success('ATS analysis completed!');
        router.push('/profile/ats-improvement');
      } else {
        toast.error(result?.message || 'Failed to analyze resume.');
      }
    } catch {
      toast.error('Network error during resume analysis.');
    } finally {
      setAnalyzingResume(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchSuggestions();
      fetchConnectionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      
      // Show sticky create post widget when scrolling up and past 220px
      if (currentScrollY > 220 && currentScrollY < lastScrollY) {
        setShowStickyWidget(true);
      } else {
        setShowStickyWidget(false);
      }
      
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="relative min-h-screen page-bg">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[10%] left-[5%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[15%] right-[5%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24 h-fit">
            <div className="theme-card rounded-2xl overflow-hidden transition-all duration-300 shadow-xl">
              <div className="h-24 bg-gradient-to-r from-indigo-600/20 to-violet-600/20" />
              <div className="px-4 pb-5 -mt-10 flex flex-col items-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-4 border-[var(--background)] object-cover mb-3 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold border-4 border-[var(--background)] mb-3 shadow-lg select-none">
                    {user?.name ? getInitials(user.name) : 'CH'}
                  </div>
                )}

                <h2 className="text-lg font-bold theme-text-primary text-center leading-tight truncate w-full">
                  {user?.name || 'User Name'}
                </h2>
                <p className="text-xs theme-text-muted text-center mt-1 truncate w-full">
                  @{user?.username || 'username'}
                </p>

                <div className="w-full border-t theme-border pt-4 mt-4 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs theme-text-secondary">Posts in feed</span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs theme-text-secondary">Connections</span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold">
                      {connectionCount === null ? '0' : connectionCount}
                    </span>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="w-full mt-4 py-2 px-4 rounded-xl theme-btn-secondary text-xs font-semibold text-center block"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </aside>

          <section className="col-span-1 lg:col-span-6 space-y-5">
            <div className={`transition-all duration-300 ${
              showStickyWidget 
                ? 'sticky top-24 z-20 shadow-2xl comment-section-enter bg-[var(--background)]/95 backdrop-blur-md p-1 rounded-2xl' 
                : ''
            }`}>
              <CreatePostWidget onPostCreated={fetchPosts} />
            </div>

            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold theme-text-muted uppercase tracking-widest">
                Global Feed
              </h2>
              <button
                onClick={fetchPosts}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] theme-text-secondary hover:text-indigo-500 transition-colors disabled:opacity-40"
                aria-label="Refresh feed"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoading && (
              <div className="space-y-5">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && fetchError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center shadow-xl">
                <p className="text-sm text-red-400 font-semibold mb-1">Could not load feed</p>
                <p className="text-xs text-white/40 mb-4">{fetchError}</p>
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !fetchError && (
              <div className="space-y-5">
                {posts.length === 0 ? (
                  <div className="theme-card rounded-2xl p-10 text-center shadow-xl">
                    <p className="text-sm theme-text-secondary font-semibold">No posts yet.</p>
                    <p className="text-xs theme-text-muted mt-1">Be the first to share something!</p>
                  </div>
                ) : (
                  posts.map((post, i) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      animationDelay={i * 60}
                    />
                  ))
                )}
              </div>
            )}
          </section>

          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24 h-fit">
            <div className="theme-card rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden group shadow-xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all duration-300 theme-blob" />

              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-sm font-bold theme-text-primary">ATS Resume Scoring</h3>
              </div>

              <div className="flex flex-col items-center justify-center py-4 relative z-10">
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--btn-sec-bg)] border theme-border">
                    <Upload className="w-4 h-4 text-indigo-400 shrink-0" />
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="w-full text-[11px] theme-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white file:text-[11px] file:font-semibold"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-black/5 py-4">
                    <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-[var(--border)] mb-3 bg-black/5">
                      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200 dark:text-white/5"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-indigo-600 dark:text-indigo-400"
                          strokeWidth="2.5"
                          strokeDasharray="78, 100"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="text-lg text-indigo-600 dark:text-indigo-300 font-extrabold">78%</span>
                    </div>
                    <p className="text-[11px] theme-text-secondary text-center px-2">
                      Upload a resume to generate an ATS score.
                    </p>
                    {resumeFile && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] theme-text-primary font-semibold px-3">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        {resumeFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleResumeAnalyze}
                disabled={analyzingResume}
                className="w-full mt-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-200"
              >
                {analyzingResume ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  'Boost Score'
                )}
              </button>
            </div>

            <div className="theme-card rounded-2xl p-4 hover:border-indigo-500/20 transition-all duration-300 shadow-xl">
              <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest px-1 mb-4">
                People You May Know
              </h3>

              <div className="space-y-3">
                {loadingSuggestions && (
                  <div className="text-center py-4 text-xs theme-text-secondary">Loading suggestions...</div>
                )}
                
                {!loadingSuggestions && recommendations.length === 0 && (
                  <p className="text-center py-4 text-xs theme-text-muted">No new suggestions found.</p>
                )}

                {!loadingSuggestions && recommendations.map((profile) => {
                  const person = profile.userId;
                  if (!person) return null;
                  const initials = getInitials(person.name);
                  return (
                    <div
                      key={person._id}
                      className="flex items-center justify-between p-2 hover:bg-[var(--btn-sec-bg)] rounded-xl transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {person.profilePicture ? (
                          <img
                            src={person.profilePicture}
                            alt={person.name}
                            className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shrink-0 select-none">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold theme-text-primary leading-tight truncate">{person.name}</p>
                          <p className="text-[10px] theme-text-secondary mt-0.5 truncate">{profile.currentPost || 'Professional'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(person._id, person.name)}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-indigo-400 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all duration-150 active:scale-90 shrink-0"
                        aria-label={`Connect with ${person.name}`}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
