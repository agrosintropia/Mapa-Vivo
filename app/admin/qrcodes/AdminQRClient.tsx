'use client';

import { useState, useEffect } from 'react';
import QRTag from '@/components/QRTag';
import QRBatchPrint from '@/components/QRBatchPrint';

interface TreeItem {
  id: string;
  qr_slug: string;
  status: string;
  status_label: string;
  common_name: string;
  scientific_name: string;
}

interface Props {
  trees: TreeItem[];
  projectName: string;
}

const STATUS_COLORS: Record<string, string> = {
  viva: 'bg-green-100 text-green-800',
  doente: 'bg-amber-100 text-amber-800',
  em_tratamento: 'bg-blue-100 text-blue-800',
  morta: 'bg-gray-200 text-gray-700',
  removida: 'bg-red-100 text-red-800',
};

export default function AdminQRClient({ trees, projectName }: Props) {
  const [selectedTree, setSelectedTree] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [showBatchSection, setShowBatchSection] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  if (!baseUrl) return null;

  const selected = trees.find((t) => t.qr_slug === selectedTree);

  return (
    <div>
      {/* Batch print section */}
      <div className="mb-8 print:mb-0">
        {showBatchSection ? (
          <QRBatchPrint trees={trees} baseUrl={baseUrl} />
        ) : (
          <div className="flex gap-3 print:hidden">
            <button
              onClick={() => setShowBatchSection(true)}
              className="btn-primary"
            >
              Impressão em lote ({trees.length} tags)
            </button>
          </div>
        )}
      </div>

      {/* Individual tree list + QR preview */}
      <div className="print:hidden">
        <h2 className="font-display text-lg font-bold text-verde-cerrado mb-4">
          Árvores — {projectName}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tree list */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-verde-cerrado/5 text-verde-cerrado text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Árvore</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Código</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-medium">QR</th>
                  </tr>
                </thead>
                <tbody>
                  {trees.map((tree) => (
                    <tr
                      key={tree.id}
                      className={`border-t border-areia hover:bg-areia/50 transition-colors ${
                        selectedTree === tree.qr_slug ? 'bg-verde-medio/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-verde-cerrado">{tree.common_name}</p>
                        <p className="text-xs italic text-gray-400">{tree.scientific_name}</p>
                        <p className="text-xs font-mono text-gray-300 sm:hidden mt-0.5">{tree.qr_slug}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 hidden sm:table-cell">
                        {tree.qr_slug}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tree.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {tree.status_label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedTree(selectedTree === tree.qr_slug ? null : tree.qr_slug)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            selectedTree === tree.qr_slug
                              ? 'bg-verde-medio text-white'
                              : 'bg-areia text-verde-cerrado hover:bg-verde-medio/10'
                          }`}
                        >
                          {selectedTree === tree.qr_slug ? 'Fechar' : 'Gerar QR'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QR preview panel */}
          <div className="md:col-span-1">
            <div className="sticky top-6">
              {selected ? (
                <QRTag
                  qrSlug={selected.qr_slug}
                  commonName={selected.common_name}
                  scientificName={selected.scientific_name}
                  baseUrl={baseUrl}
                />
              ) : (
                <div className="card text-center text-gray-400 text-sm py-12">
                  <div className="text-3xl mb-3">📷</div>
                  <p>Selecione uma árvore para<br />visualizar o QR Code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
