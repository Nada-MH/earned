import React, { useState } from 'react';
import { Briefcase, User, Hexagon, Home, Search, MessageSquare, Layers, Settings, LogOut, Mail } from 'lucide-react';
import { UserProfile, CompanyProfile } from '../types';
import { PixelAvatar } from './ui/PixelAvatar';
import { useSettings } from '../contexts/SettingsContext';
import { SettingsModal } from './SettingsModal';

export type AppView = 
  | 'landing' 
  | 'auth' 
  | 'company-auth' 
  | 'talent-feed' 
  | 'talent-dashboard' 
  | 'talent-profile' 
  | 'messages' 
  | 'company-pool' 
  | 'company-jobs';

const NavItem = ({ 
  view, 
  icon: Icon, 
  label,
  currentView,
  onNavigate,
  badgeCount
}: { 
  view: AppView, 
  icon: React.ElementType, 
  label: string,
  currentView: AppView,
  onNavigate: (view: AppView) => void,
  badgeCount?: number
}) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`relative flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all ${
        isActive 
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-bold' 
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <div className="relative">
        <Icon size={22} className={isActive ? "fill-emerald-500/20" : ""} />
        {badgeCount && badgeCount > 0 ? (
          <span className="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {badgeCount}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">{label}</span>
    </button>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user?: UserProfile;
  companyUser?: CompanyProfile;
  onLogout?: () => void;
  unreadMessagesCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate, 
  user, 
  companyUser,
  onLogout,
  unreadMessagesCount = 0
}) => {
  const isCompany = currentView.startsWith('company') || (!!companyUser && !user);
  const isTalent = currentView.startsWith('talent') || (!!user && !companyUser);
  const { t } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Full screen layout for Landing and Auth flows
  if (currentView === 'landing' || currentView === 'auth' || currentView === 'company-auth') {
    return (
      <div className="h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <div className="absolute top-4 right-4 z-50">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md text-slate-500 dark:text-slate-400 transition-all"
           >
             <Settings size={20} />
           </button>
        </div>
        {children}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    );
  }

  const activeAvatar = user?.avatar || companyUser?.avatar || { archetype: 'android' as const, color: '#10b981' };
  const activeName = user?.name || companyUser?.companyName || 'Guest User';
  const activeSubTitle = user?.role || (companyUser ? `Recruiter: ${companyUser.recruiterName}` : 'Guest');

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden transition-colors duration-300">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 transition-colors">
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-3 px-4 py-4 mb-6 cursor-pointer group"
        >
          <div className="bg-emerald-500 rounded-xl p-2 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
            <Hexagon className="h-6 w-6 text-white dark:text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none block">Earned</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mt-0.5">
              {isCompany ? 'Recruiter Hub' : 'Talent Hub'}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1.5">
          {isTalent && (
            <>
              <NavItem view="talent-feed" icon={Home} label={t('nav.home')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="talent-dashboard" icon={Layers} label={t('nav.career')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="talent-profile" icon={User} label={t('nav.profile')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="messages" icon={Mail} label="Mailbox & Invites" currentView={currentView} onNavigate={onNavigate} badgeCount={unreadMessagesCount} />
            </>
          )}
          {isCompany && (
            <>
              <NavItem view="company-pool" icon={Search} label={t('nav.pool')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="company-jobs" icon={Briefcase} label={t('nav.jobs')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="messages" icon={MessageSquare} label="Messages & Invites" currentView={currentView} onNavigate={onNavigate} badgeCount={unreadMessagesCount} />
            </>
          )}
        </nav>

        {/* Footer Actions in Sidebar */}
        <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
           <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium"
           >
             <Settings size={18} />
             <span>{t('nav.settings')}</span>
           </button>

           {onLogout && (
             <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-bold"
             >
               <LogOut size={18} />
               <span>Log Out</span>
             </button>
           )}
        </div>

        {/* User Card */}
        <div className="p-3 mt-3 bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PixelAvatar config={activeAvatar} size={36} />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{activeName}</p>
              <p className="text-[10px] text-slate-500 truncate">{activeSubTitle}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
          {/* Spacer for mobile bottom bar */}
          <div className="md:hidden h-20 flex-shrink-0" />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg fixed bottom-0 w-full z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
           {isTalent && (
            <>
              <NavItem view="talent-feed" icon={Home} label={t('nav.home')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="talent-dashboard" icon={Layers} label={t('nav.career')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="messages" icon={Mail} label="Mailbox" currentView={currentView} onNavigate={onNavigate} badgeCount={unreadMessagesCount} />
              <NavItem view="talent-profile" icon={User} label={t('nav.profile')} currentView={currentView} onNavigate={onNavigate} />
            </>
          )}
          {isCompany && (
            <>
              <NavItem view="company-pool" icon={Search} label={t('nav.pool')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="company-jobs" icon={Briefcase} label={t('nav.jobs')} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view="messages" icon={MessageSquare} label="Messages" currentView={currentView} onNavigate={onNavigate} badgeCount={unreadMessagesCount} />
              <button onClick={() => setIsSettingsOpen(true)} className="flex flex-col items-center p-2 text-slate-500 dark:text-slate-400">
                 <Settings size={20} />
                 <span className="text-[10px] font-medium mt-1">{t('nav.settings')}</span>
              </button>
            </>
          )}
          {onLogout && (
            <button onClick={onLogout} className="flex flex-col items-center p-2 text-rose-500">
               <LogOut size={20} />
               <span className="text-[10px] font-bold mt-1">Exit</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
