"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface LandingVideoProps {
  src: string;
  placeholderText?: string;
}

export default function LandingVideo({ src, placeholderText }: LandingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasEndedRef = useRef(false);

  // Keep ref in sync for IntersectionObserver closure
  useEffect(() => {
    hasEndedRef.current = hasEnded;
  }, [hasEnded]);

  // Cleanup hideTimer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Autoplay when video scrolls into view
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && v.paused && !hasEndedRef.current) {
          v.play().then(() => setIsPlaying(true)).catch(() => {});
        } else if (!entry.isIntersecting && !v.paused) {
          v.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(v);
    return () => observer.disconnect();
  }, [src]);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      if (v.duration) {
        setProgress((v.currentTime / v.duration) * 100);
        setCurrentTime(v.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(v.duration);
      setIsLoaded(true);
    };
    const onProgress = () => {
      if (v.buffered.length > 0 && v.duration) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      setShowControls(true);
    };
    const onPlay = () => { setIsPlaying(true); setHasEnded(false); };
    const onPause = () => setIsPlaying(false);

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("progress", onProgress);
    v.addEventListener("ended", onEnded);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [isPlaying]);

  const togglePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (hasEnded) {
      v.currentTime = 0;
      setHasEnded(false);
    }
    if (v.paused) {
      try { await v.play(); } catch {}
    } else {
      v.pause();
    }
  }, [hasEnded]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setProgress(pct * 100);
    if (hasEnded) {
      setHasEnded(false);
      v.play().catch(() => {});
    }
  }, [hasEnded]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!src) {
    return (
      <div className="aspect-video bg-slate-100 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-slate-400 dark:text-neutral-500 ms-1" />
          </div>
          <p className="text-slate-400 dark:text-neutral-500 font-medium">{placeholderText || "Video coming soon"}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      onMouseMove={scheduleHide}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        loop={false}
        className="w-full h-auto block"
        src={src}
      />

      {/* Replay overlay */}
      <AnimatePresence>
        {hasEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
            >
              <RotateCcw className="w-7 h-7 md:w-8 md:h-8 text-slate-900" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <AnimatePresence>
        {(showControls || !isPlaying) && isLoaded && !hasEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 pt-16 bg-gradient-to-t from-black/50 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={progressRef}
              className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/bar relative hover:h-1.5 transition-all"
              onClick={handleProgressClick}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ms-0.5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[11px] text-white/60 font-mono tabular-nums ms-1">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
