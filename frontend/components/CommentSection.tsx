'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store/hooks';
import { api } from '../utils/api';
import { Comment } from '../store/types';

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

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
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CommentSection({ 
  postId, 
  initialCommentCount = 0,
  onCommentCountChange
}: CommentSectionProps) {
  const { user } = useAppSelector((state) => state.auth);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch comments when section mounts (first time)
  useEffect(() => {
    if (hasFetched) return;
    setHasFetched(true);
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getComments(postId);
      if (data && Array.isArray(data.comments)) {
        setComments(data.comments);
        if (onCommentCountChange) {
          onCommentCountChange(data.comments.length);
        }
      }
    } catch {
      // silently fail - comments are optional
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (!user) {
      toast.error('You must be logged in to comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.addComment(postId, trimmed);
      if (data && (data.message || data.comment)) {
        // Optimistic: add comment locally
        const optimisticComment: Comment = {
          _id: `temp-${Date.now()}`,
          userId: {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
          },
          postId,
          body: trimmed,
        };
        setComments((prev) => {
          const updated = [...prev, optimisticComment];
          if (onCommentCountChange) {
            onCommentCountChange(updated.length);
          }
          return updated;
        });
        setCommentText('');
        // Refetch to get real _id from backend
        setTimeout(fetchComments, 600);
      } else {
        toast.error(data?.message || 'Failed to add comment.');
      }
    } catch {
      toast.error('Network error. Could not post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      const data = await api.deleteComment(commentId);
      if (data && data.message) {
        setComments((prev) => {
          const updated = prev.filter((c) => c._id !== commentId);
          if (onCommentCountChange) {
            onCommentCountChange(updated.length);
          }
          return updated;
        });
      } else {
        toast.error(data?.message || 'Failed to delete comment.');
      }
    } catch {
      toast.error('Network error. Could not delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="comment-section-enter border-t theme-border mt-3 pt-4 space-y-3">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <div className="shrink-0">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold border border-[var(--border)] select-none shrink-0">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-1.5 focus-within:border-indigo-500/40 focus-within:bg-[var(--input-focus-bg)] transition-all duration-200">
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={300}
            className="flex-1 bg-transparent theme-text-primary text-xs placeholder-[var(--text-muted)] outline-none border-none focus:ring-0"
            id={`comment-input-${postId}`}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-90 shrink-0"
            aria-label="Post comment"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 py-2 pl-10">
          <Loader2 className="w-3.5 h-3.5 animate-spin theme-text-muted" />
          <span className="text-[11px] theme-text-muted">Loading comments...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && comments.length === 0 && (
        <div className="flex items-center gap-2 py-2 pl-10">
          <MessageSquare className="w-3.5 h-3.5 theme-text-muted" />
          <span className="text-[11px] theme-text-muted">
            No comments yet. Be the first!
          </span>
        </div>
      )}

      {/* Comment List */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-2.5 pl-10">
          {comments.map((comment) => {
            const isOwner = user?._id === comment.userId._id;
            const isDeleting = deletingId === comment._id;
            return (
              <div
                key={comment._id}
                className="group flex items-start gap-2.5 comment-item-enter"
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {comment.userId.profilePicture ? (
                    <img
                      src={comment.userId.profilePicture}
                      alt={comment.userId.name}
                      className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-bold border border-[var(--border)] select-none">
                      {getInitials(comment.userId.name)}
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0 bg-[var(--btn-sec-bg)] border border-[var(--border)] rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold theme-text-primary truncate">
                        {comment.userId.name}
                      </span>
                      <span className="text-[10px] theme-text-muted shrink-0">
                        @{comment.userId.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 theme-text-muted hover:theme-text-primary transition-all duration-150 disabled:opacity-30 active:scale-90"
                          aria-label="Delete comment"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs theme-text-secondary leading-relaxed break-words">
                    {comment.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
