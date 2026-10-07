import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
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
  title: "SubTrack",
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
          appearance={{
            elements: {
              userButtonTrigger: {
                padding: "0.25rem 0.65rem 0.25rem 0.3rem",
                gap: "0.55rem",
                border: "1px solid #fdba74",
                borderRadius: "9999px",
                backgroundColor: "#fff7ed",
                boxShadow: "0 3px 10px rgb(154 52 18 / 14%)",
                transition: "transform 160ms ease, box-shadow 160ms ease",
              },
              userButtonAvatarBox: {
                width: "2.5rem",
                height: "2.5rem",
                backgroundColor: "#c2410c",
                color: "#ffffff",
                border: "2px solid #ffffff",
                boxShadow: "0 2px 6px rgb(124 45 18 / 25%)",
              },
              userButtonPopoverCard: {
                borderRadius: "0.75rem",
              },
            },
          }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-[#1C1917]/8 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/tangerine-icon.png"
                alt="SubTrack"
                width={28}
                height={28}
                priority
              />
              <span className="text-sm font-semibold tracking-tight text-[#1C1917]">
                SubTrack
              </span>
            </Link>

            <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/pricing"
                className="rounded-lg px-2 py-2 text-sm font-medium text-[#57534E] hover:text-[#1C1917] sm:px-3"
              >
                Pricing
              </Link>

              <Show when="signed-out">
                <div className="flex items-center gap-1 sm:gap-2">
                  <SignInButton>
                    <button className="rounded-lg px-2 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#1C1917]/5 sm:px-4">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="rounded-lg bg-[#9A3412] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12] sm:px-4">
                      Start tracking
                    </button>
                  </SignUpButton>
                </div>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-[#57534E] hover:text-[#1C1917]"
                  >
                    Dashboard
                  </Link>
                  <UserButton showName />
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
