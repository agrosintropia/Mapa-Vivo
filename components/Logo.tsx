interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  dark?: boolean;
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className || 'w-full h-full'}>
      <circle cx="32" cy="32" r="28" stroke="#2D5016" strokeWidth="2" fill="#F5F0E8" />
      <circle cx="32" cy="32" r="20" stroke="#4A7C2F" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="32" r="12" stroke="#4A7C2F" strokeWidth="1" fill="none" />
      <path d="M32 20v20" stroke="#2D5016" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="18" r="6" fill="#4A7C2F" />
      <circle cx="27" cy="22" r="4" fill="#2D5016" />
      <circle cx="37" cy="22" r="4" fill="#2D5016" />
      <circle cx="32" cy="18" r="2" fill="#F5F0E8" />
    </svg>
  );
}

export function LogoIconDark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className || 'w-full h-full'}>
      <circle cx="32" cy="32" r="28" stroke="#4A7C2F" strokeWidth="2" fill="none" />
      <circle cx="32" cy="32" r="20" stroke="#4A7C2F" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="32" cy="32" r="12" stroke="#4A7C2F" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M32 20v20" stroke="#F5F0E8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="18" r="6" fill="#4A7C2F" />
      <circle cx="27" cy="22" r="4" fill="#F5F0E8" opacity="0.3" />
      <circle cx="37" cy="22" r="4" fill="#F5F0E8" opacity="0.3" />
      <circle cx="32" cy="18" r="2" fill="#F5F0E8" />
    </svg>
  );
}

export default function Logo({ size = 'md', showSubtitle = true, dark = false }: LogoProps) {
  const sizes = { sm: 'h-8', md: 'h-12', lg: 'h-16' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const subSizes = { sm: 'text-[8px]', md: 'text-[10px]', lg: 'text-xs' };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} aspect-square`}>
        {dark ? <LogoIconDark /> : <LogoIcon />}
      </div>
      <div>
        <h1 className={`font-display ${textSizes[size]} font-bold ${dark ? 'text-white' : 'text-verde-cerrado'} leading-none tracking-tight`}>
          Mapa Vivo
        </h1>
        {showSubtitle && (
          <p className={`${subSizes[size]} ${dark ? 'text-verde-medio' : 'text-verde-medio'} font-medium tracking-widest uppercase mt-0.5`}>
            Inteligência Urbana Verde
          </p>
        )}
      </div>
    </div>
  );
}
