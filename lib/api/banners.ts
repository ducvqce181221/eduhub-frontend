import { apiClient } from "./client";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerPayload {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface UpdateBannerPayload {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface ReorderBannersPayload {
  orders: { id: string; order: number }[];
}

export async function getActiveBanners(): Promise<Banner[]> {
  const res = await apiClient.get<Banner[]>("/banners");
  return res.data || [];
}

export async function getAllBanners(): Promise<Banner[]> {
  const res = await apiClient.get<Banner[]>("/admin/banners");
  return res.data || [];
}

export async function createBanner(payload: CreateBannerPayload): Promise<Banner> {
  const res = await apiClient.post<Banner>("/admin/banners", payload);
  return res.data;
}

export async function updateBanner(
  id: string,
  payload: UpdateBannerPayload
): Promise<Banner> {
  const res = await apiClient.patch<Banner>(`/admin/banners/${id}`, payload);
  return res.data;
}

export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/admin/banners/${id}`);
}

export async function reorderBanners(
  payload: ReorderBannersPayload
): Promise<Banner[]> {
  const res = await apiClient.patch<Banner[]>("/admin/banners/reorder", payload);
  return res.data || [];
}
