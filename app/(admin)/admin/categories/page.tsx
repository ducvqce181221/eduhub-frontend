"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderTree, CheckCircle2, EyeOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/admin/categories/delete-category-dialog";
import { Button } from "@/components/ui/button";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/admin";
import type { Category, CreateCategoryPayload } from "@/types/api";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Fetch all categories (including inactive)
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getCategories(false),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingCategory(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeletingCategory(null);
    },
  });

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const hiddenCategories = categories.filter((c) => !c.isActive).length;

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="Category Management"
        breadcrumb="Administration / Categories"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Course Categories
            </h2>
            <p className="text-xs text-neutral-500">
              Organize educational domains, topics, and catalog tags across the platform.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white px-4 py-2 text-xs font-semibold shadow-2xs transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#0075de]">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Total Categories
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {totalCategories}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Active
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {activeCategories}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <EyeOff className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Hidden
                </p>
                <h3 className="text-xl font-bold text-neutral-900">
                  {hiddenCategories}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <CategoriesTable
          categories={categories}
          isLoading={isLoading}
          onEditCategory={(cat) => setEditingCategory(cat)}
          onDeleteCategory={(cat) => setDeletingCategory(cat)}
        />
      </div>

      {/* Create Dialog */}
      <CategoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
      />

      {/* Edit Dialog */}
      <CategoryFormDialog
        open={!!editingCategory}
        category={editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSubmit={async (payload) => {
          if (editingCategory) {
            await updateMutation.mutateAsync({
              id: editingCategory.id,
              payload,
            });
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        open={!!deletingCategory}
        category={deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirm={async (id) => {
          await deleteMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}
