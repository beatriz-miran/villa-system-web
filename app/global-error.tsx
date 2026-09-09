"use client";

import Link from "next/link";
import {
  type CSSProperties,
  useEffect,
} from "react";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  retry: () => void;
};

const bodyStyle: CSSProperties = {
  margin: 0,
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  boxSizing: "border-box",
  backgroundColor: "#F8FAFC",
  color: "#111827",
  fontFamily: "Arial, sans-serif",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "500px",
  padding: "32px",
  boxSizing: "border-box",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  backgroundColor: "#FFFFFF",
  textAlign: "center",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const iconStyle: CSSProperties = {
  width: "56px",
  height: "56px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9999px",
  backgroundColor: "#FEF2F2",
  color: "#DC2626",
  fontSize: "28px",
  fontWeight: "bold",
};

const actionsStyle: CSSProperties = {
  marginTop: "24px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "12px",
};

const buttonStyle: CSSProperties = {
  border: 0,
  borderRadius: "6px",
  padding: "11px 16px",
  backgroundColor: "#1B3B32",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const linkStyle: CSSProperties = {
  border: "1px solid #D1D5DB",
  borderRadius: "6px",
  padding: "10px 16px",
  backgroundColor: "#FFFFFF",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
};

export default function GlobalError({
  error,
  retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(
      "Erro global inesperado:",
      error
    );
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={bodyStyle}>
        <title>Erro | Villa System</title>

        <main style={cardStyle}>
          <div style={iconStyle}>!</div>

          <h1
            style={{
              margin: "20px 0 0",
              fontSize: "26px",
            }}
          >
            O sistema encontrou um problema
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#4B5563",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Não foi possível carregar o Villa System.
            Tente novamente ou volte para o início.
          </p>

          {error.digest && (
            <p
              style={{
                margin: "12px 0 0",
                color: "#9CA3AF",
                fontSize: "12px",
              }}
            >
              Código de referência: {error.digest}
            </p>
          )}

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={retry}
              style={buttonStyle}
            >
              Tentar novamente
            </button>

            <Link href="/" style={linkStyle}>
              Voltar ao início
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}