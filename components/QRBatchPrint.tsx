'use client';

import { useState } from 'react';
import QRTag from './QRTag';

interface TreeItem {
  qr_slug: string;
  common_name: string;
  scientific_name: string;
  status: string;
}

interface Props {
  trees: TreeItem[];
  baseUrl: string;
}

export default function QRBatchPrint({ trees, baseUrl }: Props) {
  const [showBatch, setShowBatch] = useState(false);

  if (!showBatch) {
    return (
      <button
        onClick={() => setShowBatch(true)}
        className="btn-primary"
      >
        Gerar todos os QR Codes ({trees.length})
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="btn-secondary"
        >
          Imprimir tags
        </button>
        <button
          onClick={() => setShowBatch(false)}
          className="text-sm text-gray-500 hover:underline"
        >
          Fechar
        </button>
        <p className="text-sm text-gray-400">
          {trees.length} tags prontas para impressão
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 print:grid-cols-4 print:gap-2">
        {trees.map((tree) => (
          <QRTag
            key={tree.qr_slug}
            qrSlug={tree.qr_slug}
            commonName={tree.common_name}
            scientificName={tree.scientific_name}
            baseUrl={baseUrl}
            compact
          />
        ))}
      </div>
    </div>
  );
}
