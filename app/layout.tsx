import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignOutButton,
  Show,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { AuthActions } from "@/components/auth-actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tangerine SubTrack",
  description: "Track your subscriptions and recurring expenses",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF9]">
        <ClerkProvider
          signUpFallbackRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
        >
          <header className="flex flex-col items-stretch gap-3 border-b border-[#1C1917]/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link href="/" prefetch={false} className="flex items-center gap-2">
              <Image
                src="/tangerine-icon.png"
                alt=""
                width={28}
                height={28}
                fetchPriority="high"
              />
              <span className="text-sm font-semibold tracking-tight text-[#1C1917]">
                SubTrack
              </span>
            </Link>

            <nav aria-label="Main navigation" className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:flex-nowrap sm:justify-start sm:gap-4">
              <Link
                href="/pricing"
                prefetch={false}
                className="rounded-lg px-2 py-2 text-sm font-medium text-[#4B4742] hover:text-[#1C1917] sm:px-3"
              >
                Pricing
              </Link>

              <Show when="signed-out">
                <AuthActions />
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link
                    href="/dashboard"
                    prefetch={false}
                    className="text-sm font-medium text-[#4B4742] hover:text-[#1C1917]"
                  >
                    Dashboard
                  </Link>
                  <SignOutButton redirectUrl="/">
                    <button className="rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#FAFAF9]">
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
              </Show>
            </nav>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
