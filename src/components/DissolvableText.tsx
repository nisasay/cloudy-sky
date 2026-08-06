import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface DissolvableTextProps {
  id?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
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

  useEffect(() => {
    const handleUndoSingle = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: string }>;
      if (!customEvent.detail?.id || customEvent.detail.id === textKey) {
        setIsDissolved(false);
        const current = getDissolvedIds();
        saveDissolvedIds(current.filter((k) => k !== textKey));
      }
    };

    const handleRestoreAll = () => {
      setIsDissolved(false);
      saveDissolvedIds([]);
    };

    window.addEventListener('dissolve-undo-single', handleUndoSingle);
    window.addEventListener('dissolve-restore-all', handleRestoreAll);
    return () => {
      window.removeEventListener('dissolve-undo-single', handleUndoSingle);
      window.removeEventListener('dissolve-restore-all', handleRestoreAll);
    };
  }, [textKey]);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
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
    <Component
      initial={false}
      animate={
        isDissolved
          ? {
              opacity: 0,
              filter: 'blur(24px)',
              letterSpacing: '0.4em',
              scaleX: 1.25,
              scaleY: 1.18,
              textShadow:
                '22px -22px 28px rgba(99, 102, 241, 0.45), -22px 22px 28px rgba(99, 102, 241, 0.45)',
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
              letterSpacing: 'normal',
              scaleX: 1,
              scaleY: 1,
              textShadow: '0px 0px 0px rgba(0,0,0,0)',
              height: 'auto',
              marginTop: 'auto',
              marginBottom: 'auto',
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
  );
};
