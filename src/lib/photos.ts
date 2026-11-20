import gen from '../data/photos.generated.json';
import type { L10n } from '../types';

export interface PhotoInfo { src640: string; src1280: string; focal: string; alt: L10n; aspect: number; blur: string }
const data = gen as unknown as { photos: Record<string, PhotoInfo>; days: Record<string, string>; splash: string; info: string };

export const photo = (slug?: string | null): PhotoInfo | undefined => (slug ? data.photos[slug] : undefined);
export const dayPhoto = (date: string) => photo(data.days[date]);
export const splashPhoto = () => photo(data.splash);
export const infoPhoto = () => photo(data.info);
