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
import { useTranslation } from "@/lib/i18n/language-context";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/admin";
import type { Category, CreateCategoryPayload } from "@/types/api";

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
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
      toast.success(t.admin.categoryCreatedSuccess);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || t.admin.categoryCreateFailed);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success(t.admin.categoryUpdatedSuccess);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingCategory(null);
    },
    onError: (err: any) => {
      toast.error(err.message || t.admin.categoryUpdateFailed);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success(t.admin.categoryDeletedSuccess);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeletingCategory(null);
    },
    onError: (err: any) => {
      toast.error(err.message || t.admin.categoryDeleteFailed);
    },
  });

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const hiddenCategories = categories.filter((c) => !c.isActive).length;

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title={t.admin.categoryManagementTitle}
        breadcrumb={t.admin.categoryManagementBreadcrumb}
      />

      <div className="flex-1 space-y-6 p-6 sm:p-8 pb-16 sm:pb-20">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {t.admin.courseCategories}
            </h2>
            <p className="text-xs text-ink-muted">
              {t.admin.courseCategoriesSubtitle}
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium gap-1.5 shadow-notion-soft transition-colors h-9 px-4"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.admin.createCategory}
          </Button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                <FolderTree className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {t.admin.totalCategories}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {totalCategories}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-teal/15 border border-sticker-teal/20 text-sticker-teal dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {t.admin.activeCategories}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {activeCategories}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                <EyeOff className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {t.admin.hiddenCategories}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
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
