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
  userName?: string;
  isMirrored?: boolean;
}

export const FaceOverlay: React.FC<FaceOverlayProps> = ({
  box,
  emotion,
  confidence,
  isProcessing,
  detected,
  userName,
  isMirrored = true,
}) => {
  if (!detected || !box) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
        {/* Large, clean face alignment frame */}
        <div className="relative border-2 border-dashed border-yellow-400/40 rounded-3xl w-[82%] max-w-[370px] h-[85%] max-h-[400px] flex items-center justify-center text-center backdrop-blur-[1px] bg-black/15 shadow-[0_0_25px_rgba(250,204,21,0.15)]">
          {/* Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-yellow-400 rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-yellow-400 rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-yellow-400 rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-yellow-400 rounded-br-lg"></div>

          {/* Clean 3-Word Label */}
          <div className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-white/90 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            Position Face Here
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage coordinates relative to original frame with mirroring
  const leftPct = isMirrored
    ? ((box.frame_width - (box.x + box.width)) / box.frame_width) * 100
    : (box.x / box.frame_width) * 100;
  const topPct = (box.y / box.frame_height) * 100;
  const widthPct = (box.width / box.frame_width) * 100;
  const heightPct = (box.height / box.frame_height) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute border-2 sm:border-3 border-yellow-400 rounded-2xl shadow-[0_0_25px_rgba(250,204,21,0.35)] transition-all duration-150"
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        {/* Corner Reticles */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-white rounded-tl"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-white rounded-tr"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-white rounded-bl"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-white rounded-br"></div>

        {/* Emotion Floating Tag */}
        <div className="absolute -top-8 left-0 bg-yellow-400 text-black text-xs font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
          <span>{userName ? `${userName}: ` : ""}{emotion}</span>
          <span className="opacity-80 font-mono text-[11px]">({Math.round(confidence * 100)}%)</span>
        </div>
      </div>
    </div>
  );
};

