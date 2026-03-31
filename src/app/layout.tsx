import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rifa Recaudación Médica — Ayuda a Felix",
  description: "Participa en nuestra rifa benéfica y ayuda a recaudar fondos para el tratamiento médico de Felix Octavio Martinez Hernandez. 250 boletos disponibles. $50 MXN cada uno.",
  keywords: ["rifa", "benéfica", "recaudación", "médico", "Felix", "donación"],
  openGraph: {
    title: "Rifa Recaudación Médica — Ayuda a Felix",
    description: "Participa en nuestra rifa benéfica. 100% de los fondos al tratamiento.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}