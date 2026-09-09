"use client";

import React from "react";
import { Folder, Pencil, Trash2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/language-context";
import type { Category } from "@/types/api";

interface CategoriesTableProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  isLoading?: boolean;
}

export function CategoriesTable({
  categories,
  onEditCategory,
  onDeleteCategory,
  isLoading = false,
}: CategoriesTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-notion-soft">
      <Table className="border-0 rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>{t.admin.columnCategory}</TableHead>
            <TableHead>{t.admin.columnSlug}</TableHead>
            <TableHead>{t.admin.columnDescription}</TableHead>
            <TableHead>{t.admin.columnStatus}</TableHead>
            <TableHead className="text-right">{t.admin.columnActions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-12 text-center text-xs text-ink-muted"
              >
                {t.admin.loadingCategories}
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-12 text-center text-xs text-ink-muted"
              >
                {t.admin.noCategoriesFound}
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className="transition-colors hover:bg-canvas-soft/50"
              >
                {/* Category Name */}
                <TableCell className="font-medium text-ink">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                      <Folder className="h-3.5 w-3.5" />
                    </div>
                    <span>{category.name}</span>
                  </div>
                </TableCell>

                {/* Slug */}
                <TableCell className="font-mono text-[11px] text-ink-muted">
                  {category.slug}
                </TableCell>

                {/* Description */}
                <TableCell className="text-ink-secondary text-xs max-w-xs truncate">
                  {category.description || (
                    <span className="text-ink-muted italic">{t.admin.noDescription}</span>
                  )}
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  {category.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-[11px] font-medium text-sticker-teal border border-sticker-teal/20 dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15">
                      <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal dark:bg-teal-400" />
                      {t.common.active}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-0.5 text-[11px] font-medium text-ink-muted border border-hairline">
                      <EyeOff className="h-3 w-3 text-ink-muted" />
                      {t.common.inactive}
                    </span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`edit-category-${category.id}`}
                      onClick={() => onEditCategory(category)}
                      className="h-7 rounded-md px-2 text-[11px] font-medium text-ink border-hairline hover:bg-canvas-soft"
                    >
                      <Pencil className="mr-1 h-3 w-3 text-ink-muted" />
                      {t.common.edit}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`delete-category-${category.id}`}
                      onClick={() => onDeleteCategory(category)}
                      className="h-7 rounded-md px-2 text-[11px] font-medium text-rose-600 border-hairline hover:bg-rose-500/10 hover:border-rose-300"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {t.common.delete}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
