import { redirect } from "next/navigation";

export default function MeCoursesRedirect() {
  redirect("/teacher/courses");
}
