"use client";

import React from "react";
import { ErrorStatusView } from "@/components/common/error-status-view";
import { useTranslation } from "@/lib/i18n/language-context";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <ErrorStatusView
      code="404"
      title={t.notFound.title}
      description={t.notFound.description}
      backButtonLabel={t.notFound.goBack}
      primaryActionLabel={t.notFound.backToHome}
      primaryActionHref="/"
    />
  );
}
