import { Metadata } from "next";

export const siteMetadata = {
  title: "WebChat AI - AI-Powered Website Assistant & Live Chat",
  description:
    "AI chatbot for websites that answers FAQs, captures leads, and boosts conversions 24/7. Smart customer support automation for your business.",
  siteUrl: "https://webchat-ai.com",
  author: "WebChat AI Team",
  keywords: [
    "WebChat AI",
    "AI Website Assistant",
    "AI Chatbot for Websites",
    "Web Chat AI",
    "AI Customer Support",
    "AI Live Chat",
    "Website Chatbot",
    "Lead Capture AI",
    "Customer Support Automation",
    "Conversational AI",
    "AI Customer Service",
    "Website Chat Widget",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  creator: siteMetadata.author,
  publisher: siteMetadata.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteMetadata.siteUrl,
    title: siteMetadata.title,
    description: siteMetadata.description,
    siteName: "WebChat AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WebChat AI - AI-Powered Website Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: ["/og-image.png"],
    creator: "@webchatai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

// JSON-LD Structured Data for SaaS Product
export function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WebChat AI",
    applicationCategory: "BusinessApplication",
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      category: "subscription",
      availability: "https://schema.org/OnlineOnly",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    creator: {
      "@type": "Organization",
      name: "WebChat AI",
      url: siteMetadata.siteUrl,
    },
  };
}
