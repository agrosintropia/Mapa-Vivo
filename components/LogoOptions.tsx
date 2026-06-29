'use client';

interface LogoProps {
  variant?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function LogoOption1({ size = 'md', showSubtitle = true }: Omit<LogoProps, 'variant'>) {
  const sizes = { sm: 'h-8', md: 'h-12', lg: 'h-16' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const subSizes = { sm: 'text-[8px]', md: 'text-[10px]', lg: 'text-xs' };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Leaf/pin fusion */}
          <path d="M32 4C22 4 14 12 14 22c0 8 6 16 12 22l6 6 6-6c6-6 12-14 12-22 0-10-8-18-18-18z" fill="#2D5016" />
          <path d="M32 14c-2 0-4 2-4 6 0 3 1 5 2 7l2 3 2-3c1-2 2-4 2-7 0-4-2-6-4-6z" fill="#4A7C2F" />
          <circle cx="32" cy="22" r="4" fill="#F5F0E8" />
          <path d="M28 28c0 0 2 4 4 4s4-4 4-4" stroke="#4A7C2F" strokeWidth="1.5" fill="none" />
          {/* Roots */}
          <path d="M26 50l-4 8M32 50v10M38 50l4 8" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <h1 className={`font-display ${textSizes[size]} font-bold text-verde-cerrado leading-none tracking-tight`}>
          Mapa Vivo
        </h1>
        {showSubtitle && (
          <p className={`${subSizes[size]} text-terracota font-medium tracking-widest uppercase mt-0.5`}>
            Raízes que conectam
          </p>
        )}
      </div>
    </div>
  );
}

export function LogoOption2({ size = 'md', showSubtitle = true }: Omit<LogoProps, 'variant'>) {
  const sizes = { sm: 'h-8', md: 'h-12', lg: 'h-16' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const subSizes = { sm: 'text-[8px]', md: 'text-[10px]', lg: 'text-xs' };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Concentric rings = tree rings / map contours */}
          <circle cx="32" cy="32" r="28" stroke="#2D5016" strokeWidth="2" fill="#F5F0E8" />
          <circle cx="32" cy="32" r="20" stroke="#4A7C2F" strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="32" r="12" stroke="#4A7C2F" strokeWidth="1" fill="none" />
          {/* Center tree */}
          <path d="M32 20v20" stroke="#2D5016" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="18" r="6" fill="#4A7C2F" />
          <circle cx="27" cy="22" r="4" fill="#2D5016" />
          <circle cx="37" cy="22" r="4" fill="#2D5016" />
          {/* Pin dot */}
          <circle cx="32" cy="18" r="2" fill="#F5F0E8" />
        </svg>
      </div>
      <div>
        <h1 className={`font-display ${textSizes[size]} font-bold text-verde-cerrado leading-none tracking-tight`}>
          Mapa Vivo
        </h1>
        {showSubtitle && (
          <p className={`${subSizes[size]} text-ocre font-medium tracking-widest uppercase mt-0.5`}>
            Cada árvore tem história
          </p>
        )}
      </div>
    </div>
  );
}

export function LogoOption3({ size = 'md', showSubtitle = true }: Omit<LogoProps, 'variant'>) {
  const sizes = { sm: 'h-8', md: 'h-12', lg: 'h-16' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const subSizes = { sm: 'text-[8px]', md: 'text-[10px]', lg: 'text-xs' };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Hexagonal badge */}
          <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" fill="#2D5016" />
          {/* Inner light hex */}
          <path d="M32 12L48 22v20L32 52 16 42V22L32 12z" fill="#4A7C2F" opacity="0.3" />
          {/* Stylized M + leaf */}
          <path d="M20 38V24l6 8 6-8 6 8 6-8v14" stroke="#F5F0E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Small leaf accent */}
          <path d="M32 16c-2 2-2 5 0 7 2-2 2-5 0-7z" fill="#D4A017" />
        </svg>
      </div>
      <div>
        <h1 className={`font-display ${textSizes[size]} font-bold text-verde-cerrado leading-none tracking-tight`}>
          Mapa Vivo
        </h1>
        {showSubtitle && (
          <p className={`${subSizes[size]} text-verde-medio font-medium tracking-widest uppercase mt-0.5`}>
            Inteligência verde urbana
          </p>
        )}
      </div>
    </div>
  );
}

export default function LogoShowcase() {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Opção 1 — &quot;Raízes que conectam&quot;</h2>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <LogoOption1 size="lg" />
          <LogoOption1 size="md" />
          <LogoOption1 size="sm" />
          <div className="bg-verde-cerrado rounded-xl p-6">
            <div className="flex items-center gap-2">
              <div className="h-12 aspect-square">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <path d="M32 4C22 4 14 12 14 22c0 8 6 16 12 22l6 6 6-6c6-6 12-14 12-22 0-10-8-18-18-18z" fill="#4A7C2F" />
                  <path d="M32 14c-2 0-4 2-4 6 0 3 1 5 2 7l2 3 2-3c1-2 2-4 2-7 0-4-2-6-4-6z" fill="#F5F0E8" opacity="0.3" />
                  <circle cx="32" cy="22" r="4" fill="#F5F0E8" />
                  <path d="M26 50l-4 8M32 50v10M38 50l4 8" stroke="#D4A017" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white leading-none tracking-tight">Mapa Vivo</h1>
                <p className="text-[10px] text-ocre font-medium tracking-widest uppercase mt-0.5">Raízes que conectam</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Opção 2 — &quot;Cada árvore tem história&quot;</h2>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <LogoOption2 size="lg" />
          <LogoOption2 size="md" />
          <LogoOption2 size="sm" />
          <div className="bg-verde-cerrado rounded-xl p-6">
            <div className="flex items-center gap-2">
              <div className="h-12 aspect-square">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <circle cx="32" cy="32" r="28" stroke="#4A7C2F" strokeWidth="2" fill="none" />
                  <circle cx="32" cy="32" r="20" stroke="#4A7C2F" strokeWidth="1.5" fill="none" opacity="0.5" />
                  <circle cx="32" cy="32" r="12" stroke="#4A7C2F" strokeWidth="1" fill="none" opacity="0.3" />
                  <path d="M32 20v20" stroke="#F5F0E8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="32" cy="18" r="6" fill="#4A7C2F" />
                  <circle cx="27" cy="22" r="4" fill="#F5F0E8" opacity="0.3" />
                  <circle cx="37" cy="22" r="4" fill="#F5F0E8" opacity="0.3" />
                  <circle cx="32" cy="18" r="2" fill="#F5F0E8" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white leading-none tracking-tight">Mapa Vivo</h1>
                <p className="text-[10px] text-ocre font-medium tracking-widest uppercase mt-0.5">Cada árvore tem história</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Opção 3 — &quot;Inteligência verde urbana&quot;</h2>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <LogoOption3 size="lg" />
          <LogoOption3 size="md" />
          <LogoOption3 size="sm" />
          <div className="bg-verde-cerrado rounded-xl p-6">
            <div className="flex items-center gap-2">
              <div className="h-12 aspect-square">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" fill="#4A7C2F" />
                  <path d="M32 12L48 22v20L32 52 16 42V22L32 12z" fill="#F5F0E8" opacity="0.1" />
                  <path d="M20 38V24l6 8 6-8 6 8 6-8v14" stroke="#F5F0E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M32 16c-2 2-2 5 0 7 2-2 2-5 0-7z" fill="#D4A017" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white leading-none tracking-tight">Mapa Vivo</h1>
                <p className="text-[10px] text-verde-medio font-medium tracking-widest uppercase mt-0.5">Inteligência verde urbana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
