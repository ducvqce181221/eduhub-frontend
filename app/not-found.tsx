import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";

export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale}>
      <head>
        <title>404 — Page Not Found | EduHub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: "24px",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#f6f5f4",
          color: "#000000",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            backgroundColor: "#ffffff",
            border: "1px solid #e6e6e6",
            borderRadius: "24px",
            padding: "48px 40px",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.01), 0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
          }}
        >
          {/* Left: Giant 404 */}
          <div
            style={{
              fontSize: "160px",
              fontWeight: 800,
              fontFamily: "monospace",
              color: "rgba(0, 0, 0, 0.08)",
              lineHeight: 1,
              userSelect: "none",
              textAlign: "center",
              flex: "1 1 240px",
            }}
          >
            404
          </div>

          {/* Right: Text & Actions */}
          <div
            style={{
              flex: "1 1 340px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                margin: 0,
                color: "#000000",
              }}
            >
              Page Not Found
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#615d59",
                lineHeight: 1.6,
                margin: 0,
                maxWidth: "380px",
              }}
            >
              This page couldn’t be found. It looks like it was moved, renamed, or never existed on EduHub.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <Link
                href={`/${defaultLocale}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 24px",
                  borderRadius: "9999px",
                  backgroundColor: "#0075de",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Back to Home
              </Link>
              <Link
                href={`/${defaultLocale}/courses`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  border: "1px solid #e6e6e6",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
