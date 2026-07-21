
import React, { useState } from 'react';
import { PixelAvatar } from './ui/PixelAvatar';
import { BadgeDisplay } from './ui/BadgeDisplay';
import { UserBadge, AvatarConfig } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Award, Zap, TrendingUp } from 'lucide-react';

// Mock Feed Data
const FEED_ITEMS = [
  {
    id: '1',
    user: { name: 'Sarah Jones', role: 'Product Manager', avatar: { archetype: 'human_female', color: '#f59e0b' } as AvatarConfig },
    type: 'badge_earned',
    content: 'Just earned the "Consistency: 30 Days" badge! It’s been a tough month but showing up every day matters.',
    badgeId: 'cons-30',
    likes: 24,
    comments: 5,
    timestamp: '2h ago'
  },
  {
    id: '2',
    user: { name: 'David Kim', role: 'Software Engineer', avatar: { archetype: 'android', color: '#3b82f6' } as AvatarConfig },
    type: 'level_up',
    content: 'Finally promoted to Senior Professional (Level 6)! The system design challenges were intense.',
    level: 6,
    likes: 156,
    comments: 42,
    timestamp: '5h ago'
  },
  {
    id: '3',
    user: { name: 'Emily Blunt', role: 'UX Designer', avatar: { archetype: 'ethereal', color: '#8b5cf6' } as AvatarConfig },
    type: 'challenge_complete',
    content: 'Scored 100% on today\'s Accessibility Audit challenge. Learned a ton about ARIA live regions.',
    score: 100,
    likes: 89,
    comments: 12,
    timestamp: '8h ago'
  }
];

export const TalentFeed: React.FC<{ user?: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'following' | 'global'>('following');
  const [postText, setPostText] = useState('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-white">Your Feed</h2>
        <div className="flex gap-4 text-sm font-bold text-slate-500">
          <button 
             onClick={() => setActiveTab('following')} 
             className={activeTab === 'following' ? "text-white" : "hover:text-slate-300"}
          >
            Following
          </button>
          <button 
             onClick={() => setActiveTab('global')} 
             className={activeTab === 'global' ? "text-white" : "hover:text-slate-300"}
          >
            Global
          </button>
        </div>
      </div>

      {/* Create Post Placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
         {user?.avatar ? (
            <PixelAvatar config={user.avatar} size={40} className="border border-slate-700" />
         ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20"></div>
         )}
         <input 
           type="text" 
           value={postText}
           onChange={(e) => setPostText(e.target.value)}
           placeholder="Share a milestone..." 
           className="bg-transparent text-sm text-white placeholder-slate-500 flex-1 outline-none"
         />
         <button className="bg-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs">Post</button>
      </div>

      {/* Feed Items */}
      {FEED_ITEMS.map((item) => {
        const isLiked = likedPosts[item.id];
        const likesCount = item.likes + (isLiked ? 1 : 0);
        return (
        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-in slide-in-from-bottom duration-500">
          
          {/* Post Header */}
          <div className="flex justify-between items-start mb-4">
             <div className="flex gap-3">
               <PixelAvatar config={item.user.avatar} size={40} className="border border-slate-700" />
               <div>
                 <h3 className="text-sm font-bold text-white">{item.user.name}</h3>
                 <p className="text-xs text-slate-500">{item.user.role} • {item.timestamp}</p>
               </div>
             </div>
             <button className="text-slate-500 hover:text-white"><MoreHorizontal size={16}/></button>
          </div>

          {/* Content */}
          <p className="text-sm text-slate-200 mb-4 leading-relaxed">{item.content}</p>

          {/* Visual Highlight */}
          {item.type === 'badge_earned' && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center gap-4 mb-4">
               <BadgeDisplay badge={{ badgeId: item.badgeId!, earnedAt: Date.now() }} size="md" />
               <div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Badge Earned</span>
                  <p className="text-sm font-bold text-white">Contributor (30 Days)</p>
               </div>
            </div>
          )}

          {item.type === 'level_up' && (
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-4 border border-indigo-500/30 mb-4 flex items-center gap-3">
               <div className="bg-indigo-500 p-2 rounded-full text-white"><TrendingUp size={20}/></div>
               <div>
                 <span className="text-xs font-bold text-indigo-300 uppercase">Level Up</span>
                 <p className="text-white font-bold">Reached Level {item.level}</p>
               </div>
            </div>
          )}

          {item.type === 'challenge_complete' && (
            <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/20 mb-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400"><Zap size={20} fill="currentColor"/></div>
                 <span className="text-sm font-bold text-white">Perfect Score</span>
               </div>
               <span className="text-2xl font-black text-emerald-500">100</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 border-t border-slate-800 pt-3 text-slate-400">
             <button 
               onClick={() => toggleLike(item.id)}
               className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
             >
               <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> {likesCount}
             </button>
             <button className="flex items-center gap-1.5 text-xs font-medium hover:text-blue-400 transition-colors">
               <MessageCircle size={16} /> {item.comments}
             </button>
             <button className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors">
               <Share2 size={16} /> Share
             </button>
          </div>

        </div>
      )})}
    </div>
  );
};
