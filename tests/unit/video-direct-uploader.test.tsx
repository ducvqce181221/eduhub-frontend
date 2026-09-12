import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoUploader } from "@/components/teacher/video-uploader";
import * as uploadApi from "@/lib/api/upload";

describe("VideoUploader (Cloudflare R2 Direct Upload)", () => {
  it("renders upload dropzone when no video exists", () => {
    render(<VideoUploader currentVideo={null} onSaveVideo={vi.fn()} />);

    expect(screen.getByText(/upload lesson video/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop mp4 or webm video file/i)).toBeInTheDocument();
  });

  it("handles file selection, presigned URL request, progress tracking, and saves video", async () => {
    const onSaveVideo = vi.fn().mockResolvedValue(undefined);
    const mockFile = new File(["fake-video-bytes"], "lesson1.mp4", { type: "video/mp4" });

    vi.spyOn(uploadApi, "getPresignedUrl").mockResolvedValue({
      uploadUrl: "https://r2.cloudflarestorage.com/upload",
      fileUrl: "https://pub-r2.dev/videos/lesson1.mp4",
      key: "videos/lesson1.mp4",
      expiresIn: 3600,
    });

    vi.spyOn(uploadApi, "uploadDirectToR2").mockImplementation(async (url, file, onProgress) => {
      if (onProgress) onProgress(50);
      if (onProgress) onProgress(100);
    });

    render(<VideoUploader currentVideo={null} onSaveVideo={onSaveVideo} />);

    const fileInput = screen.getByTestId("video-file-input");
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(uploadApi.getPresignedUrl).toHaveBeenCalledWith({
        fileName: "lesson1.mp4",
        fileType: "video/mp4",
        fileSize: mockFile.size,
        folder: "videos",
      });
      expect(uploadApi.uploadDirectToR2).toHaveBeenCalled();
    });

    // Duration input
    const durationInput = screen.getByLabelText(/duration/i);
    fireEvent.change(durationInput, { target: { value: "360" } });

    const saveBtn = screen.getByRole("button", { name: /save video/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSaveVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          videoUrl: "https://pub-r2.dev/videos/lesson1.mp4",
          durationSeconds: 360,
        })
      );
    });
  });

  it("renders existing video info with replace option", async () => {
    const currentVideo = {
      id: "v-1",
      videoUrl: "https://pub-r2.dev/videos/existing.mp4",
      durationSeconds: 420,
    };

    render(<VideoUploader currentVideo={currentVideo} onSaveVideo={vi.fn()} />);

    expect(screen.getByText(/existing.mp4/i)).toBeInTheDocument();
    expect(screen.getAllByText(/7m 00s/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /replace video/i })).toBeInTheDocument();
  });
});
