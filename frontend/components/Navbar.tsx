'use client';

import { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Bell,
  Settings,
  Rss,
  Users,
  BookOpen,
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Feed',      href: '/',          icon: Rss },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Jobs',      href: '/jobs',      icon: BookOpen },
  { name: 'Profile',   href: '/profile',   icon: User },
];

function getInitials(name?: string): string {
  if (!name) return 'CH';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Navbar() {
  const { user }     = useAppSelector((state) => state.auth);
  const dispatch     = useAppDispatch();
  const router       = useRouter();
  const pathname     = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted,        setMounted]        = useState(false);
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [searchVal,      setSearchVal]      = useState('');

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      router.push(`/directory?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setMobileMenuOpen(false);
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    dispatch(logout());
    router.push('/login');
  };

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <>
      <nav
        id="main-navbar"
        className="sticky top-0 z-40 w-full transition-colors duration-300"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--nav-border)',
          boxShadow: 'var(--nav-shadow)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/"
                id="nav-brand-logo"
                className="flex items-center gap-2.5 group shrink-0"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #818cf8 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  <Briefcase className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span
                  className="text-xl font-extrabold tracking-tight hidden sm:block"
                  style={{
                    background: 'var(--logo-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  CareerHub
                </span>
              </Link>

              <div
                id="nav-search-bar"
                className="hidden md:flex relative w-56 lg:w-80 transition-all duration-300"
              >
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                  style={{ color: searchFocused ? '#818cf8' : 'var(--text-muted)' }}
                />
                <input
                  id="nav-search-input"
                  type="text"
                  placeholder="Search professionals, jobs..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="nav-search-input w-full pl-9 pr-4 py-2.5 rounded-full text-sm theme-input outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div
              id="nav-links-desktop"
              className="hidden md:flex items-center gap-0.5"
            >
              {NAV_LINKS.map(({ name, href }) => {
                const isActive =
                  href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={name}
                    href={href}
                    id={`nav-link-${name.toLowerCase()}`}
                    className="relative px-4 py-2 rounded-xl text-[0.9rem] font-medium transition-all duration-200 group"
                    style={{
                      color: isActive ? 'var(--active-link-text)' : 'var(--text-secondary)',
                      background: isActive
                        ? 'var(--active-link-bg)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid var(--active-link-border)'
                        : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color =
                          'var(--text-primary)';
                        (e.currentTarget as HTMLElement).style.background =
                          'var(--btn-sec-bg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color =
                          'var(--text-secondary)';
                        (e.currentTarget as HTMLElement).style.background =
                          'transparent';
                      }
                    }}
                  >
                    {name}
                    {isActive && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: '#a78bfa' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0">

              <button
                id="nav-notifications-btn"
                aria-label="Notifications"
                className="nav-icon-btn relative p-2.5 rounded-xl transition-all duration-200 theme-btn-secondary"
              >
                <Bell className="w-4.5 h-4.5" />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                  style={{
                    background: '#818cf8',
                    borderColor: 'var(--background)',
                  }}
                />
              </button>

              <button
                id="nav-settings-btn"
                onClick={() => router.push('/settings')}
                aria-label="Settings"
                className="nav-icon-btn p-2.5 rounded-xl transition-all duration-200 theme-btn-secondary"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>

              <button
                id="nav-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="nav-icon-btn p-2.5 rounded-xl transition-all duration-200 theme-btn-secondary"
              >
                {mounted ? (
                  isDark ? (
                    <Sun className="w-4.5 h-4.5 transition-transform duration-300 hover:rotate-12" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 transition-transform duration-300 hover:-rotate-12" />
                  )
                ) : (
                  <span className="w-4.5 h-4.5 block rounded-full bg-white/10 animate-pulse" />
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-profile-trigger"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full transition-all duration-200 theme-btn-secondary"
                  style={{
                    borderColor: dropdownOpen ? 'rgba(129,140,248,0.5)' : 'var(--btn-sec-border)'
                  }}
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'Profile'}
                      className="w-7 h-7 rounded-full object-cover border border-white/15"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold border border-white/15"
                      style={{
                        background:
                          'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                      }}
                    >
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{
                      color: 'var(--text-muted)',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    id="nav-profile-dropdown"
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl p-2 z-50 navbar-dropdown"
                    style={{
                      background: 'var(--dropdown-bg)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid var(--dropdown-border)',
                      boxShadow: 'var(--dropdown-shadow)',
                    }}
                  >
                    <div
                      className="px-3.5 py-3 mb-1 rounded-xl"
                      style={{ background: 'var(--dropdown-header-bg)' }}
                    >
                      <p className="text-sm font-semibold theme-text-primary truncate">
                        {user?.name || 'User'}
                      </p>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        @{user?.username || 'username'}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/profile"
                        id="dropdown-my-profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-all duration-150"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            'var(--text-primary)';
                          (e.currentTarget as HTMLElement).style.background =
                            'var(--btn-sec-bg)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            'var(--text-secondary)';
                          (e.currentTarget as HTMLElement).style.background =
                            'transparent';
                        }}
                      >
                        <User className="w-4 h-4 shrink-0" />
                        My Profile
                      </Link>

                      <Link
                        href="/settings"
                        id="dropdown-settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-all duration-150"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            'var(--text-primary)';
                          (e.currentTarget as HTMLElement).style.background =
                            'var(--btn-sec-bg)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            'var(--text-secondary)';
                          (e.currentTarget as HTMLElement).style.background =
                            'transparent';
                        }}
                      >
                        <Settings className="w-4 h-4 shrink-0" />
                        Settings
                      </Link>

                      <div
                        className="my-1.5 mx-1"
                        style={{
                          height: '1px',
                          background: 'var(--border)',
                        }}
                      />

                      <button
                        id="dropdown-sign-out"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-all duration-150"
                        style={{ color: '#f87171' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            '#fca5a5';
                          (e.currentTarget as HTMLElement).style.background =
                            'rgba(239,68,68,0.09)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            '#f87171';
                          (e.currentTarget as HTMLElement).style.background =
                            'transparent';
                        }}
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2 shrink-0">
              <button
                id="mobile-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl transition-all duration-150 theme-btn-secondary"
              >
                {mounted ? (
                  isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
                ) : (
                  <span className="w-5 h-5 block rounded-full bg-white/10 animate-pulse" />
                )}
              </button>

              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="p-2 rounded-xl transition-all duration-150 theme-btn-secondary"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="md:hidden px-4 pt-3 pb-5 space-y-2 mobile-drawer border-t"
            style={{
              borderTopColor: 'var(--border)',
              background: 'var(--dropdown-bg)',
            }}
          >
            <div className="relative w-full mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm theme-input outline-none"
              />
            </div>

            {NAV_LINKS.map(({ name, href, icon: Icon }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={name}
                  href={href}
                  id={`mobile-nav-link-${name.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border"
                  style={{
                    color: isActive ? 'var(--active-link-text)' : 'var(--text-secondary)',
                    background: isActive
                      ? 'var(--active-link-bg)'
                      : 'transparent',
                    borderColor: isActive
                      ? 'var(--active-link-border)'
                      : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {name}
                </Link>
              );
            })}

            <div
              className="mt-2 pt-3 flex items-center justify-between border-t"
              style={{ borderTopColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || 'Profile'}
                    className="w-9 h-9 rounded-full object-cover border border-white/15"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/15"
                    style={{
                      background:
                        'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                    }}
                  >
                    {getInitials(user?.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold theme-text-primary leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 theme-text-muted"
                  >
                    @{user?.username || 'username'}
                  </p>
                </div>
              </div>

              <button
                id="mobile-sign-out-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150"
                style={{
                  color: '#f87171',
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
