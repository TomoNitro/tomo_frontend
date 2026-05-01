"use client";

import Link from "next/link";

export default function ParentDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc]">
      {/* Header */}
      <header className="border-b border-[#e8d4b0] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
          <h1 className="text-2xl font-black text-[#f39211]">TOMO</h1>
          <nav className="flex items-center gap-8">
            <Link href="/parent/dashboard" className="border-b-2 border-[#f39211] text-sm font-bold text-[#f39211]">
              Dashboard
            </Link>
            <Link href="/parent/generate" className="text-sm font-semibold text-[#8d7661] hover:text-[#f39211]">
              Generate
            </Link>
            <Link href="/parent/profile" className="h-10 w-10 rounded-full bg-gradient-to-br from-[#cb4f0e] via-[#d96c12] to-[#b0410b]" aria-label="Open profile" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-14">

        {/* Report Description */}
        <section className="mb-8 rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#f39211]">
                <span className="text-2xl">✨</span>
                Report Description
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-[#5f4d42]">
                Parent insights are ready. Track your explorer habits and use generated stories to guide better money decisions.
              </p>
            </div>
            <div className="hidden flex-shrink-0 sm:flex">
              <img src="/images/tomo1.svg" alt="Tomo" className="h-32 w-32 object-contain" />
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
          <div className="rounded-2xl bg-[#e8d4b0] p-6 text-center">
            <div className="text-3xl font-black text-[#3d3128]">72%</div>
            <div className="text-sm font-semibold text-[#8d7661] mt-1">Wise Decisions</div>
          </div>
          <div className="rounded-2xl bg-[#ffe071] p-6 text-center">
            <div className="text-3xl font-black text-[#3d3128]">65%</div>
            <div className="text-sm font-semibold text-[#8d7661] mt-1">Savings Progress</div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-6 text-center border border-[#e8d4b0]">
            <div className="text-3xl font-black text-[#3d3128]">88%</div>
            <div className="text-sm font-semibold text-[#8d7661] mt-1">Success Rate</div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-6 text-center border border-[#e8d4b0]">
            <div className="text-3xl font-black text-[#f39211]">27</div>
            <div className="text-sm font-semibold text-[#8d7661] mt-1">Total Stories</div>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-6 text-center border border-[#e8d4b0]">
            <div className="text-3xl font-black text-[#3d3128]">14</div>
            <div className="text-sm font-semibold text-[#8d7661] mt-1">Days Active</div>
          </div>
        </section>

        {/* Charts Section */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          {/* Financial Trend */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-sm p-8 border border-[#e8d4b0]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[#3d3128]">Financial Trend</h3>
              <span className="text-xs font-black text-[#8d7661]">WEEKLY</span>
            </div>
            {/* Placeholder for chart */}
            <div className="h-40 flex items-end justify-around gap-2">
              {[180, 220, 280, 350, 400, 420, 380, 320, 220, 120, 200, 320, 450].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-[#f59f1b] to-[#ffe071] rounded-t opacity-80"
                  style={{ height: `${(height / 450) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-[#8d7661] font-semibold">
              <span>Mon</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Behavior Composition */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-sm p-8 border border-[#e8d4b0] flex flex-col items-center justify-center">
            <h3 className="text-lg font-black text-[#3d3128] mb-8 w-full">Behavior Composition</h3>
            <div className="relative h-48 w-48 flex items-center justify-center">
              {/* Donut chart placeholder */}
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#b8572a" strokeWidth="12" strokeDasharray="56 100" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f59f1b" strokeWidth="12" strokeDasharray="27 100" strokeDashoffset="-56" />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-black text-[#3d3128]">72%</div>
                <div className="text-xs font-bold text-[#8d7661]">WISE</div>
              </div>
            </div>
            <div className="flex gap-6 mt-6 text-sm font-bold">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#b8572a]" />
                <span className="text-[#8d7661]">75% Wise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#f59f1b]" />
                <span className="text-[#8d7661]">25% Impulsive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
