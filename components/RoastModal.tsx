"use client";

import React, { useEffect, useState } from "react";
import { Flame, Sparkles, X } from "lucide-react";

interface RoastNotificationProps {
  roastText: string;
  isVisible: boolean;
  onClose: () => void;
  durationMs?: number;
}

export const RoastNotification: React.FC<RoastNotificationProps> = ({
  roastText,
  isVisible,
  onClose,
  durationMs = 3000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onClose();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, durationMs, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-bounce-short">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-[2px] shadow-2xl shadow-red-500/30">
        <div className="relative rounded-2xl bg-slate-950/95 backdrop-blur-xl p-4 sm:p-5 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Flame className="w-4 h-4 animate-bounce" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                🔥 EMOTIONAL DAMAGE (3s ROAST)
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1"
              aria-label="Close roast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Roast Body */}
          <p className="text-base sm:text-lg font-bold text-yellow-300 leading-snug tracking-tight">
            &ldquo;{roastText}&rdquo;
          </p>

          {/* 3-Second Countdown Progress Bar */}
          <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
