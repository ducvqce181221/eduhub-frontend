import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizEditor } from "@/components/teacher/quiz-editor";
import type { QuizDetail } from "@/types/api";

const mockQuizDetail: QuizDetail = {
  id: "q-1",
  lessonId: "les-1",
  title: "Module 1 Assessment",
  description: "Check your knowledge on microservices",
  passScore: 80,
  questions: [
    {
      id: "qn-1",
      content: "What protocol does NestJS microservice use by default?",
      points: 10,
      order: 1,
      answers: [
        { id: "ans-1", content: "TCP", isCorrect: true },
        { id: "ans-2", content: "HTTP", isCorrect: false },
      ],
    },
  ],
};

describe("QuizEditor (FR-Q01 - FR-Q03, BR-QZ-02, BR-QZ-03)", () => {
  it("renders empty quiz state with create button when no quiz exists", async () => {
    const onCreateQuiz = vi.fn();
    const user = userEvent.setup();

    render(<QuizEditor quiz={null} onCreateQuiz={onCreateQuiz} onUpdateQuiz={vi.fn()} onDeleteQuiz={vi.fn()} onAddQuestion={vi.fn()} onUpdateQuestion={vi.fn()} onDeleteQuestion={vi.fn()} />);

    expect(screen.getByText(/no quiz attached to this lesson/i)).toBeInTheDocument();
    const createBtn = screen.getByRole("button", { name: /create quiz/i });
    await user.click(createBtn);
    expect(onCreateQuiz).toHaveBeenCalled();
  });

  it("renders existing quiz with pass score and question list", () => {
    render(<QuizEditor quiz={mockQuizDetail} onCreateQuiz={vi.fn()} onUpdateQuiz={vi.fn()} onDeleteQuiz={vi.fn()} onAddQuestion={vi.fn()} onUpdateQuestion={vi.fn()} onDeleteQuestion={vi.fn()} />);

    expect(screen.getByDisplayValue("Module 1 Assessment")).toBeInTheDocument();
    expect(screen.getByDisplayValue("80")).toBeInTheDocument();
    expect(screen.getByText("What protocol does NestJS microservice use by default?")).toBeInTheDocument();
    expect(screen.getByText("TCP")).toBeInTheDocument();
    expect(screen.getByText("HTTP")).toBeInTheDocument();
  });

  it("submits new question with validated answers (BR-QZ-03)", async () => {
    const onAddQuestion = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<QuizEditor quiz={mockQuizDetail} onCreateQuiz={vi.fn()} onUpdateQuiz={vi.fn()} onDeleteQuiz={vi.fn()} onAddQuestion={onAddQuestion} onUpdateQuestion={vi.fn()} onDeleteQuestion={vi.fn()} />);

    const addQuestionBtn = screen.getByRole("button", { name: /add question/i });
    await user.click(addQuestionBtn);

    const questionInput = screen.getByLabelText(/question text/i);
    await user.type(questionInput, "What is RabbitMQ?");

    const optionInputs = screen.getAllByPlaceholderText(/option/i);
    await user.type(optionInputs[0], "Message Broker");
    await user.type(optionInputs[1], "Relational Database");

    // Select the first radio option as correct
    const correctRadios = screen.getAllByRole("radio", { name: /correct answer/i });
    await user.click(correctRadios[0]);

    const saveQuestionBtn = screen.getByRole("button", { name: /save question/i });
    await user.click(saveQuestionBtn);

    await waitFor(() => {
      expect(onAddQuestion).toHaveBeenCalledWith({
        content: "What is RabbitMQ?",
        points: 1,
        answers: [
          { content: "Message Broker", isCorrect: true },
          { content: "Relational Database", isCorrect: false },
        ],
      });
    });
  });
});
