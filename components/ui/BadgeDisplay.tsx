
import React from 'react';
import { UserBadge } from '../../types';
import { BADGE_DEFINITIONS } from '../../services/badgeService';
import { 
  Target, TrendingUp, CalendarClock, CalendarCheck, Briefcase, Zap, ShieldCheck, Crown, Award,
  CalendarRange, Infinity, RefreshCcw, Star, Crosshair, ArrowUpCircle, ShieldAlert, FileCheck,
  Handshake, Radio, Users, MessageSquare, Clock, Activity, Gauge, Brain, Lightbulb, Thermometer, Scale
} from 'lucide-react';

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Target, TrendingUp, CalendarClock, CalendarCheck, Briefcase, Zap, ShieldCheck, Crown,
  CalendarRange, Infinity, RefreshCcw, Star, Crosshair, ArrowUpCircle, ShieldAlert, FileCheck,
  Handshake: Users, Radio, Users, MessageSquare, Clock, Activity, Gauge,
  Brain, Lightbulb, Thermometer, Gavel: Scale, Scale
};

// SVG Shapes
const Hexagon = () => (
  <polygon points="50 0, 95 25, 95 75, 50 100, 5 75, 5 25" />
);

const ShieldShape = () => (
  <path d="M50 0 L95 15 V55 C95 85 50 100 50 100 C50 100 5 85 5 55 V15 L50 0Z" />
);

interface BadgeDisplayProps {
  badge: UserBadge;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, size = 'md', showLabel = false }) => {
  const def = BADGE_DEFINITIONS[badge.badgeId];
  if (!def) return null;

  const Icon = ICONS[def.icon] || Award;

  // Visual styles based on Rarity
  const styles = {
    Common: {
      gradient: 'from-slate-700 to-slate-900',
      border: '#475569', // slate-600
      iconColor: 'text-slate-300',
      shadow: 'shadow-slate-900/50',
      shape: 'hexagon'
    },
    Rare: {
      gradient: 'from-blue-600 to-blue-900',
      border: '#60a5fa', // blue-400 (Silverish)
      iconColor: 'text-white',
      shadow: 'shadow-blue-500/30',
      shape: 'hexagon'
    },
    Epic: {
      gradient: 'from-amber-600 to-amber-900',
      border: '#fbbf24', // amber-400 (Gold)
      iconColor: 'text-amber-100',
      shadow: 'shadow-amber-500/40',
      shape: 'shield'
    },
    Legendary: {
      gradient: 'from-emerald-500 via-emerald-700 to-teal-900',
      border: '#34d399', // emerald-400 (Neon)
      iconColor: 'text-white',
      shadow: 'shadow-emerald-500/50',
      shape: 'shield'
    }
  };

  const style = styles[def.rarity];
  
  // Size calculations
  const dims = size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 72 : 96;
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 20 : size === 'lg' ? 32 : 40;
  
  const Shape = style.shape === 'shield' ? ShieldShape : Hexagon;
  const gradientId = React.useId().replace(/:/g, '');

  return (
    <div className="group relative inline-flex flex-col items-center justify-center">
      {/* Badge Container */}
      <div 
        className={`relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-xl ${style.shadow}`}
        style={{ width: dims, height: dims }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 drop-shadow-md">
           <defs>
              <linearGradient id={`grad-${badge.badgeId}-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                 {def.rarity === 'Legendary' ? (
                   <>
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#020617" />
                   </>
                 ) : def.rarity === 'Epic' ? (
                   <>
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                   </>
                 ) : def.rarity === 'Rare' ? (
                   <>
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                   </>
                 ) : (
                   <>
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#0f172a" />
                   </>
                 )}
              </linearGradient>
           </defs>
           
           {/* Background Shape */}
           <g fill={`url(#grad-${badge.badgeId}-${gradientId})`} stroke={style.border} strokeWidth="4">
              <Shape />
           </g>
           
           {/* Inner Highlight/Glint */}
           <g fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="2">
              <Shape />
           </g>
        </svg>

        {/* Icon */}
        <div className={`relative z-10 ${style.iconColor} drop-shadow-md`}>
           <Icon size={iconSize} strokeWidth={def.rarity === 'Legendary' ? 3 : 2} />
        </div>
        
        {/* Shine Effect for Legendary/Epic */}
        {(def.rarity === 'Legendary' || def.rarity === 'Epic') && (
           <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
        )}
      </div>

      {/* Label (Optional) */}
      {showLabel && (
        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 text-center max-w-[80px] leading-tight`}>
          {def.name}
        </span>
      )}

      {/* Tooltip (Recruiter Facing) */}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-950 border border-slate-700 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-xs font-bold uppercase tracking-wider ${def.rarity === 'Legendary' ? 'text-emerald-400' : def.rarity === 'Epic' ? 'text-amber-400' : def.rarity === 'Rare' ? 'text-blue-400' : 'text-slate-400'}`}>
            {def.rarity} Badge
          </span>
          <span className="text-[10px] text-slate-500">{new Date(badge.earnedAt).toLocaleDateString()}</span>
        </div>
        <h4 className="text-white font-bold mb-1">{def.name}</h4>
        <p className="text-xs text-slate-400 mb-3">{def.description}</p>
        
        <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Criteria</span>
          <p className="text-xs text-slate-300 font-medium leading-snug">{def.criteria}</p>
        </div>
      </div>
    </div>
  );
};
