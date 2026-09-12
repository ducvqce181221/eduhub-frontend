"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CheckCircle2,
  Clock,
  Maximize,
  Minimize,
  Pause,
  Play,
  PlayCircle,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  VideoOff,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LessonVideo } from "@/types/api";
import { formatDuration } from "@/components/courses/curriculum-outline";
import { useAuthSafe } from "@/lib/auth/auth-context";
import { useTranslation } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  video: LessonVideo | null | undefined;
  lessonTitle: string;
  initialWatchedSeconds?: number;
  isCompleted?: boolean;
  heartbeatIntervalMs?: number;
  onProgressHeartbeat?: (watchedSeconds: number) => void;
  className?: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  video,
  lessonTitle,
  initialWatchedSeconds = 0,
  isCompleted = false,
  heartbeatIntervalMs = 15000,
  onProgressHeartbeat,
  className,
}: VideoPlayerProps) {
  const { t } = useTranslation();
  const auth = useAuthSafe();
  const user = auth?.user;
  const watermarkText = user?.email
    ? `${user.email} • ID: ${user.id.slice(0, 8)}`
    : "";

  const [watermarkPos, setWatermarkPos] = useState<number>(0);

  // Dynamic watermark 4-corner repositioning
  useEffect(() => {
    if (!watermarkText) return;
    const interval = setInterval(() => {
      setWatermarkPos((prev) => (prev + 1) % 4);
    }, 15000);
    return () => clearInterval(interval);
  }, [watermarkText]);

  const watermarkPositionClasses = [
    "top-4 right-6",
    "bottom-16 right-6",
    "bottom-16 left-6",
    "top-4 left-6",
  ];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(initialWatchedSeconds);
  const [duration, setDuration] = useState(video?.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);
  const [centerIconFeedback, setCenterIconFeedback] = useState<"play" | "pause" | null>(null);

  const lastReportedSecondsRef = useRef<number>(initialWatchedSeconds);
  const isInitialSeekDoneRef = useRef(false);

  const effectiveDuration = duration > 0 ? duration : video?.durationSeconds || 0;
  const is90PercentReached =
    effectiveDuration > 0
      ? currentSeconds >= 0.9 * effectiveDuration || isCompleted
      : isCompleted;

  const emitHeartbeat = useCallback(
    (seconds: number) => {
      const clampedSeconds =
        effectiveDuration > 0 ? Math.min(seconds, effectiveDuration) : seconds;
      if (
        Math.abs(clampedSeconds - lastReportedSecondsRef.current) >= 3 ||
        clampedSeconds >= 0.9 * effectiveDuration
      ) {
        lastReportedSecondsRef.current = clampedSeconds;
        onProgressHeartbeat?.(Math.floor(clampedSeconds));
      }
    },
    [effectiveDuration, onProgressHeartbeat],
  );

  // Auto-hide controls logic
  const resetHideControlsTimer = useCallback(() => {
    setAreControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && !isSettingsOpen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setAreControlsVisible(false);
      }, 2600);
    }
  }, [isPlaying, isSettingsOpen]);

  useEffect(() => {
    resetHideControlsTimer();
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [resetHideControlsTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Periodic heartbeat interval while playing
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      if (videoRef.current) {
        emitHeartbeat(Math.floor(videoRef.current.currentTime));
      }
    }, heartbeatIntervalMs);

    return () => clearInterval(intervalId);
  }, [isPlaying, heartbeatIntervalMs, emitHeartbeat]);

  // Handle video events
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = Math.floor(videoRef.current.duration) || video?.durationSeconds || 0;
      setDuration(videoDuration);

      if (initialWatchedSeconds > 0 && !isInitialSeekDoneRef.current) {
        videoRef.current.currentTime = initialWatchedSeconds;
        isInitialSeekDoneRef.current = true;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = Math.floor(videoRef.current.currentTime);
      setCurrentSeconds(time);

      // Update buffered percentage
      if (videoRef.current.buffered.length > 0 && videoRef.current.duration > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBufferedPercent(Math.min(100, (bufferedEnd / videoRef.current.duration) * 100));
      }
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      try {
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => { });
        }
      } catch {
        // Fallback for jsdom
      }
      setIsPlaying(true);
      setCenterIconFeedback("play");
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setCenterIconFeedback("pause");
      emitHeartbeat(Math.floor(videoRef.current.currentTime));
    }
    setTimeout(() => setCenterIconFeedback(null), 600);
  };

  const handlePlay = () => setIsPlaying(true);

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      emitHeartbeat(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      emitHeartbeat(
        effectiveDuration > 0 ? effectiveDuration : Math.floor(videoRef.current.currentTime),
      );
    }
  };

  // Skip forward / backward
  const handleSeekDelta = (secondsDelta: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(
      0,
      Math.min(
        effectiveDuration || videoRef.current.duration || 9999,
        videoRef.current.currentTime + secondsDelta,
      ),
    );
    videoRef.current.currentTime = newTime;
    setCurrentSeconds(Math.floor(newTime));
    resetHideControlsTimer();
  };

  // Scrubber progress change
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSeconds = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetSeconds;
      setCurrentSeconds(Math.floor(targetSeconds));
    }
    resetHideControlsTimer();
  };

  // Scrubber hover preview
  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!effectiveDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverSeekPos(pos * 100);
    setHoverSeekTime(Math.floor(pos * effectiveDuration));
  };

  const handleScrubberMouseLeave = () => {
    setHoverSeekTime(null);
  };

  // Volume & Mute
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
    resetHideControlsTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume > 0 ? volume : 1;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
    resetHideControlsTimer();
  };

  // Playback Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setIsSettingsOpen(false);
    resetHideControlsTimer();
  };

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Fallback
    }
    resetHideControlsTimer();
  };

  // Keyboard navigation shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only handle if not typing in an input
    if (["input", "textarea"].includes((e.target as HTMLElement).tagName.toLowerCase())) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlayPause();
        break;
      case "arrowleft":
        e.preventDefault();
        handleSeekDelta(-5);
        break;
      case "arrowright":
        e.preventDefault();
        handleSeekDelta(5);
        break;
      case "arrowup":
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.min(1, volume + 0.1);
          setVolume(newVol);
          videoRef.current.volume = newVol;
          setIsMuted(false);
        }
        break;
      case "arrowdown":
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.max(0, volume - 0.1);
          setVolume(newVol);
          videoRef.current.volume = newVol;
          setIsMuted(newVol === 0);
        }
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "f":
        e.preventDefault();
        toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const progressPercent = useMemo(() => {
    if (!effectiveDuration) return 0;
    return Math.min(100, Math.max(0, (currentSeconds / effectiveDuration) * 100));
  }, [currentSeconds, effectiveDuration]);

  if (!video || !video.videoUrl) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full rounded-lg bg-canvas-soft border border-hairline flex flex-col items-center justify-center p-8 text-center",
          className,
        )}
      >
        <div className="w-12 h-12 rounded-md bg-surface border border-hairline flex items-center justify-center text-ink-secondary mb-3">
          <VideoOff className="w-6 h-6" />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-ink mb-1">
          {t?.learn?.videoPlayerUnavailable || "No video content for this lesson"}
        </h3>
        <p className="text-xs text-ink-muted max-w-sm">
          {t?.learn?.videoCompletionHint ||
            "This lesson might consist of downloadable resources or an assessment quiz below."}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={resetHideControlsTimer}
      onMouseEnter={() => setAreControlsVisible(true)}
      onMouseLeave={() => {
        if (isPlaying && !isSettingsOpen) setAreControlsVisible(false);
      }}
      className={cn(
        "group relative flex flex-col rounded-lg overflow-hidden bg-black border border-hairline shadow-notion-soft outline-none select-none",
        isFullscreen ? "h-screen w-screen rounded-none border-none" : "",
        className,
      )}
    >
      {/* Video Container with Context Menu and Drag Prevention */}
      <div
        className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={togglePlayPause}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/*
          HTML5 Video Element:
          - NO native `controls` attribute (eradicating the native browser download button & 3-dot menu)
          - playsInline for seamless playback
          - disablePictureInPicture
        */}
        <video
          ref={videoRef}
          data-testid="learning-video-element"
          src={video.videoUrl}
          disablePictureInPicture
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Dynamic Watermark for leak tracing */}
        {watermarkText && (
          <div
            data-testid="video-watermark"
            className={cn(
              "absolute pointer-events-none select-none z-20 text-[11px] font-mono text-white/30 tracking-wider px-2 py-0.5 rounded bg-black/20 backdrop-blur-[1px] transition-all duration-1000",
              watermarkPositionClasses[watermarkPos],
            )}
          >
            {watermarkText}
          </div>
        )}

        {/* Center Feedback Pulse Animation */}
        {centerIconFeedback && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center shadow-lg backdrop-blur-xs animate-in zoom-in-50 fade-in duration-200">
              {centerIconFeedback === "play" ? (
                <Play className="w-8 h-8 fill-current ml-1" />
              ) : (
                <Pause className="w-8 h-8 fill-current" />
              )}
            </div>
          </div>
        )}

        {/* Big Center Play Button when Paused */}
        {!isPlaying && !centerIconFeedback && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[0.5px] transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              aria-label={t?.learn?.play || "Play"}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-notion-blue text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
            </button>
          </div>
        )}

        {/*
          Custom Video Controls Bar:
          - Automatically fades out when playing and mouse is idle
          - Re-appears on hover or pause
        */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute bottom-0 inset-x-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 sm:px-4 pt-8 pb-3 transition-opacity duration-300",
            areControlsVisible || !isPlaying || isSettingsOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          {/* Scrubber / Seek Bar Container */}
          <div
            className="group/seek relative w-full h-3 flex items-center cursor-pointer mb-2"
            onMouseMove={handleScrubberMouseMove}
            onMouseLeave={handleScrubberMouseLeave}
          >
            {/* Background Track */}
            <div className="relative w-full h-1 group-hover/seek:h-1.5 rounded-full bg-white/20 transition-all">
              {/* Buffer Progress */}
              <div
                style={{ width: `${bufferedPercent}%` }}
                className="absolute top-0 left-0 h-full rounded-full bg-white/30"
              />

              {/* Played Progress */}
              <div
                style={{ width: `${progressPercent}%` }}
                className="absolute top-0 left-0 h-full rounded-full bg-notion-blue"
              />
            </div>

            {/* Hover Tooltip Timestamp */}
            {hoverSeekTime !== null && (
              <div
                style={{ left: `${hoverSeekPos}%` }}
                className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-neutral-900/90 text-white text-[10px] font-mono shadow border border-white/10 pointer-events-none"
              >
                {formatDuration(hoverSeekTime)}
              </div>
            )}

            {/* Native range input for accessible seeking */}
            <input
              type="range"
              min={0}
              max={effectiveDuration || 100}
              step={0.1}
              value={currentSeconds}
              onChange={handleScrubberChange}
              aria-label="Seek video position"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls Button Row */}
          <div className="flex items-center justify-between gap-2 text-white">
            {/* Left Controls: Play/Pause, Rewind, Forward, Volume, Time */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                data-testid="player-play-pause-btn"
                onClick={togglePlayPause}
                aria-label={isPlaying ? t?.learn?.pause || "Pause" : t?.learn?.play || "Play"}
                className="p-1.5 rounded-md hover:bg-white/15 text-white transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSeekDelta(-10)}
                title={t?.learn?.rewind10s || "Rewind 10s"}
                className="p-1.5 rounded-md hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleSeekDelta(10)}
                title={t?.learn?.forward10s || "Forward 10s"}
                className="p-1.5 rounded-md hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center justify-center"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Volume Slider Group */}
              <div className="group/vol flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? t?.learn?.unmute || "Unmute" : t?.learn?.mute || "Mute"}
                  className="p-1.5 rounded-md hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                  className="w-14 sm:w-18 h-1 accent-notion-blue cursor-pointer transition-opacity"
                />
              </div>

              {/* Duration display */}
              <div className="text-[11px] sm:text-xs font-mono text-white/80 ml-2 tracking-tight">
                <span>{formatDuration(currentSeconds)}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/60">{formatDuration(effectiveDuration)}</span>
              </div>
            </div>

            {/* Right Controls: Quality Indicator, Settings Popover, Fullscreen */}
            <div className="flex items-center gap-1.5">
              {/* Settings (Speed & Quality) Popover */}
              <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t?.learn?.settings || "Settings"}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white/85 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-semibold text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 leading-none mr-0.5">
                      1080p HD
                    </span>
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  side="top"
                  sideOffset={10}
                  className="w-72 p-3 bg-surface/95 backdrop-blur-md border border-hairline rounded-xl shadow-notion-dropdown text-ink text-xs z-50 animate-in fade-in-0 zoom-in-95"
                >
                  {/* Playback Speed Section */}
                  <div className="mb-3">
                    <div className="font-semibold text-ink mb-1.5 text-[11px] uppercase tracking-wider text-ink-muted">
                      {t?.learn?.playbackSpeed || "Playback Speed"}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {PLAYBACK_SPEEDS.map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleSpeedChange(spd)}
                          className={cn(
                            "px-2 py-1 rounded text-xs text-center transition-colors cursor-pointer",
                            playbackSpeed === spd
                              ? "bg-notion-blue text-white font-semibold shadow-2xs"
                              : "text-ink-secondary hover:bg-canvas-soft hover:text-ink",
                          )}
                        >
                          {spd === 1 ? `1x (${t?.learn?.speedNormal || "Normal"})` : `${spd}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-hairline pt-2.5">
                    {/* Quality / Resolution Section */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-ink text-[11px] uppercase tracking-wider text-ink-muted">
                        {t?.learn?.quality || "Resolution / Quality"}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Active HD
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Active 1080p */}
                      <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-canvas-soft font-semibold text-ink">
                        <div className="flex items-center gap-1.5">
                          <span>1080p ({t?.learn?.originalQuality || "Original HD"})</span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-notion-blue shrink-0" />
                      </div>

                      {/* Disabled HLS resolution presets */}
                      <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-ink-faint text-[11px] opacity-60">
                        <span>720p (HD)</span>
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800">
                          HLS Auto
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-ink-faint text-[11px] opacity-60">
                        <span>480p (Standard)</span>
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800">
                          HLS Auto
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-ink-faint text-[11px] opacity-60">
                        <span>360p (Data Saver)</span>
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800">
                          HLS Auto
                        </span>
                      </div>
                    </div>

                    {/* Explanatory callout for resolution switching */}
                    <div className="mt-2.5 p-2 rounded-md bg-notion-blue/5 border border-notion-blue/15 flex items-start gap-1.5 text-[10px] text-ink-secondary leading-relaxed">
                      {/* <Sparkles className="w-3 h-3 text-notion-blue shrink-0 mt-0.5" /> */}
                      <span>
                        {t?.learn?.qualityNotice ||
                          "Playing in original HD. Adaptive streaming (HLS) via cloud transcoding is coming soon."}
                      </span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen
                    ? t?.learn?.exitFullscreen || "Exit Fullscreen"
                    : t?.learn?.fullscreen || "Fullscreen"
                }
                className="p-1.5 rounded-md hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Footer Status Bar */}
      <div className="bg-surface border-t border-hairline px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <PlayCircle className="w-4 h-4 text-notion-blue shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-ink truncate leading-none">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {effectiveDuration > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-ink-faint" />
              <span>
                {formatDuration(currentSeconds)} / {formatDuration(effectiveDuration)}
              </span>
            </div>
          )}

          {isCompleted || is90PercentReached ? (
            <Badge
              variant="teal"
              className="text-xs px-2.5 py-0.5 font-medium flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t?.learn?.completedPercentBadge || "Completed (≥90%)"}</span>
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs px-2.5 py-0.5 bg-canvas-soft text-ink-secondary border-hairline font-medium tabular-nums"
            >
              {effectiveDuration > 0
                ? `${Math.round((currentSeconds / effectiveDuration) * 100)}% ${t?.learn?.watchedSuffix || "Watched"}`
                : t?.learn?.inProgress || "In Progress"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
