'use client';

import { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addPost, likePost } from '../store/postSlice';
import { toast } from 'react-toastify';
import { 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  UserPlus, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Send,
  X
} from 'lucide-react';

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const reduxPosts = useAppSelector((state) => state.posts.posts);

  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High-fidelity fallback mock posts if database is currently empty
  const mockFallbackPosts = [
    {
      _id: 'mock-1',
      user: {
        name: 'Sarah Jenkins',
        username: 'sarah_design',
        headline: 'Lead UX Designer at CareerHub',
        profilePicture: ''
      },
      content: 'Just finished documenting the core design guidelines for our new project. We are heavily leaning into clean glassmorphism and subtle radial gradients to create digital depth. No complex background assets, just pure CSS blurs and harmonics. Exciting times ahead!',
      likes: 42,
      commentsCount: 12,
      createdAt: '2 hours ago'
    },
    {
      _id: 'mock-2',
      user: {
        name: 'Michael Chen',
        username: 'mike_pm',
        headline: 'Senior Product Manager',
        profilePicture: ''
      },
      content: 'Great product management is not about having all the right answers, but asking the right questions. Focusing on user pain points and keeping the interface clean and clutter-free is key. Excited to run our beta testing rounds next week.',
      likes: 18,
      commentsCount: 4,
      createdAt: '5 hours ago'
    }
  ];

  const activePosts = reduxPosts.length > 0 ? reduxPosts : mockFallbackPosts;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !selectedImage) {
      toast.warning('Please enter some text or select an image to post.');
      return;
    }

    // Dispatching local post update to redux for instant UI satisfaction
    const newPostData = {
      _id: Date.now().toString(),
      user: {
        name: user?.name || 'Vikash Pandey',
        username: user?.username || 'vikash_dev',
        headline: 'Software Engineer',
        profilePicture: user?.profilePicture || ''
      },
      content: postText,
      image: selectedImage || undefined,
      likes: 0,
      commentsCount: 0,
      createdAt: 'Just now'
    };

    dispatch(addPost(newPostData));
    toast.success('Post shared successfully!');
    setPostText('');
    setSelectedImage(null);
  };

  const handleLike = (postId: string) => {
    // Check if it's a mock post, we can just increment locally or trigger toast
    if (postId.startsWith('mock-')) {
      toast.info('You liked this mock post!');
      return;
    }
    dispatch(likePost({ postId }));
  };

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[10%] left-[5%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="blob-2 absolute bottom-[15%] right-[5%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Profile Summary Card */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-xl">
              <div className="h-24 bg-gradient-to-r from-indigo-500/20 to-violet-500/20" />
              <div className="px-4 pb-5 -mt-10 flex flex-col items-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-4 border-[#0F172A] object-cover mb-3 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold border-4 border-[#0F172A] mb-3 shadow-lg">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CH'}
                  </div>
                )}
                
                <h2 className="text-lg font-bold text-white text-center leading-tight truncate w-full">
                  {user?.name || 'User Name'}
                </h2>
                <p className="text-xs text-white/50 text-center mt-1 truncate w-full">
                  @{user?.username || 'username'}
                </p>
                <p className="text-xs text-indigo-300 text-center font-medium mt-1.5">
                  Software Engineer
                </p>

                <div className="w-full border-t border-white/10 pt-4 mt-4.5 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-white/50">Profile views</span>
                    <span className="text-xs text-indigo-300 font-bold">142</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-white/50">Connections</span>
                    <span className="text-xs text-indigo-300 font-bold">88</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 py-2 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  View Profile
                </button>
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: Create Post & Feed */}
          <section className="lg:col-span-6 space-y-6">
            
            {/* Create Post Card */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/15 shadow-xl">
              <div className="flex gap-4 items-start">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold border border-white/10 shrink-0">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CH'}
                  </div>
                )}
                
                <div className="flex-grow">
                  <form onSubmit={handleCreatePost}>
                    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 focus-within:border-indigo-500/50 focus-within:bg-indigo-950/10 transition-all">
                      <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="Share a career update, tip, or ask a question..."
                        className="w-full bg-transparent border-none text-white placeholder-white/30 text-sm focus:ring-0 resize-none p-0 outline-none"
                        rows={2.5}
                      />
                      
                      {selectedImage && (
                        <div className="relative mt-2.5 rounded-lg overflow-hidden border border-white/10 max-h-48 bg-black/40">
                          <img
                            src={selectedImage}
                            alt="Post attachment"
                            className="w-full h-full object-contain max-h-48"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/60 hover:text-indigo-400 hover:bg-white/[0.05] transition-all text-xs font-semibold"
                      >
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        Upload Media
                      </button>
                      
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.8 rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Post Feed List */}
            <div className="space-y-4">
              {activePosts.map((post) => (
                <div 
                  key={post._id} 
                  className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/15 transition-all duration-300 shadow-xl"
                >
                  <div className="flex gap-3 items-center mb-4">
                    {post.user.profilePicture ? (
                      <img
                        src={post.user.profilePicture}
                        alt={post.user.name}
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                        {post.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{post.user.name}</h3>
                      <p className="text-[11px] text-white/50">{post.user.headline} • {post.createdAt}</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="rounded-xl overflow-hidden border border-white/10 mb-4 max-h-80 bg-black/40">
                      <img
                        src={post.image}
                        alt="Post media"
                        className="w-full h-full object-contain max-h-80"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-white/5 pt-3.5 mt-2 text-white/40 text-xs">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer transition-colors active:scale-95 duration-100 font-semibold"
                      >
                        <ThumbsUp className="w-4 h-4" /> 
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer transition-colors font-semibold">
                        <MessageSquare className="w-4 h-4" /> 
                        {post.commentsCount}
                      </button>
                    </div>
                    <button className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer transition-colors font-semibold">
                      <Share2 className="w-4 h-4" /> 
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </section>

          {/* RIGHT COLUMN: AI ATS Analyzer & Network Suggestions */}
          <aside className="lg:col-span-3 space-y-4">
            
            {/* ATS Resume Analyzer Card */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all duration-300" />
              
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">ATS Resume Scoring</h3>
              </div>

              <div className="flex flex-col items-center justify-center py-4 relative z-10">
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-white/5 mb-3 bg-black/10">
                  <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/5"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-400"
                      strokeWidth="2.5"
                      strokeDasharray="78, 100"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="text-lg text-indigo-300 font-extrabold">78%</span>
                </div>
                <p className="text-[11px] text-white/50 text-center px-2">
                  Powered by Gemini AI analysis.
                </p>
              </div>

              <button className="w-full mt-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-200">
                Boost Score
              </button>
            </div>

            {/* Network Suggestions */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-300 shadow-xl">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest px-1 mb-4">
                People You May Know
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 hover:bg-white/[0.04] rounded-xl transition-all duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shrink-0">
                      SJ
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Sarah Jenkins</p>
                      <p className="text-[10px] text-white/55 mt-0.5">UX Designer</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success('Connection request sent')}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-indigo-400 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all duration-150 active:scale-90"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-white/[0.04] rounded-xl transition-all duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shrink-0">
                      MC
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Michael Chen</p>
                      <p className="text-[10px] text-white/55 mt-0.5">Product Manager</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success('Connection request sent')}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-indigo-400 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all duration-150 active:scale-90"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
