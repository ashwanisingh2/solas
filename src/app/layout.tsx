import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "GuruAI MVP", description: "Mastery learning platform" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><main className="container-app">{children}</main></body></html>;
}
