'use client';
// Phones: a bottom tab bar (Overview, Tickets, + New ticket, Notifications, More) with a "More" sheet
// holding the rest of the menu, the profile and log out. Hidden on wider screens (see app/majstormile.css).
import {useEffect, useState} from 'react';
import {LayoutDashboard, ListChecks, Plus, Bell, Menu, LogOut} from 'lucide-react';
import {tx, useLang, LangButtons} from '@/lib/i18n';

type Item = {name: string; icon: React.ComponentType<{size?: number}>};
export default function MobileNav({view, go, nav, canCreate, ticketCount, notifCount, userName, role, onLogout}: {
  view: string; go: (name: string) => void; nav: Item[]; canCreate: boolean; ticketCount: number; notifCount: number;
  userName: string; role: string; onLogout: () => void;
}) {
  useLang();
  const [more, setMore] = useState(false);
  useEffect(() => { setMore(false); }, [view]);
  useEffect(() => {
    if (!more) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMore(false); };
    window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc);
  }, [more]);
  const has = (n: string) => nav.some(x => x.name === n);
  const tabs = [
    has('Overview') && {name: 'Overview', label: 'Overview', icon: LayoutDashboard},
    has('Tickets') && {name: 'Tickets', label: role === 'Contractor' ? 'My jobs' : 'Tickets', icon: ListChecks, count: ticketCount},
    canCreate && {name: 'New ticket', label: 'New', icon: Plus, fab: true},
    has('Notifications') && {name: 'Notifications', label: 'Notifications', icon: Bell, count: notifCount},
  ].filter(Boolean) as {name: string; label: string; icon: Item['icon']; fab?: boolean; count?: number}[];
  const inMore = more || (!tabs.some(t => t.name === view));
  const pick = (n: string) => { setMore(false); go(n); };

  return <>
    {more && <div className="mnav-sheet-wrap">
      <button className="mnav-backdrop" aria-label={tx('Close menu')} onClick={() => setMore(false)}/>
      <div className="mnav-sheet" role="dialog" aria-label={tx('More')}>
        <div className="mnav-grip"/>
        <div className="mnav-sheet-head">
          <span className="mnav-avatar">{(userName || 'M').slice(0, 1)}</span>
          <div className="mnav-who"><strong>{userName}</strong><small>{tx(role)}</small></div>
          <button className="mnav-profile" onClick={() => pick('User Profile')}>{tx('Profile')}</button>
        </div>
        <div className="mnav-tiles">
          {[...nav.filter(n => n.name === 'Overview' || n.name === 'Tickets'), ...(canCreate ? [{name: 'New ticket', icon: Plus}] : []), ...nav.filter(n => n.name !== 'Overview' && n.name !== 'Tickets')].map(n =>
            <button key={n.name} className={'mnav-tile' + (view === n.name ? ' on' : '')} onClick={() => pick(n.name)}>
              <n.icon size={24}/><span>{tx(n.name === 'Tickets' && role === 'Contractor' ? 'My jobs' : n.name)}</span>
            </button>)}
        </div>
        <div className="mnav-lang"><LangButtons/></div>
        <div className="mnav-foot">
          <button className="mnav-out" onClick={() => { setMore(false); onLogout(); }}><LogOut size={18}/>{tx('Log out')}</button>
        </div>
      </div>
    </div>}
    <nav className="mnav" aria-label={tx('Main menu')}>
      {tabs.map(t => {
        const on = !more && view === t.name;
        return <button key={t.name} className={'mnav-tab' + (t.fab ? ' fab' : '') + (on ? ' on' : '')} aria-current={on ? 'page' : undefined} onClick={() => pick(t.name)}>
          {t.fab ? <span className="mnav-fab"><t.icon size={26}/></span> : <span className="mnav-ico"><t.icon size={22}/>{t.count ? <b className="mnav-badge">{t.count > 99 ? '99+' : t.count}</b> : null}</span>}
          <span className="mnav-label">{tx(t.label)}</span>
        </button>;
      })}
      <button className={'mnav-tab' + (inMore ? ' on' : '')} aria-expanded={more} onClick={() => setMore(m => !m)}>
        <span className="mnav-ico"><Menu size={22}/></span><span className="mnav-label">{tx('More')}</span>
      </button>
    </nav>
  </>;
}
