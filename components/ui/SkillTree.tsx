import React, { useEffect, useRef, useState } from 'react';
import { SkillNode, MasteryLevel } from '../../types';
import { Lock, Check, Star, Shield, Zap } from 'lucide-react';

interface SkillTreeProps {
  nodes: SkillNode[];
  onNodeSelect?: (node: SkillNode) => void;
}

const SkillNodeItem: React.FC<{
  node: SkillNode;
  parent: SkillNode | undefined;
  onSelect?: (node: SkillNode) => void;
}> = ({ node, parent, onSelect }) => {
  const [animateClass, setAnimateClass] = useState('');
  const prevStatus = useRef(node.status);
  const isClickable = node.status !== 'locked';

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (prevStatus.current !== node.status) {
      if (prevStatus.current === 'locked' && node.status === 'available') {
        // Unlock animation
        if (isMounted) setAnimateClass('animate-unlock');
      } else if (prevStatus.current === 'available' && node.status === 'completed') {
        // Complete animation
        if (isMounted) setAnimateClass('animate-complete');
      }
      prevStatus.current = node.status;
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (isMounted) setAnimateClass('');
      }, 1000); // Clear after animation
    }
    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [node.status]);

  return (
    <div 
      className="group relative flex flex-col items-center"
      onClick={() => isClickable && onSelect?.(node)}
    >
      {/* Connection Line */}
      {parent && (
        <svg className="absolute -top-16 left-1/2 -translate-x-1/2 w-full h-16 pointer-events-none overflow-visible">
            <path 
              d="M 50% 0 C 50% 40%, 50% 60%, 50% 100%" 
              fill="none" 
              stroke={node.status === 'locked' ? '#334155' : '#10b981'} 
              strokeWidth="2" 
              strokeDasharray={node.status === 'locked' ? "4 4" : ""}
              className={`transition-colors duration-1000 ${node.status !== 'locked' ? 'opacity-100' : 'opacity-50'}`}
            />
        </svg>
      )}

      {/* Node Circle */}
      <div 
        className={`
          w-20 h-20 rounded-2xl rotate-45 flex items-center justify-center border-2 transition-all duration-500 relative z-10
          ${node.status === 'completed' 
            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
            : node.status === 'available'
              ? 'bg-slate-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer hover:bg-emerald-500/10'
              : 'bg-slate-900 border-slate-700 opacity-60 grayscale cursor-not-allowed'
          }
          ${animateClass}
          ${node.status === 'available' && !animateClass ? 'animate-pulse' : ''}
        `}
      >
        <div className="-rotate-45 transition-transform duration-500">
          {node.status === 'completed' ? <Check className="text-white w-8 h-8" strokeWidth={3} /> :
            node.status === 'locked' ? <Lock className="text-slate-500 w-6 h-6" /> :
            <Star className="text-emerald-500 w-8 h-8" fill="currentColor" />
          }
        </div>
        
        {/* Mastery Level Indicator */}
        {node.status !== 'locked' && (
            <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center -rotate-45 transition-transform duration-500
              ${node.level === MasteryLevel.EXPERT ? 'bg-amber-400 text-amber-900' :
                node.level === MasteryLevel.PRO ? 'bg-blue-400 text-blue-900' : 'bg-slate-600 text-slate-200'
              }
              ${animateClass === 'animate-complete' ? 'scale-125' : 'scale-100'}
            `}>
              {node.level === MasteryLevel.EXPERT ? <Shield size={12} fill="currentColor"/> :
              node.level === MasteryLevel.PRO ? <Zap size={12} fill="currentColor"/> :
              <span className="text-[10px] font-bold">N</span>
              }
            </div>
        )}
      </div>

      {/* Label */}
      <div className={`mt-8 text-center transition-all duration-500 ${node.status === 'locked' ? 'opacity-40' : 'opacity-100'}`}>
        <h4 className={`text-sm font-bold ${node.status === 'completed' ? 'text-emerald-400' : 'text-slate-200'}`}>
          {node.status === 'locked' ? '???' : node.name}
        </h4>
        <span className="text-[10px] uppercase tracking-wider font-medium text-slate-500">
          {node.level}
        </span>
      </div>
    </div>
  );
};

export const SkillTree: React.FC<SkillTreeProps> = ({ nodes, onNodeSelect }) => {
  const tiers = Array.from(new Set(nodes.map(n => n.tier))).sort((a: number, b: number) => a - b);
  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="relative py-8 px-4 w-full overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      <div className="flex flex-col items-center space-y-16 relative z-10">
        {tiers.map((tier) => {
          const tierNodes = nodes.filter(n => n.tier === tier);
          return (
            <div key={tier} className="relative w-full flex justify-center gap-4 md:gap-12">
              {tierNodes.map((node) => (
                <SkillNodeItem 
                  key={node.id} 
                  node={node} 
                  parent={node.parentId ? getNodeById(node.parentId) : undefined} 
                  onSelect={onNodeSelect} 
                />
              ))}
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 flex justify-center gap-6 text-xs text-slate-500 uppercase tracking-widest font-medium">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Mastered</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-emerald-500"/> Available</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700"/> Locked</div>
      </div>
    </div>
  );
};
