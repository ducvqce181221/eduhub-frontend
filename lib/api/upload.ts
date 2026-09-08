import { apiClient } from "./client";
import type {
  GetPresignedUrlPayload,
  PresignedUrlResponse,
  UploadImageResponse,
  CheckDuplicatePayload,
  CheckDuplicateResponse,
} from "@/types/api";

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadImageResponse>("/upload/image", formData);
  return response.data;
}

export async function getPresignedUrl(
  payload: GetPresignedUrlPayload
): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<PresignedUrlResponse>(
    "/upload/presigned-url",
    payload
  );
  return response.data;
}

export async function checkDuplicateAsset(
  payload: CheckDuplicatePayload
): Promise<CheckDuplicateResponse> {
  const response = await apiClient.post<CheckDuplicateResponse>(
    "/upload/check-duplicate",
    payload
  );
  return response.data;
}

export async function getPreviewUrl(url: string): Promise<string> {
  try {
    const response = await apiClient.post<{ previewUrl: string }>(
      "/upload/preview-url",
      { url }
    );
    return response.data?.previewUrl || url;
  } catch {
    return url;
  }
}

export async function uploadDirectToR2(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (typeof XMLHttpRequest !== "undefined") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          const detail = xhr.responseText ? `: ${xhr.responseText}` : "";
          reject(new Error(`Upload failed with status ${xhr.status}${detail}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  }

  // Fallback to fetch
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const detail = errorText ? `: ${errorText}` : "";
    throw new Error(`Upload failed with status ${response.status}${detail}`);
  }

  if (onProgress) onProgress(100);
}
