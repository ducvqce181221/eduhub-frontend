"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PlayCircle, VideoOff, Clock } from "lucide-react";
import type { LessonVideo } from "@/types/api";
import { formatDuration } from "@/components/courses/curriculum-outline";
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

export function VideoPlayer({
  video,
  lessonTitle,
  initialWatchedSeconds = 0,
  isCompleted = false,
  heartbeatIntervalMs = 15000,
  onProgressHeartbeat,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(initialWatchedSeconds);
  const lastReportedSecondsRef = useRef<number>(initialWatchedSeconds);
  const isInitialSeekDoneRef = useRef(false);

  const durationSeconds = video?.durationSeconds || 0;
  const is90PercentReached =
    durationSeconds > 0
      ? currentSeconds >= 0.9 * durationSeconds || isCompleted
      : isCompleted;

  const emitHeartbeat = useCallback(
    (seconds: number) => {
      const clampedSeconds = durationSeconds > 0 ? Math.min(seconds, durationSeconds) : seconds;
      if (Math.abs(clampedSeconds - lastReportedSecondsRef.current) >= 3 || clampedSeconds >= 0.9 * durationSeconds) {
        lastReportedSecondsRef.current = clampedSeconds;
        onProgressHeartbeat?.(Math.floor(clampedSeconds));
      }
    },
    [durationSeconds, onProgressHeartbeat],
  );

  // Initial seek on loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current && initialWatchedSeconds > 0 && !isInitialSeekDoneRef.current) {
      videoRef.current.currentTime = initialWatchedSeconds;
      isInitialSeekDoneRef.current = true;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = Math.floor(videoRef.current.currentTime);
      setCurrentSeconds(time);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      emitHeartbeat(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      emitHeartbeat(durationSeconds > 0 ? durationSeconds : Math.floor(videoRef.current.currentTime));
    }
  };

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

  if (!video || !video.videoUrl) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full rounded-2xl bg-canvas-soft border border-hairline flex flex-col items-center justify-center p-8 text-center",
          className,
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-surface border border-hairline flex items-center justify-center text-ink-muted mb-3 shadow-2xs">
          <VideoOff className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-ink mb-1">
          No video content for this lesson
        </h3>
        <p className="text-xs text-ink-muted max-w-sm">
          This lesson might consist of downloadable resources or an assessment quiz below.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden bg-black border border-hairline shadow-notion-elevated",
        className,
      )}
    >
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          data-testid="learning-video-element"
          src={video.videoUrl}
          controls
          controlsList="nodownload"
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Video Footer Status Bar */}
      <div className="bg-surface border-t border-hairline px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <PlayCircle className="w-4 h-4 text-notion-blue shrink-0" />
          <span className="text-sm font-semibold text-ink truncate leading-none">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {durationSeconds > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono">
              <Clock className="w-3.5 h-3.5 text-ink-faint" />
              <span>
                {formatDuration(currentSeconds)} / {formatDuration(durationSeconds)}
              </span>
            </div>
          )}

          {isCompleted || is90PercentReached ? (
            <Badge variant="teal" className="text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed (≥90%)
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-canvas-soft text-ink-muted border-hairline">
              {durationSeconds > 0
                ? `${Math.round((currentSeconds / durationSeconds) * 100)}% Watched`
                : "In Progress"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
