'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function GestorEspeciesPage() {
  const { projectSlug } = useParams();
  const router = useRouter();
  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [family, setFamily] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commonName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch('/api/species/gestor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          common_name: commonName,
          scientific_name: scientificName || null,
          family: family || null,
          description: description || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao sugerir espécie');
        setSaving(false);
        return;
      }

      setSuccess(true);
    } catch {
      alert('Erro de conexão.');
      setSaving(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-areia flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-verde-cerrado">Espécie sugerida!</h2>
          <p className="text-gray-600 text-sm">
            Sua sugestão de <strong>{commonName}</strong> foi registrada e será validada
            pela equipe técnica.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setCommonName(''); setScientificName(''); setFamily(''); setDescription(''); }}
              className="btn-secondary flex-1"
            >
              Sugerir outra
            </button>
            <button
              onClick={() => router.push(`/${projectSlug}/painel`)}
              className="btn-primary flex-1"
            >
              Voltar ao painel
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <a href={`/${projectSlug}/painel`} className="text-2xl leading-none">🌳</a>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">Sugerir espécie</h1>
            <p className="text-xs opacity-70">A sugestão será validada pela equipe técnica</p>
          </div>
        </div>
        <a href={`/${projectSlug}/painel`} className="text-sm hover:underline opacity-80 hover:opacity-100">
          Voltar
        </a>
      </header>

      <div className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Como funciona?</p>
            <p className="text-xs">
              Sua sugestão ficará com status &quot;pendente de validação&quot; até ser revisada
              por um técnico — online ou na próxima visita presencial.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome popular *</label>
            <input
              type="text"
              value={commonName}
              onChange={e => setCommonName(e.target.value)}
              placeholder="Ex: Ipê-amarelo"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome científico</label>
            <input
              type="text"
              value={scientificName}
              onChange={e => setScientificName(e.target.value)}
              placeholder="Ex: Handroanthus albus"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Família</label>
            <input
              type="text"
              value={family}
              onChange={e => setFamily(e.target.value)}
              placeholder="Ex: Bignoniaceae"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / observações</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Onde você viu? Alguma característica que ajude na identificação?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !commonName.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Enviando...' : 'Enviar sugestão'}
          </button>
        </form>
      </div>
    </main>
  );
}
