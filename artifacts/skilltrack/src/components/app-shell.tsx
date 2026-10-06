import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Award, BarChart3, BookOpen, BriefcaseBusiness, ChevronDown, CircleHelp, Command, LayoutDashboard, Menu, Search, Settings, ShieldAlert, Users, X } from 'lucide-react';
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
  const current = nav.find(n => path === n.path || (n.path === '/employees' && path.startsWith('/employees/')) || (n.path === '/training' && path.startsWith('/training/')));
  return <div className="min-h-[100dvh] bg-[#f5f2e9]">
    {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-[#10262e]/45 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[#19333b] text-[#e8e9df] transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-inherit no-underline"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#74bca0] text-[#19333b]"><Command size={19}/></span><span className="font-[Manrope] text-[17px] font-extrabold tracking-[-.04em]">skilltrack<span className="text-[#83c5a9]">.</span></span></Link>
        <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-white/65 md:hidden"><X size={18}/></button>
      </div>
      <div className="px-4 pt-6">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#8ca0a1]">People & capability</div>
        {['Workspace','Insights'].map(group => <div key={group} className="mb-5">
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#8ca0a1]">{group}</div>
          {nav.filter(n=>n.group===group).map(item => { const Icon=item.icon; const active=current?.path===item.path; return <Link data-testid={`link-nav-${item.path.slice(1)}`} onClick={()=>setOpen(false)} key={item.path} href={item.path} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-[10px] text-[13px] font-semibold no-underline transition-colors ${active?'bg-[#2c4a50] text-white':'text-[#c0cbc6] hover:bg-white/5 hover:text-white'}`}><Icon size={17} strokeWidth={1.8}/><span>{item.label}</span></Link>; })}
        </div>)}
      </div>
      <div className="mt-auto border-t border-white/10 p-4">
        <Link href="/settings" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold no-underline ${path==='/settings'?'bg-[#2c4a50] text-white':'text-[#c0cbc6] hover:bg-white/5'}`}><Settings size={17}/>Organization settings</Link>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#10282f]/60 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dfb878] text-xs font-bold text-[#293940]">AM</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-white">Avery Morgan</div><div className="text-[10px] text-[#9cadaa]">People operations</div></div><ChevronDown size={15} className="text-[#9cadaa]"/>
        </div>
      </div>
    </aside>
    <div className="md:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[#e5e0d5] bg-[#f7f5ef]/95 px-4 backdrop-blur md:px-9">
        <div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} aria-label="Open navigation" className="rounded-lg p-2 text-[#29434a] md:hidden"><Menu size={20}/></button><div className="hidden items-center gap-2 text-xs text-[#7d8986] sm:flex">Northstar Group <span className="text-[#bdc3bb]">/</span><span className="font-semibold text-[#354b4e]">{current?.label || 'Workspace'}</span></div><div className="text-sm font-semibold text-[#354b4e] sm:hidden">{current?.label || 'Workspace'}</div></div>
        <div className="flex items-center gap-2"><button aria-label="Search workspace" onClick={()=>{const search=document.getElementById('workspace-search');if(search)search.focus();else setLocation('/employees');}} className="flex items-center gap-2 rounded-xl border border-[#e4dfd4] bg-white px-3 py-2 text-xs text-[#73807e]"><Search size={15}/><span className="hidden sm:inline">Search workspace</span><kbd className="ml-4 hidden rounded border border-[#e5e0d5] px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘ K</kbd></button><Link href="/settings" aria-label="Help and settings" className="grid h-9 w-9 place-items-center rounded-xl border border-[#e4dfd4] bg-white text-[#60716f]"><CircleHelp size={16}/></Link></div>
      </header>
      <main className="mx-auto max-w-[1440px] px-4 py-7 md:px-9 md:py-9">{children}</main>
    </div>
  </div>;
}
