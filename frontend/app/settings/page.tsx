'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, updateUser } from '../../store/authSlice';
import { api } from '../../utils/api';
import { useTheme } from 'next-themes';
import {
  User,
  KeyRound,
  Palette,
  AlertTriangle,
  Trash2,
  Loader2,
  CheckCircle2,
  Lock,
  Moon,
  Sun,
  AtSign,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'password' | 'appearance' | 'danger'>('account');
  const [mounted, setMounted] = useState(false);

  // Form States - Account info
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [accountSaving, setAccountSaving] = useState(false);

  // Form States - Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Danger Zone - Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user, router]);

  // Account Save Handler
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email) {
      toast.error('All fields are required.');
      return;
    }

    setAccountSaving(true);
    try {
      const res = await api.updateUserProfile({ name, username, email });
      if (res?.message === 'user updated') {
        dispatch(updateUser({ ...user, name, username, email }));
        toast.success('Account settings updated successfully!');
      } else {
        toast.error(res?.message || 'Failed to update account.');
      }
    } catch {
      toast.error('Network error. Could not update account.');
    } finally {
      setAccountSaving(false);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res?.message === 'Password updated successfully') {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res?.message || 'Failed to change password.');
      }
    } catch {
      toast.error('Network error. Could not change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await api.deleteAccount();
      if (res?.message === 'Account deleted successfully') {
        toast.success('Your account has been deleted.');
        dispatch(logout());
        router.push('/register');
      } else {
        toast.error(res?.message || 'Failed to delete account.');
      }
    } catch {
      toast.error('Network error. Could not delete account.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="relative min-h-screen page-bg overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[10%] right-[5%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold theme-text-primary tracking-tight mb-8 px-1">Settings Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Settings Tabs Sidebar */}
          <aside className="md:col-span-4 theme-card rounded-2xl p-4 space-y-1 shadow-lg">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'account'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                  : 'theme-text-secondary hover:theme-text-primary hover:bg-[var(--btn-sec-bg)]'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'password'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                  : 'theme-text-secondary hover:theme-text-primary hover:bg-[var(--btn-sec-bg)]'
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'appearance'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                  : 'theme-text-secondary hover:theme-text-primary hover:bg-[var(--btn-sec-bg)]'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              Appearance Mode
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'danger'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/5'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Danger Zone
            </button>
          </aside>

          {/* Settings Panels Box */}
          <section className="md:col-span-8 theme-card rounded-2xl p-6 sm:p-8 shadow-xl min-h-[400px]">
            
              {/* Account Settings Panel */}
              {activeTab === 'account' && (
                <form onSubmit={handleSaveAccount} className="space-y-6 fade-in-up">
                  <div>
                    <h2 className="text-base font-bold theme-text-primary mb-1">Account Credentials</h2>
                    <p className="text-xs theme-text-secondary">Update your basic login identifiers and profile credentials.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Full Name</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full theme-input rounded-xl px-3.5 py-2.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Username</label>
                        <div className="relative">
                          <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                          <input
                            required
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full theme-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full theme-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={accountSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {accountSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      'Save Account'
                    )}
                  </button>
                </form>
              )}

              {/* Change Password Panel */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-6 fade-in-up">
                  <div>
                    <h2 className="text-base font-bold theme-text-primary mb-1">Update Password</h2>
                    <p className="text-xs theme-text-secondary">Change your login password. We recommend choosing a strong one.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                        <input
                          required
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full theme-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                          <input
                            required
                            type="password"
                            placeholder="At least 6 chars"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full theme-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                          <input
                            required
                            type="password"
                            placeholder="Re-type new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full theme-input rounded-xl pl-9 pr-3.5 py-2.5 text-xs placeholder-[var(--text-muted)] focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </form>
              )}

              {/* Appearance Mode Panel */}
              {activeTab === 'appearance' && (
                <div className="space-y-6 fade-in-up">
                  <div>
                    <h2 className="text-base font-bold theme-text-primary mb-1">Theme Preferences</h2>
                    <p className="text-xs theme-text-secondary">Configure the visual colors of your CareerHub application.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dark Mode button card */}
                    <div
                      onClick={() => setTheme('dark')}
                      className={`border rounded-2xl p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-200 ${
                        isDark 
                          ? 'border-indigo-500/50 bg-indigo-500/[0.04] text-[var(--text-primary)]' 
                          : 'border-[var(--border)] bg-[var(--btn-sec-bg)] text-[var(--text-secondary)] hover:border-[var(--card-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold theme-text-primary">Sleek Dark Mode</p>
                          <p className="text-[10px] theme-text-muted">Soft gradients & glass panels</p>
                        </div>
                      </div>
                      {isDark && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />}
                    </div>

                    {/* Light Mode button card */}
                    <div
                      onClick={() => setTheme('light')}
                      className={`border rounded-2xl p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-200 ${
                        !isDark 
                          ? 'border-indigo-500/50 bg-indigo-500/[0.04] text-[var(--text-primary)]' 
                          : 'border-[var(--border)] bg-[var(--btn-sec-bg)] text-[var(--text-secondary)] hover:border-[var(--card-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Sun className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold theme-text-primary">Clean Light Mode</p>
                          <p className="text-[10px] theme-text-muted">Highly legible & modern contrast</p>
                        </div>
                      </div>
                      {!isDark && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />}
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Panel */}
              {activeTab === 'danger' && (
                <div className="space-y-6 fade-in-up">
                  <div>
                    <h2 className="text-base font-bold text-red-400 mb-1">Danger Zone</h2>
                    <p className="text-xs theme-text-secondary">Irreversible administrative actions for your account.</p>
                  </div>

                  <div className="border border-red-500/25 bg-red-500/5 p-5 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-xs font-bold theme-text-primary">Permanently Delete Account</h3>
                        <p className="text-[11px] theme-text-secondary leading-relaxed mt-1">
                          Once you delete your account, there is no going back. All of your profile history, job postings, feed updates, comments, and connection requests will be permanently purged from our servers.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

          </section>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />

            <div className="relative w-full max-w-md theme-card rounded-2xl p-6 shadow-2xl profile-modal-enter text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>

              <h2 className="text-sm font-bold theme-text-primary">Are you absolutely sure?</h2>
              <p className="text-xs theme-text-secondary mt-2 leading-relaxed">
                This action is final and cannot be undone. To confirm, please type <strong className="text-red-400">DELETE</strong> in the box below:
              </p>

              <input
                type="text"
                placeholder="Type 'DELETE' here"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full theme-input rounded-xl px-4 py-2.5 text-center text-xs placeholder-[var(--text-muted)] mt-4 focus:outline-none transition-all"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl theme-btn-secondary text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10"
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
