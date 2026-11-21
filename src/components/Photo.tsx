import { useState, type CSSProperties } from 'react';
import { useApp } from '../lib/app';
import type { PhotoInfo } from '../lib/photos';

/** Responsive WebP with blur-up placeholder and focal-point crop. Fills its parent (parent sets size/aspect). */
export function Photo({ p, priority = false, className = '', sizes = '100vw', style }: { p?: PhotoInfo; priority?: boolean; className?: string; sizes?: string; style?: CSSProperties }) {
  const { l } = useApp();
  const [loaded, setLoaded] = useState(false);
  if (!p) return <div aria-hidden="true" className={`bg-sand ${className}`} style={style} />;
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`} style={{ backgroundImage: `url(${p.blur})`, backgroundSize: 'cover', backgroundPosition: p.focal, ...style }}>
      <img
        src={p.src640}
        srcSet={`${p.src640} 640w, ${p.src1280} 1280w`}
        sizes={sizes}
        alt={l(p.alt)}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        ref={(el) => { if (el && el.complete && el.naturalWidth > 0) setLoaded(true); }}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{ objectPosition: p.focal, opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}
