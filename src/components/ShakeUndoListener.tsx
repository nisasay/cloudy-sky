import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShakeUndoListener: React.FC = () => {
  const { t } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Hidden device shake listener as an extra easter egg
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const now = Date.now();
      if (now - lastTime > 150) {
        const diffTime = now - lastTime;
        lastTime = now;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        const delta = Math.abs(x + y + z - lastX - lastY - lastZ);
        const speed = (delta / diffTime) * 10000;

        if (speed > 25) {
          triggerUndoSingle();
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);

    // Item tapped event listener - receives the single dissolved item's ID
    const handleItemTapped = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: string }>;
      const itemId = customEvent.detail?.id || null;
      setLastId(itemId);
      setShowToast(true);

      // Reset auto-hide timer (disappears after 5 seconds)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setShowToast(false);
      }, 5000);
    };

    const handleUndo = () => {
      setShowToast(false);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };

    window.addEventListener('dissolve-item-tapped', handleItemTapped);
    window.addEventListener('dissolve-undo-single', handleUndo);
    window.addEventListener('dissolve-restore-all', handleUndo);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('dissolve-item-tapped', handleItemTapped);
      window.removeEventListener('dissolve-undo-single', handleUndo);
      window.removeEventListener('dissolve-restore-all', handleUndo);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const triggerUndoSingle = () => {
    window.dispatchEvent(
      new CustomEvent('dissolve-undo-single', { detail: { id: lastId } })
    );
    setShowToast(false);
  };

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={triggerUndoSingle}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/90 text-white shadow-xl backdrop-blur-md flex items-center gap-3 text-xs border border-white/20 cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-200 font-serif italic">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{t('dissolve_toast_single')}</span>
          </div>

          <div className="flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-indigo-500/90 hover:bg-indigo-600 text-white transition-colors shadow-xs font-serif italic text-xs font-bold">
            <RotateCcw className="w-3 h-3" />
            <span>{t('dissolve_undo')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
