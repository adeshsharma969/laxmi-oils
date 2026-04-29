import type { Metadata } from "next";
import type React from "react";
import "../../styles/index.css";
import "../../styles/App.css";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.laxmiedibleoils.com"),
  title: {
    default: "Laxmi Edible Oils — Cold-Pressed, Lab-Tested Oils from Jaipur",
    template: "%s | Laxmi Edible Oils",
  },
  description:
    "Buy pure, cold-pressed mustard oil, groundnut oil, soyabean oil & sunflower oil online. Wood-pressed by partner mills in Rajasthan, lab-tested in Jaipur. Free delivery on orders above ₹499.",
  keywords: [
    "cold pressed mustard oil",
    "kachi ghani mustard oil",
    "wood pressed oil",
    "groundnut oil online",
    "pure soyabean oil",
    "sunflower oil India",
    "lab tested edible oil",
    "Jaipur edible oils",
    "Laxmi oils",
    "FSSAI certified oil",
    "cold pressed oil buy online",
    "cooking oil Rajasthan",
  ],
  authors: [{ name: "Laxmi Edible Oils" }],
  creator: "Laxmi Edible Oils",
  publisher: "Laxmi Edible Oils",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.laxmiedibleoils.com",
    siteName: "Laxmi Edible Oils",
    title: "Laxmi Edible Oils — Wood-Pressed. Lab-Tested. Jaipur.",
    description:
      "Curated wood-pressed mustard, groundnut, soyabean & sunflower oils from Rajasthan's best small-batch mills. Every bottle lab-tested in Jaipur. Free delivery above ₹499.",
    images: [
      {
        url: "https://www.laxmiedibleoils.com/logo.png",
        width: 512,
        height: 512,
        alt: "Laxmi Edible Oils Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laxmi Edible Oils — Wood-Pressed. Lab-Tested. Jaipur.",
    description:
      "Wood-pressed oils from Rajasthan's best small-batch mills. Every bottle lab-tested in Jaipur.",
    images: ["https://www.laxmiedibleoils.com/logo.png"],
  },
  alternates: {
    canonical: "https://www.laxmiedibleoils.com",
  },
  category: "E-commerce",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.laxmiedibleoils.com/#organization",
      name: "Laxmi Edible Oils",
      url: "https://www.laxmiedibleoils.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.laxmiedibleoils.com/logo.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-9887651555",
        contactType: "customer service",
        email: "laxmiedibleoils@gmail.com",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.laxmiedibleoils.com/#website",
      url: "https://www.laxmiedibleoils.com",
      name: "Laxmi Edible Oils",
      publisher: {
        "@id": "https://www.laxmiedibleoils.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://www.laxmiedibleoils.com/products?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.laxmiedibleoils.com/#localbusiness",
      name: "Laxmi Edible Oils",
      image: "https://www.laxmiedibleoils.com/logo.png",
      telephone: "+91-9887651555",
      email: "laxmiedibleoils@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        postalCode: "302001",
        addressCountry: "IN",
      },
      priceRange: "₹₹",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
