import { apiClient } from "./client";
import type {
  MediaAsset,
  PaginationMeta,
  QueryMediaAssetsParams,
  CreateExternalAssetPayload,
} from "@/types/api";

export interface MediaAssetsListResponse {
  items: MediaAsset[];
  meta?: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}


export async function getMediaAssets(
  params?: QueryMediaAssetsParams
): Promise<MediaAssetsListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) query.append("search", params.search);
  if (params?.mediaType) query.append("mediaType", params.mediaType);
  if (params?.source) query.append("source", params.source);

  const queryString = query.toString();
  const url = queryString ? `/media-assets?${queryString}` : "/media-assets";

  const response = await apiClient.get<MediaAssetsListResponse>(url);
  return response.data;
}

export async function createExternalAsset(
  payload: CreateExternalAssetPayload
): Promise<MediaAsset> {
  const response = await apiClient.post<MediaAsset>("/media-assets/external", payload);
  return response.data;
}

export async function getMediaAsset(id: string): Promise<MediaAsset> {
  const response = await apiClient.get<MediaAsset>(`/media-assets/${id}`);
  return response.data;
}

export async function deleteMediaAsset(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/media-assets/${id}`);
  return response.data;
}
