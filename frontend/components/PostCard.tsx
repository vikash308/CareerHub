'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { likePost, deletePost as deletePostAction } from '../store/postSlice';
import { api } from '../utils/api';
import { Post } from '../store/types';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  animationDelay?: number;
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

export default function PostCard({ post, animationDelay = 0 }: PostCardProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [localLikes, setLocalLikes] = useState(post.likes);
  const [liked, setLiked] = useState(() => getLikedSet().has(post._id));
  const [popAnim, setPopAnim] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount || 0);

  const isOwner = user?._id === post.userId._id;

  useEffect(() => {
    setLocalLikes(post.likes);
  }, [post.likes]);

  useEffect(() => {
    setLocalCommentCount(post.commentCount || 0);
  }, [post.commentCount]);

  // post.media contains the full Cloudinary URL
  const mediaUrl = post.media && post.media !== 'pending' ? post.media : null;

  const handleLike = async () => {
    if (liked) return;

    setLiked(true);
    setLocalLikes((prev) => prev + 1);
    setPopAnim(true);
    setTimeout(() => setPopAnim(false), 400);
    persistLike(post._id);
    dispatch(likePost({ postId: post._id }));

    try {
      await api.likePost(post._id);
    } catch {
      setLiked(false);
      setLocalLikes((prev) => prev - 1);
      const set = getLikedSet();
      set.delete(post._id);
      localStorage.setItem(LS_KEY, JSON.stringify([...set]));
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    try {
      await api.deletePost(post._id);
      dispatch(deletePostAction(post._id));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() =>
      toast.success('Link copied to clipboard!')
    );
  };

  return (
    <article
      className="post-card-enter theme-card rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300 shadow-xl group relative"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex gap-3 items-start mb-4">
        <div className="shrink-0">
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
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold theme-text-primary leading-tight truncate">
            {post.userId.name}
          </h3>
          <p className="text-[11px] theme-text-muted mt-0.5 truncate">
            @{post.userId.username}&nbsp;·&nbsp;{formatRelativeTime(post.createdAt)}
          </p>
        </div>

        {isOwner && (
          <div className="relative ml-auto shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg theme-text-muted hover:theme-text-primary hover:bg-[var(--btn-sec-bg)] transition-all duration-150 opacity-0 group-hover:opacity-100"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-xl shadow-2xl overflow-hidden navbar-dropdown min-w-[130px]">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm theme-text-secondary leading-relaxed whitespace-pre-wrap mb-4">
        {post.body}
      </p>

      {mediaUrl && (
        <div className="rounded-xl overflow-hidden border theme-border mb-4 bg-[var(--btn-sec-bg)] max-h-80">
          {(post.fileType && ['mp4', 'webm', 'ogg', 'quicktime', 'mov', 'avi', 'mkv'].includes(post.fileType)) || 
           (mediaUrl && mediaUrl.includes('/video/upload/')) ? (
            <video src={mediaUrl} controls className="w-full max-h-80 object-contain" />
          ) : (
            <img src={mediaUrl} alt="Post media" className="w-full object-contain max-h-80" />
          )}
        </div>
      )}

      <div className="flex justify-between items-center border-t theme-border pt-3.5 mt-1 theme-text-secondary text-xs">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            aria-label={`Like post - ${localLikes} likes`}
            className={`flex items-center gap-1.5 font-semibold transition-colors duration-150
              ${liked ? 'text-indigo-500' : 'theme-text-secondary hover:text-indigo-500 cursor-pointer'}`}
          >
            <ThumbsUp
              className={`w-4 h-4 ${popAnim ? 'like-pop' : liked ? 'scale-110' : ''} transition-transform duration-150`}
              fill={liked ? 'currentColor' : 'none'}
            />
            <span>{localLikes}</span>
          </button>

          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors font-semibold
              ${showComments ? 'text-indigo-500' : 'hover:text-indigo-500'}`}
            aria-label="Toggle comments"
          >
            <MessageSquare className={`w-4 h-4 transition-transform duration-200 ${showComments ? 'scale-110' : ''}`} />
            <span>Comment</span>
            {localCommentCount > 0 && (
              <span className="text-[10px] opacity-90 bg-[var(--btn-sec-bg)] px-1.5 py-0.5 rounded-full font-medium">
                {localCommentCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer transition-colors font-semibold"
          aria-label="Share post"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Comments Section - slides in when showComments is true */}
      {showComments && (
        <CommentSection 
          postId={post._id} 
          onCommentCountChange={setLocalCommentCount}
        />
      )}
    </article>
  );
}
