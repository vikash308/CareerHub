'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '../store/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isPublicPath = pathname === '/login' || pathname === '/register';

    if (!token && !isPublicPath) {
      router.push('/login');
    } else if (token && isPublicPath) {
      router.push('/');
    }
  }, [token, pathname, router, isMounted]);

  // Prevent hydration mismatches and show loader until client mounting is complete
  if (!isMounted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex items-center justify-center" aria-hidden="true">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isPublicPath = pathname === '/login' || pathname === '/register';

  // If redirecting unauthenticated user to login
  if (!token && !isPublicPath) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex items-center justify-center" aria-hidden="true">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If redirecting authenticated user away from login/register to dashboard
  if (token && isPublicPath) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] flex items-center justify-center" aria-hidden="true">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
