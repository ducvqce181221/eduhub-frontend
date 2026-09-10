import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DuplicateAssetDialog } from "@/components/teacher/duplicate-asset-dialog";
import { ExternalUrlDialog } from "@/components/teacher/external-url-dialog";
import { AssetLibraryDialog } from "@/components/teacher/asset-library-dialog";
import { ResourcesManager } from "@/components/teacher/resources-manager";
import * as mediaAssetsApi from "@/lib/api/media-assets";
import * as uploadApi from "@/lib/api/upload";
import type { MediaAsset, LessonResource } from "@/types/api";

describe("Media Assets Frontend Dialogs & Components", () => {
  const mockAsset: MediaAsset = {
    id: "asset-123",
    uploaderId: "teacher-1",
    name: "Architectural Diagram.pdf",
    fileUrl: "https://pub-r2.dev/resources/arch.pdf",
    fileType: "application/pdf",
    fileSize: 1048576, // 1MB
    durationSeconds: null,
    source: "R2_UPLOAD",
    mediaType: "DOCUMENT",
    contentHash: "abcdef1234567890",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  };

  describe("DuplicateAssetDialog", () => {
    it("renders duplicate warning and offers Use Existing vs Upload Anyway", async () => {
      const user = userEvent.setup();
      const onUseExisting = vi.fn();
      const onUploadAnyway = vi.fn();
      const onClose = vi.fn();

      render(
        <DuplicateAssetDialog
          isOpen={true}
          onClose={onClose}
          existingAsset={mockAsset}
          newFileName="New_Upload.pdf"
          onUseExisting={onUseExisting}
          onUploadAnyway={onUploadAnyway}
        />
      );

      expect(screen.getByText("Duplicate File Detected")).toBeInTheDocument();
      expect(screen.getByText(/Architectural Diagram\.pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/Incoming: New_Upload\.pdf/i)).toBeInTheDocument();
      expect(screen.getByText("09/01/2026")).toBeInTheDocument();

      const useExistingBtn = screen.getByRole("button", { name: /use existing asset/i });
      const uploadAnywayBtn = screen.getByRole("button", { name: /upload anyway/i });

      await user.click(useExistingBtn);
      expect(onUseExisting).toHaveBeenCalled();

      await user.click(uploadAnywayBtn);
      expect(onUploadAnyway).toHaveBeenCalled();
    });
  });

  describe("ExternalUrlDialog", () => {
    it("validates external URL and submits verified link", async () => {
      const user = userEvent.setup();
      const onAddExternal = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      vi.spyOn(mediaAssetsApi, "createExternalAsset").mockResolvedValue({
        id: "asset-ext-1",
        uploaderId: "teacher-1",
        name: "React Docs",
        fileUrl: "https://react.dev",
        fileType: "text/html",
        fileSize: null,
        durationSeconds: null,
        source: "EXTERNAL_URL",
        mediaType: "DOCUMENT",
        contentHash: null,
        createdAt: "2026-09-01T10:00:00.000Z",
        updatedAt: "2026-09-01T10:00:00.000Z",
      });

      render(
        <ExternalUrlDialog
          isOpen={true}
          onClose={onClose}
          mediaType="DOCUMENT"
          onAddExternal={onAddExternal}
        />
      );

      expect(screen.getByText(/Add External Resource Link/i)).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText(/e\.g\. Official Documentation Guide/i);
      const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com\/resource/i);
      const submitBtn = screen.getByRole("button", { name: /verify & attach/i });

      await user.type(nameInput, "React Docs");
      await user.type(urlInput, "https://react.dev");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mediaAssetsApi.createExternalAsset).toHaveBeenCalledWith({
          name: "React Docs",
          url: "https://react.dev",
          mediaType: "DOCUMENT",
          durationSeconds: undefined,
        });
        expect(onAddExternal).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("AssetLibraryDialog", () => {
    it("renders assets list and allows attaching selected asset", async () => {
      const user = userEvent.setup();
      const onSelectAsset = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      vi.spyOn(mediaAssetsApi, "getMediaAssets").mockResolvedValue({
        items: [mockAsset],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });

      render(
        <AssetLibraryDialog
          isOpen={true}
          onClose={onClose}
          mediaType="DOCUMENT"
          onSelectAsset={onSelectAsset}
        />
      );

      expect(screen.getByText("Select from Asset Library")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Architectural Diagram.pdf")).toBeInTheDocument();
        expect(screen.getByText("09/01/2026")).toBeInTheDocument();
      });

      // Click the asset card to select
      await user.click(screen.getByText("Architectural Diagram.pdf"));

      const attachBtn = screen.getByRole("button", { name: /attach to lesson/i });
      expect(attachBtn).not.toBeDisabled();
      await user.click(attachBtn);

      await waitFor(() => {
        expect(onSelectAsset).toHaveBeenCalledWith(mockAsset, "Architectural Diagram.pdf");
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("ResourcesManager", () => {
    it("renders external resources with badge and local resources with file size", () => {
      const resources: LessonResource[] = [
        {
          id: "res-1",
          lessonId: "les-1",
          name: "Course Cheat Sheet.pdf",
          fileUrl: "https://pub-r2.dev/resources/cheat.pdf",
          fileType: "application/pdf",
          fileSize: 204800, // 200 KB
          isExternal: false,
        },
        {
          id: "res-2",
          lessonId: "les-1",
          name: "MDN Web Docs Reference",
          fileUrl: "https://developer.mozilla.org",
          fileType: "text/html",
          fileSize: null,
          isExternal: true,
        },
      ];

      render(
        <ResourcesManager
          resources={resources}
          onAddResource={vi.fn()}
          onDeleteResource={vi.fn()}
        />
      );

      expect(screen.getByText("Downloadable Resources (2)")).toBeInTheDocument();
      expect(screen.getByText("Course Cheat Sheet.pdf")).toBeInTheDocument();
      expect(screen.getByText("200.0 KB")).toBeInTheDocument();

      expect(screen.getByText("MDN Web Docs Reference")).toBeInTheDocument();
      expect(screen.getByText("External Link")).toBeInTheDocument();

      expect(screen.getByRole("button", { name: /upload file/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /from library/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add link/i })).toBeInTheDocument();
    });

    it("detects duplicate file on upload and attaches existing asset when confirmed", async () => {
      const user = userEvent.setup();
      const onAttachFromLibrary = vi.fn().mockResolvedValue(undefined);
      const onAddResource = vi.fn();

      vi.spyOn(uploadApi, "checkDuplicateAsset").mockResolvedValue({
        isDuplicate: true,
        existingAsset: mockAsset,
      });

      const { container } = render(
        <ResourcesManager
          resources={[]}
          onAddResource={onAddResource}
          onDeleteResource={vi.fn()}
          onAttachFromLibrary={onAttachFromLibrary}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = new File(["duplicate-content"], "Architectural Diagram.pdf", {
        type: "application/pdf",
      });

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText("Duplicate File Detected")).toBeInTheDocument();
      });

      const useExistingBtn = screen.getByRole("button", { name: /use existing asset/i });
      await user.click(useExistingBtn);

      await waitFor(() => {
        expect(onAttachFromLibrary).toHaveBeenCalledWith("asset-123", "Architectural Diagram.pdf");
      });
    });
  });
});
