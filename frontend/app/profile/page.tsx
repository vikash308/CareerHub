'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setMyProfile, updateMyProfileData } from '../../store/profileSlice';
import { updateUser } from '../../store/authSlice';
import { api } from '../../utils/api';
import { Profile, WorkExperience, Education } from '../../store/types';
import {
  Camera,
  Edit3,
  Briefcase,
  GraduationCap,
  User,
  Plus,
  X,
  Save,
  Loader2,
  MapPin,
  Mail,
  AtSign,
  Building2,
  BookOpen,
  ChevronRight,
  Sparkles,
  FileText,
  Download,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'react-toastify';
import PostDetailModal from '../../components/PostDetailModal';
import { likePost } from '../../store/postSlice';
import { Post } from '../../store/types';

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
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

const LS_KEY = 'ch_liked_posts';

function getLikedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistLike(postId: string) {
  const set = getLikedSet();
  set.add(postId);
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

// ─── Edit Profile Modal ──────────────────────────────────────────────────

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}

function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [bio, setBio] = useState(profile.bio || '');
  const [currentPost, setCurrentPost] = useState(profile.currentPost || '');
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');

  const [pastWork, setPastWork] = useState<WorkExperience[]>(profile.pastWork || []);
  const [education, setEducation] = useState<Education[]>(profile.education || []);

  const [isSaving, setIsSaving] = useState(false);

  // Work handlers
  const addWork = () =>
    setPastWork((prev) => [...prev, { company: '', position: '', years: '' }]);
  const updateWork = (idx: number, field: keyof WorkExperience, val: string) =>
    setPastWork((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, [field]: val } : w))
    );
  const removeWork = (idx: number) =>
    setPastWork((prev) => prev.filter((_, i) => i !== idx));

  // Education handlers
  const addEdu = () =>
    setEducation((prev) => [...prev, { school: '', degree: '', fieldOfStudy: '' }]);
  const updateEdu = (idx: number, field: keyof Education, val: string) =>
    setEducation((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e))
    );
  const removeEdu = (idx: number) =>
    setEducation((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user info (name / username)
      const userRes = await api.updateUserProfile({ name, username });
      if (!userRes?.message?.includes('updated') && userRes?.message) {
        // might be an error
        if (userRes.message !== 'user updated') {
          toast.error(userRes.message);
          setIsSaving(false);
          return;
        }
      }

      // Update profile data (bio, currentPost, pastWork, education)
      const profileRes = await api.updateProfileData({
        bio,
        currentPost,
        pastWork,
        education,
      });

      if (profileRes?.message === 'profile updated') {
        dispatch(updateUser({ ...user, name, username }));
        dispatch(updateMyProfileData({ bio, currentPost, pastWork, education }));
        toast.success('Profile updated successfully!');
        onSaved();
        onClose();
      } else {
        toast.error(profileRes?.message || 'Failed to update profile.');
      }
    } catch {
      toast.error('Network error. Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-2xl profile-modal-enter flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b theme-border bg-[var(--dropdown-bg)]/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold theme-text-primary">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg theme-text-secondary hover:theme-text-primary hover:bg-[var(--btn-sec-bg)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest mb-3">
              Basic Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] theme-text-secondary font-medium mb-1 block">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full theme-input rounded-xl px-3 py-2 text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-[11px] theme-text-secondary font-medium mb-1 block">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 theme-text-muted" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full theme-input rounded-xl pl-8 pr-3 py-2 text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Current Position & Bio */}
          <section>
            <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest mb-3">
              Professional Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] theme-text-secondary font-medium mb-1 block">Current Position / Headline</label>
                <input
                  value={currentPost}
                  onChange={(e) => setCurrentPost(e.target.value)}
                  className="w-full theme-input rounded-xl px-3 py-2 text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all"
                  placeholder="e.g. Senior Software Engineer at Google"
                />
              </div>
              <div>
                <label className="text-[11px] theme-text-secondary font-medium mb-1 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full theme-input rounded-xl px-3 py-2 text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all resize-none"
                  placeholder="A short bio about yourself..."
                />
                <p className="text-[10px] theme-text-muted text-right mt-0.5">{bio.length}/500</p>
              </div>
            </div>
          </section>

          {/* Work Experience */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest">
                Work Experience
              </h3>
              <button
                type="button"
                onClick={addWork}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {pastWork.length === 0 && (
                <p className="text-[11px] theme-text-muted text-center py-3 border border-dashed theme-border rounded-xl">
                  No work experience added yet.
                </p>
              )}
              {pastWork.map((work, idx) => (
                <div key={idx} className="bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-xl p-3 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeWork(idx)}
                    className="absolute top-3 right-3 theme-text-muted hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <input
                      value={work.company}
                      onChange={(e) => updateWork(idx, 'company', e.target.value)}
                      placeholder="Company"
                      className="theme-input rounded-lg px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    />
                    <input
                      value={work.position}
                      onChange={(e) => updateWork(idx, 'position', e.target.value)}
                      placeholder="Position / Role"
                      className="theme-input rounded-lg px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    />
                  </div>
                  <input
                    value={work.years}
                    onChange={(e) => updateWork(idx, 'years', e.target.value)}
                    placeholder="Duration (e.g. 2021 - Present)"
                    className="w-full theme-input rounded-lg px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest">
                Education
              </h3>
              <button
                type="button"
                onClick={addEdu}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {education.length === 0 && (
                <p className="text-[11px] theme-text-muted text-center py-3 border border-dashed theme-border rounded-xl">
                  No education added yet.
                </p>
              )}
              {education.map((edu, idx) => (
                <div key={idx} className="bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-xl p-3 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeEdu(idx)}
                    className="absolute top-3 right-3 theme-text-muted hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <input
                      value={edu.school}
                      onChange={(e) => updateEdu(idx, 'school', e.target.value)}
                      placeholder="School / University"
                      className="theme-input rounded-lg px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    />
                    <input
                      value={edu.degree}
                      onChange={(e) => updateEdu(idx, 'degree', e.target.value)}
                      placeholder="Degree"
                      className="theme-input rounded-lg px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                    />
                  </div>
                  <input
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateEdu(idx, 'fieldOfStudy', e.target.value)}
                    placeholder="Field of Study (e.g. Computer Science)"
                    className="w-full theme-input rounded-lg px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t theme-border bg-[var(--dropdown-bg)]/95 backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold theme-text-secondary hover:theme-text-primary hover:bg-[var(--btn-sec-bg)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ───────────────────────────────────────────────────

export function ProfileContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const userIdQuery = searchParams.get('id');
  const { user } = useAppSelector((s) => s.auth);
  const { myProfile } = useAppSelector((s) => s.profile);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [selectedPostForModal, setSelectedPostForModal] = useState<Post | null>(null);
  const [selectedPostLiked, setSelectedPostLiked] = useState(false);
  const [selectedPostLikesCount, setSelectedPostLikesCount] = useState(0);
  const [selectedPostCommentCount, setSelectedPostCommentCount] = useState(0);

  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<any>(null);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const profile = profileData;
  const profileUser = profile?.userId;
  const isOwnProfile = !userIdQuery || user?._id === profileUser?._id;

  const handleDownloadResume = async () => {
    if (!profileUser?._id) return;
    if (profile?.resumeUrl) {
      window.open(profile.resumeUrl, '_blank');
      toast.success('Opening custom resume PDF!');
      return;
    }
    setIsDownloading(true);
    try {
      await api.downloadResume(profileUser._id);
      toast.success('Resume downloaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download resume.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAtsAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.warning('Please enter a job description to analyze.');
      return;
    }
    setIsAnalyzing(true);
    setAtsResult(null);
    setAtsError(null);
    try {
      const result = await api.atsAnalyze(jobDescription);
      if (result && typeof result.score === 'number') {
        setAtsResult(result);
        toast.success('ATS analysis completed!');
      } else {
        setAtsError(result.message || 'Failed to analyze profile.');
        toast.error(result.message || 'Failed to analyze profile.');
      }
    } catch {
      setAtsError('Network error during ATS analysis.');
      toast.error('Network error during ATS analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF documents are supported for resumes.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume must be under 10 MB.');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('name', file.name);

      const res = await api.uploadResume(formData);
      if (res?.resumeUrl) {
        toast.success('Custom resume uploaded successfully!');
        fetchProfile(); // Re-fetch to sync
      } else {
        toast.error(res?.message || 'Failed to upload resume.');
      }
    } catch {
      toast.error('Network error during upload.');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your custom resume?')) return;
    try {
      const res = await api.deleteResume();
      if (res?.message?.includes('deleted') || res?.message?.includes('success')) {
        toast.success('Custom resume deleted.');
        fetchProfile();
      } else {
        toast.error(res?.message || 'Failed to delete resume.');
      }
    } catch {
      toast.error('Network error deleting resume.');
    }
  };

  const handleMiniPostClick = (post: any) => {
    setSelectedPostForModal(post);
    setSelectedPostLiked(getLikedSet().has(post._id));
    setSelectedPostLikesCount(post.likes);
    setSelectedPostCommentCount(post.commentCount || 0);
  };

  const handleModalLike = async () => {
    if (!selectedPostForModal || selectedPostLiked) return;

    const postId = selectedPostForModal._id;
    setSelectedPostLiked(true);
    setSelectedPostLikesCount((prev) => prev + 1);
    persistLike(postId);
    dispatch(likePost({ postId }));

    // Sync with userPosts array
    setUserPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: p.likes + 1 } : p))
    );

    try {
      await api.likePost(postId);
    } catch {
      setSelectedPostLiked(false);
      setSelectedPostLikesCount((prev) => prev - 1);
      const set = getLikedSet();
      set.delete(postId);
      localStorage.setItem(LS_KEY, JSON.stringify([...set]));
      setUserPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: p.likes - 1 } : p))
      );
    }
  };

  const handleModalCommentCountChange = (count: number) => {
    if (!selectedPostForModal) return;
    const postId = selectedPostForModal._id;
    setSelectedPostCommentCount(count);
    
    // Sync with userPosts array
    setUserPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, commentCount: count } : p))
    );
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const targetUserId = userIdQuery || undefined;
      const data = await api.getUserAndProfile(targetUserId);
      if (data && data.userId) {
        setProfileData(data);
        if (!targetUserId) {
          dispatch(setMyProfile(data));
        }

        // Fetch user posts
        try {
          const postsRes = await api.getAllPosts();
          if (postsRes && Array.isArray(postsRes.posts)) {
            const filtered = postsRes.posts
              .filter((p: any) => p.userId && p.userId._id === data.userId._id)
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setUserPosts(filtered);
          }
        } catch (err) {
          console.error("Error fetching user posts:", err);
        }
      } else {
        setFetchError(data?.message || 'Could not load profile.');
      }
    } catch {
      setFetchError('Network error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdQuery]);

  // ── Avatar Upload Handler ──────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported for profile picture.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      const res = await api.uploadProfilePicture(formData);

      if (res?.profilePicture) {
        dispatch(updateUser({ ...user, profilePicture: res.profilePicture }));
        const updatedUserId = myProfile?.userId
          ? { ...myProfile.userId, profilePicture: res.profilePicture }
          : undefined;
        if (updatedUserId) {
          dispatch(updateMyProfileData({ userId: updatedUserId }));
        }
        toast.success('Profile picture updated!');
        fetchProfile(); // re-fetch to sync
      } else {
        toast.error(res?.message || 'Failed to upload picture.');
      }
    } catch {
      toast.error('Network error during upload.');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };



  return (
    <div className="relative min-h-screen page-bg">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[10%] left-[5%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[15%] right-[5%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm theme-text-muted">Loading your profile...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && fetchError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-sm text-red-400 font-semibold mb-2">Failed to load profile</p>
            <p className="text-xs theme-text-muted mb-4">{fetchError}</p>
            <button
              onClick={fetchProfile}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!isLoading && !fetchError && profile && (
          <div className="space-y-5 fade-in-up">

            {/* ── Hero Card ── */}
            <div className="theme-card rounded-2xl overflow-hidden shadow-xl">
              {/* Cover banner */}
              <div className="h-32 sm:h-44 bg-gradient-to-r from-indigo-900/60 via-violet-900/40 to-slate-900/60 relative">
                <div className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(139,92,246,0.2) 0%, transparent 60%)'
                  }}
                />
              </div>

              <div className="px-5 sm:px-8 pb-6 -mt-14 sm:-mt-16">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  {/* Avatar with upload */}
                  <div className="relative w-fit">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => isOwnProfile && avatarInputRef.current?.click()}
                    >
                      {profileUser?.profilePicture || user?.profilePicture ? (
                        <img
                          src={profileUser?.profilePicture || user?.profilePicture}
                          alt={profileUser?.name || user?.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[var(--background)] shadow-2xl"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-[var(--background)] shadow-2xl select-none">
                          {getInitials(profileUser?.name || user?.name || 'U')}
                        </div>
                      )}

                      {/* Hover overlay */}
                      {isOwnProfile && (
                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          {uploadingAvatar ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <Camera className="w-6 h-6 text-white" />
                          )}
                        </div>
                      )}
                    </div>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      id="avatar-upload-input"
                    />
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-btn-secondary self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>

                {/* Name / headline */}
                <div className="mt-4">
                  <h1 className="text-xl sm:text-2xl font-bold theme-text-primary leading-tight">
                    {profileUser?.name || user?.name || 'Your Name'}
                  </h1>
                  {profile.currentPost && (
                    <p className="text-sm text-indigo-300 mt-0.5 font-medium">
                      {profile.currentPost}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {(profileUser?.username || user?.username) && (
                      <div className="flex items-center gap-1.5 text-[12px] theme-text-muted">
                        <AtSign className="w-3 h-3" />
                        {profileUser?.username || user?.username}
                      </div>
                    )}
                    {(profileUser?.email || user?.email) && (
                      <div className="flex items-center gap-1.5 text-[12px] theme-text-muted">
                        <Mail className="w-3 h-3" />
                        {profileUser?.email || user?.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-4 text-sm theme-text-secondary leading-relaxed max-w-2xl border-t theme-border pt-4">
                    {profile.bio}
                  </p>
                )}

                {!profile.bio && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="mt-4 text-xs theme-text-muted hover:text-indigo-400 transition-colors border-t theme-border pt-4 block"
                  >
                    + Add a bio to let people know about you
                  </button>
                )}
              </div>
            </div>

            {/* ── Resume Toolkit Card ── */}
            <div className="theme-card rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b theme-border">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold theme-text-primary">Resume Toolkit</h2>
              </div>

              <div className={isOwnProfile ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "grid grid-cols-1 gap-6"}>
                {/* PDF Generation section */}
                <div className={isOwnProfile ? "md:col-span-1 space-y-3 bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between" : "space-y-3 bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full"}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold theme-text-primary uppercase tracking-wider">Export Resume</h3>
                    </div>
                    <p className="text-[11px] theme-text-secondary leading-relaxed">
                      Download a clean, professionally formatted PDF resume compiled directly from {isOwnProfile ? 'your' : `${profileUser?.name}'s`} profile data.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadResume}
                    disabled={isDownloading}
                    className={isOwnProfile ? "w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10 cursor-pointer" : "sm:w-fit flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10 cursor-pointer shrink-0"}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>

                {/* Custom Resume Upload Section */}
                {isOwnProfile && (
                  <div className="md:col-span-1 space-y-3 bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-bold theme-text-primary uppercase tracking-wider">Custom Resume</h3>
                      </div>
                      
                      {profile.resumeUrl ? (
                        <div className="space-y-1 bg-black/10 p-2.5 rounded-xl border theme-border">
                          <p className="text-[11px] font-bold theme-text-primary truncate">
                            {profile.resumeName}
                          </p>
                          <p className="text-[9px] theme-text-muted">
                            Custom PDF Resume uploaded
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] theme-text-secondary leading-relaxed">
                          Upload your own custom PDF resume to apply to jobs directly.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {profile.resumeUrl ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(profile.resumeUrl, '_blank')}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[10px] font-semibold bg-[var(--dropdown-bg)] border theme-border theme-text-primary hover:bg-[var(--btn-sec-bg)] transition-all cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={handleDeleteResume}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      ) : null}

                      <div className="relative w-full">
                        <button
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={uploadingResume}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/10"
                        >
                          {uploadingResume ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              {profile.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                            </>
                          )}
                        </button>
                        <input
                          ref={resumeInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleResumeUpload}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ATS Scan Section */}
                {isOwnProfile && (
                  <div className="md:col-span-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold theme-text-primary uppercase tracking-wider flex items-center gap-1.5">
                        ATS Job Scanner
                      </h3>
                      <p className="text-[11px] theme-text-secondary leading-relaxed">
                        Verify profile match against job requirements and get recommendations.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={4}
                        className="w-full theme-input rounded-xl px-3 py-2 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all resize-none font-mono"
                        placeholder="Paste requirements..."
                      />

                      <button
                        onClick={handleAtsAnalyze}
                        disabled={isAnalyzing}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Scan Profile
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ATS Error Banner */}
              {atsError && (
                <div className="mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 fade-in">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">ATS Scanner Message:</span> {atsError}
                  </div>
                </div>
              )}

              {/* ATS Results View (Only shown if a valid result is returned) */}
              {atsResult && (
                <div className="mt-6 border-t theme-border pt-6 space-y-5 fade-in">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-2xl p-5">
                    {/* Score Circle Indicator */}
                    <div className="relative flex items-center justify-center shrink-0 w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Track circle */}
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          className="stroke-[var(--border)]"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke={atsResult.score >= 75 ? '#10B981' : atsResult.score >= 50 ? '#F59E0B' : '#EF4444'}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - atsResult.score / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Score Text Overlay */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-black theme-text-primary">{atsResult.score}%</span>
                        <span className="text-[9px] uppercase font-bold theme-text-muted tracking-wider">Match</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Summary rating */}
                      <div>
                        <h4 className="text-xs font-bold theme-text-primary">
                          Match Rating: {' '}
                          <span className={atsResult.score >= 75 ? 'text-emerald-400' : atsResult.score >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                            {atsResult.score >= 75 ? 'Strong Match' : atsResult.score >= 50 ? 'Moderate Match' : 'Weak Match'}
                          </span>
                        </h4>
                        <p className="text-[11px] theme-text-secondary mt-1">
                          Based on an automated comparison of your profile biography, headlines, experience dates, and schools against the target job requirements.
                        </p>
                      </div>

                      {/* Skills lists */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <h5 className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Matched Skills</h5>
                          {atsResult.matchedSkills && atsResult.matchedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {atsResult.matchedSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] theme-text-muted italic">No clear matching skills found.</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="text-[10px] uppercase font-black tracking-widest text-rose-400">Missing / Weak Skills</h5>
                          {atsResult.missingSkills && atsResult.missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {atsResult.missingSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] theme-text-muted italic">No major missing skills identified.</p>
                          )}
                        </div>
                      </div>

                      {/* Suggestions list */}
                      {atsResult.suggestions && atsResult.suggestions.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t theme-border">
                          <h5 className="text-[10px] uppercase font-black tracking-widest theme-text-primary">Optimization Suggestions</h5>
                          <ul className="list-disc pl-4 space-y-1">
                            {atsResult.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx} className="text-[11px] theme-text-secondary leading-relaxed">
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── User Posts Card ── */}
            <div className="theme-card rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b theme-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h2 className="text-sm font-bold theme-text-primary">
                    {isOwnProfile ? 'My Posts' : `Posts by ${profileUser?.name}`}
                  </h2>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                  {userPosts.length} posts
                </span>
              </div>

              {userPosts.length > 0 ? (
                <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => handleMiniPostClick(post)}
                      className="min-w-[280px] max-w-[300px] bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between shrink-0 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] theme-text-muted">
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-xs theme-text-secondary leading-relaxed line-clamp-4 whitespace-pre-wrap">
                          {post.body}
                        </p>
                        {post.media && (
                          <div className="w-full h-24 rounded-lg overflow-hidden border theme-border bg-black/10">
                            {post.fileType && ['mp4', 'webm', 'ogg', 'quicktime', 'mov', 'avi', 'mkv'].includes(post.fileType) ? (
                              <div className="w-full h-full flex items-center justify-center bg-slate-950 text-indigo-400">
                                <span className="text-[10px] font-bold">Video Clip</span>
                              </div>
                            ) : (
                              <img
                                src={post.media}
                                alt="Post media"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 pt-2 border-t theme-border text-[11px] theme-text-secondary">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                          {post.likes}
                        </span>
                        {post.commentCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            {post.commentCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed theme-border rounded-xl">
                  <FileText className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                  <p className="text-xs theme-text-secondary">No posts published yet</p>
                </div>
              )}
            </div>

            {/* ── Work Experience Card ── */}
            <div className="theme-card rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h2 className="text-sm font-bold theme-text-primary">Work Experience</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-1.5 rounded-lg theme-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {profile.pastWork && profile.pastWork.length > 0 ? (
                <div className="space-y-4">
                  {profile.pastWork.map((work, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-start pb-4 border-b theme-border last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold theme-text-primary leading-tight">
                          {work.position || 'Position'}
                        </p>
                        <p className="text-[12px] text-indigo-300/80 mt-0.5">
                          {work.company || 'Company'}
                        </p>
                        {work.years && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 theme-text-muted" />
                            <span className="text-[11px] theme-text-muted">{work.years}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed theme-border rounded-xl">
                  <Briefcase className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                  <p className="text-xs theme-text-secondary mb-2">No work experience added yet</p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Add your first experience
                  </button>
                </div>
              )}
            </div>

            {/* ── Education Card ── */}
            <div className="theme-card rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <GraduationCap className="w-4 h-4 text-violet-400" />
                  </div>
                  <h2 className="text-sm font-bold theme-text-primary">Education</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-1.5 rounded-lg theme-text-muted hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-start pb-4 border-b theme-border last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold theme-text-primary leading-tight">
                          {edu.school || 'School'}
                        </p>
                        <p className="text-[12px] text-violet-300/80 mt-0.5">
                          {edu.degree || ''}{edu.degree && edu.fieldOfStudy ? ' · ' : ''}{edu.fieldOfStudy || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed theme-border rounded-xl">
                  <GraduationCap className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                  <p className="text-xs theme-text-secondary mb-2">No education added yet</p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Add your education
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={fetchProfile}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPostForModal && (
        <PostDetailModal
          post={selectedPostForModal}
          liked={selectedPostLiked}
          localLikes={selectedPostLikesCount}
          commentCount={selectedPostCommentCount}
          onClose={() => setSelectedPostForModal(null)}
          onLike={handleModalLike}
          onCommentCountChange={handleModalCommentCountChange}
          getInitials={getInitials}
          formatRelativeTime={formatRelativeTime}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 gap-4 min-h-screen page-bg">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm theme-text-muted font-semibold">Loading profile...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
