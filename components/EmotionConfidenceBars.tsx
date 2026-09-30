"use client";

import React from "react";
import { EMOTION_CONFIG } from "./memeConfig";

interface EmotionScoresProps {
  scores?: Record<string, number>;
  currentEmotion: string;
}

const ALL_EMOTIONS = ["happy", "angry", "sad", "surprise", "neutral", "fear", "disgust"];

export const EmotionConfidenceBars: React.FC<EmotionScoresProps> = ({
  scores = {},
  currentEmotion,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Emotion Probabilities
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">TFLite 48x48</span>
      </div>

      <div className="space-y-2">
        {ALL_EMOTIONS.map((emotionKey) => {
          const cfg = EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG.neutral;
          const score = scores[emotionKey] ?? (currentEmotion.toLowerCase() === emotionKey ? 0.95 : 0.02);
          const percent = Math.min(100, Math.max(0, Math.round(score * 100)));
          const isActive = currentEmotion.toLowerCase() === emotionKey;

          return (
            <div key={emotionKey} className="group">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className={`flex items-center gap-1.5 font-medium ${isActive ? cfg.accentColor + " font-bold scale-105 origin-left transition-transform" : "text-slate-300"}`}>
                  <span>{cfg.emoji}</span>
                  <span className="capitalize">{cfg.name}</span>
                </span>
                <span className={`font-mono text-[11px] ${isActive ? "text-white font-bold" : "text-slate-400"}`}>
                  {percent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-sm shadow-yellow-500/50"
                      : "bg-slate-600/50"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
