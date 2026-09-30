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
        {/* Large, spacious face alignment frame */}
        <div className="relative border-2 border-dashed border-yellow-400/60 rounded-3xl w-[82%] max-w-[370px] h-[85%] max-h-[400px] flex flex-col items-center justify-between p-5 text-center backdrop-blur-[2px] bg-black/25 shadow-[0_0_35px_rgba(250,204,21,0.2)] transition-all duration-300">
          {/* 4 Prominent Glowing Corner Brackets */}
          <div className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl shadow-lg"></div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl shadow-lg"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl shadow-lg"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 border-yellow-400 rounded-br-xl shadow-lg"></div>

          {/* Top Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-yellow-400/40 text-yellow-300 text-[11px] font-bold tracking-wide shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping"></span>
            <span>AI FACE SCANNER</span>
          </div>

          {/* Center Target & Guidance */}
          <div className="flex flex-col items-center justify-center gap-2 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-3xl shadow-inner animate-pulse">
              🎯
            </div>
            <p className="text-sm sm:text-base text-white font-extrabold text-shadow tracking-wide">
              Apna Chehra Is Box Mein Rakhein
            </p>
            <p className="text-xs text-yellow-200/90 max-w-[260px] font-medium leading-relaxed">
              Frame bada kar diya hai! Smile, gussa ya koi bhi expression banayein.
            </p>
          </div>

          {/* Bottom Telemetry */}
          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[10px] text-white/80 font-mono">
            <span>{isProcessing ? "Analyzing..." : "Ready to Detect"}</span>
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

