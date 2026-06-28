'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

interface TreeItem {
  id: string;
  qr_slug: string;
  status: string;
  common_name: string;
  scientific_name: string;
}

interface Props {
  trees: TreeItem[];
  projectName: string;
  projectSlug: string;
}

type TagSize = 'pequena' | 'media' | 'grande';

const TAG_SIZES: Record<TagSize, { label: string; description: string; qrPx: number; widthMm: number; heightMm: number; cols: number }> = {
  pequena: { label: 'Pequena', description: '40×50 mm — plaquinha de campo', qrPx: 100, widthMm: 40, heightMm: 50, cols: 4 },
  media: { label: 'Média', description: '60×70 mm — tag padrão', qrPx: 150, widthMm: 60, heightMm: 70, cols: 3 },
  grande: { label: 'Grande', description: '80×100 mm — placa resistente', qrPx: 200, widthMm: 80, heightMm: 100, cols: 2 },
};

export default function QRCodesClient({ trees, projectName, projectSlug }: Props) {
  const [baseUrl, setBaseUrl] = useState('');
  const [tagSize, setTagSize] = useState<TagSize>('media');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [previewQr, setPreviewQr] = useState<string | null>(null);
  const [previewTree, setPreviewTree] = useState<TreeItem | null>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const generateQrDataUrl = useCallback(async (slug: string, size: number): Promise<string> => {
    const url = `${baseUrl}/arvore/${slug}`;
    return QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: { dark: '#2D5016', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  }, [baseUrl]);

  async function showPreview(tree: TreeItem) {
    const qr = await generateQrDataUrl(tree.qr_slug, 200);
    setPreviewQr(qr);
    setPreviewTree(tree);
  }

  async function downloadPDF() {
    if (!baseUrl || trees.length === 0) return;
    setGenerating(true);
    setProgress('Gerando QR codes...');

    const config = TAG_SIZES[tagSize];
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const marginX = 10;
    const marginY = 10;
    const gapX = 5;
    const gapY = 5;
    const { widthMm: tagW, heightMm: tagH, cols, qrPx } = config;

    const usableW = pageW - 2 * marginX;
    const actualCols = Math.min(cols, Math.floor((usableW + gapX) / (tagW + gapX)));
    const rows = Math.floor((pageH - 2 * marginY + gapY) / (tagH + gapY));
    const tagsPerPage = actualCols * rows;

    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i];
      setProgress(`Gerando ${i + 1} de ${trees.length}...`);

      const pageIndex = Math.floor(i / tagsPerPage);
      const posInPage = i % tagsPerPage;

      if (posInPage === 0 && i > 0) {
        pdf.addPage();
      }

      const col = posInPage % actualCols;
      const row = Math.floor(posInPage / actualCols);
      const x = marginX + col * (tagW + gapX);
      const y = marginY + row * (tagH + gapY);

      pdf.setDrawColor(200);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(x, y, tagW, tagH, 2, 2);

      const qrDataUrl = await generateQrDataUrl(tree.qr_slug, qrPx);
      const qrSize = tagW * 0.65;
      const qrX = x + (tagW - qrSize) / 2;
      const qrY = y + 3;
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      const textY = qrY + qrSize + 2;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(tagSize === 'pequena' ? 5 : tagSize === 'media' ? 7 : 9);
      pdf.setTextColor(45, 80, 22);
      const commonLines = pdf.splitTextToSize(tree.common_name, tagW - 4);
      pdf.text(commonLines.slice(0, 1), x + tagW / 2, textY, { align: 'center' });

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(tagSize === 'pequena' ? 4 : tagSize === 'media' ? 5.5 : 7);
      pdf.setTextColor(120);
      const sciName = tree.scientific_name !== 'Não identificada' ? tree.scientific_name : '';
      if (sciName) {
        pdf.text(sciName, x + tagW / 2, textY + (tagSize === 'pequena' ? 3 : 4), { align: 'center', maxWidth: tagW - 4 });
      }

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(tagSize === 'pequena' ? 3.5 : tagSize === 'media' ? 4.5 : 6);
      pdf.setTextColor(160);
      pdf.text(tree.qr_slug, x + tagW / 2, y + tagH - 2.5, { align: 'center' });

      pdf.setFontSize(tagSize === 'pequena' ? 3 : tagSize === 'media' ? 3.5 : 4.5);
      pdf.setTextColor(74, 124, 47);
      pdf.text('Mapa Vivo', x + tagW / 2, y + tagH - 1, { align: 'center' });
    }

    setProgress('Salvando PDF...');
    const fileName = `qrcodes-${projectSlug}-${tagSize}.pdf`;
    pdf.save(fileName);
    setGenerating(false);
    setProgress('');
  }

  async function downloadZIP() {
    if (!baseUrl || trees.length === 0) return;
    setGenerating(true);
    setProgress('Gerando imagens...');

    const zip = new JSZip();
    const folder = zip.folder(`qrcodes-${projectSlug}`)!;

    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i];
      setProgress(`Gerando ${i + 1} de ${trees.length}...`);

      const dataUrl = await generateQrDataUrl(tree.qr_slug, 400);
      const base64 = dataUrl.split(',')[1];
      folder.file(`${tree.qr_slug}.png`, base64, { base64: true });
    }

    setProgress('Compactando ZIP...');
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcodes-${projectSlug}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    setGenerating(false);
    setProgress('');
  }

  if (!baseUrl) return null;

  if (trees.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="font-display text-xl font-bold text-verde-cerrado mb-2">Nenhuma árvore cadastrada</h2>
          <p className="text-gray-500 text-sm mb-4">Cadastre árvores primeiro para gerar os QR codes.</p>
          <a href={`/${projectSlug}/visita`} className="btn-primary inline-block">Iniciar visita técnica</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Instructions */}
      <div className="card border-l-4 border-l-verde-medio">
        <h3 className="font-bold text-verde-cerrado mb-2">Como funciona</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Escolha o <strong>tamanho da tag</strong> adequado para o material da gráfica</li>
          <li>Clique em <strong>Baixar PDF</strong> — arquivo pronto para enviar para impressão</li>
          <li>Ou baixe o <strong>ZIP com PNGs</strong> individuais se a gráfica preferir arquivos soltos</li>
        </ol>
      </div>

      {/* Tag size selector */}
      <div className="card space-y-3">
        <h3 className="font-bold text-verde-cerrado">Tamanho da tag</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(TAG_SIZES) as [TagSize, typeof TAG_SIZES[TagSize]][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setTagSize(key)}
              className={`text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                tagSize === key
                  ? 'border-verde-medio bg-verde-claro/20'
                  : 'border-gray-200 hover:border-verde-claro'
              }`}
            >
              <p className="font-bold text-gray-700">{config.label}</p>
              <p className="text-xs text-gray-500 mt-1">{config.description}</p>
              <p className="text-xs text-gray-400 mt-1">{config.cols} tags por linha na folha A4</p>
            </button>
          ))}
        </div>
      </div>

      {/* Download actions */}
      <div className="card space-y-4">
        <h3 className="font-bold text-verde-cerrado">Gerar arquivo para gráfica</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadPDF}
            disabled={generating}
            className="bg-verde-cerrado text-white px-6 py-3 rounded-lg font-semibold hover:bg-verde-cerrado/90 transition-colors text-sm disabled:opacity-50 cursor-pointer"
          >
            Baixar PDF ({trees.length} tags — {TAG_SIZES[tagSize].label})
          </button>
          <button
            onClick={downloadZIP}
            disabled={generating}
            className="bg-white text-verde-cerrado border border-verde-cerrado px-6 py-3 rounded-lg font-semibold hover:bg-verde-cerrado/5 transition-colors text-sm disabled:opacity-50 cursor-pointer"
          >
            Baixar ZIP (PNGs individuais)
          </button>
          <button
            onClick={() => window.print()}
            className="bg-white text-gray-600 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer"
          >
            Imprimir direto
          </button>
        </div>
        {generating && (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-verde-medio border-t-transparent" />
            <p className="text-sm text-gray-500">{progress}</p>
          </div>
        )}
        <p className="text-xs text-gray-400">
          O PDF gera tags em folha A4 com marcas de corte. Cada tag contém: QR code, nome popular,
          nome científico, código da árvore e marca Mapa Vivo.
        </p>
      </div>

      {/* Tree list with preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-verde-cerrado text-sm">{trees.length} árvores neste projeto</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">Árvore</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs hidden sm:table-cell">Código</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {trees.map(tree => (
                    <tr key={tree.id} className={`border-b border-gray-50 hover:bg-gray-50 ${previewTree?.id === tree.id ? 'bg-verde-medio/5' : ''}`}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-verde-cerrado text-sm">{tree.common_name}</p>
                        <p className="text-xs italic text-gray-400">{tree.scientific_name}</p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400 hidden sm:table-cell">{tree.qr_slug}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => showPreview(tree)}
                          className="text-xs text-verde-medio font-medium hover:underline cursor-pointer"
                        >
                          Ver QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            {previewTree && previewQr ? (
              <div className="card flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewQr} alt={`QR ${previewTree.qr_slug}`} width={200} height={200} className="rounded" />
                <div className="text-center">
                  <p className="font-bold text-verde-cerrado">{previewTree.common_name}</p>
                  <p className="text-xs italic text-gray-500">{previewTree.scientific_name}</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">{previewTree.qr_slug}</p>
                  <p className="text-[10px] text-verde-medio mt-1">Mapa Vivo · {projectName}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={previewQr}
                    download={`qr-${previewTree.qr_slug}.png`}
                    className="text-xs bg-verde-medio text-white px-3 py-1.5 rounded-lg font-medium hover:bg-verde-cerrado transition-colors"
                  >
                    Baixar PNG
                  </a>
                  <a
                    href={`/arvore/${previewTree.qr_slug}`}
                    target="_blank"
                    className="text-xs text-verde-medio font-medium hover:underline px-3 py-1.5"
                  >
                    Ver ficha
                  </a>
                </div>
              </div>
            ) : (
              <div className="card text-center text-gray-400 text-sm py-12">
                <div className="text-3xl mb-3">📷</div>
                <p>Clique em &quot;Ver QR&quot; para<br />visualizar uma tag</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print layout (hidden on screen, shown on print) */}
      <div className="hidden print:block">
        <div className="grid grid-cols-4 gap-2">
          {trees.map(tree => (
            <PrintTag key={tree.id} tree={tree} baseUrl={baseUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PrintTag({ tree, baseUrl }: { tree: TreeItem; baseUrl: string }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(`${baseUrl}/arvore/${tree.qr_slug}`, {
      width: 120,
      margin: 1,
      color: { dark: '#2D5016', light: '#FFFFFF' },
    }).then(setQr);
  }, [tree.qr_slug, baseUrl]);

  if (!qr) return null;

  return (
    <div className="border border-gray-300 rounded p-2 flex flex-col items-center gap-1 break-inside-avoid">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="" width={100} height={100} />
      <p className="text-[9px] font-bold text-center leading-tight">{tree.common_name}</p>
      <p className="text-[7px] italic text-gray-500 text-center">{tree.scientific_name}</p>
      <p className="text-[7px] font-mono text-gray-400">{tree.qr_slug}</p>
      <p className="text-[6px] text-green-700">Mapa Vivo</p>
    </div>
  );
}
