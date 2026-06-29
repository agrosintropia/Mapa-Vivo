'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  projectSlug: string;
  userRole: string;
  pendingObservations?: number;
}

const ICONS = {
  mapa: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <path d="M8 2v16M16 6v16" />
    </svg>
  ),
  dashboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="13" width="7" height="8" rx="1" />
    </svg>
  ),
  painel: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  observacoes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  visita: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  ajuda: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  reportar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
};

export default function BottomNav({ projectSlug, userRole, pendingObservations }: BottomNavProps) {
  const pathname = usePathname();

  const items: { href: string; icon: React.ReactNode; label: string; badge?: number }[] = [];

  if (userRole === 'morador') {
    items.push({ href: `/${projectSlug}/mapa`, icon: ICONS.mapa, label: 'Mapa' });
    items.push({ href: `/${projectSlug}/dashboard`, icon: ICONS.dashboard, label: 'Dashboard' });
    items.push({ href: `/${projectSlug}/submeter`, icon: ICONS.reportar, label: 'Reportar' });
    items.push({ href: `/${projectSlug}/ajuda`, icon: ICONS.ajuda, label: 'Ajuda' });
  } else if (userRole === 'gestor') {
    items.push({ href: `/${projectSlug}/dashboard`, icon: ICONS.dashboard, label: 'Dashboard' });
    items.push({ href: `/${projectSlug}/mapa`, icon: ICONS.mapa, label: 'Mapa' });
    items.push({ href: `/${projectSlug}/painel/observacoes`, icon: ICONS.observacoes, label: 'Revisões', badge: pendingObservations });
    items.push({ href: `/${projectSlug}/ajuda`, icon: ICONS.ajuda, label: 'Ajuda' });
  } else if (userRole === 'tecnico') {
    items.push({ href: `/${projectSlug}/mapa`, icon: ICONS.mapa, label: 'Mapa' });
    items.push({ href: `/${projectSlug}/dashboard`, icon: ICONS.dashboard, label: 'Dashboard' });
    items.push({ href: `/${projectSlug}/painel`, icon: ICONS.painel, label: 'Painel' });
    items.push({ href: `/${projectSlug}/painel/observacoes`, icon: ICONS.observacoes, label: 'Revisões', badge: pendingObservations });
    items.push({ href: `/${projectSlug}/visita`, icon: ICONS.visita, label: 'Visita' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {items.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg min-w-[56px] transition-colors relative ${
                isActive ? 'text-verde-cerrado' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-terracota text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
