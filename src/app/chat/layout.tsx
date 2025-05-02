import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | Deliver AI",
  description: "Chat with AI using assistant-ui",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 