import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DissolvableTextProps {
  id?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

interface SmokeParticle {
  id: number;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  width: number;
  height: number;
  rotate: number;
  duration: number;
  delay: number;
}

export const DISSOLVE_STORAGE_KEY = 'sky_dissolved_texts_v1';
export const EVER_DISSOLVED_KEY = 'sky_ever_dissolved_v1';

export const getDissolvedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DISSOLVE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveDissolvedIds = (ids: string[]) => {
  try {
    localStorage.setItem(DISSOLVE_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
};

export const getHasEverDissolved = (): boolean => {
  try {
    if (localStorage.getItem(EVER_DISSOLVED_KEY) === 'true') return true;
    return getDissolvedIds().length > 0;
  } catch {
    return false;
  }
};

export const DissolvableText: React.FC<DissolvableTextProps> = ({
  id,
  as = 'p',
  className = '',
  children,
  onClick,
  title,
}) => {
  const textKey = id || (typeof children === 'string' ? children : String(children));
  const [isDissolved, setIsDissolved] = useState(() => getDissolvedIds().includes(textKey));
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    const syncState = () => {
      setIsDissolved(getDissolvedIds().includes(textKey));
    };

    const handleUndoSingle = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: string }>;
      const targetId = customEvent.detail?.id;
      if (!targetId || targetId === textKey) {
        setIsDissolved(false);
      }
    };

    const handleRestoreAll = () => {
      setIsDissolved(false);
    };

    window.addEventListener('dissolve-undo-single', handleUndoSingle);
    window.addEventListener('dissolve-restore-all', handleRestoreAll);

    // Sync state on mount/remount
    syncState();

    return () => {
      window.removeEventListener('dissolve-undo-single', handleUndoSingle);
      window.removeEventListener('dissolve-restore-all', handleRestoreAll);
    };
  }, [textKey]);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);

    // Spawn 8 delicate mist wisps diffusing softly outwards (向外侧晕染飘散)
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX > 0 ? e.clientX - rect.left : rect.width / 2;
    const clickY = e.clientY > 0 ? e.clientY - rect.top : rect.height / 2;

    const newParticles: SmokeParticle[] = Array.from({ length: 8 }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / 8 + (Math.random() - 0.5) * 0.3;
      const distance = Math.random() * 12 + 6; // Small dynamic range
      const driftX = Math.cos(angle) * distance * 1.2;
      const driftY = Math.sin(angle) * distance * 0.5 - 3;
      const width = Math.random() * 20 + 22; // Horizontal wisp 22-42px
      const height = Math.random() * 6 + 6;   // Soft oval 6-12px (Not spherical!)

      return {
        id: Date.now() + index + Math.random(),
        startX: clickX,
        startY: clickY,
        driftX,
        driftY,
        width,
        height,
        rotate: (Math.random() - 0.5) * 30,
        duration: Math.random() * 0.8 + 1.8,
        delay: index * 0.03,
      };
    });

    setSmokeParticles(newParticles);
    setTimeout(() => setSmokeParticles([]), 2800);

    setIsDissolved(true);

    const current = getDissolvedIds();
    if (!current.includes(textKey)) {
      const updated = [...current, textKey];
      saveDissolvedIds(updated);
    }

    try {
      localStorage.setItem(EVER_DISSOLVED_KEY, 'true');
    } catch {}

    // Broadcast event that this specific item was dissolved
    window.dispatchEvent(
      new CustomEvent('dissolve-item-tapped', { detail: { id: textKey } })
    );
  };

  const Component = motion[as] || motion.p;

  return (
    <div className="relative inline-block w-full">
      <Component
        initial={false}
        animate={
          isDissolved
            ? {
                opacity: 0,
                filter: 'blur(22px)',
                letterSpacing: '0.35em',
                scaleX: 1.25,
                scaleY: 1.15,
                textShadow:
                  '18px -18px 24px rgba(99, 102, 241, 0.45), -18px 18px 24px rgba(99, 102, 241, 0.45)',
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
                lineHeight: 0,
              }
            : {
                opacity: 1,
                filter: 'blur(0px)',
                letterSpacing: 'inherit',
                scaleX: 1,
                scaleY: 1,
                textShadow: 'none',
                height: 'auto',
                marginTop: '',
                marginBottom: '',
                paddingTop: '',
                paddingBottom: '',
                lineHeight: 'inherit',
              }
        }
        transition={
          isDissolved
            ? {
                opacity: { duration: 6.0, ease: [0.1, 0.4, 0.2, 1] },
                filter: { duration: 6.0, ease: [0.1, 0.4, 0.2, 1] },
                letterSpacing: { duration: 6.0, ease: [0.1, 0.4, 0.2, 1] },
                scaleX: { duration: 6.0, ease: [0.1, 0.4, 0.2, 1] },
                scaleY: { duration: 6.0, ease: [0.1, 0.4, 0.2, 1] },
                textShadow: { duration: 6.0, ease: [0.1, 0.4, 0.2, 1] },
                height: { duration: 1.5, delay: 4.5, ease: [0.4, 0, 0.2, 1] },
                marginTop: { duration: 1.5, delay: 4.5 },
                marginBottom: { duration: 1.5, delay: 4.5 },
              }
            : {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }
        }
        onClick={handleClick}
        title={title || '轻点消散'}
        className={`cursor-pointer select-none transition-colors hover:opacity-80 active:opacity-60 ${
          isDissolved ? 'pointer-events-none overflow-hidden my-0 py-0 border-none' : ''
        } ${className}`}
      >
        {children}
      </Component>

      {/* Floating Smoke Mist Cloud Particles Burst (向外侧晕染飘散) */}
      <AnimatePresence>
        {smokeParticles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible z-40">
            {smokeParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  opacity: 0.55,
                  scale: 0.7,
                  x: p.startX - p.width / 2,
                  y: p.startY - p.height / 2,
                  rotate: p.rotate,
                  filter: 'blur(5px)',
                }}
                animate={{
                  opacity: [0.55, 0.25, 0],
                  scale: 1.25,
                  x: p.startX + p.driftX - p.width / 2,
                  y: p.startY + p.driftY - p.height / 2,
                  rotate: p.rotate,
                  filter: 'blur(12px)',
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  position: 'absolute',
                  width: p.width,
                  height: p.height,
                  borderRadius: '9999px',
                  background:
                    'radial-gradient(ellipse at center, rgba(165, 180, 252, 0.55) 0%, rgba(192, 132, 252, 0.25) 50%, rgba(255, 255, 255, 0) 100%)',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

