import type { EventItem } from '../types';

/** English meaning shown in brackets after Hindi/ritual names, keyed by event id. English UI only. */
const GLOSS: Record<string, string> = {
  'mehendi-groom-29nov': 'Henna ceremony',
  'mehendi-bride-30nov': 'Henna ceremony',
  'baraat-travel-30nov': 'groom’s wedding procession travels',
  'mata-pujan-bride-30nov': 'prayers to the Mother Goddess',
  'telban-bride-1dec': 'oil-anointing & sacred-thread rituals',
  'ganesh-tel-haldi-groom-1dec': 'prayers, oil & turmeric rituals',
  'parojan-bride-1dec': 'traditional pre-wedding family ritual',
  'haldi-carnival-1dec': 'turmeric ceremony',
  'chak-bhat-bride-1dec': 'maternal family’s gifting ritual',
  'chak-bhat-groom-1dec': 'maternal family’s gifting ritual',
  'sagai-tilak-goad-1dec': 'engagement & blessing rituals',
  'sangeet-dj-1dec': 'music & dance night',
  'nikasi-groom-2dec': 'groom’s procession sets out',
  'samela-2dec': 'ceremonial meeting of the two families',
  'baarat-swagat-varmala-2dec': 'procession welcome & garland exchange',
  'phere-2dec': 'wedding vows around the sacred fire',
};

export const glossOf = (ev: EventItem, lang: string): string => (lang === 'en' && GLOSS[ev.id] ? `(${GLOSS[ev.id]})` : '');
