import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api/client";
import {
  getMyCourses,
  createCourse,
  updateCourse,
  publishCourse,
  unpublishCourse,
  archiveCourse,
  getCourseStudents,
  getCourseProgressMetrics,
  getCourseQuizResults,
} from "@/lib/api/teacher";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  upsertLessonVideo,
  createLessonResource,
  updateLessonResource,
  deleteLessonResource,
  createLessonQuiz,
  updateLessonQuiz,
  deleteLessonQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@/lib/api/curriculum";
import {
  uploadImage,
  getPresignedUrl,
  uploadDirectToR2,
} from "@/lib/api/upload";

describe("Teacher API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Teacher Courses API (lib/api/teacher.ts)", () => {
    it("getMyCourses calls GET /me/courses and returns array", async () => {
      const mockData = [{ id: "c-1", title: "Course 1", status: "DRAFT" }];
      vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockData });

      const result = await getMyCourses();
      expect(apiClient.get).toHaveBeenCalledWith("/me/courses");
      expect(result).toEqual(mockData);
    });

    it("createCourse calls POST /courses with payload", async () => {
      const payload = { title: "New Course", categoryId: "cat-1", level: "BEGINNER" as const };
      const mockCreated = { id: "c-new", slug: "new-course-123456", ...payload };
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: mockCreated });

      const result = await createCourse(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/courses", payload);
      expect(result).toEqual(mockCreated);
    });

    it("updateCourse calls PATCH /courses/:id with payload", async () => {
      const payload = { title: "Updated Title" };
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "c-1", ...payload } });

      const result = await updateCourse("c-1", payload);
      expect(apiClient.patch).toHaveBeenCalledWith("/courses/c-1", payload);
      expect(result.title).toBe("Updated Title");
    });

    it("publishCourse calls PATCH /courses/:id/publish", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "c-1", status: "PUBLISHED" } });

      const result = await publishCourse("c-1");
      expect(apiClient.patch).toHaveBeenCalledWith("/courses/c-1/publish");
      expect(result.status).toBe("PUBLISHED");
    });

    it("unpublishCourse calls PATCH /courses/:id/unpublish", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "c-1", status: "DRAFT" } });

      const result = await unpublishCourse("c-1");
      expect(apiClient.patch).toHaveBeenCalledWith("/courses/c-1/unpublish");
      expect(result.status).toBe("DRAFT");
    });

    it("archiveCourse calls PATCH /courses/:id/archive", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "c-1", status: "ARCHIVED" } });

      const result = await archiveCourse("c-1");
      expect(apiClient.patch).toHaveBeenCalledWith("/courses/c-1/archive");
      expect(result.status).toBe("ARCHIVED");
    });

    it("getCourseStudents calls GET /courses/:id/students", async () => {
      const mockStudents = [
        { studentId: "s-1", fullName: "John Doe", email: "john@example.com", enrolledAt: "2026-09-01", completedLessons: 3, totalLessons: 5, progressPercentage: 60, isCompleted: false },
      ];
      vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockStudents });

      const result = await getCourseStudents("c-1");
      expect(apiClient.get).toHaveBeenCalledWith("/courses/c-1/students");
      expect(result).toEqual(mockStudents);
    });

    it("getCourseProgressMetrics calls GET /courses/:id/progress", async () => {
      const mockProgress = { totalEnrollments: 10, completedCount: 4, averageProgressPercentage: 65 };
      vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockProgress });

      const result = await getCourseProgressMetrics("c-1");
      expect(apiClient.get).toHaveBeenCalledWith("/courses/c-1/progress");
      expect(result).toEqual(mockProgress);
    });

    it("getCourseQuizResults calls GET /courses/:id/quiz-results", async () => {
      const mockQuizResults = [
        { lessonId: "l-1", lessonTitle: "Intro", quizId: "q-1", quizTitle: "Quiz 1", passScore: 80, totalAttempts: 15, passRate: 86.6, averageScore: 88.5 },
      ];
      vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockQuizResults });

      const result = await getCourseQuizResults("c-1");
      expect(apiClient.get).toHaveBeenCalledWith("/courses/c-1/quiz-results");
      expect(result).toEqual(mockQuizResults);
    });
  });

  describe("Curriculum API (lib/api/curriculum.ts)", () => {
    it("manages chapter lifecycle and reordering", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: { id: "ch-1", title: "Chapter 1" } });
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "ch-1", title: "Renamed" } });
      vi.spyOn(apiClient, "delete").mockResolvedValue({ success: true, data: { id: "ch-1" } });

      await createChapter("c-1", { title: "Chapter 1" });
      expect(apiClient.post).toHaveBeenCalledWith("/courses/c-1/chapters", { title: "Chapter 1" });

      await updateChapter("ch-1", { title: "Renamed" });
      expect(apiClient.patch).toHaveBeenCalledWith("/chapters/ch-1", { title: "Renamed" });

      await deleteChapter("ch-1");
      expect(apiClient.delete).toHaveBeenCalledWith("/chapters/ch-1");

      await reorderChapters("c-1", { orders: [{ id: "ch-1", order: 1 }, { id: "ch-2", order: 2 }] });
      expect(apiClient.patch).toHaveBeenCalledWith("/courses/c-1/chapters/reorder", {
        orders: [{ id: "ch-1", order: 1 }, { id: "ch-2", order: 2 }],
      });
    });

    it("manages lesson lifecycle and reordering", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: { id: "les-1", title: "Lesson 1" } });
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "les-1", title: "Lesson 1 Renamed" } });
      vi.spyOn(apiClient, "delete").mockResolvedValue({ success: true, data: { id: "les-1" } });

      await createLesson("ch-1", { title: "Lesson 1" });
      expect(apiClient.post).toHaveBeenCalledWith("/chapters/ch-1/lessons", { title: "Lesson 1" });

      await updateLesson("les-1", { title: "Lesson 1 Renamed" });
      expect(apiClient.patch).toHaveBeenCalledWith("/lessons/les-1", { title: "Lesson 1 Renamed" });

      await deleteLesson("les-1");
      expect(apiClient.delete).toHaveBeenCalledWith("/lessons/les-1");

      await reorderLessons("ch-1", { orders: [{ id: "les-1", order: 1 }, { id: "les-2", order: 2 }] });
      expect(apiClient.patch).toHaveBeenCalledWith("/chapters/ch-1/lessons/reorder", {
        orders: [{ id: "les-1", order: 1 }, { id: "les-2", order: 2 }],
      });
    });

    it("upserts lesson video metadata", async () => {
      vi.spyOn(apiClient, "put").mockResolvedValue({
        success: true,
        data: { id: "v-1", videoUrl: "https://r2.dev/video.mp4", durationSeconds: 300 },
      });

      const result = await upsertLessonVideo("les-1", { videoUrl: "https://r2.dev/video.mp4", durationSeconds: 300 });
      expect(apiClient.put).toHaveBeenCalledWith("/lessons/les-1/video", {
        videoUrl: "https://r2.dev/video.mp4",
        durationSeconds: 300,
      });
      expect(result.durationSeconds).toBe(300);
    });

    it("manages lesson resources", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: { id: "res-1", name: "Doc.pdf" } });
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "res-1", name: "Doc Renamed.pdf" } });
      vi.spyOn(apiClient, "delete").mockResolvedValue({ success: true, data: { id: "res-1" } });

      await createLessonResource("les-1", { name: "Doc.pdf", fileUrl: "https://r2.dev/doc.pdf" });
      expect(apiClient.post).toHaveBeenCalledWith("/lessons/les-1/resources", {
        name: "Doc.pdf",
        fileUrl: "https://r2.dev/doc.pdf",
      });

      await updateLessonResource("res-1", { name: "Doc Renamed.pdf" });
      expect(apiClient.patch).toHaveBeenCalledWith("/resources/res-1", { name: "Doc Renamed.pdf" });

      await deleteLessonResource("res-1");
      expect(apiClient.delete).toHaveBeenCalledWith("/resources/res-1");
    });

    it("manages lesson quiz and questions", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: { id: "q-1", title: "Quiz 1", passScore: 80 } });
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: { id: "q-1", passScore: 90 } });
      vi.spyOn(apiClient, "delete").mockResolvedValue({ success: true, data: { id: "q-1" } });

      await createLessonQuiz("les-1", { title: "Quiz 1", passScore: 80 });
      expect(apiClient.post).toHaveBeenCalledWith("/lessons/les-1/quiz", { title: "Quiz 1", passScore: 80 });

      await updateLessonQuiz("q-1", { passScore: 90 });
      expect(apiClient.patch).toHaveBeenCalledWith("/quizzes/q-1", { passScore: 90 });

      await deleteLessonQuiz("q-1");
      expect(apiClient.delete).toHaveBeenCalledWith("/quizzes/q-1");

      const questionPayload = {
        content: "What is NestJS?",
        points: 5,
        answers: [
          { content: "A TypeScript framework", isCorrect: true },
          { content: "A database", isCorrect: false },
        ],
      };
      await createQuizQuestion("q-1", questionPayload);
      expect(apiClient.post).toHaveBeenCalledWith("/quizzes/q-1/questions", questionPayload);

      await updateQuizQuestion("qn-1", { content: "Updated Question" });
      expect(apiClient.patch).toHaveBeenCalledWith("/questions/qn-1", { content: "Updated Question" });

      await deleteQuizQuestion("qn-1");
      expect(apiClient.delete).toHaveBeenCalledWith("/questions/qn-1");
    });
  });

  describe("Upload API (lib/api/upload.ts)", () => {
    it("uploadImage calls POST /upload/image with FormData", async () => {
      const mockFile = new File(["test-image"], "thumb.png", { type: "image/png" });
      vi.spyOn(apiClient, "post").mockResolvedValue({
        success: true,
        data: { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" },
      });

      const result = await uploadImage(mockFile);
      expect(apiClient.post).toHaveBeenCalled();
      expect(result.url).toContain("cloudinary.com");
    });

    it("getPresignedUrl calls POST /upload/presigned-url", async () => {
      const mockPresigned = {
        uploadUrl: "https://r2.cloudflarestorage.com/upload",
        fileUrl: "https://pub-r2.dev/video.mp4",
        key: "videos/video.mp4",
        expiresIn: 3600,
      };
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: mockPresigned });

      const result = await getPresignedUrl({ fileName: "video.mp4", fileType: "video/mp4", folder: "videos" });
      expect(apiClient.post).toHaveBeenCalledWith("/upload/presigned-url", {
        fileName: "video.mp4",
        fileType: "video/mp4",
        folder: "videos",
      });
      expect(result.uploadUrl).toBe(mockPresigned.uploadUrl);
    });

    it("uploadDirectToR2 uploads binary file to presigned URL with progress", async () => {
      const mockFile = new File(["dummy-video-content"], "lesson1.mp4", { type: "video/mp4" });
      const onProgress = vi.fn();

      const mockXHR = {
        open: vi.fn(),
        setRequestHeader: vi.fn(),
        send: vi.fn(function (this: any) {
          if (this.upload?.onprogress) {
            this.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
          }
          this.status = 200;
          this.onload?.();
        }),
        upload: {
          onprogress: null as any,
        },
        onload: null as any,
        onerror: null as any,
        status: 200,
      };

      function MockXHR() {
        return mockXHR;
      }

      const originalXHR = global.XMLHttpRequest;
      global.XMLHttpRequest = MockXHR as any;

      await uploadDirectToR2("https://r2.cloudflarestorage.com/upload", mockFile, onProgress);

      expect(mockXHR.open).toHaveBeenCalledWith("PUT", "https://r2.cloudflarestorage.com/upload");
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith("Content-Type", "video/mp4");
      expect(mockXHR.send).toHaveBeenCalledWith(mockFile);
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);

      global.XMLHttpRequest = originalXHR;
    });
  });
});
