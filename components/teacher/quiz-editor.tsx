import React, { useState } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslation } from "@/lib/i18n/language-context";
import type {
  QuizDetail,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
} from "@/types/api";

interface QuizEditorProps {
  quiz: QuizDetail | null;
  onCreateQuiz: (payload: CreateQuizPayload) => Promise<void>;
  onUpdateQuiz: (payload: UpdateQuizPayload) => Promise<void>;
  onDeleteQuiz: () => Promise<void>;
  onAddQuestion: (payload: CreateQuestionPayload) => Promise<void>;
  onUpdateQuestion: (questionId: string, payload: any) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
}

export function QuizEditor({
  quiz,
  onCreateQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: QuizEditorProps) {
  const { t } = useTranslation();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionPoints, setNewQuestionPoints] = useState(1);
  const [newAnswers, setNewAnswers] = useState([
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
  ]);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [showDeleteQuizDialog, setShowDeleteQuizDialog] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  // Handle Pass Score update
  const handlePassScoreBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (!quiz) return;
    const score = Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 80));
    await onUpdateQuiz({ passScore: score });
  };

  // Add answer option
  const handleAddOption = () => {
    setNewAnswers((prev) => [...prev, { content: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (newAnswers.length <= 2) return;
    setNewAnswers((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure at least one is correct
      if (!updated.some((a) => a.isCorrect) && updated.length > 0) {
        updated[0].isCorrect = true;
      }
      return updated;
    });
  };

  const handleSelectCorrect = (index: number) => {
    setNewAnswers((prev) =>
      prev.map((a, i) => ({
        ...a,
        isCorrect: i === index,
      }))
    );
  };

  const handleAnswerContentChange = (index: number, content: string) => {
    setNewAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, content } : a))
    );
  };

  const handleSaveQuestion = async () => {
    if (!newQuestionText.trim()) {
      setQuestionError(t.teacher.errQuestionRequired);
      return;
    }

    if (newAnswers.some((a) => !a.content.trim())) {
      setQuestionError(t.teacher.errAnswersRequired);
      return;
    }

    const correctCount = newAnswers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      setQuestionError(t.teacher.errExactOneCorrect);
      return;
    }

    try {
      setIsSubmitting(true);
      setQuestionError(null);
      await onAddQuestion({
        content: newQuestionText.trim(),
        points: newQuestionPoints > 0 ? newQuestionPoints : 1,
        answers: newAnswers.map((a) => ({
          content: a.content.trim(),
          isCorrect: a.isCorrect,
        })),
      });

      // Reset
      setNewQuestionText("");
      setNewQuestionPoints(1);
      setNewAnswers([
        { content: "", isCorrect: true },
        { content: "", isCorrect: false },
      ]);
      setIsAddingQuestion(false);
    } catch (err: any) {
      setQuestionError(err.message || t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-surface p-8 text-center shadow-notion-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas-soft text-ink-muted border border-hairline">
          <HelpCircle className="h-6 w-6 stroke-1" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-ink">
          {t.teacher.noQuizAttached}
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          {t.teacher.noQuizAttachedDesc}
        </p>
        <Button
          type="button"
          onClick={() => onCreateQuiz({ title: "Lesson Quiz", passScore: 80 })}
          className="mt-4 rounded-md bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {t.teacher.createQuizButton}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 rounded-lg border border-hairline bg-surface p-5 shadow-notion-soft">
        {/* Quiz Header & Pass Score */}
        <div className="flex flex-col gap-4 border-b border-hairline pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ink">
              {t.teacher.quizTitleLabel}
            </label>
            <Input
              defaultValue={quiz.title}
              onBlur={(e) => onUpdateQuiz({ title: e.target.value.trim() })}
              className="mt-1 text-sm font-semibold bg-surface border-hairline"
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink">
                {t.teacher.passScoreLabel}
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                defaultValue={quiz.passScore}
                onBlur={handlePassScoreBlur}
                className="mt-1 h-9 w-24 text-xs font-medium bg-surface border-hairline font-mono tabular-nums"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteQuizDialog(true)}
              className="mt-5 rounded-md text-xs text-ink-muted hover:text-sticker-red hover:bg-canvas-soft cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted font-mono tabular-nums">
              {t.teacher.questionsCountHeader.replace("{count}", String(quiz.questions?.length || 0))}
            </h4>

            {!isAddingQuestion && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddingQuestion(true)}
                className="rounded-md bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t.teacher.addQuestion}
              </Button>
            )}
          </div>

          {/* Existing Questions */}
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-3">
              {quiz.questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="rounded-md border border-hairline bg-canvas-soft/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface border border-hairline text-xs font-bold text-ink shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-ink">
                          {q.content}
                        </h5>
                        <span className="text-[11px] font-mono tabular-nums text-ink-muted">
                          {t.teacher.questionWeightLabel.replace("{points}", String(q.points))}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingQuestionId(q.id)}
                      className="h-6 w-6 text-ink-muted hover:text-sticker-red hover:bg-canvas-soft cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Answers list */}
                  <div className="mt-3 space-y-1.5 pl-7">
                    {q.answers.map((ans) => (
                      <div
                        key={ans.id}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                          ans.isCorrect
                            ? "bg-sticker-teal/15 dark:bg-teal-500/15 text-sticker-teal dark:text-teal-300 font-medium"
                            : "text-ink-secondary"
                        }`}
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${
                            ans.isCorrect ? "text-sticker-teal dark:text-teal-400" : "text-ink-faint"
                          }`}
                        />
                        <span>{ans.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isAddingQuestion && (
              <div className="rounded-md border border-dashed border-hairline py-6 text-center text-xs text-ink-muted">
                {t.teacher.noQuestionsAddedYet}
              </div>
            )
          )}

          {/* Add Question Form */}
          {isAddingQuestion && (
            <div className="rounded-md border border-hairline bg-canvas-soft/70 p-4 space-y-3">
              <h5 className="text-xs font-bold text-ink">{t.teacher.newQuestionHeader}</h5>

              {questionError && (
                <div className="flex items-center gap-2 rounded-md bg-sticker-red/15 p-2 text-xs text-sticker-red border border-transparent">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{questionError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label htmlFor="question-text" className="block text-xs font-medium text-ink">
                    {t.teacher.questionTextLabel}
                  </label>
                  <Input
                    id="question-text"
                    placeholder={t.teacher.questionTextPlaceholder}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="mt-1 text-xs bg-surface border-hairline"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink">
                    {t.teacher.pointsLabel}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={newQuestionPoints}
                    onChange={(e) => setNewQuestionPoints(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 h-8 w-24 text-xs bg-surface border-hairline font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    {t.teacher.answerOptionsPrompt}
                  </label>
                  <div className="space-y-2">
                    {newAnswers.map((ans, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-answer"
                          aria-label="Correct answer"
                          checked={ans.isCorrect}
                          onChange={() => handleSelectCorrect(idx)}
                          className="h-4 w-4 text-notion-blue focus:ring-notion-blue border-hairline"
                        />
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={ans.content}
                          onChange={(e) => handleAnswerContentChange(idx, e.target.value)}
                          className="h-8 text-xs bg-surface border-hairline"
                        />
                        {newAnswers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-ink-muted hover:text-sticker-red p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2 text-xs text-notion-blue hover:bg-notion-blue/5 cursor-pointer"
                  >
                    <Plus className="mr-1 h-3 w-3" /> {t.teacher.addChoiceButton}
                  </Button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingQuestion(false)}
                    className="rounded-md border-hairline text-xs font-medium text-ink-secondary hover:bg-canvas-soft cursor-pointer"
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleSaveQuestion}
                    className="rounded-md bg-notion-blue text-xs font-semibold text-white hover:bg-notion-blue-active shadow-2xs cursor-pointer"
                  >
                    {isSubmitting ? t.common.saving : t.teacher.saveQuestionButton}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Quiz Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteQuizDialog}
        onOpenChange={setShowDeleteQuizDialog}
        variant="danger"
        title={t.teacher.deleteQuizTitle}
        confirmLabel={t.teacher.deleteQuizConfirm}
        description={t.teacher.deleteQuizDesc}
        onConfirm={onDeleteQuiz}
      />

      {/* Delete Question Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingQuestionId}
        onOpenChange={(open) => !open && setDeletingQuestionId(null)}
        variant="danger"
        title={t.teacher.deleteQuestionTitle}
        confirmLabel={t.teacher.deleteQuestionConfirm}
        description={t.teacher.deleteQuestionDesc}
        onConfirm={async () => {
          if (deletingQuestionId) {
            const id = deletingQuestionId;
            setDeletingQuestionId(null);
            await onDeleteQuestion(id);
          }
        }}
      />
    </>
  );
}
