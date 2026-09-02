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
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <HelpCircle className="h-6 w-6 stroke-1" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-neutral-900">
          No quiz results available
        </h3>
        <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto">
          When enrolled students attempt the assessment quizzes attached to your lessons, their submissions, highest scores, and pass rates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[#0075de]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Total Quiz Attempts</p>
              <h4 className="text-xl font-bold text-neutral-900">{overallStats.totalAttempts}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Average Pass Rate</p>
              <h4 className="text-xl font-bold text-neutral-900">{overallStats.avgPassRate}%</h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Average Score</p>
              <h4 className="text-xl font-bold text-neutral-900">{overallStats.avgScore}%</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Performance Summary Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-neutral-200 bg-neutral-50/60 p-4">
          <h3 className="text-sm font-bold text-neutral-900">
            Quiz Performance Breakdown ({aggregatedQuizzes.length})
          </h3>
          <p className="text-xs text-neutral-500">
            Aggregated pass rates, attempts, and average scores per lesson assessment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/40 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Quiz / Lesson</th>
                <th className="py-3 px-4">Pass Threshold</th>
                <th className="py-3 px-4">Total Attempts</th>
                <th className="py-3 px-4 w-44">Pass Rate</th>
                <th className="py-3 px-4 text-right">Average Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {aggregatedQuizzes.map((item) => (
                <tr
                  key={item.quizId}
                  className="transition hover:bg-neutral-50/60"
                >
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {item.quizTitle}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Lesson: {item.lessonTitle}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-700 font-medium">
                    {item.passScore}%
                  </td>

                  <td className="py-3.5 px-4 text-neutral-700 font-medium">
                    {item.totalAttempts} {item.totalAttempts === 1 ? "attempt" : "attempts"}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.passRate}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-[11px] font-semibold text-neutral-700 w-10 text-right">
                        {Math.round(item.passRate)}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-neutral-900">
                    {Math.round(item.averageScore * 10) / 10}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Submissions Breakdown (if student details are present) */}
      {filteredStudentAttempts.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-neutral-200 bg-neutral-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Student Assessment Attempts ({filteredStudentAttempts.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Individual student test scores, attempt count, and pass status.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Search student or quiz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/40 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Quiz</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-4 text-center">Highest Score</th>
                  <th className="py-3 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredStudentAttempts.map((attempt, index) => {
                  const isPassed = attempt.isPassed;
                  return (
                    <tr
                      key={`${attempt.studentId || index}_${attempt.quizId}`}
                      className="transition hover:bg-neutral-50/60"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {attempt.fullName || "Student"}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {attempt.email || ""}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-neutral-800">
                        {attempt.quizTitle}
                      </td>

                      <td className="py-3 px-4 text-center text-neutral-600 font-medium">
                        {attempt.attemptsCount || 1}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-neutral-900">
                        {attempt.highestScore ?? 0}%
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isPassed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
