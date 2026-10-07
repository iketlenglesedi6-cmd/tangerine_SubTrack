import Image from "next/image";

export default function Loading() {
  return (
    <main
      className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-12"
      aria-live="polite"
      role="status"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="tangerine-loading-orbit">
          <Image
            src="/tangerine-icon.webp"
            alt=""
            width={96}
            height={96}
            priority
            className="tangerine-loading-mascot h-24 w-24 object-contain"
          />
        </div>
        <div>
          <p className="font-semibold text-[#1f1a17]">Getting things ready</p>
          <p className="mt-1 text-sm text-[#6b625d]">Loading your subscriptions…</p>
        </div>
      </div>
    </main>
  );
}
