'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const roles = [
  {
    id: 'gestor',
    title: 'Gestor',
    icon: '🏢',
    description: 'Administrador do condomínio ou área verde. Gerencia árvores, aprova submissões e acessa relatórios completos.',
  },
  {
    id: 'tecnico',
    title: 'Técnico',
    icon: '🔬',
    description: 'Profissional de botânica ou meio ambiente. Valida identificações, realiza laudos e atualiza dados técnicos.',
  },
  {
    id: 'morador',
    title: 'Morador',
    icon: '🏠',
    description: 'Residente do condomínio. Pode visualizar o mapa, consultar fichas de árvores e enviar submissões.',
  },
];

interface RoleSelectorProps {
  userName: string;
}

export default function RoleSelector({ userName }: RoleSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);

    try {
      const res = await fetch('/api/profile/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao atribuir papel');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (selected === 'tecnico') {
        router.push('/projetos');
      } else if (selected === 'gestor' && data.projectSlug) {
        router.push(`/${data.projectSlug}/dashboard`);
      } else if (selected === 'morador' && data.projectSlug) {
        router.push(`/${data.projectSlug}/mapa`);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      alert('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-lg w-full space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🌳</div>
        <h1 className="font-display text-2xl font-bold text-verde-cerrado">
          Bem-vindo, {userName.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Selecione seu papel para personalizar sua experiência no Mapa Vivo.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selected === role.id
                ? 'border-verde-medio bg-verde-claro/20'
                : 'border-gray-200 hover:border-verde-claro'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{role.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{role.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{role.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Configurando...' : 'Confirmar'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Você pode alterar seu papel depois nas configurações do perfil.
      </p>
    </div>
  );
}
