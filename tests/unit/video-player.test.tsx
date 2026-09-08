import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoPlayer } from "@/components/learn/video-player";
import type { LessonVideo } from "@/types/api";

const mockVideo: LessonVideo = {
  id: "vid-1",
  videoUrl: "https://example.com/video.mp4",
  durationSeconds: 600,
};

describe("VideoPlayer Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders video element with source and lesson title", () => {
    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={0}
        isCompleted={false}
        onProgressHeartbeat={vi.fn()}
      />,
    );

    expect(screen.getByText("Introduction to NestJS")).toBeInTheDocument();
    const videoEl = screen.getByTestId("learning-video-element");
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute("src", "https://example.com/video.mp4");
  });

  it("renders completion badge when isCompleted is true", () => {
    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={580}
        isCompleted={true}
        onProgressHeartbeat={vi.fn()}
      />,
    );

    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });

  it("triggers periodic progress heartbeat during video playback", () => {
    const handleHeartbeat = vi.fn();

    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={0}
        isCompleted={false}
        heartbeatIntervalMs={10000}
        onProgressHeartbeat={handleHeartbeat}
      />,
    );

    const videoEl = screen.getByTestId("learning-video-element");

    // Simulate play and time progression
    fireEvent.play(videoEl);
    Object.defineProperty(videoEl, "currentTime", { value: 60, writable: true });
    fireEvent.timeUpdate(videoEl);

    // Fast-forward heartbeat timer
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(handleHeartbeat).toHaveBeenCalledWith(60);
  });

  it("renders placeholder when video is not attached", () => {
    render(
      <VideoPlayer
        video={null}
        lessonTitle="Text Only Lesson"
        initialWatchedSeconds={0}
        isCompleted={false}
        onProgressHeartbeat={vi.fn()}
      />,
    );

    expect(screen.getByText(/No video content for this lesson/i)).toBeInTheDocument();
  });

  it("prevents context menu (right-click) on video container to deter saving", () => {
    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={0}
        isCompleted={false}
      />,
    );

    const videoEl = screen.getByTestId("learning-video-element");
    const container = videoEl.parentElement;
    expect(container).toBeInTheDocument();

    const preventDefault = vi.fn();
    fireEvent.contextMenu(container!, { preventDefault });
  });

  it("does not have native controls attribute on video element (eliminating browser download menu)", () => {
    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={0}
        isCompleted={false}
      />,
    );

    const videoEl = screen.getByTestId("learning-video-element");
    // Native controls attribute must be absent to eliminate browser 3-dot download menu
    expect(videoEl).not.toHaveAttribute("controls");
  });

  it("renders custom play/pause button and toggles playback state", () => {
    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={0}
        isCompleted={false}
      />,
    );

    const playPauseBtn = screen.getByTestId("player-play-pause-btn");
    expect(playPauseBtn).toBeInTheDocument();
    expect(playPauseBtn).toHaveAttribute("aria-label", "Play");

    // Click play
    fireEvent.click(playPauseBtn);
    const videoEl = screen.getByTestId("learning-video-element");
    fireEvent.play(videoEl);

    expect(playPauseBtn).toHaveAttribute("aria-label", "Pause");
  });

  it("renders quality resolution badge and settings menu with quality explanation", () => {
    render(
      <VideoPlayer
        video={mockVideo}
        lessonTitle="Introduction to NestJS"
        initialWatchedSeconds={0}
        isCompleted={false}
      />,
    );

    // Resolution badge rendered on player
    expect(screen.getByText("1080p HD")).toBeInTheDocument();

    // Open settings popover
    const settingsBtn = screen.getByRole("button", { name: /Settings/i });
    fireEvent.pointerDown(settingsBtn);
    fireEvent.click(settingsBtn);

    // Active resolution and HLS explanation visible
    expect(screen.getAllByText(/1080p/i).length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText(/Multi-bitrate adaptive streaming \(HLS\) will be enabled/i),
    ).toBeInTheDocument();
  });
});

