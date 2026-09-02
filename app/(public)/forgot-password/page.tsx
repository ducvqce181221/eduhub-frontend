"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.post("/auth/forgot-password", {
        body: values,
        skipAuth: true,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      if (err?.statusCode === 429) {
        setErrorMessage("Too many requests. Please try again in a few minutes.");
      } else {
        setErrorMessage(err?.message || "Failed to process request. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RoleGuard guestOnly>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
        <Card className="w-full max-w-md border-hairline shadow-notion-soft bg-surface rounded-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-ink">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-ink-muted text-sm">
              Enter your email address and we&apos;ll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-sticker-teal/20 text-sticker-teal flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-ink">Check your email</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    If an account exists for <span className="font-semibold text-ink">{form.getValues("email")}</span>, you will receive password reset instructions shortly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-md bg-sticker-orange/10 border border-sticker-orange/20 flex items-start gap-2.5 text-sm text-sticker-orange-deep">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-sticker-orange" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-ink-secondary">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              autoComplete="email"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-9.5"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending instructions...
                        </>
                      ) : (
                        "Send Reset Instructions"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-sm text-ink-muted">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-medium text-notion-blue hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
