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
            variables: {
              colorPrimary: "#F97316",
              colorText: "#1C1917",
              colorTextSecondary: "#78716C",
              colorBackground: "#FFFFFF",
              colorInputBackground: "#FAFAF9",
              colorInputText: "#1C1917",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              userButtonAvatarBox: {
                width: "2rem",
                height: "2rem",
              },
              userButtonPopoverCard: {
                borderRadius: "0.75rem",
              },
            },
          }}
        >
          <header className="flex items-center justify-between border-b border-[#1C1917]/8 px-6 py-4">
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

            <Show when="signed-out">
              <div className="flex items-center gap-2">
                <SignInButton>
                  <button className="rounded-lg px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#1C1917]/5">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#EA580C]">
                    Start tracking
                  </button>
                </SignUpButton>
              </div>
            </Show>

            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
