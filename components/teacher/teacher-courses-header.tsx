import React from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/language-context";

interface TeacherCoursesHeaderProps {
  totalCourses: number;
  onNewCourse: () => void;
}

export function TeacherCoursesHeader({
  totalCourses,
  onNewCourse,
}: TeacherCoursesHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t.teacher.myCourses}
          </h1>
          <span className="inline-flex items-center rounded-full bg-canvas-soft px-2.5 py-0.5 text-xs font-medium text-ink-secondary border border-hairline tabular-nums">
            {t.teacher.totalCoursesBadge.replace("{count}", String(totalCourses))}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {t.teacher.manageCoursesSubtitle}
        </p>
      </div>

      <div>
        <Button
          variant="pill"
          size="default"
          onClick={onNewCourse}
          className="gap-1.5 px-5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{t.teacher.newCourseBtn}</span>
        </Button>
      </div>
    </div>
  );
}
