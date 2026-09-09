import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  type CreateBannerPayload,
  type UpdateBannerPayload,
  type ReorderBannersPayload,
} from "@/lib/api/banners";
import { toast } from "sonner";

export const BANNER_QUERY_KEYS = {
  active: ["banners", "active"] as const,
  all: ["banners", "all"] as const,
};

export function useActiveBannersQuery() {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.active,
    queryFn: getActiveBanners,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllBannersQuery(enabled = true) {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.all,
    queryFn: getAllBanners,
    enabled,
  });
}

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBannerPayload) => createBanner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.active });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all });
      toast.success("Banner created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create banner");
    },
  });
}

export function useUpdateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBannerPayload }) =>
      updateBanner(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.active });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all });
      toast.success("Banner updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update banner");
    },
  });
}

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.active });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all });
      toast.success("Banner deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete banner");
    },
  });
}

export function useReorderBannersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderBannersPayload) => reorderBanners(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.active });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.all });
      toast.success("Banners reordered successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reorder banners");
    },
  });
}
