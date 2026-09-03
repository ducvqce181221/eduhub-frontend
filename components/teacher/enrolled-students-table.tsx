import React from "react";
import { Users, CheckCircle2, TrendingUp, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  EnrolledStudentProgressItem,
  CourseAggregateProgress,
} from "@/types/api";

interface EnrolledStudentsTableProps {
  students: EnrolledStudentProgressItem[];
  metrics: CourseAggregateProgress | null;
  isLoading?: boolean;
}

export function EnrolledStudentsTable({
  students,
  metrics,
  isLoading,
}: EnrolledStudentsTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#0075de]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Total Enrollments
                </p>
                <h3 className="text-2xl font-bold text-neutral-900">
                  {metrics.totalEnrollments ?? metrics.totalEnrolled ?? 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Completed Learners
                </p>
                <h3 className="text-2xl font-bold text-neutral-900">
                  {metrics.completedCount ?? 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Average Progress
                </p>
                <h3 className="text-2xl font-bold text-neutral-900">
                  {Math.round(metrics.averageProgressPercentage ?? 0)}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-neutral-200 bg-neutral-50/60 p-4">
          <h3 className="text-sm font-bold text-neutral-900">
            Enrolled Learners ({students.length})
          </h3>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            No students have enrolled in this course yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/40 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4">Lessons Completed</th>
                  <th className="py-3 px-4 w-48">Progress</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {students.map((student) => (
                  <tr
                    key={student.studentId}
                    className="transition hover:bg-neutral-50/60"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-full border border-neutral-200">
                          {student.avatarUrl ? (
                            <AvatarImage
                              src={student.avatarUrl}
                              alt={student.fullName}
                            />
                          ) : (
                            <AvatarFallback className="text-[11px] font-bold">
                              {getInitials(student.fullName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {student.fullName}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(student.enrolledAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 font-medium">
                      {student.completedLessons}/{student.totalLessons}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={student.progressPercentage}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-[11px] font-semibold text-neutral-700 w-9 text-right">
                          {Math.round(student.progressPercentage)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {student.isCompleted ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
