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

// Teacher & Course Builder Payloads
export interface CreateCoursePayload {
  title: string;
  categoryId: string;
  level: CourseLevel;
  description?: string;
  thumbnailUrl?: string;
}

export interface UpdateCoursePayload {
  title?: string;
  categoryId?: string;
  level?: CourseLevel;
  description?: string;
  thumbnailUrl?: string;
}

export interface CreateChapterPayload {
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateChapterPayload {
  title?: string;
  description?: string;
}

export interface ReorderItem {
  id: string;
  order: number;
}

export interface ReorderPayload {
  orders: ReorderItem[];
}

export interface CreateLessonPayload {
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
}

export interface UpsertVideoPayload {
  videoUrl: string;
  durationSeconds: number;
}

export interface CreateResourcePayload {
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface UpdateResourcePayload {
  name?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface CreateQuizPayload {
  title: string;
  description?: string;
  passScore?: number;
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string;
  passScore?: number;
}

export interface CreateQuizAnswerOption {
  content: string;
  isCorrect: boolean;
}

export interface CreateQuestionPayload {
  content: string;
  points?: number;
  answers: CreateQuizAnswerOption[];
}

export interface UpdateQuestionPayload {
  content?: string;
  points?: number;
  answers?: CreateQuizAnswerOption[];
}

// Media & Uploads
export interface GetPresignedUrlPayload {
  fileName: string;
  fileType: string;
  folder: "videos" | "resources";
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number;
}

export interface UploadImageResponse {
  url: string;
  publicId?: string;
}

// Analytics & Reports
export interface EnrolledStudentProgressItem {
  studentId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface CourseAggregateProgress {
  totalEnrollments: number;
  totalEnrolled?: number;
  totalLessons?: number;
  completedCount: number;
  averageProgressPercentage: number;
  activeStudentsCount?: number;
}

export interface CourseQuizStudentResult {
  studentId: string;
  fullName: string;
  email: string;
  quizId: string;
  quizTitle: string;
  attemptsCount: number;
  highestScore: number;
  isPassed: boolean;
  latestSubmittedAt: string;
}

export interface CourseQuizResultItem {
  lessonId?: string;
  lessonTitle?: string;
  quizId: string;
  quizTitle: string;
  passScore?: number;
  totalAttempts?: number;
  passRate?: number;
  averageScore?: number;
}

// Admin Management Interfaces
export interface QueryUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserListResponse {
  users: User[];
  meta: PaginationMeta;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
  isActive?: boolean;
}

export interface UpdateUserRolePayload {
  role: Role;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface SendSystemNotificationPayload {
  title: string;
  message: string;
}

export interface SystemNotificationResponse {
  success: boolean;
  message: string;
  recipientCount?: number;
}
