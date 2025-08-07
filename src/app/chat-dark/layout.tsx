import type { Metadata } from "next";
// No need to import globals.css or fonts here, as it's handled by the root layout.
// No need for Inter font, as it's globally set.

export const metadata: Metadata = {
  title: "Dark Mode Chat",
  description: "A sleek dark mode chat interface",
};

// This layout component will wrap the page.tsx content for /chat-dark
export default function ChatDarkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
