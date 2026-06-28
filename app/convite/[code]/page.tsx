'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ConvitePage() {
  const { code } = useParams();
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    setJoining(true);
    setError('');
    try {
      const res = await fetch('/api/projects/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao entrar no projeto');
        setJoining(false);
        return;
      }
      if (data.role === 'gestor') {
        router.push(`/${data.slug}/painel`);
      } else {
        router.push(`/${data.slug}/mapa`);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setJoining(false);
    }
  }

  return (
    <main className="min-h-screen bg-areia flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-6">
        <div className="text-5xl">🌳</div>
        <h1 className="font-display text-2xl font-bold text-verde-cerrado">
          Convite para projeto
        </h1>
        <p className="text-gray-600 text-sm">
          Você foi convidado para participar de um projeto no Mapa Vivo.
          Clique abaixo para entrar.
        </p>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="btn-primary w-full disabled:opacity-50"
        >
          {joining ? 'Entrando...' : 'Entrar no projeto'}
        </button>
        <p className="text-xs text-gray-400">
          Você precisa estar logado para entrar no projeto.
        </p>
      </div>
    </main>
  );
}
