'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { 
  Briefcase, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  User, 
  ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navLinks = [
    { name: 'Feed', href: '/' },
    { name: 'Directory', href: '/directory' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Profile', href: '/profile' }
  ];

  // Quick helper for initials if avatar is not present
  const getInitials = (name: string) => {
    if (!name) return 'CH';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Hide Navbar on authentication routes
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#101415]/75 dark:bg-[#101415]/75 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition-transform group-hover:scale-105 duration-200">
                <Briefcase className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
                CareerHub
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex relative group w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search professionals, jobs..." 
                className="w-full pl-9 pr-4 py-1.8 bg-white/[0.06] border border-white/10 rounded-full text-white text-[0.875rem] placeholder-white/30 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:bg-indigo-950/20"
              />
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-[0.9375rem] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Theme Toggle & Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-white/60 hover:text-white bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl transition-all active:scale-95 duration-150"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-full transition-all duration-200"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                    {getInitials(user?.name)}
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-white/45 truncate">@{user?.username || 'username'}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all duration-150"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] rounded-xl transition-all duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-white/60 hover:text-white bg-white/[0.05] rounded-xl transition-all duration-150"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-white/60 hover:text-white bg-white/[0.05] rounded-xl transition-all duration-150"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#101415]/95 backdrop-blur-xl px-4 pt-3 pb-4 space-y-3 shadow-inner">
          <div className="relative group w-full mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-white/[0.06] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || 'Profile'}
                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                  {getInitials(user?.name)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                <p className="text-[11px] text-white/40">@{user?.username || 'username'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.8 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] border border-red-500/10 rounded-xl transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
