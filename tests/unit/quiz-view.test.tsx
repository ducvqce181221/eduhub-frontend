import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizView } from "@/components/learn/quiz-view";
import type { QuizDetail, QuizAttemptResult } from "@/types/api";

const mockQuiz: QuizDetail = {
  id: "quiz-1",
  lessonId: "les-1",
  title: "NestJS Architecture Knowledge Check",
  description: "Answer all questions to complete the quiz requirement (Pass threshold: 80%).",
  passScore: 80,
  questions: [
    {
      id: "q-1",
      content: "What pattern does NestJS utilize for dependency inversion?",
      points: 1,
      order: 1,
      answers: [
        { id: "a-1", content: "Dependency Injection" },
        { id: "a-2", content: "Active Record" },
      ],
    },
    {
      id: "q-2",
      content: "Which decorator denotes an injectable service in NestJS?",
      points: 1,
      order: 2,
      answers: [
        { id: "a-3", content: "@Injectable()" },
        { id: "a-4", content: "@Service()" },
      ],
    },
  ],
};

const mockPassedAttemptResult: QuizAttemptResult = {
  attemptId: "att-1",
  quizId: "quiz-1",
  earnedPoints: 2,
  totalPoints: 2,
  score: 100,
  passScore: 80,
  isPassed: true,
  isLessonCompleted: true,
  submittedAt: new Date().toISOString(),
};

describe("QuizView Component", () => {
  it("renders quiz title, passing threshold, and questions list", () => {
    render(
      <QuizView
        quiz={mockQuiz}
        isLessonCompleted={false}
        onSubmitAttempt={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText("NestJS Architecture Knowledge Check")).toBeInTheDocument();
    expect(screen.getAllByText(/Pass threshold: 80%/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("What pattern does NestJS utilize for dependency inversion?")).toBeInTheDocument();
    expect(screen.getByText("Dependency Injection")).toBeInTheDocument();
  });

  it("submits quiz answers when all questions are answered", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <QuizView
        quiz={mockQuiz}
        isLessonCompleted={false}
        onSubmitAttempt={handleSubmit}
        isSubmitting={false}
      />,
    );

    // Select answers
    const option1 = screen.getByLabelText("Dependency Injection");
    const option2 = screen.getByLabelText("@Injectable()");

    await user.click(option1);
    await user.click(option2);

    const submitBtn = screen.getByRole("button", { name: /Submit Quiz/i });
    await user.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith([
      { questionId: "q-1", selectedAnswerId: "a-1" },
      { questionId: "q-2", selectedAnswerId: "a-3" },
    ]);
  });

  it("renders result card with score and pass status when latestAttempt is provided", () => {
    render(
      <QuizView
        quiz={mockQuiz}
        latestAttempt={mockPassedAttemptResult}
        isLessonCompleted={true}
        onSubmitAttempt={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText("Quiz Passed")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 2 points/i)).toBeInTheDocument();
  });

  it("provides 'Retry Quiz' action and clears state when clicked (BR-QZ-04)", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    render(
      <QuizView
        quiz={mockQuiz}
        latestAttempt={mockPassedAttemptResult}
        isLessonCompleted={true}
        onSubmitAttempt={vi.fn()}
        onRetry={handleRetry}
        isSubmitting={false}
      />,
    );

    const retryBtn = screen.getAllByRole("button", { name: /Retry Quiz/i })[0];
    await user.click(retryBtn);

    expect(handleRetry).toHaveBeenCalled();
  });
});
