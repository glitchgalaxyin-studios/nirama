import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FCFBF8] px-4 text-center text-[#1A1A1A]">
      <div className="rounded-[2.5rem] border border-white/80 bg-white/60 p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.04)] backdrop-blur-3xl max-w-md">
        <span className="rounded-full border border-[#B3945E]/30 bg-[#B3945E]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8C6F3B]">
          404 · Page Not Found
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#1A1A1A]">
          Label Not Found
        </h1>
        <p className="mt-3 text-sm text-black/60 leading-relaxed">
          The page or product record you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#B3945E]/40 bg-gradient-to-r from-[#C9AB73] to-[#A88851] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:scale-105"
          >
            Return to Nirāma Home
          </Link>
        </div>
      </div>
    </main>
  );
}
