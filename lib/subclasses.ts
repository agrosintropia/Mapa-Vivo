export const SUBCLASSES = [
  { key: 'nativa', label: 'Nativa' },
  { key: 'exotica', label: 'Exótica' },
  { key: 'nativa_com_flor', label: 'Com flor' },
  { key: 'frutifera', label: 'Frutífera' },
  { key: 'madeireira_nobre', label: 'Madeireira nobre' },
  { key: 'medicinal', label: 'Medicinal' },
  { key: 'ameacada_de_extincao', label: 'Ameaçada' },
  { key: 'atrativa_de_fauna', label: 'Atrativa de fauna' },
  { key: 'melifera', label: 'Melífera' },
  { key: 'pioneira', label: 'Pioneira' },
] as const;

export type SubclassKey = typeof SUBCLASSES[number]['key'];
