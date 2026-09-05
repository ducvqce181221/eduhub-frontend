"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type {
  QuizDetail,
  QuizAttemptResult,
  QuizAttemptSummary,
  SubmitQuizAnswerPayload,
} from "@/types/api";
import { cn } from "@/lib/utils";

interface QuizViewProps {
  quiz: QuizDetail;
  latestAttempt?: QuizAttemptResult | QuizAttemptSummary | null;
  isLessonCompleted?: boolean;
  isSubmitting?: boolean;
  onSubmitAttempt: (answers: SubmitQuizAnswerPayload[]) => void;
  onRetry?: () => void;
  className?: string;
}

export function QuizView({
  quiz,
  latestAttempt,
  isLessonCompleted = false,
  isSubmitting = false,
  onSubmitAttempt,
  onRetry,
  className,
}: QuizViewProps) {
  // Store selected answer per question: { [questionId]: selectedAnswerId }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isRetrying, setIsRetrying] = useState(false);

  // Reset retry state when quiz changes
  React.useEffect(() => {
    setIsRetrying(false);
    setSelectedAnswers({});
  }, [quiz.id]);

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelectOption = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered) return;

    const payload: SubmitQuizAnswerPayload[] = Object.entries(selectedAnswers).map(
      ([questionId, selectedAnswerId]) => ({
        questionId,
        selectedAnswerId,
      }),
    );

    onSubmitAttempt(payload);
    setIsRetrying(false);
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setIsRetrying(true);
    onRetry?.();
  };

  // Render Result Screen if latestAttempt exists and we are not in retry mode
  if (latestAttempt && !isRetrying) {
    const isPassed = latestAttempt.isPassed;

    return (
      <div
        className={cn(
          "flex flex-col gap-6 p-6 sm:p-8 rounded-lg bg-surface border border-hairline shadow-notion-soft",
          className,
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant={isPassed ? "teal" : "secondary"}
                className={cn(
                  "text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1",
                  !isPassed && "bg-sticker-orange/15 text-sticker-orange-deep border-transparent",
                )}
              >
                {isPassed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Quiz Passed
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    Quiz Not Passed
                  </>
                )}
              </Badge>
              <span className="text-xs text-ink-muted tabular-nums">
                Required Pass Score: {latestAttempt.passScore}%
              </span>
            </div>
            <h3 className="text-xl font-bold text-ink">{quiz.title}</h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryQuiz}
            className="rounded-md border-hairline text-ink hover:bg-accent shrink-0 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Quiz</span>
          </Button>
        </div>

        {/* Score Summary Box */}
        <div className="grid sm:grid-cols-3 gap-4 p-5 rounded-md bg-canvas-soft border border-hairline">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">Your Score</span>
            <span className={cn("text-3xl font-bold font-mono tabular-nums tracking-tight", isPassed ? "text-sticker-teal" : "text-sticker-orange-deep")}>
              {latestAttempt.score}%
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">Earned Points</span>
            <span className="text-2xl font-semibold text-ink font-mono tabular-nums">
              {latestAttempt.earnedPoints} / {latestAttempt.totalPoints} points
            </span>
          </div>

          <div className="flex flex-col gap-1 justify-center">
            {isLessonCompleted || ("isLessonCompleted" in latestAttempt && latestAttempt.isLessonCompleted) ? (
              <span className="text-xs text-sticker-teal font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Lesson completion marked!
              </span>
            ) : isPassed ? (
              <span className="text-xs text-ink-muted leading-relaxed">
                Quiz requirement passed. Ensure you watch ≥90% of the video to complete this lesson.
              </span>
            ) : (
              <span className="text-xs text-ink-muted leading-relaxed">
                Score is below {latestAttempt.passScore}%. You can retake the quiz with unlimited attempts.
              </span>
            )}
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="pill"
            size="default"
            onClick={handleRetryQuiz}
            className="gap-2 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-6 sm:p-8 rounded-lg bg-surface border border-hairline shadow-notion-soft",
        className,
      )}
    >
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-sticker-teal/15 text-sticker-teal border-transparent font-medium flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Lesson Assessment
            </Badge>
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-canvas-soft border-hairline text-ink-secondary tabular-nums">
              Pass threshold: {quiz.passScore}%
            </Badge>
          </div>
          <h3 className="text-xl font-bold text-ink tracking-tight">{quiz.title}</h3>
          {quiz.description && (
            <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-2xl">
              {quiz.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-ink-muted tabular-nums">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        {questions.map((question, qIdx) => {
          const selectedOptionId = selectedAnswers[question.id];

          return (
            <div
              key={question.id}
              className="flex flex-col gap-3.5 p-5 rounded-md border border-hairline bg-surface shadow-2xs"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-sm sm:text-base font-semibold text-ink leading-snug">
                  <span className="text-notion-blue mr-2 font-mono">Q{qIdx + 1}.</span>
                  {question.content}
                </h4>
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5 bg-canvas-soft border-hairline text-ink-faint shrink-0 tabular-nums">
                  {question.points} {question.points === 1 ? "point" : "points"}
                </Badge>
              </div>

              {/* Answers Radio List */}
              <div className="flex flex-col gap-2 pt-1">
                {(question.answers || []).map((answer) => {
                  const isSelected = selectedOptionId === answer.id;

                  return (
                    <label
                      key={answer.id}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-md border text-xs sm:text-sm font-medium transition-all cursor-pointer select-none",
                        isSelected
                          ? "border-notion-blue bg-notion-blue/5 text-ink shadow-2xs ring-1 ring-notion-blue/30"
                          : "border-hairline bg-surface text-ink-secondary hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={answer.id}
                        checked={isSelected}
                        onChange={() => handleSelectOption(question.id, answer.id)}
                        className="w-4 h-4 text-notion-blue border-hairline focus:ring-notion-blue focus:ring-offset-0"
                      />
                      <span className="leading-snug">{answer.content}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-hairline">
          <p className="text-xs text-ink-muted">
            All answers are graded atomically upon submission per BR-QZ-04.
          </p>

          <Button
            type="submit"
            variant="pill"
            size="lg"
            disabled={!isAllAnswered || isSubmitting}
            className="w-full sm:w-auto px-8 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Grading Attempt...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Submit Quiz</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
