'use client';

import { X, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Post } from '../store/types';
import CommentSection from './CommentSection';

interface PostDetailModalProps {
  post: Post;
  liked: boolean;
  localLikes: number;
  commentCount: number;
  onClose: () => void;
  onLike: () => void;
  onCommentCountChange: (count: number) => void;
  getInitials: (name: string) => string;
  formatRelativeTime: (isoDate: string) => string;
}

export default function PostDetailModal({
  post,
  liked,
  localLikes,
  commentCount,
  onClose,
  onLike,
  onCommentCountChange,
  getInitials,
  formatRelativeTime,
}: PostDetailModalProps) {
  const mediaUrl = post.media && post.media !== 'pending' ? post.media : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl h-[90vh] md:h-[80vh] bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Post Content & Media */}
        <div className="flex-1 md:w-3/5 w-full flex flex-col justify-between p-6 bg-black/10 border-b md:border-b-0 md:border-r theme-border overflow-y-auto h-1/2 md:h-full">
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex gap-3 items-center">
              <Link href={`/profile?id=${post.userId._id}`} onClick={onClose} className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                {post.userId.profilePicture ? (
                  <img
                    src={post.userId.profilePicture}
                    alt={post.userId.name}
                    className="w-11 h-11 rounded-full object-cover border border-[var(--border)]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-[var(--border)] select-none">
                    {getInitials(post.userId.name)}
                  </div>
                )}
              </Link>

              <div className="min-w-0">
                <Link href={`/profile?id=${post.userId._id}`} onClick={onClose} className="hover:underline block">
                  <h3 className="text-sm font-bold theme-text-primary leading-tight truncate">
                    {post.userId.name}
                  </h3>
                </Link>
                <p className="text-[11px] theme-text-muted mt-0.5 truncate">
                  @{post.userId.username}&nbsp;·&nbsp;{formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Post text */}
            <p className="text-sm theme-text-secondary leading-relaxed whitespace-pre-wrap">
              {post.body}
            </p>

            {/* Media rendering */}
            {mediaUrl && (
              <div className="rounded-xl overflow-hidden border theme-border bg-black/10 max-h-[40vh] flex items-center justify-center">
                {(post.fileType && ['mp4', 'webm', 'ogg', 'quicktime', 'mov', 'avi', 'mkv'].includes(post.fileType)) ||
                (mediaUrl && mediaUrl.includes('/video/upload/')) ? (
                  <video src={mediaUrl} controls className="w-full max-h-[40vh] object-contain" />
                ) : (
                  <img src={mediaUrl} alt="Post media" className="w-full object-contain max-h-[40vh]" />
                )}
              </div>
            )}
          </div>

          {/* Social stats in modal */}
          <div className="flex gap-6 items-center border-t theme-border pt-4 mt-4 text-xs theme-text-secondary">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 font-semibold transition-colors duration-150 cursor-pointer
                ${liked ? 'text-indigo-500' : 'theme-text-secondary hover:text-indigo-500'}`}
            >
              <ThumbsUp
                className="w-4.5 h-4.5"
                fill={liked ? 'currentColor' : 'none'}
              />
              <span>{localLikes} Likes</span>
            </button>
            <span className="flex items-center gap-1.5 font-semibold">
              <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
              <span>{commentCount} Comments</span>
            </span>
          </div>
        </div>

        {/* Right Side: Scrollable Comments Section */}
        <div className="md:w-2/5 w-full flex flex-col h-1/2 md:h-full overflow-y-auto p-6 bg-[var(--dropdown-bg)]">
          <div className="pb-3 border-b theme-border mb-3">
            <h4 className="text-xs font-bold theme-text-primary uppercase tracking-wider">Comments Discussion</h4>
          </div>
          <div className="flex-1">
            <CommentSection
              postId={post._id}
              initialCommentCount={commentCount}
              onCommentCountChange={onCommentCountChange}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
