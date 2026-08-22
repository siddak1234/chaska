"use client";

/**
 * Last resort: a failure in the root layout itself, where neither the site
 * fonts nor `globals.css` are guaranteed to have loaded. Everything here is
 * inline for that reason.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          background: "#f7f3ea",
          color: "#1a1712",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "34px", fontWeight: 400, margin: 0 }}>
          Chaska is temporarily unavailable
        </h1>
        <p style={{ margin: 0, fontSize: "16px", lineHeight: "28px" }}>
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            cursor: "pointer",
            border: 0,
            background: "#1a1712",
            color: "#f7f3ea",
            padding: "12px 22px",
            font: "700 12px/20px ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
