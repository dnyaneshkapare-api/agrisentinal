import React from 'react';
import { UserRole, LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Languages,
  Lock,
  AlertTriangle,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'observe' | 'case-detail' | 'godmode';
  setCurrentTab: (tab: 'dashboard' | 'observe' | 'case-detail' | 'godmode') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  language,
  setLanguage,
  isOnline,
  setIsOnline,
}) => {
  const t = TRANSLATIONS[language];
  const { user, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Offline banner if simulated offline */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {language === 'mr'
                ? 'ऑफलाईन मोड सक्रिय: नवीन पाहणी नोंदी स्थानिक मेमरीत साठवल्या जातील.'
                : 'Offline Mode Simulated: New observations will be queued locally with retry-safe IDs.'}
            </span>
          </div>
          <button
            onClick={() => setIsOnline(true)}
            className="px-2 py-0.5 bg-amber-800/60 hover:bg-amber-700/60 text-amber-100 rounded text-[11px] transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Main 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single Brand Element */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors block leading-tight"
            >
              AgriSentinel AI
            </a>
            <span className="text-[11px] text-slate-400 block font-mono">
              Maharashtra · SIH 26131
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navCommandCenter}
          </button>

          <button
            onClick={() => setCurrentTab('observe')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'observe'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navIntake}
          </button>

          <button
            onClick={() => setCurrentTab('case-detail')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'case-detail'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navCaseDetail}
          </button>

          <button
            onClick={() => setCurrentTab('godmode')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'godmode'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50 shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{t.navGodmode}</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Selectors */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Online/Offline Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title={isOnline ? 'Simulate Offline' : 'Go Online'}
            className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors flex items-center gap-1.5 ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">{isOnline ? t.online : t.offline}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-md p-0.5">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 text-xs font-medium rounded transition-colors ${
                language === 'en' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-1.5 py-0.5 text-xs font-medium rounded transition-colors ${
                language === 'mr' ? 'bg-slate-700 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 text-xs font-medium rounded transition-colors ${
                language === 'hi' ? 'bg-slate-700 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* User Role Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-md px-2 py-1">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="extension_worker" className="bg-slate-900 text-white">
                {t.roleExtension}
              </option>
              <option value="farmer" className="bg-slate-900 text-white">
                {t.roleFarmer}
              </option>
              <option value="expert" className="bg-slate-900 text-white">
                {t.roleExpert}
              </option>
              <option value="system_admin" className="bg-slate-900 text-white">
                {t.roleAdmin}
              </option>
            </select>
          </div>

          {/* Firebase Auth Google Sign-in */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-md p-1 pl-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs text-white max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                title="Sign out of Firebase"
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
