import "../styles/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://nba-75-showcase.vercel.app"),
  title: {
    default: "NBA 75 Showcase",
    template: "%s | NBA 75 Showcase",
  },
  description:
    "An immersive, interactive celebration of the NBA 75 legends with data-rich visuals and cinematic presentation.",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "NBA 75 Showcase",
    description:
      "Interactive stories, advanced metrics, and visualizations for the NBA's greatest players.",
    url: "https://nba-75-showcase.vercel.app",
    siteName: "NBA 75 Showcase",
  },
  twitter: {
    card: "summary_large_image",
    title: "NBA 75 Showcase",
    description:
      "Explore player profiles, shot charts, and comparisons for the NBA's 75 greatest.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-base text-white antialiased selection:bg-accent-400/40">
        {children}
      </body>
    </html>
  );
}
