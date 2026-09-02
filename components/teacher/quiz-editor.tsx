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
      setQuestionError("Question text is required.");
      return;
    }

    if (newAnswers.some((a) => !a.content.trim())) {
      setQuestionError("All answer choices must have content.");
      return;
    }

    const correctCount = newAnswers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      setQuestionError("Exactly 1 answer must be selected as correct (BR-QZ-03).");
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
      setQuestionError(err.message || "Failed to add question");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <HelpCircle className="h-6 w-6 stroke-1" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-neutral-900">
          No quiz attached to this lesson
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Add an assessment quiz to test student mastery after completing the video.
        </p>
        <Button
          type="button"
          onClick={() => onCreateQuiz({ title: "Lesson Quiz", passScore: 80 })}
          className="mt-4 rounded-md bg-[#0075de] text-xs text-white hover:bg-[#005bab]"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create Quiz
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5">
        {/* Quiz Header & Pass Score */}
        <div className="flex flex-col gap-4 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-700">
              Quiz Title
            </label>
            <Input
              defaultValue={quiz.title}
              onBlur={(e) => onUpdateQuiz({ title: e.target.value.trim() })}
              className="mt-1 text-sm font-semibold"
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Pass Score (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                defaultValue={quiz.passScore}
                onBlur={handlePassScoreBlur}
                className="mt-1 h-9 w-24 text-xs font-medium"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteQuizDialog(true)}
              className="mt-5 rounded-md text-xs text-neutral-400 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Questions ({quiz.questions?.length || 0})
            </h4>

            {!isAddingQuestion && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddingQuestion(true)}
                className="rounded-md bg-[#0075de] text-xs text-white hover:bg-[#005bab]"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Question
              </Button>
            )}
          </div>

          {/* Existing Questions */}
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-3">
              {quiz.questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
                        {qIndex + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-neutral-900">
                          {q.content}
                        </h5>
                        <span className="text-[11px] font-medium text-neutral-400">
                          Weight: {q.points} pt{q.points > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingQuestionId(q.id)}
                      className="h-6 w-6 text-neutral-400 hover:text-rose-600"
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
                            ? "bg-emerald-50 text-emerald-900 font-medium"
                            : "text-neutral-600"
                        }`}
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            ans.isCorrect ? "text-emerald-600" : "text-neutral-300"
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
              <div className="rounded-lg border border-dashed border-neutral-200 py-6 text-center text-xs text-neutral-400">
                No questions added yet. Click &quot;Add Question&quot; to begin.
              </div>
            )
          )}

          {/* Add Question Form */}
          {isAddingQuestion && (
            <div className="rounded-xl border-2 border-[#0075de]/30 bg-sky-50/20 p-4">
              <h5 className="text-xs font-bold text-neutral-900">New Single-Choice Question</h5>

              {questionError && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-rose-50 p-2 text-xs text-rose-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{questionError}</span>
                </div>
              )}

              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="question-text" className="block text-xs font-medium text-neutral-700">
                    Question Text
                  </label>
                  <Input
                    id="question-text"
                    placeholder="e.g. What is RabbitMQ?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="mt-1 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">
                    Points
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={newQuestionPoints}
                    onChange={(e) => setNewQuestionPoints(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 h-8 w-24 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Answer Options (Choose 1 correct answer)
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
                          className="h-4 w-4 text-[#0075de] focus:ring-[#0075de]"
                        />
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={ans.content}
                          onChange={(e) => handleAnswerContentChange(idx, e.target.value)}
                          className="h-8 text-xs bg-white"
                        />
                        {newAnswers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-neutral-400 hover:text-rose-600"
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
                    className="mt-2 text-xs text-[#0075de] hover:bg-sky-50"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Choice
                  </Button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingQuestion(false)}
                    className="rounded-md border-neutral-200 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleSaveQuestion}
                    className="rounded-md bg-[#0075de] text-xs text-white hover:bg-[#005bab]"
                  >
                    {isSubmitting ? "Saving..." : "Save Question"}
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
        title="Delete Assessment Quiz?"
        confirmLabel="Delete Quiz"
        description={
          <>
            Are you sure you want to delete this quiz and all its questions? Student progress and attempts related to this quiz will be permanently removed.
          </>
        }
        onConfirm={onDeleteQuiz}
      />

      {/* Delete Question Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingQuestionId}
        onOpenChange={(open) => !open && setDeletingQuestionId(null)}
        variant="danger"
        title="Delete Question?"
        confirmLabel="Delete Question"
        description={
          <>
            Are you sure you want to remove this question?
          </>
        }
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
