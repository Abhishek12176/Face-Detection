"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import confetti from "canvas-confetti";
import {
  Camera,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  Download,
  Play,
  Pause,
  AlertCircle,
  HelpCircle,
  Zap,
} from "lucide-react";
import { EMOTION_CONFIG, DEFAULT_THEME, EmotionTheme } from "@/components/memeConfig";
import { sounds } from "@/components/audio";
import { FaceOverlay } from "@/components/FaceOverlay";
import { EmotionConfidenceBars } from "@/components/EmotionConfidenceBars";
import { RoastNotification } from "@/components/RoastModal";

interface PredictionResponse {
  emotion: string;
  confidence: number;
  detected?: boolean;
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
    frame_width: number;
    frame_height: number;
  } | null;
  scores?: Record<string, number>;
  demo_mode?: boolean;
  notice?: string;
  error?: string;
}

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const isBusyRef = useRef(false);

  // Core App State
  const [userName, setUserName] = useState<string>("Abhishek");
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [confidence, setConfidence] = useState<number>(0.92);
  const [detected, setDetected] = useState<boolean>(true);
  const [boundingBox, setBoundingBox] = useState<PredictionResponse["box"]>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  // Controls & Toggles
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  const [roastMode, setRoastMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [detectionIntervalMs, setDetectionIntervalMs] = useState<number>(500);

  // Roast Toast State
  const [activeRoast, setActiveRoast] = useState<string | null>(null);
  const [showRoast, setShowRoast] = useState<boolean>(false);
  const lastRoastTimeRef = useRef<number>(0);

  // Status & Telemetry
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [latency, setLatency] = useState<number>(0);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);

  // Dynamic Theme
  const theme: EmotionTheme = EMOTION_CONFIG[currentEmotion.toLowerCase()] || DEFAULT_THEME;

  // Sound sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Trigger sound effect on emotion switch
  const triggerEmotionEffect = useCallback(
    (emotion: string, isHappyConfetti = false) => {
      const em = emotion.toLowerCase();
      if (em === "happy") {
        sounds.playHappy();
        if (isHappyConfetti) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#FBBF24", "#F59E0B", "#EF4444", "#10B981"],
          });
        }
      } else if (em === "angry") {
        sounds.playAngry();
      } else if (em === "sad") {
        sounds.playSad();
      } else if (em === "surprise" || em === "fear") {
        sounds.playSurprise();
      }
    },
    []
  );

  // Trigger a 3-second Roast
  const triggerRoast = useCallback(
    (emotionKey?: string) => {
      const target = emotionKey || currentEmotion;
      const cfg = EMOTION_CONFIG[target.toLowerCase()] || EMOTION_CONFIG.neutral;
      const randomRoast =
        cfg.roasts[Math.floor(Math.random() * cfg.roasts.length)] ||
        "Bhai teri shakal dekh ke AI bhi confuse ho gaya! 🤪";

      setActiveRoast(randomRoast);
      setShowRoast(true);
      sounds.playRoast();
      lastRoastTimeRef.current = Date.now();
    },
    [currentEmotion]
  );

  // Main Prediction API Caller
  const processFrame = useCallback(async () => {
    if (!webcamRef.current || isBusyRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    isBusyRef.current = true;
    const startTime = performance.now();

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: screenshot }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: PredictionResponse = await response.json();

      if (data.emotion) {
        const prevEmotion = currentEmotion;
        setCurrentEmotion(data.emotion);
        setConfidence(data.confidence ?? 0.9);
        setDetected(data.detected ?? true);
        setBoundingBox(data.box ?? null);
        if (data.scores) setScores(data.scores);
        if (data.notice) setApiNotice(data.notice);

        // Sound & Confetti trigger on change
        if (data.emotion !== prevEmotion) {
          triggerEmotionEffect(data.emotion, data.emotion === "happy");

          // Auto roast if Roast Mode is active (rate limited to once every 4 seconds)
          if (roastMode && Date.now() - lastRoastTimeRef.current > 4000) {
            triggerRoast(data.emotion);
          }
        }
      }
    } catch {
      // Local fallback / offline demo simulation if backend is not started
      setLatency(35);
      setApiNotice(
        "Backend /api/predict not reachable locally yet. Running in Interactive Preview mode."
      );
    } finally {
      isBusyRef.current = false;
    }
  }, [currentEmotion, roastMode, triggerEmotionEffect, triggerRoast]);

  // Capture loop
  useEffect(() => {
    if (!isDetecting) return;

    const interval = setInterval(() => {
      processFrame();
    }, detectionIntervalMs);

    return () => clearInterval(interval);
  }, [isDetecting, detectionIntervalMs, processFrame]);

  // Export Meme Snapshot
  const captureSnapshot = async () => {
    if (!webcamRef.current) return;
    setIsCapturingSnapshot(true);

    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) return;

      const img = new Image();
      img.src = screenshot;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw camera image
      ctx.drawImage(img, 0, 0);

      // Add meme banner top
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(0, 0, canvas.width, 90);

      ctx.fillStyle = "#FACC15";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(theme.memeQuote, canvas.width / 2, 55);

      // Add meme watermark bottom
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, canvas.height - 45, canvas.width, 45);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px sans-serif";
      ctx.fillText(
        `AI Emotion: ${theme.name.toUpperCase()} (${Math.round(confidence * 100)}%) ${userName ? `| User: ${userName}` : ""} | MemeMood AI`,
        canvas.width / 2,
        canvas.height - 18
      );

      const link = document.createElement("a");
      link.download = `meme-${currentEmotion}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsCapturingSnapshot(false);
    }
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} transition-colors duration-700 ease-in-out px-4 py-6 md:p-8 flex flex-col justify-between`}
    >
      {/* 3-Second Roast Toast */}
      <RoastNotification
        roastText={activeRoast || ""}
        isVisible={showRoast}
        onClose={() => setShowRoast(false)}
        durationMs={3000}
      />

      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 text-2xl animate-float">
            😂
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>MemeMood</span>
              <span className="text-yellow-400 font-serif italic text-lg sm:text-xl">AI</span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                v14 Serverless
              </span>
            </h1>
            <p className="text-xs text-white/60">Face Emotion Detection with Unfiltered Desi Memes</p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* User Name input matching app.py */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs shadow-md">
            <span className="text-white/50 text-[11px] font-medium">👤</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="bg-transparent border-none outline-none text-yellow-300 font-bold w-24 sm:w-28 text-xs placeholder:text-white/30"
              title="Enter your name"
            />
          </div>

          {/* Roast Mode Toggle */}
          <button
            onClick={() => {
              const next = !roastMode;
              setRoastMode(next);
              if (next) triggerRoast();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-300 shadow-md ${
              roastMode
                ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-red-500/40 scale-105 ring-2 ring-red-400"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10"
            }`}
          >
            <Flame className={`w-4 h-4 ${roastMode ? "text-yellow-300 animate-bounce" : "text-red-400"}`} />
            <span>ROAST MODE</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                roastMode ? "bg-black/40 text-yellow-300" : "bg-white/10 text-white/60"
              }`}
            >
              {roastMode ? "ON 🔥" : "OFF"}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            aria-label="Toggle sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Camera Flip */}
          <button
            onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 transition-colors"
            title="Flip camera"
            aria-label="Flip camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Run / Pause Loop */}
          <button
            onClick={() => setIsDetecting(!isDetecting)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isDetecting
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isDetecting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isDetecting ? "Active (500ms)" : "Paused"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* Left Column: Live Webcam Card & Meme Punchline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Highlight Meme Punchline Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl p-6 shadow-2xl text-center">
            {/* Top Emotion Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border backdrop-blur-sm transition-colors duration-500">
              <span className="text-xl">{theme.emoji}</span>
              <span className={theme.accentColor}>Emotion: {theme.name}</span>
              <span className="text-white/60">({Math.round(confidence * 100)}%)</span>
            </div>

            {/* Funny Meme Quote */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-shadow-meme tracking-tight leading-tight my-2">
              {theme.memeQuote}
            </h2>

            {/* Quick Roast Button */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={() => triggerRoast()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Roast Me Now!</span>
              </button>
            </div>
          </div>

          {/* Webcam Viewport Container */}
          <div className="relative rounded-3xl overflow-hidden bg-black aspect-[4/3] max-h-[460px] border-4 border-slate-800/80 shadow-2xl flex items-center justify-center group">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode,
                width: 640,
                height: 480,
              }}
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Face Box Overlay */}
            <FaceOverlay
              box={boundingBox}
              emotion={currentEmotion}
              confidence={confidence}
              isProcessing={isBusyRef.current}
              detected={detected}
              userName={userName}
            />

            {/* Live Indicator Pills */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>LIVE FEED</span>
              </div>
              {latency > 0 && (
                <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400">
                  {latency}ms
                </div>
              )}
            </div>

            {/* Snapshot Trigger Button */}
            <button
              onClick={captureSnapshot}
              disabled={isCapturingSnapshot}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-xl transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isCapturingSnapshot ? "Generating..." : "Save Meme Card"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Emotion Analysis & Quick Testing (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Emotion Probability Bars */}
          <EmotionConfidenceBars scores={scores} currentEmotion={currentEmotion} />

          {/* Quick Emotion Preview Buttons */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Emotion Quick Sim / Test
              </h3>
              <span className="text-[10px] text-white/50">Click to preview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(EMOTION_CONFIG).map((emKey) => {
                const item = EMOTION_CONFIG[emKey];
                const isSelected = currentEmotion.toLowerCase() === emKey;
                return (
                  <button
                    key={emKey}
                    onClick={() => {
                      setCurrentEmotion(emKey);
                      setConfidence(0.96);
                      triggerEmotionEffect(emKey, emKey === "happy");
                      if (roastMode) triggerRoast(emKey);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all text-left ${
                      isSelected
                        ? "bg-white text-black shadow-lg scale-105"
                        : "bg-slate-800/80 hover:bg-slate-700/80 text-white/80"
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="capitalize truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vercel Architecture Spec Card */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl text-xs space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Full-Stack Architecture Details</span>
            </h4>
            <ul className="space-y-1.5 text-white/70">
              <li className="flex items-center justify-between">
                <span>Frontend:</span>
                <span className="font-mono text-emerald-400">Next.js 14 App Router</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Backend Function:</span>
                <span className="font-mono text-blue-400">/api/predict.py (Serverless)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Inference Engine:</span>
                <span className="font-mono text-yellow-400">TFLite Runtime (48x48)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Face Detection:</span>
                <span className="font-mono text-purple-400">OpenCV Haar Cascade</span>
              </li>
            </ul>

            {apiNotice && (
              <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[11px] text-yellow-200 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                <span>{apiNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
        <p>Built with Next.js 14 + Python Serverless on Vercel</p>
        <p className="font-mono text-[11px]">Dynamic Range Quantized TFLite &bull; Fast &lt;100ms Inference</p>
      </footer>
    </main>
  );
}
