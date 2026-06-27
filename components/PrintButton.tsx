'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 cursor-pointer"
    >
      Imprimir
    </button>
  );
}
