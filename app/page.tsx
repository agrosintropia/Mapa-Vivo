export default function Home() {
  return (
    <main className="min-h-screen bg-areia flex flex-col items-center justify-center">
      {/* Hero */}
      <div className="w-full bg-verde-cerrado text-white py-20 px-4 flex flex-col items-center text-center">
        <div className="mb-4">
          <span className="text-5xl">🌳</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
          Mapa Vivo
        </h1>
        <p className="text-lg md:text-xl text-ocre mb-2 font-medium">
          por Agrosintropia
        </p>
        <p className="text-base md:text-lg opacity-80 max-w-2xl mt-4">
          Inventário arbóreo digital para condomínios, parques e incorporadoras.
          Cada árvore ganha identidade — mapa interativo, QR code e relatórios ambientais em tempo real.
        </p>
      </div>

      {/* Em construção */}
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-4">
        <div className="card max-w-lg w-full text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-verde-cerrado mb-3">
            Em construção
          </h2>
          <p className="text-gray-600 mb-6">
            A Fase 1 vem aí — estamos construindo o mapa interativo, cadastro de árvores,
            geração de QR codes e painel de gestão.
          </p>
          <div className="flex flex-col gap-3">
            <div className="bg-areia rounded-lg p-4 text-left">
              <h3 className="font-semibold text-verde-cerrado mb-2">O que está por vir:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🗺️ Mapa interativo com todas as árvores do condomínio</li>
                <li>🔖 QR code individual por árvore</li>
                <li>📊 Relatórios de carbono e diversidade</li>
                <li>📸 Registro de podas, tratos e ocorrências</li>
                <li>👤 Portal do morador e painel do gestor</li>
              </ul>
            </div>
            <div className="bg-ocre/10 border border-ocre/30 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-terracota">Projeto piloto:</span>{' '}
                Residencial Mata Viva — Goiânia, GO · Bioma Cerrado · 2,4 ha · ~130 árvores catalogadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-verde-cerrado text-white py-6 px-4 text-center text-sm opacity-80">
        <p>© {new Date().getFullYear()} Agrosintropia · Mapa Vivo · Goiânia, GO</p>
        <p className="mt-1 text-xs opacity-60">Fase 0 — Fundação do projeto</p>
      </footer>
    </main>
  );
}
