import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
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

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fffaf5] text-zinc-800">
        <ClerkProvider>
          <header className="border-b border-[#f6e4c7] bg-[#fffaf5]/90 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
              <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-zinc-900 uppercase">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f1a17] text-base font-black text-[#f5efe9]">
                  S
                </span>
                SubTrack
              </Link>

              <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="transition hover:text-zinc-900">
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <div className="hidden items-center gap-2 sm:flex">
                    <SignInButton>
                      <button className="rounded-full border border-[#d9c5af] bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-[#f8f3ed]">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="rounded-full bg-[#171513] px-4 py-2 text-sm font-medium text-[#f7f2ee] transition hover:bg-[#2b241f]">
                        Get started
                      </button>
                    </SignUpButton>
                  </div>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
