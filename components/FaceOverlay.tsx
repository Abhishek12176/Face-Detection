"use client";

import React from "react";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  frame_width: number;
  frame_height: number;
}

interface FaceOverlayProps {
  box: Box | null | undefined;
  emotion: string;
  confidence: number;
  isProcessing: boolean;
  detected: boolean;
}

export const FaceOverlay: React.FC<FaceOverlayProps> = ({
  box,
  emotion,
  confidence,
  isProcessing,
  detected,
}) => {
  if (!detected || !box) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="border-2 border-dashed border-white/20 rounded-2xl w-48 h-48 md:w-56 md:h-56 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[1px] bg-black/10">
          <span className="text-2xl mb-1 animate-pulse">🎯</span>
          <span className="text-xs text-white/70 font-medium">Keep face inside frame</span>
        </div>
      </div>
    );
  }

  // Calculate percentage coordinates relative to original frame
  const leftPct = (box.x / box.frame_width) * 100;
  const topPct = (box.y / box.frame_height) * 100;
  const widthPct = (box.width / box.frame_width) * 100;
  const heightPct = (box.height / box.frame_height) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute border-2 border-yellow-400 rounded-lg shadow-lg shadow-yellow-500/20 transition-all duration-200"
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        {/* Corner Reticles */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white"></div>

        {/* Emotion Floating Tag */}
        <div className="absolute -top-7 left-0 bg-yellow-400 text-black text-[11px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 uppercase tracking-wider whitespace-nowrap">
          <span>{emotion}</span>
          <span className="opacity-75">({Math.round(confidence * 100)}%)</span>
        </div>
      </div>
    </div>
  );
};
