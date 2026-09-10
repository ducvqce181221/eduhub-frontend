import React from "react";
import { Users, CheckCircle2, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/language-context";
import { formatShortDate } from "@/lib/i18n/formatters";
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
  const { t, language } = useTranslation();

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
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-notion-blue shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t.teacher.totalEnrollmentsMetric}
                </p>
                <h3 className="text-2xl font-bold text-ink font-mono tabular-nums">
                  {metrics.totalEnrollments ?? metrics.totalEnrolled ?? 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sticker-teal/15 text-sticker-teal border border-transparent shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t.teacher.completedLearnersMetric}
                </p>
                <h3 className="text-2xl font-bold text-ink font-mono tabular-nums">
                  {metrics.completedCount ?? 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sticker-purple/25 text-sticker-purple-deep border border-sticker-purple/40 shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t.teacher.averageProgressMetric}
                </p>
                <h3 className="text-2xl font-bold text-ink font-mono tabular-nums">
                  {Math.round(metrics.averageProgressPercentage ?? 0)}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      <div className="rounded-lg border border-hairline bg-surface shadow-notion-soft overflow-hidden">
        <div className="border-b border-hairline bg-canvas-soft/70 px-4 py-3">
          <h3 className="text-sm font-bold text-ink">
            {t.teacher.enrolledLearnersHeader.replace(
              "{count}",
              String(students.length)
            )}
          </h3>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            {t.teacher.noStudentsEnrolledYet}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.teacher.tableStudent}</TableHead>
                <TableHead>{t.teacher.tableEnrolledDate}</TableHead>
                <TableHead>{t.teacher.tableLessonsCompleted}</TableHead>
                <TableHead className="w-48">{t.teacher.tableProgress}</TableHead>
                <TableHead>{t.teacher.tableStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-full border border-hairline">
                        {student.avatarUrl ? (
                          <AvatarImage
                            src={student.avatarUrl}
                            alt={student.fullName}
                          />
                        ) : (
                          <AvatarFallback className="text-[11px] font-bold bg-canvas-soft text-ink">
                            {getInitials(student.fullName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">
                          {student.fullName}
                        </p>
                        <p className="text-[11px] text-ink-muted truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-ink-muted font-mono tabular-nums">
                    {formatShortDate(student.enrolledAt, language)}
                  </TableCell>

                  <TableCell className="text-ink font-medium font-mono tabular-nums">
                    {student.completedLessons}/{student.totalLessons}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={student.progressPercentage}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-[11px] font-semibold text-ink w-9 text-right font-mono tabular-nums">
                        {Math.round(student.progressPercentage)}%
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {student.isCompleted ? (
                      <Badge
                        variant="secondary"
                        className="bg-sticker-teal/15 text-sticker-teal border-transparent font-medium"
                      >
                        {t.teacher.statusCompleted}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-sticker-sky/15 text-sticker-sky-deep border-transparent font-medium"
                      >
                        {t.teacher.statusInProgress}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
