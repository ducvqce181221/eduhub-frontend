import React from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherCoursesHeaderProps {
  totalCourses: number;
  onNewCourse: () => void;
}

export function TeacherCoursesHeader({
  totalCourses,
  onNewCourse,
}: TeacherCoursesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            My Courses
          </h1>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200">
            {totalCourses} total
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your curriculum, edit course content, upload videos, and track learner performance.
        </p>
      </div>

      <div>
        <Button
          onClick={onNewCourse}
          className="inline-flex items-center gap-2 rounded-full bg-[#0075de] px-5 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-[#005bab] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Button>
      </div>
    </div>
  );
}
