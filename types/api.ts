export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseTeacher {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface LessonVideo {
  id: string;
  videoUrl: string;
  durationSeconds: number;
  createdAt?: string;
}

export interface LessonResource {
  id: string;
  name: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
}

export interface LessonQuiz {
  id: string;
  title: string;
  passScore: number;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  chapterId?: string;
  video?: LessonVideo | null;
  resources?: LessonResource[];
  quiz?: LessonQuiz | null;
  _count?: {
    resources?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  courseId?: string;
  lessons: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  level: CourseLevel;
  status: CourseStatus;
  categoryId: string;
  category: Category;
  teacherId: string;
  teacher: CourseTeacher;
  chapters?: Chapter[];
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    chapters?: number;
    enrollments?: number;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  course?: Course;
}

export interface QueryCoursesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  level?: CourseLevel | string;
  search?: string;
}

export interface CoursesListResponse {
  items: Course[];
  meta: PaginationMeta;
}

export interface QuizAnswer {
  id: string;
  content: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId?: string;
  content: string;
  points: number;
  order: number;
  answers: QuizAnswer[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizDetail {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  passScore: number;
  questions: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitQuizAnswerPayload {
  questionId: string;
  selectedAnswerId: string;
}

export interface SubmitQuizAttemptPayload {
  answers: SubmitQuizAnswerPayload[];
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  earnedPoints: number;
  totalPoints: number;
  score: number;
  passScore: number;
  isPassed: boolean;
  isLessonCompleted: boolean;
  submittedAt: string;
}

export interface QuizAttemptSummary {
  id: string;
  score: number;
  passScore: number;
  isPassed: boolean;
  earnedPoints: number;
  totalPoints: number;
  startedAt?: string;
  submittedAt: string;
}

export interface LessonProgressResponse {
  id?: string;
  studentId?: string;
  lessonId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface CourseProgressResponse {
  courseId: string;
  status: EnrollmentStatus;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedLessonIds: string[];
  enrolledAt?: string;
  completedAt?: string | null;
}

export interface EnrolledCourseItem {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  course: Course;
}
