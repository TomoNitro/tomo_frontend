"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { childrenApi, type ChildProfile } from "@/lib/api";

const CHILD_AVATAR_IMAGES = [
  "/images/tomo1.png",
  "/images/tomo2.png",
  "/images/tomo4.png",
  "/images/tomo5.png",
  "/images/tomo6.png",
] as const;

function hashString(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickAvatar(seed: string) {
  return CHILD_AVATAR_IMAGES[hashString(seed) % CHILD_AVATAR_IMAGES.length];
}

function makeTrend(seed: string) {
  const hash = hashString(seed);
  return Array.from({ length: 7 }, (_, index) => {
    const base = 140 + ((hash >> (index * 2)) % 300);
    return Math.min(base, 450);
  });
}

function makeChildDashboard(child: ChildProfile) {
  const hash = hashString(`${child.id}-${child.name}`);
  const wise = 55 + (hash % 35);
  const savings = 45 + ((hash >> 3) % 40);
  const successRate = 72 + ((hash >> 5) % 24);
  const totalStories = 8 + ((hash >> 7) % 24);
  const daysActive = 3 + ((hash >> 9) % 18);

  return {
    id: child.id,
    name: child.name,
    avatar: pickAvatar(child.id || child.name),
    report: `${child.name} is making steady progress this week. Track their habits and use generated stories to guide better money decisions.`,
    wise,
    savings,
    successRate,
    totalStories,
    daysActive,
    trend: makeTrend(child.id || child.name),
  };
}

type ChildDashboard = ReturnType<typeof makeChildDashboard>;

export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadChildren = async () => {
      const response = await childrenApi.getList();
      if (response.success && Array.isArray(response.data)) {
        setChildren(response.data);
        const storedChildId = localStorage.getItem("selectedChildId") || response.data[0]?.id || "";
        setSelectedChildId(storedChildId);
        setErrorMessage("");
      } else {
        setErrorMessage(response.error ?? "Failed to load children.");
      }
      setIsLoading(false);
    };

    loadChildren();
  }, []);

  const dashboardChildren = useMemo<ChildDashboard[]>(() => {
    return children.map((child) => makeChildDashboard(child));
  }, [children]);

  const current = useMemo(() => {
    if (!dashboardChildren.length) return null;
    return (
      dashboardChildren.find((child) => child.id === selectedChildId) ??
      dashboardChildren[0]
    );
  }, [dashboardChildren, selectedChildId]);

  const impulsive = useMemo(() => (current ? 100 - current.wise : 0), [current]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc] px-6 py-14 sm:px-10 lg:px-14">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center rounded-[2rem] border border-[#e8d4b0] bg-white/60 backdrop-blur-sm">
          <p className="text-lg font-black text-[#f39211]">Loading children...</p>
        </div>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc] px-6 py-14 sm:px-10 lg:px-14">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center rounded-[2rem] border border-[#e8d4b0] bg-white/60 p-8 text-center backdrop-blur-sm">
          <h1 className="text-3xl font-black text-[#f39211]">No children found</h1>
          <p className="mt-3 max-w-xl text-base font-medium text-[#6b5649]">
            Add a child profile first so the parent dashboard can show their reports.
          </p>
          {errorMessage ? (
            <p className="mt-4 text-sm font-semibold text-red-600">{errorMessage}</p>
          ) : null}
          <Link href="/profile" className="mt-6 rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-6 py-3 font-black text-white">
            Go to Profile Picker
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc]">
      <header className="sticky top-0 z-40 border-b border-[#e8d4b0] bg-white/50 backdrop-blur-sm">
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

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-14">
        <section className="mb-7 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-black text-[#6f570f]">Exploring with:</h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ebe4d1] p-1.5">
            {dashboardChildren.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-black transition ${
                  selectedChildId === child.id
                    ? "bg-white text-[#2f2a22] shadow-sm"
                    : "bg-transparent text-[#6f6252] hover:bg-white/70"
                }`}
                aria-pressed={selectedChildId === child.id}
              >
                <img
                  src={child.avatar}
                  alt={`${child.name} avatar`}
                  className="h-8 w-8 rounded-full object-cover"
                />
                {child.name}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#f39211]">
                <span className="text-2xl">✨</span>
                Report Description
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-[#5f4d42]">
                {current.report}
              </p>
            </div>
            <div className="hidden flex-shrink-0 sm:flex">
              <img src={current.avatar} alt={`${current.name} avatar`} className="h-32 w-32 rounded-2xl object-cover" />
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
          <div className="rounded-2xl bg-[#e8d4b0] p-6 text-center">
            <div className="text-3xl font-black text-[#3d3128]">{current.wise}%</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Wise Decisions</div>
          </div>
          <div className="rounded-2xl bg-[#ffe071] p-6 text-center">
            <div className="text-3xl font-black text-[#3d3128]">{current.savings}%</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Savings Progress</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#3d3128]">{current.successRate}%</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Success Rate</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#f39211]">{current.totalStories}</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Total Stories</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#3d3128]">{current.daysActive}</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Days Active</div>
          </div>
        </section>

        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3d3128]">Financial Trend</h3>
              <span className="text-xs font-black text-[#8d7661]">WEEKLY</span>
            </div>
            <div className="flex h-40 items-end justify-around gap-2">
              {current.trend.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t bg-gradient-to-t from-[#f59f1b] to-[#ffe071] opacity-80"
                  style={{ height: `${(height / 450) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs font-semibold text-[#8d7661]">
              <span>Mon</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
            <h3 className="mb-8 w-full text-lg font-black text-[#3d3128]">Behavior Composition</h3>
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#b8572a" strokeWidth="12" strokeDasharray={`${current.wise} 100`} />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f59f1b" strokeWidth="12" strokeDasharray={`${impulsive} 100`} strokeDashoffset={`-${current.wise}`} />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-black text-[#3d3128]">{current.wise}%</div>
                <div className="text-xs font-bold text-[#8d7661]">WISE</div>
              </div>
            </div>
            <div className="mt-6 flex gap-6 text-sm font-bold">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#b8572a]" />
                <span className="text-[#8d7661]">{current.wise}% Wise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#f59f1b]" />
                <span className="text-[#8d7661]">{impulsive}% Impulsive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
