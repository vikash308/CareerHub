'use client';

import { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myProfile } = useAppSelector((s) => s.profile);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getUserAndProfile();
      if (data && data.userId) {
        dispatch(setMyProfile(data));
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
  }, []);

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
        // Also update myProfile in redux
        dispatch(updateMyProfileData({ userId: { ...myProfile?.userId, profilePicture: res.profilePicture } }));
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

  const profile = myProfile as Profile | null;
  const profileUser = profile?.userId;

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
                      onClick={() => avatarInputRef.current?.click()}
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
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        {uploadingAvatar ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                      </div>
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
    </div>
  );
}
