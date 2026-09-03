"use client";

import React from "react";
import { Folder, Pencil, Trash2, CheckCircle2, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-[#f6f5f4] text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-xs text-neutral-400"
                >
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-xs text-neutral-400"
                >
                  No course categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="transition-colors hover:bg-neutral-50/70"
                >
                  {/* Category Name */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-[#0075de]">
                        <Folder className="h-4 w-4" />
                      </div>
                      <span>{category.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                    {category.slug}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate">
                    {category.description || (
                      <span className="text-neutral-400 italic">No description</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {category.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-300">
                        <EyeOff className="h-3 w-3 text-neutral-400" />
                        Hidden
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`edit-category-${category.id}`}
                        onClick={() => onEditCategory(category)}
                        className="h-7 rounded-md px-2 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100"
                      >
                        <Pencil className="mr-1 h-3 w-3 text-neutral-500" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`delete-category-${category.id}`}
                        onClick={() => onDeleteCategory(category)}
                        className="h-7 rounded-md px-2 text-[11px] font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
