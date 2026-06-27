'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  qrSlug: string;
  commonName: string;
  scientificName: string;
  baseUrl: string;
  compact?: boolean;
}

export default function QRTag({ qrSlug, commonName, scientificName, baseUrl, compact }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `${baseUrl}/arvore/${qrSlug}`;
    QRCode.toDataURL(url, {
      width: compact ? 120 : 200,
      margin: 1,
      color: { dark: '#2D5016', light: '#FFFFFF' },
    }).then(setDataUrl).catch(console.error);
  }, [qrSlug, baseUrl, compact]);

  if (!dataUrl) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'w-[120px] h-[120px]' : 'w-[200px] h-[200px]'}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-verde-medio border-t-transparent" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="qr-tag border border-gray-300 rounded-lg p-3 flex flex-col items-center gap-1.5 bg-white w-[180px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt={`QR ${qrSlug}`} width={120} height={120} />
        <p className="text-[10px] font-bold text-verde-cerrado text-center leading-tight truncate w-full">
          {commonName}
        </p>
        <p className="text-[8px] italic text-gray-400 text-center leading-tight truncate w-full">
          {scientificName}
        </p>
        <p className="text-[8px] font-mono text-gray-300">{qrSlug}</p>
      </div>
    );
  }

  return (
    <div className="qr-tag border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR ${qrSlug}`} width={200} height={200} className="rounded" />
      <div className="text-center">
        <p className="text-sm font-bold text-verde-cerrado">{commonName}</p>
        <p className="text-xs italic text-gray-500">{scientificName}</p>
        <p className="text-xs font-mono text-gray-400 mt-1">{qrSlug}</p>
      </div>
      <a
        href={dataUrl}
        download={`qr-${qrSlug}.png`}
        className="text-xs text-verde-medio hover:underline font-medium"
      >
        Baixar QR
      </a>
    </div>
  );
}
