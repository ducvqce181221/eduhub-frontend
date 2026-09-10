import { redirect } from "next/navigation";

export default async function EnrollmentsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/me/enrollments`);
}
