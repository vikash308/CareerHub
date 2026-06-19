'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { Image as ImageIcon, Send, X, RefreshCw, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addPost } from '../store/postSlice';
import { api } from '../utils/api';

const MAX_CHARS = 500;

interface CreatePostWidgetProps {
  onPostCreated?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function CreatePostWidget({ onPostCreated }: CreatePostWidgetProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [text, setText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [popKey, setPopKey] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea height based on content
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [text]);

  const remaining = MAX_CHARS - text.length;
  const charCountClass =
    remaining <= 0
      ? 'char-count-danger'
      : remaining <= 60
      ? 'char-count-warn'
      : 'char-count-ok';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Only image or video files are supported.');
      return;
    }
    if (isVideo && file.size > 5 * 1024 * 1024) {
      toast.error('Video must be under 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (isImage && file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearMedia = useCallback(() => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !previewUrl) {
      toast.warning('Write something or attach a file first.');
      return;
    }
    if (text.length > MAX_CHARS) {
      toast.error(`Post exceeds ${MAX_CHARS} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('body', text.trim());

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const isVideo = file.type.startsWith('video/');
        if (isVideo && file.size > 5 * 1024 * 1024) {
          toast.error('Video must be under 5 MB.');
          setIsSubmitting(false);
          return;
        }
        formData.append('media', file);
      }

      const result = await api.createPost(formData);

      if (result?.message) {
        const optimisticPost = {
          _id: `temp-${Date.now()}`,
          userId: {
            _id: user?._id || '',
            name: user?.name || 'You',
            username: user?.username || '',
            email: user?.email || '',
            profilePicture: user?.profilePicture || '',
          },
          body: text.trim(),
          likes: 0,
          media: previewUrl ? 'pending' : '',
          fileType: file?.type.split('/')[1] || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true,
        };
        dispatch(addPost(optimisticPost));

        toast.success('Post shared successfully!');
        setText('');
        clearMedia();
        setIsFocused(false);

        if (onPostCreated) {
          setTimeout(onPostCreated, 700);
        }
      } else {
        toast.error(result?.error || result?.message || 'Failed to create post.');
      }
    } catch {
      toast.error('Network error while posting. Is the server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ctrl+Enter submits the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const hasContent = text.trim().length > 0 || Boolean(previewUrl);
  const mediaFile = fileInputRef.current?.files?.[0];
  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <div
      className={`theme-card rounded-2xl p-4 transition-all duration-300 shadow-xl
        ${isFocused || hasContent
          ? 'border-indigo-500/40 bg-indigo-500/[0.04]'
          : 'hover:border-indigo-500/20'
        }`}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3.5 items-start">
          <div className="shrink-0 mt-0.5">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-[var(--border)] select-none">
                {user?.name ? getInitials(user.name) : 'CH'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <textarea
              id="create-post-textarea"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(text.length > 0)}
              onKeyDown={handleKeyDown}
              placeholder="Share a career update, insight, or ask the community..."
              rows={3}
              className="post-textarea w-full bg-transparent border-none theme-text-primary placeholder-[var(--text-muted)] text-sm focus:ring-0 resize-none p-0 outline-none leading-relaxed"
            />

            {previewUrl && (
              <div className="relative mt-3 rounded-xl overflow-hidden border theme-border bg-[var(--btn-sec-bg)] max-h-56">
                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-56 object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Attachment preview"
                    className="w-full object-contain max-h-56"
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                  aria-label="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t theme-border">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="post-media-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg theme-text-secondary hover:text-indigo-500 hover:bg-[var(--btn-sec-bg)] transition-all text-xs font-medium"
                  title="Attach image"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg theme-text-secondary hover:text-indigo-500 hover:bg-[var(--btn-sec-bg)] transition-all text-xs font-medium"
                  title="Attach video"
                >
                  <Film className="w-4 h-4" />
                  <span className="hidden sm:inline">Video</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-mono tabular-nums transition-colors ${charCountClass}`}
                >
                  {remaining < 100 ? remaining : ''}
                  {remaining < 100 && (
                    <span className="ml-0.5 text-[10px] opacity-60">left</span>
                  )}
                </span>

                <button
                  type="submit"
                  id="create-post-submit-btn"
                  disabled={isSubmitting || text.length > MAX_CHARS || (!text.trim() && !previewUrl)}
                  onMouseDown={() => setPopKey((k) => k + 1)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send key={popKey} className="w-3.5 h-3.5" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!isFocused && !hasContent && (
          <p className="mt-2 ml-[3.375rem] text-[10px] theme-text-muted opacity-60 font-medium select-none">
            Press Ctrl + Enter to publish
          </p>
        )}
      </form>
    </div>
  );
}
