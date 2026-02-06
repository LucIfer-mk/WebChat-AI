import type { Metadata } from "next";
import { metadata as seoMetadata, generateStructuredData } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = seoMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateStructuredData();

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
