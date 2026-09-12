"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/language-context";
import type { Course, CourseQuizStudentResult, CourseQuizResultItem } from "@/types/api";

interface QuizAnalyticsViewProps {
  quizResults: (CourseQuizStudentResult | CourseQuizResultItem | any)[];
  course?: Course | null;
  isLoading?: boolean;
}

export function QuizAnalyticsView({
  quizResults,
  course,
}: QuizAnalyticsViewProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  // Map quizId to Lesson information from course structure
  const quizToLessonMap = useMemo(() => {
    const map = new Map<string, { lessonTitle: string; passScore: number }>();
    if (course?.chapters) {
      for (const chapter of course.chapters) {
        if (chapter.lessons) {
          for (const lesson of chapter.lessons) {
            if (lesson.quiz) {
              map.set(lesson.quiz.id, {
                lessonTitle: lesson.title,
                passScore: lesson.quiz.passScore || 80,
              });
            }
          }
        }
      }
    }
    return map;
  }, [course]);

  // Aggregate student attempts into Quiz-level summaries
  const aggregatedQuizzes = useMemo(() => {
    const quizMap = new Map<
      string,
      {
        quizId: string;
        quizTitle: string;
        lessonTitle: string;
        passScore: number;
        totalAttempts: number;
        totalStudents: number;
        passedStudents: number;
        scoreSum: number;
      }
    >();

    for (const item of quizResults) {
      const qId = item.quizId;
      if (!qId) continue;

      const lessonInfo = quizToLessonMap.get(qId);
      const lessonTitle = item.lessonTitle || lessonInfo?.lessonTitle || "Assessment Quiz";
      const passScore = item.passScore || lessonInfo?.passScore || 80;

      const existing = quizMap.get(qId);
      const attempts = Number(item.attemptsCount || item.totalAttempts || 1);
      const score = Number(item.highestScore ?? item.averageScore ?? 0);
      const isPassed = item.isPassed ?? (score >= passScore);

      if (!existing) {
        quizMap.set(qId, {
          quizId: qId,
          quizTitle: item.quizTitle || "Lesson Quiz",
          lessonTitle,
          passScore,
          totalAttempts: attempts,
          totalStudents: item.studentId ? 1 : (item.totalStudents || 1),
          passedStudents: isPassed ? 1 : 0,
          scoreSum: score,
        });
      } else {
        existing.totalAttempts += attempts;
        existing.totalStudents += 1;
        if (isPassed) existing.passedStudents += 1;
        existing.scoreSum += score;
      }
    }

    return Array.from(quizMap.values()).map((q) => {
      const passRate = q.totalStudents > 0 ? (q.passedStudents / q.totalStudents) * 100 : 0;
      const averageScore = q.totalStudents > 0 ? q.scoreSum / q.totalStudents : 0;
      return {
        ...q,
        passRate: Math.min(100, Math.max(0, passRate)),
        averageScore: Math.min(100, Math.max(0, averageScore)),
      };
    });
  }, [quizResults, quizToLessonMap]);

  // Filter individual student attempts for table
  const filteredStudentAttempts = useMemo(() => {
    const isStudentFormat = quizResults.some((r) => r.studentId || r.fullName);
    if (!isStudentFormat) return [];

    return quizResults.filter((r) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchName = r.fullName?.toLowerCase().includes(term);
      const matchEmail = r.email?.toLowerCase().includes(term);
      const matchQuiz = r.quizTitle?.toLowerCase().includes(term);
      return matchName || matchEmail || matchQuiz;
    });
  }, [quizResults, searchTerm]);

  // Overall metric statistics
  const overallStats = useMemo(() => {
    if (aggregatedQuizzes.length === 0) return { totalAttempts: 0, avgScore: 0, avgPassRate: 0 };
    const totalAttempts = aggregatedQuizzes.reduce((acc, q) => acc + q.totalAttempts, 0);
    const avgScore =
      aggregatedQuizzes.reduce((acc, q) => acc + q.averageScore, 0) / aggregatedQuizzes.length;
    const avgPassRate =
      aggregatedQuizzes.reduce((acc, q) => acc + q.passRate, 0) / aggregatedQuizzes.length;
    return {
      totalAttempts,
      avgScore: Math.round(avgScore * 10) / 10,
      avgPassRate: Math.round(avgPassRate),
    };
  }, [aggregatedQuizzes]);

  if (quizResults.length === 0) {
    return (
      <div className="rounded-lg border border-hairline bg-surface p-12 text-center shadow-notion-soft">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
          <HelpCircle className="h-5 w-5 stroke-1" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-ink">
          {t.teacher.noQuizResults}
        </h3>
        <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
          {t.teacher.noQuizResultsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-notion-blue/10 text-notion-blue border border-notion-blue/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">{t.teacher.totalQuizAttempts}</p>
              <h4 className="text-2xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                {overallStats.totalAttempts}
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sticker-teal/15 text-sticker-teal border border-sticker-teal/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">{t.teacher.averagePassRate}</p>
              <h4 className="text-2xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                {overallStats.avgPassRate}%
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sticker-purple/25 text-sticker-purple-deep border border-sticker-purple/40">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">{t.teacher.averageScore}</p>
              <h4 className="text-2xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                {overallStats.avgScore}%
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Performance Summary Table */}
      <div className="rounded-lg border border-hairline bg-surface shadow-notion-soft overflow-hidden">
        <div className="border-b border-hairline bg-canvas-soft/60 p-4">
          <h3 className="text-sm font-semibold text-ink">
            {t.teacher.quizPerformanceBreakdown.replace("{count}", String(aggregatedQuizzes.length))}
          </h3>
          <p className="text-xs text-ink-muted">
            {t.teacher.quizPerformanceDesc}
          </p>
        </div>

        <Table className="border-0 rounded-none">
          <TableHeader>
            <TableRow>
              <TableHead>{t.teacher.tableQuizLesson}</TableHead>
              <TableHead>{t.teacher.tablePassThreshold}</TableHead>
              <TableHead>{t.teacher.tableTotalAttempts}</TableHead>
              <TableHead className="w-44">{t.teacher.tablePassRate}</TableHead>
              <TableHead className="text-right">{t.teacher.tableAverageScore}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aggregatedQuizzes.map((item) => (
              <TableRow key={item.quizId}>
                <TableCell>
                  <div>
                    <p className="font-medium text-ink">
                      {item.quizTitle}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {t.teacher.lessonPrefix.replace("{title}", item.lessonTitle)}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="text-ink font-mono tabular-nums">
                  {item.passScore}%
                </TableCell>

                <TableCell className="text-ink font-mono tabular-nums">
                  {item.totalAttempts === 1
                    ? t.teacher.attemptSingle.replace("{count}", String(item.totalAttempts))
                    : t.teacher.attemptPlural.replace("{count}", String(item.totalAttempts))}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={item.passRate}
                      className="h-1.5 flex-1"
                    />
                    <span className="text-[11px] font-semibold text-ink w-10 text-right font-mono tabular-nums">
                      {Math.round(item.passRate)}%
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right font-semibold text-ink font-mono tabular-nums">
                  {Math.round(item.averageScore * 10) / 10}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Individual Student Submissions Breakdown (if student details are present) */}
      {filteredStudentAttempts.length > 0 && (
        <div className="rounded-lg border border-hairline bg-surface shadow-notion-soft overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-hairline bg-canvas-soft/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {t.teacher.studentAttemptsHeader.replace("{count}", String(filteredStudentAttempts.length))}
              </h3>
              <p className="text-xs text-ink-muted">
                {t.teacher.studentAttemptsDesc}
              </p>
            </div>

            <div className="w-full sm:w-64">
              <SearchInput
                placeholder={t.teacher.searchStudentOrQuiz}
                value={searchTerm}
                onSearch={setSearchTerm}
                size="sm"
              />
            </div>
          </div>

          <Table className="border-0 rounded-none">
            <TableHeader>
              <TableRow>
                <TableHead>{t.teacher.tableStudent}</TableHead>
                <TableHead>{t.course.quiz}</TableHead>
                <TableHead className="text-center">{t.teacher.tableHeaderAttempts}</TableHead>
                <TableHead className="text-center">{t.teacher.tableHeaderHighestScore}</TableHead>
                <TableHead className="text-right">{t.teacher.tableHeaderResult}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudentAttempts.map((attempt, index) => {
                const isPassed = attempt.isPassed;
                return (
                  <TableRow key={`${attempt.studentId || index}_${attempt.quizId}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-ink">
                          {attempt.fullName || t.teacher.tableStudent}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {attempt.email || ""}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-ink font-medium">
                      {attempt.quizTitle}
                    </TableCell>

                    <TableCell className="text-center text-ink-muted font-mono tabular-nums">
                      {attempt.attemptsCount || 1}
                    </TableCell>

                    <TableCell className="text-center font-semibold text-ink font-mono tabular-nums">
                      {attempt.highestScore ?? 0}%
                    </TableCell>

                    <TableCell className="text-right">
                      {isPassed ? (
                        <Badge
                          variant="secondary"
                          className="bg-sticker-teal/15 text-sticker-teal border-transparent font-medium gap-1 text-[11px]"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {t.teacher.resultPassed}
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-transparent font-medium gap-1 text-[11px]"
                        >
                          <XCircle className="h-3 w-3" />
                          {t.teacher.resultFailed}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
