'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogoIconDark } from './Logo';

interface AppHeaderProps {
  projectName?: string;
  projectSlug?: string;
  subtitle?: string;
  userRole: string;
  userName?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function AppHeader({
  projectName,
  projectSlug,
  subtitle,
  userRole,
  userName,
  showBack,
  backHref,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = projectName || 'Mapa Vivo';
  const defaultBack = projectSlug ? `/${projectSlug}/mapa` : '/';

  return (
    <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href={backHref || defaultBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Voltar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <Link href={projectSlug ? `/${projectSlug}/mapa` : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8">
            <LogoIconDark />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base font-bold leading-tight truncate max-w-[200px]">
              {displayName}
            </h1>
            {subtitle && (
              <p className="text-[10px] opacity-60 leading-tight">{subtitle}</p>
            )}
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full right-4 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-verde-cerrado">
            {userName && (
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-sm truncate">{userName}</p>
                <p className="text-xs text-gray-400 capitalize">{userRole}</p>
              </div>
            )}

            {projectSlug && (
              <>
                <Link href={`/${projectSlug}/mapa`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Mapa interativo
                </Link>
                <Link href={`/${projectSlug}/dashboard`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Dashboard ambiental
                </Link>
              </>
            )}

            {userRole === 'morador' && projectSlug && (
              <>
                <Link href={`/${projectSlug}/submeter`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Reportar observação
                </Link>
                <Link href={`/${projectSlug}/ajuda`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Ajuda
                </Link>
              </>
            )}

            {userRole === 'gestor' && projectSlug && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link href={`/${projectSlug}/painel`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Painel de gestão
                </Link>
                <Link href={`/${projectSlug}/painel/observacoes`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Revisões
                </Link>
                <Link href={`/${projectSlug}/painel/visitas`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Visitas técnicas
                </Link>
                <Link href={`/${projectSlug}/ajuda`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Ajuda
                </Link>
              </>
            )}

            {userRole === 'tecnico' && projectSlug && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link href={`/${projectSlug}/painel`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Painel de gestão
                </Link>
                <Link href={`/${projectSlug}/painel/observacoes`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Revisões
                </Link>
                <Link href={`/${projectSlug}/painel/visitas`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Visitas técnicas
                </Link>
                <Link href={`/${projectSlug}/visita`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Iniciar visita
                </Link>
                <Link href={`/${projectSlug}/painel/especies`} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Espécies
                </Link>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link href="/admin" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Painel administrativo
                </Link>
                <Link href="/projetos" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                  Todos os projetos
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 my-1" />
            <Link href="/selecionar-papel/trocar" className="block px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
              Trocar perfil
            </Link>
            <Link href="/" className="block px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
              Página inicial
            </Link>
          </div>
        </>
      )}
    </header>
  );
}
