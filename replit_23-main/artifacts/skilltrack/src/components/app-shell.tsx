import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { getStoredUser, logoutUser, type AuthUser } from '@/lib/auth-service';
import { toast } from 'sonner';

const nav = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, group: 'Workspace' },
  { label: 'People', path: '/employees', icon: Users, group: 'Workspace' },
  { label: 'Skills library', path: '/skills', icon: BriefcaseBusiness, group: 'Workspace' },
  { label: 'Certifications', path: '/certifications', icon: Award, group: 'Workspace' },
  { label: 'Learning', path: '/training', icon: BookOpen, group: 'Workspace' },
  { label: 'Skill gaps', path: '/skill-gaps', icon: ShieldAlert, group: 'Insights' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, group: 'Insights' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [path, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    const handleRequestSignOut = () => {
      setSignOutModalOpen(true);
    };

    window.addEventListener('skilltrack:auth-change', handleAuthChange);
    window.addEventListener('skilltrack:request-signout', handleRequestSignOut);

    return () => {
      window.removeEventListener('skilltrack:auth-change', handleAuthChange);
      window.removeEventListener('skilltrack:request-signout', handleRequestSignOut);
    };
  }, []);

  // Close sign out modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && signOutModalOpen && !signingOut) {
        setSignOutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [signOutModalOpen, signingOut]);

  const handlePromptSignOut = () => {
    setUserMenuOpen(false);
    setOpen(false);
    setSignOutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    setSigningOut(true);
    try {
      await logoutUser();
      toast.success('Signed out successfully. See you soon!');
      setSignOutModalOpen(false);
      setUserMenuOpen(false);
      setLocation('/');
    } catch {
      toast.error('Could not complete sign out.');
    } finally {
      setSigningOut(false);
    }
  };

  const current = nav.find(
    (n) =>
      path === n.path ||
      (n.path === '/employees' && path.startsWith('/employees/')) ||
      (n.path === '/training' && path.startsWith('/training/'))
  );

  const displayName = user?.name || 'Avery Morgan';
  const displayRole = user?.role || 'Director of People Operations';
  const displayOrg = user?.organization || 'Northstar Group';
  const avatarText = user?.avatarText || 'AM';
  const avatarColor = user?.avatarColor || '#F26207';

  return (
    <div className="min-h-[100dvh] gradient-dark-canvas text-slate-100 flex flex-col selection:bg-[#F26207] selection:text-white">
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[254px] flex-col bg-slate-950/90 backdrop-blur-xl border-r border-white/10 text-slate-200 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 text-inherit no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-500/10 border border-orange-500/40 text-[#F26207] shadow-[0_0_15px_rgba(242,98,7,0.25)]">
              <Command size={18} />
            </span>
            <span className="font-[Manrope] text-xl font-black tracking-tight text-white">
              skilltrack<span className="text-[#F26207]">.</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3.5 pt-6 flex-1 overflow-y-auto space-y-6">
          {['Workspace', 'Insights'].map((group) => (
            <div key={group}>
              <div className="mb-2 px-3 text-[10px] font-mono font-bold uppercase tracking-[.18em] text-slate-400">
                {group}
              </div>
              <div className="space-y-1">
                {nav
                  .filter((n) => n.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = current?.path === item.path;
                    return (
                      <Link
                        data-testid={`link-nav-${item.path.slice(1)}`}
                        onClick={() => setOpen(false)}
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold no-underline transition-all ${
                          active
                            ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/15 border border-orange-500/40 text-orange-300 shadow-[0_0_15px_rgba(242,98,7,0.2)] font-bold'
                            : 'text-slate-400 hover:bg-white/5 hover:text-orange-200'
                        }`}
                      >
                        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-[#F26207]' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-white/10 p-3.5 relative bg-slate-950/60">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold no-underline transition ${
              path === '/settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings size={15} />
            <span>Organization settings</span>
          </Link>

          {/* User Profile Pill */}
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 rounded-xl bg-slate-900/90 hover:bg-slate-900 p-2.5 text-left transition border border-white/10 group cursor-pointer"
            >
              <div
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {avatarText}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-white group-hover:text-orange-300 transition">
                  {displayName}
                </div>
                <div className="truncate text-[10px] text-slate-400">{displayRole}</div>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-white/15 bg-slate-900 p-2 text-white shadow-2xl backdrop-blur-xl z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Signed in as
                  </div>
                  <div className="text-xs font-bold truncate text-orange-400">{user?.email || 'avery.morgan@northstar.io'}</div>
                  <div className="text-[10px] text-slate-300">{displayOrg}</div>
                </div>
                <Link
                  href="/settings"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setOpen(false);
                  }}
                  className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white no-underline transition"
                >
                  <Settings size={14} />
                  <span>Profile & Preferences</span>
                </Link>
                <button
                  type="button"
                  onClick={handlePromptSignOut}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-[254px] flex-1 flex flex-col">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-slate-300 md:hidden hover:bg-white/10"
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="font-semibold text-slate-200">{displayOrg}</span>
              <span className="text-slate-600">/</span>
              <span className="font-semibold text-orange-400">{current?.label || 'Workspace'}</span>
            </div>
            <div className="text-sm font-semibold text-white sm:hidden">
              {current?.label || 'Workspace'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Search workspace"
              onClick={() => {
                const search = document.getElementById('workspace-search');
                if (search) search.focus();
                else setLocation('/employees');
              }}
              className="dynamic-btn flex items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-400 hover:border-orange-500/40 hover:text-white transition shadow-sm cursor-pointer"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search workspace</span>
              <kbd className="ml-4 hidden rounded border border-white/10 bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
                ⌘ K
              </kbd>
            </button>

            <Link
              href="/settings"
              aria-label="Help and settings"
              className="dynamic-btn grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 hover:text-white hover:border-orange-500/40 transition shadow-sm"
            >
              <CircleHelp size={16} />
            </Link>

            <button
              type="button"
              onClick={handlePromptSignOut}
              title="Sign Out"
              className="dynamic-btn inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-500/30 transition shadow-sm cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] w-full px-4 py-7 md:px-9 md:py-9 flex-1">
          {children}
        </main>
      </div>

      {/* SIGN OUT CONFIRMATION POPUP MODAL */}
      {signOutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !signingOut) setSignOutModalOpen(false);
          }}
        >
          <div className="w-full max-w-[420px] rounded-3xl bg-[#0f1523]/98 border border-white/15 p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            {!signingOut && (
              <button
                type="button"
                onClick={() => setSignOutModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}

            {/* Icon & Title */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                <LogOut size={22} />
              </div>
              <div>
                <h3 className="font-[Manrope] text-lg font-extrabold text-white">
                  Sign out of SkillTrack?
                </h3>
                <p className="text-xs text-slate-400">
                  Confirm ending your active session
                </p>
              </div>
            </div>

            {/* User Details Pill */}
            <div className="my-4 flex items-center gap-3 rounded-2xl bg-[#141b2b] border border-white/10 p-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                style={{ backgroundColor: avatarColor }}
              >
                {avatarText}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {displayName}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user?.email || 'avery.morgan@northstar.io'}
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-300 mb-6">
              You will be signed out from the <strong className="text-white">{displayOrg}</strong> workspace. You will need to log in again to access employee records, skill matrices, and compliance tracking.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                disabled={signingOut}
                onClick={() => setSignOutModalOpen(false)}
                className="rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-5 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={signingOut}
                onClick={handleConfirmSignOut}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center gap-2 disabled:opacity-50"
              >
                {signingOut ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing out…</span>
                  </>
                ) : (
                  <>
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
