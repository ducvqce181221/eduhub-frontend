import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle, Sparkles, Video, Compass, Award, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-canvas-soft">
      {/* Daylight Hero Section */}
      <section className="w-full py-18 md:py-26 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold text-notion-blue shadow-notion-soft">
            <Sparkles className="w-3.5 h-3.5 text-notion-blue" />
            <span>EduHub Learning Workspace</span>
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink tracking-tighter leading-none mb-6">
          Think, learn, and grow <br className="hidden sm:inline" />
          <span className="text-ink-muted">all in one place.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto mb-9 leading-relaxed">
          The connected learning management system where students master skills through high-definition video streaming, interactive quizzes, and atomic progress tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="pill"
            asChild
          >
            <Link href="/courses">
              Explore Courses
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="rounded-full px-7 h-11"
            asChild
          >
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Notion Sticker Feature Cards Grid */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Cloud Video */}
          <div className="p-7 rounded-xl bg-surface border border-hairline shadow-notion-soft flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-sticker-sky/20 flex items-center justify-center text-notion-blue-active mb-4">
              <Video className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-ink">
                Cloud Video Streaming
              </h3>
              <Badge variant="sky" className="text-xs px-2 py-0">HD</Badge>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Adaptive video playback powered by Cloudflare R2 infrastructure with instant seek and zero buffering.
            </p>
          </div>

          {/* Card 2: Quizzes & Assessment */}
          <div className="p-7 rounded-xl bg-surface border border-hairline shadow-notion-soft flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-sticker-teal/20 flex items-center justify-center text-sticker-teal mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-ink">
                Instant Assessments
              </h3>
              <Badge variant="teal" className="text-xs px-2 py-0">Atomic</Badge>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Single-choice quizzes graded instantly on the backend with atomic transactions and detailed score summaries.
            </p>
          </div>

          {/* Card 3: 90% Mastery Threshold */}
          <div className="p-7 rounded-xl bg-surface border border-hairline shadow-notion-soft flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-sticker-purple/35 flex items-center justify-center text-sticker-purple-deep mb-4">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-ink">
                90% Mastery Tracker
              </h3>
              <Badge variant="purple" className="text-xs px-2 py-0">BR-PRG-01</Badge>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Heartbeat progress synchronization strictly conforming to pedagogical mastery criteria across lessons.
            </p>
          </div>
        </div>
      </section>

      {/* Signature Deep Indigo Hero Band (Preview Section) */}
      <section className="w-full mt-6 py-14 px-4 sm:px-6 lg:px-8 bg-notion-indigo text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-white/10 text-white border-white/20 px-3 py-1">
            Enterprise Grade Architecture
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
            Build, publish, and teach with confidence.
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Manage your courses with atomic publish checklists, drag-and-drop curriculum builder, and real-time learner analytics.
          </p>
          <Button
            size="lg"
            variant="pill"
            className="px-8 shadow-md"
            asChild
          >
            <Link href="/register">Start Teaching Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
