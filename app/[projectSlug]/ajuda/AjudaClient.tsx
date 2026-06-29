'use client';

import { useState } from 'react';

interface Props {
  userRole: string;
  projectId: string;
  projectName: string;
}

const GUIDE_GESTOR = [
  { q: 'Como visualizar o mapa das árvores?', a: 'Acesse "Mapa" na barra inferior para ver todas as árvores georreferenciadas do seu projeto.' },
  { q: 'Como aprovar observações de moradores?', a: 'Vá em "Revisões" na barra inferior. Você verá as observações pendentes e pode aceitar, rejeitar ou solicitar revisão técnica.' },
  { q: 'Como adicionar uma nova árvore?', a: 'Use o botão "+" no mapa ou no painel. A árvore será enviada para revisão técnica antes de aparecer no mapa.' },
  { q: 'Como ver relatórios do projeto?', a: 'O Dashboard mostra estatísticas em tempo real: espécies, carbono, distribuição por estrato e mais.' },
];

const GUIDE_MORADOR = [
  { q: 'Como explorar o mapa?', a: 'Abra o app e clique nas bolinhas coloridas no mapa. Cada uma representa uma árvore catalogada.' },
  { q: 'Como reportar uma ocorrência?', a: 'Toque em "Reportar" na barra inferior, selecione a árvore e descreva a situação com texto, foto ou áudio.' },
  { q: 'O que é o Dashboard?', a: 'É um painel com estatísticas ambientais do seu condomínio: número de espécies, carbono estimado e mais.' },
  { q: 'Como chegar até uma árvore?', a: 'Clique na árvore no mapa e toque em "Como chegar". O app usará seu GPS para guiá-lo.' },
];

const FAQ = [
  { q: 'Os dados são públicos?', a: 'O mapa é visível para moradores do projeto. Dados sensíveis são acessíveis apenas por gestores e técnicos.' },
  { q: 'Com que frequência os dados são atualizados?', a: 'Em tempo real. Qualquer alteração feita por técnicos ou gestores aparece imediatamente.' },
  { q: 'Posso usar o app offline?', a: 'No momento o app requer conexão com a internet para funcionar.' },
];

export default function AjudaClient({ userRole, projectId, projectName }: Props) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [requestType, setRequestType] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const guide = userRole === 'gestor' ? GUIDE_GESTOR : GUIDE_MORADOR;

  async function handleServiceRequest() {
    if (!requestType || !requestDesc.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, type: requestType, description: requestDesc.trim() }),
      });
      if (res.ok) {
        setSent(true);
        setRequestType('');
        setRequestDesc('');
      } else {
        alert('Erro ao enviar solicitação');
      }
    } catch {
      alert('Erro de conexão');
    }
    setSending(false);
  }

  const toggle = (key: string) => setOpenItem(openItem === key ? null : key);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
      {/* Guia de uso */}
      <section>
        <h2 className="font-display text-lg font-bold text-verde-cerrado mb-3">Guia de uso</h2>
        <div className="space-y-2">
          {guide.map((item, i) => {
            const key = `guide-${i}`;
            return (
              <div key={key} className="bg-white rounded-lg border border-gray-100">
                <button onClick={() => toggle(key)} className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">{item.q}</span>
                  <span className="text-gray-400 text-lg">{openItem === key ? '−' : '+'}</span>
                </button>
                {openItem === key && (
                  <p className="px-4 pb-3 text-sm text-gray-600">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-display text-lg font-bold text-verde-cerrado mb-3">Perguntas frequentes</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const key = `faq-${i}`;
            return (
              <div key={key} className="bg-white rounded-lg border border-gray-100">
                <button onClick={() => toggle(key)} className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">{item.q}</span>
                  <span className="text-gray-400 text-lg">{openItem === key ? '−' : '+'}</span>
                </button>
                {openItem === key && (
                  <p className="px-4 pb-3 text-sm text-gray-600">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Gestor: serviços e solicitações */}
      {userRole === 'gestor' && (
        <section>
          <h2 className="font-display text-lg font-bold text-verde-cerrado mb-3">Serviços disponíveis</h2>
          <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">🔬</span>
                <div>
                  <p className="font-medium text-gray-700">Revisão técnica online</p>
                  <p className="text-xs text-gray-500">A partir de R$ 150 · Validação de espécies por especialistas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">🚗</span>
                <div>
                  <p className="font-medium text-gray-700">Visita técnica presencial</p>
                  <p className="text-xs text-gray-500">R$ 1.800 + deslocamento · Inventário em campo</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">🌳</span>
                <div>
                  <p className="font-medium text-gray-700">Setup de nova área</p>
                  <p className="text-xs text-gray-500">Mapeamento e cadastro de nova sub-área do projeto</p>
                </div>
              </div>
            </div>

            {sent ? (
              <div className="bg-verde-medio/10 text-verde-medio rounded-lg p-3 text-sm font-medium text-center">
                Solicitação enviada com sucesso! A AgroSintropia entrará em contato.
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">Solicitar serviço</p>
                <select
                  value={requestType}
                  onChange={e => setRequestType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Selecione o tipo...</option>
                  <option value="revisao_online">Revisão técnica online</option>
                  <option value="visita_tecnica">Visita técnica presencial</option>
                  <option value="nova_area">Setup de nova área</option>
                  <option value="outro">Outro</option>
                </select>
                <textarea
                  value={requestDesc}
                  onChange={e => setRequestDesc(e.target.value)}
                  placeholder="Descreva sua necessidade..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-20"
                />
                <button
                  onClick={handleServiceRequest}
                  disabled={sending || !requestType || !requestDesc.trim()}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : 'Enviar solicitação'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Morador: link para site */}
      {userRole === 'morador' && (
        <section>
          <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">Conheça mais sobre o Mapa Vivo e a AgroSintropia</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-verde-medio font-medium text-sm hover:underline">
              Visitar site do Mapa Vivo →
            </a>
          </div>
        </section>
      )}

      {/* WhatsApp discreto */}
      <section className="pb-4">
        <div className="text-center text-sm text-gray-400">
          <p>Precisa de ajuda adicional?</p>
          <a
            href={`https://wa.me/5562998062150?text=${encodeURIComponent(`Olá AgroSintropia! Preciso de ajuda com o Mapa Vivo - ${projectName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-verde-medio hover:underline inline-flex items-center gap-1 mt-1"
          >
            Fale conosco pelo WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
