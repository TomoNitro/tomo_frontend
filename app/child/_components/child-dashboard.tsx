"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  childrenApi,
  type ChildBadge,
  type ChildProgress,
  type ChildStoryHeader,
  type MarketItem,
  type StoryNode,
  type StorySummary,
} from "@/lib/api";
import { getChildAvatarSrc } from "@/lib/child-avatar";
import { readChildCoins, saveChildCoins } from "@/lib/child-coins";
import { readSavingTargetId, saveSavingTargetId } from "@/lib/saving-target";

type ChildPage = "home" | "lessons" | "profile";

const navItems = [
  { label: "Home", href: "/child/dashboard", key: "home" },
  { label: "Lessons", href: "/child/lessons", key: "lessons" },
] as const;

const DEFAULT_CHILD_POINTS = 75;
const CHILD_PROGRESS_SNAPSHOT_KEY = "tomoChildProgressSnapshot";

type ProgressSnapshot = {
  level: number;
  badgeIds: string[];
};

type Celebration =
  | {
      type: "level";
      level: number;
    }
  | {
      type: "badge";
      badge: ChildBadge;
    };

function readProgressSnapshot(): ProgressSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CHILD_PROGRESS_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProgressSnapshot>;
    const level = typeof parsed.level === "number" ? parsed.level : 1;
    const badgeIds = Array.isArray(parsed.badgeIds)
      ? parsed.badgeIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];

    return { level, badgeIds };
  } catch {
    return null;
  }
}

function saveProgressSnapshot(snapshot: ProgressSnapshot) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CHILD_PROGRESS_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors
  }
}

function Icon({ name, className = "h-5 w-5" }: { name: "user" | "book" | "search" | "play" | "edit" | "coin" | "logout" | "speaker" | "wallet" | "star"; className?: string }) {
  const common = `${className} shrink-0`;

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="M5 5.8c2.4 0 4.6.6 7 2v10.5c-2.4-1.4-4.6-2-7-2V5.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 5.8c-2.4 0-4.6.6-7 2v10.5c2.4-1.4 4.6-2 7-2V5.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M8 5.8v12.4c0 1.1 1.2 1.8 2.2 1.2l9.4-6.2c.9-.6.9-1.9 0-2.5l-9.4-6.2C9.2 3.9 8 4.6 8 5.8Z" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="m5 19 4.1-.9L18.4 8.8a2 2 0 0 0 0-2.8L18 5.6a2 2 0 0 0-2.8 0L5.9 14.9 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="m14 7 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="M9 20H6.5A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 8l4 4-4 4M18 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "speaker") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="M4 10v4h4l5 4V6l-5 4H4Z" fill="currentColor" />
        <path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="m12 3 2.5 5.2 5.7.8-4.1 4 1 5.6L12 16l-5.1 2.7 1-5.6-4.1-4 5.7-.8L12 3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" fill="currentColor" opacity=".18" />
      <path d="M12 6v12M15.5 8.5h-5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChildNavbar({ active }: { active: ChildPage }) {
  const router = useRouter();

  function handleLogout() {
    window.localStorage.removeItem("tomoChildAuthToken");
    window.localStorage.removeItem("childAccessToken");
    window.localStorage.removeItem("selectedChildId");
    window.localStorage.removeItem("selectedChildName");
    window.localStorage.removeItem("selectedUser");
    window.localStorage.removeItem(CHILD_PROGRESS_SNAPSHOT_KEY);
    router.replace("/profile");
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#e8d4b0] bg-white/50 backdrop-blur-sm">
      <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-8 sm:px-10">
        <Link href="/child/dashboard" className="text-[1.32rem] font-black tracking-[0.06em] !text-[#f39211]">
          TOMO
        </Link>
        <div className="flex h-full items-center gap-9 text-[0.85rem] font-black">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex h-full items-center border-b-2 px-2 pt-[3px] transition-colors ${
                active === item.key
                  ? "border-[#f39211] text-[#f39211]"
                  : "border-transparent text-[#8d7661] hover:text-[#f39211]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/child/profile" aria-label="Profile" className={`h-10 w-10 rounded-full bg-gradient-to-br from-[#cb4f0e] via-[#d96c12] to-[#b0410b] transition-transform hover:scale-105 ${active === "profile" ? "ring-2 ring-[#f39211]" : ""}`}>
            <span className="sr-only">Profile</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 text-[0.8rem] font-black text-[#7b5d08] transition hover:-translate-y-0.5"
            aria-label="Keluar dari akun anak"
          >
            <Icon name="logout" className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

function MascotImage({
  src,
  alt,
  className,
  loading,
  fetchPriority,
}: {
  src: string;
  alt: string;
  className: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={620}
      height={620}
      loading={loading}
      fetchPriority={fetchPriority}
      className={`${className} object-contain drop-shadow-[0_14px_20px_rgba(104,61,20,0.18)]`}
      sizes="(max-width: 768px) 60vw, 320px"
    />
  );
}

function MissionRow({
  icon,
  title,
  description,
  progress,
  reward,
  done = false,
}: {
  icon: "book" | "coin";
  title: string;
  description: string;
  progress: string;
  reward: string;
  done?: boolean;
}) {
  return (
    <div className="grid min-h-[5.25rem] grid-cols-[4.5rem_1fr_auto_auto] items-center gap-4 rounded-[1.35rem] border border-[#eabfb6] bg-[#f8f0df]/88 px-5 py-3 max-md:grid-cols-[4rem_1fr_auto] max-md:gap-y-3">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${done ? "bg-[#ffd5a5] text-[#f99a18]" : "bg-[#ffc000] text-[#806006]"}`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-[1.1rem] font-black leading-6 text-[#2c2921]">{title}</h3>
        <p className="mt-1 text-[0.83rem] font-bold leading-5 text-[#5d4b41]">{description}</p>
      </div>
      <div className="min-w-16 text-center max-md:hidden">
        <p className={`text-[1.25rem] font-black leading-none ${done ? "text-[#f5b400]" : "text-[#ff9417]"}`}>{progress}</p>
        <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#8d7661]">{done ? "Selesai" : "Progress"}</p>
      </div>
      <div className={`${done ? "bg-[#ffbd73]" : "bg-[#ff9a1a]"} rounded-full px-5 py-2.5 text-[0.98rem] font-black text-white max-md:justify-self-end`}>{reward}</div>
    </div>
  );
}

function BadgeTile({ badge }: { badge: ChildBadge }) {
  const isEarned = badge.earned !== false;

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-[1rem] border px-3 py-3 text-center ${
        isEarned ? "border-[#f4c879] bg-[#fff5e1]" : "border-[#e5d6bf] bg-[#f6efe3] opacity-60"
      }`}
    >
      <div
        className={`relative flex h-14 w-14 items-center justify-center rounded-full ${
          isEarned ? "bg-[#ffc400] text-[#6b430c]" : "bg-[#e6d8be] text-[#8b7b69]"
        }`}
      >
        {badge.image_url ? (
          <Image
            src={badge.image_url}
            alt={badge.name}
            width={44}
            height={44}
            className="h-10 w-10 object-contain"
          />
        ) : (
          <Icon name="star" className="h-7 w-7" />
        )}
      </div>
      <p className="text-[0.7rem] font-black text-[#6b4a2b]">{badge.name}</p>
      {badge.level_required ? (
        <span className="text-[0.6rem] font-black uppercase tracking-[0.12em] text-[#9a7a4a]">
          Level {badge.level_required}
        </span>
      ) : null}
    </div>
  );
}

function CelebrationModal({ celebration, onClose }: { celebration: Celebration; onClose: () => void }) {
  const isLevelUp = celebration.type === "level";
  const badge = celebration.type === "badge" ? celebration.badge : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1f12]/60 px-5">
      <div
        role="dialog"
        aria-modal
        className="relative w-full max-w-md rounded-[1.6rem] bg-[#fff7ea] p-6 text-center shadow-[0_30px_70px_rgba(37,22,10,0.35)]"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffc400] text-[#7a4a0a] shadow-[0_12px_22px_rgba(255,196,0,0.4)]">
          <Icon name="star" className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-3xl font-black text-[#f79418]">
          {isLevelUp ? "Naik Level!" : "Badge Baru!"}
        </h3>
        {isLevelUp ? (
          <>
            <p className="mt-3 text-[1rem] font-black text-[#5b4635]">
              Sekarang kamu Level {celebration.level}.
            </p>
            <p className="mt-2 text-[0.95rem] font-bold text-[#806006]">Terus lanjutkan petualanganmu!</p>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-center">
              {badge?.image_url ? (
                <Image
                  src={badge.image_url}
                  alt={badge?.name ?? "Badge"}
                  width={96}
                  height={96}
                  className="h-24 w-24 object-contain drop-shadow-[0_10px_16px_rgba(86,54,16,0.2)]"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ffe7b5] text-[#7a4d13]">
                  <Icon name="star" className="h-12 w-12" />
                </div>
              )}
            </div>
            <h4 className="mt-3 text-xl font-black text-[#5b4635]">{badge?.name}</h4>
            {badge?.description ? (
              <p className="mt-2 text-[0.92rem] font-semibold text-[#7a6146]">{badge.description}</p>
            ) : null}
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-full bg-[#fa9818] text-[0.95rem] font-black text-white shadow-[0_12px_22px_rgba(232,113,31,0.24)]"
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}

export function ChildHomePage() {
  const [coins, setCoins] = useState(DEFAULT_CHILD_POINTS);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [savingTarget, setSavingTarget] = useState<MarketItem | null>(null);
  const [pendingSavingTarget, setPendingSavingTarget] = useState<MarketItem | null>(null);
  const [isSavingTargetId, setIsSavingTargetId] = useState<string | null>(null);
  const [savingTargetMessage, setSavingTargetMessage] = useState("");
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [progressMessage, setProgressMessage] = useState("");
  const [celebrationQueue, setCelebrationQueue] = useState<Celebration[]>([]);
  const [activeCelebration, setActiveCelebration] = useState<Celebration | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const storedCoins = readChildCoins(DEFAULT_CHILD_POINTS);
      setCoins(storedCoins > 0 ? storedCoins : DEFAULT_CHILD_POINTS);
    });

    const loadDashboardData = async () => {
      setIsLoadingMarkets(true);
      setSavingTargetMessage("");
      setProgressMessage("");

      const [marketsResponse, savedTargetId, coinsResponse, progressResponse] = await Promise.all([
        childrenApi.getMarkets(),
        Promise.resolve(readSavingTargetId()),
        childrenApi.getCoins(),
        childrenApi.getProgress(),
      ]);

      if (coinsResponse.success && typeof coinsResponse.data === "number") {
        const nextCoins = coinsResponse.data > 0 ? coinsResponse.data : DEFAULT_CHILD_POINTS;
        setCoins(nextCoins);
        saveChildCoins(nextCoins);
      } else if (coinsResponse.error) {
        setSavingTargetMessage(coinsResponse.error);
      }

      if (marketsResponse.success && Array.isArray(marketsResponse.data)) {
        const items = marketsResponse.data;
        setMarketItems(items);

        if (savedTargetId) {
          setSavingTarget(items.find((item) => item.id === savedTargetId) ?? null);
        } else {
          setSavingTarget(null);
        }
      } else {
        setMarketItems([]);
        setSavingTarget(null);
      }

      if (progressResponse.success && progressResponse.data) {
        const nextProgress = progressResponse.data;
        setProgress(nextProgress);
        queueCelebrations(nextProgress);
      } else if (progressResponse.error) {
        setProgressMessage(progressResponse.error);
      }

      setIsLoadingMarkets(false);
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!activeCelebration && celebrationQueue.length > 0) {
      setActiveCelebration(celebrationQueue[0]);
      setCelebrationQueue((prev) => prev.slice(1));
    }
  }, [activeCelebration, celebrationQueue]);

  function queueCelebrations(nextProgress: ChildProgress) {
    if (typeof window === "undefined") return;

    const snapshot = readProgressSnapshot();
    const earnedBadges = nextProgress.badges.filter((badge) => badge.earned !== false);
    const earnedIds = earnedBadges
      .map((badge) => badge.id || badge.name)
      .filter((value): value is string => Boolean(value));

    if (!snapshot) {
      saveProgressSnapshot({ level: nextProgress.level, badgeIds: earnedIds });
      return;
    }

    const newEvents: Celebration[] = [];

    if (nextProgress.level > snapshot.level) {
      newEvents.push({ type: "level", level: nextProgress.level });
    }

    const previousBadgeIds = new Set(snapshot.badgeIds);
    for (const badge of earnedBadges) {
      const key = badge.id || badge.name;
      if (key && !previousBadgeIds.has(key)) {
        newEvents.push({ type: "badge", badge });
      }
    }

    if (newEvents.length > 0) {
      setCelebrationQueue((prev) => [...prev, ...newEvents]);
    }

    saveProgressSnapshot({ level: nextProgress.level, badgeIds: earnedIds });
  }

  async function confirmSavingTarget() {
    const market = pendingSavingTarget;
    if (!market) return;

    setIsSavingTargetId(market.id);
    setSavingTargetMessage("");

    const response = await childrenApi.setSavingGoal(market.id);

    if (response.success) {
      const nextTargetId = response.data?.market_id ?? market.id;
      const nextTarget =
        marketItems.find((item) => item.id === nextTargetId) ?? market;

      saveSavingTargetId(nextTargetId);
      setSavingTarget(nextTarget);

      const coinsResponse = await childrenApi.getCoins();
      if (coinsResponse.success && typeof coinsResponse.data === "number") {
        const nextCoins = coinsResponse.data > 0 ? coinsResponse.data : DEFAULT_CHILD_POINTS;
        setCoins(nextCoins);
        saveChildCoins(nextCoins);
      }

      setSavingTargetMessage(`Target disimpan ke ${nextTarget.title}.`);
      setPendingSavingTarget(null);
    } else {
      setSavingTargetMessage(response.error ?? "Target belum bisa disimpan.");
    }

    setIsSavingTargetId(null);
  }

  const targetProgress = savingTarget?.price
    ? Math.min(100, Math.round((coins / savingTarget.price) * 100))
    : 0;
  const remainingTargetCoins = savingTarget ? Math.max(0, savingTarget.price - coins) : 0;
  const progressData: ChildProgress =
    progress ?? {
      total_exp: 0,
      level: 1,
      next_level_exp: 50,
      exp_to_next_level: 50,
      badges: [],
    };
  const totalExp = progressData.total_exp;
  const level = Math.max(1, progressData.level);
  const nextLevelExp = progressData.next_level_exp || Math.max(50, level * 50);
  const expToNext =
    typeof progressData.exp_to_next_level === "number"
      ? progressData.exp_to_next_level
      : Math.max(0, nextLevelExp - totalExp);
  const progressPercent = nextLevelExp > 0
    ? Math.min(100, Math.round((totalExp / nextLevelExp) * 100))
    : 0;
  const expMessage =
    expToNext > 0
      ? `${expToNext} XP lagi untuk Level ${level + 1}!`
      : "Level ini sudah penuh!";
  const heroTitle = level >= 10 ? "Hampir Jadi Legenda!" : level >= 5 ? "Petualanganmu Makin Hebat!" : "Ayo Naik Level!";
  const earnedBadges = progressData.badges.filter((badge) => badge.earned !== false);
  const displayedBadges = earnedBadges.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-10">
      <ChildNavbar active="home" />
      <section className="mx-auto max-w-[1060px] px-5 pt-16 sm:px-7">
        <div className="relative mx-auto min-h-[16.25rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ff684d] via-[#ff8d18] to-[#fb9818] px-8 py-8 text-white shadow-[0_18px_34px_rgba(120,80,26,0.18)] md:px-14">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/13" />
          <div className="absolute -bottom-16 -left-14 h-36 w-52 rounded-full bg-[#b96d10]/12" />
          <div className="relative z-10 grid min-h-[12rem] items-center gap-5 md:grid-cols-[180px_1fr]">
            <MascotImage
              src="/images/tomo5.png"
              alt="Tomo membawa koin"
              className="mx-auto h-44 w-44 md:h-48 md:w-48"
              loading="eager"
              fetchPriority="high"
            />
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start md:pl-36">
                <span className="-rotate-2 rounded-full bg-[#ffc400] px-7 py-2 text-[1.05rem] font-black uppercase text-[#4b3605] shadow-[0_8px_14px_rgba(104,70,0,0.16)]">
                  Level {level}
                </span>
              </div>
              <h1 className="mt-4 text-[2.45rem] font-black leading-[1.05] sm:text-5xl">{heroTitle}</h1>
              <div className="mx-auto mt-6 max-w-[520px] rounded-full bg-[#b96d10]/60 p-1.5 md:mx-0">
                <div className="relative h-6 overflow-hidden rounded-full bg-[#8f5709]/45">
                  <div
                    className="h-full rounded-full bg-[#ffc400] shadow-[inset_0_2px_0_rgba(255,255,255,0.38)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[0.78rem] font-black text-[#2d2309]">
                    {totalExp} / {nextLevelExp} XP
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[1rem] font-bold">{expMessage}</p>
              {progressMessage ? (
                <p className="mt-2 text-[0.82rem] font-black text-[#ffe8b8]">{progressMessage}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 grid items-start gap-3 lg:grid-cols-[1fr_320px] lg:gap-4">
          <div>
            <h2 className="mb-2 text-[1.7rem] font-black text-[#765706]">Misi Hari Ini</h2>
            <div className="space-y-2.5">
              <MissionRow icon="book" title="Baca 1 Cerita" description="Selesaikan satu petualangan baru hari ini!" progress="0/1" reward="+10 XP" />
              <MissionRow icon="coin" title="Tabung 5 Koin" description="Kumpulkan koin dari latihan harian." progress="✓" reward="+5 XP" done />
            </div>

            <div className="mt-7 rounded-[1.35rem] border border-[#e6c2ae] bg-[#f8f0df]/90 p-5">
              <div className="rounded-[0.85rem] bg-[#fa9818] px-5 py-3 text-center text-white shadow-[0_5px_8px_rgba(156,95,15,0.18)]">
                <h2 className="text-[2.35rem] font-black leading-none">TARGET IMPIAN</h2>
                <p className="text-[0.8rem] font-black">Pilih barang yang mau kamu tabung</p>
              </div>

              <div className="mt-4 rounded-[1rem] bg-white/75 px-4 py-4 text-[#5b4635]">
                {savingTarget ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#f79418]">Target anak</p>
                        <h3 className="truncate text-[1.15rem] font-black text-[#5b4635]">{savingTarget.title}</h3>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#fa9818] px-3 py-1.5 text-[0.78rem] font-black text-white">
                        {coins}/{savingTarget.price} koin
                      </span>
                    </div>
                    <div className="mt-3 rounded-full bg-[#e6d8be] p-1">
                      <div
                        className="h-4 rounded-full bg-[#ffc400] transition-all"
                        style={{ width: `${targetProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[0.82rem] font-black text-[#806006]">
                      {remainingTargetCoins === 0 ? "Target sudah tercapai!" : `Kurang ${remainingTargetCoins} koin lagi`}
                    </p>
                  </>
                ) : (
                  <p className="text-center text-[0.92rem] font-black text-[#806006]">
                    Belum ada target. Pilih salah satu barang di bawah.
                  </p>
                )}
              </div>

              {isLoadingMarkets ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-[9.4rem] animate-pulse rounded-[1rem] bg-[#fa9818]/70" />
                  ))}
                </div>
              ) : marketItems.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {marketItems.slice(0, 6).map((market) => {
                    const isActive = savingTarget?.id === market.id;
                    return (
                      <button
                        key={market.id}
                        type="button"
                        onClick={() => setPendingSavingTarget(market)}
                        disabled={isSavingTargetId === market.id}
                        className={`relative flex h-[9.4rem] items-center justify-center overflow-hidden rounded-[1rem] bg-[#fa9818] p-2 text-white shadow-[0_6px_14px_rgba(232,113,31,0.18)] transition hover:-translate-y-0.5 disabled:opacity-60 ${
                          isActive ? "ring-4 ring-[#ffc400]" : ""
                        }`}
                        aria-label={`Pilih target ${market.title}`}
                      >
                        {isActive ? (
                          <span className="absolute left-2 top-2 z-10 rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-black text-[#f79418] shadow">
                            Target
                          </span>
                        ) : null}
                        <Image
                          src={market.image_url}
                          alt={market.title}
                          fill
                          sizes="160px"
                          className="object-contain p-2 drop-shadow-[0_8px_12px_rgba(104,61,20,0.25)]"
                        />
                        <span className="absolute bottom-2 right-2 rounded-full bg-white px-2.5 py-1 text-[0.72rem] font-black text-[#2d2921]">
                          Target {market.price} koin
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-[1rem] bg-white/70 px-5 py-8 text-center text-[0.95rem] font-black text-[#755405]">
                  Daftar target belum tersedia
                </div>
              )}

              {savingTargetMessage ? (
                <p className="mt-4 text-center text-sm font-black text-[#ff6845]">{savingTargetMessage}</p>
              ) : null}
            </div>
          </div>

          <aside className="space-y-8 pt-2">
            <div className="relative pt-12">
              <Image
                src="/images/tomonongol.png"
                alt=""
                width={168}
                height={67}
                className="pointer-events-none absolute right-4 top-0 z-10 h-auto w-[9.5rem] drop-shadow-[0_10px_14px_rgba(103,60,18,0.18)]"
                aria-hidden
              />
              <Link href="/child/lessons" className="flex min-h-[8rem] items-center justify-center gap-4 rounded-[3.4rem] bg-[#fa9818] px-7 pb-5 pt-8 text-center text-white transition-transform hover:-translate-y-0.5">
                <Icon name="book" className="h-5 w-5" />
                <span className="text-[1.65rem] font-black leading-[1.1]">
                  LANJUT<br />PETUALANGAN
                </span>
              </Link>
            </div>
            <div className="rounded-[1.35rem] bg-[#fa9818] px-8 py-7 text-center text-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#fa9818]">
                <Icon name="coin" className="h-11 w-11" />
              </div>
              <p className="mt-4 text-[1.55rem] font-black">Collected Coins</p>
              <p className="text-[4.1rem] font-black leading-none">{coins}</p>
            </div>
            <div className="rounded-[1.35rem] border border-[#f1d4a8] bg-[#fff7e8] px-6 py-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[#f79418]">
                <Icon name="star" className="h-5 w-5" />
                <p className="text-[0.9rem] font-black uppercase tracking-[0.16em]">Badge</p>
              </div>
              {displayedBadges.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {displayedBadges.map((badge) => (
                    <BadgeTile key={badge.id || badge.name} badge={badge} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[0.9rem] font-black text-[#7b5d08]">Belum ada badge. Terus kumpulkan XP!</p>
              )}
              {earnedBadges.length > displayedBadges.length ? (
                <p className="mt-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#9a7a4a]">
                  +{earnedBadges.length - displayedBadges.length} badge lain
                </p>
              ) : null}
            </div>
            <MascotImage src="/images/tomo5.png" alt="Tomo membawa kantong uang" className="mx-auto h-72 w-72" />
          </aside>
        </div>
      </section>

      {pendingSavingTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1f12]/45 px-5">
          <div className="relative w-full max-w-sm rounded-[1.4rem] bg-[#fffaf0] p-6 text-center shadow-[0_24px_60px_rgba(45,31,18,0.28)]">
            <Image
              src={pendingSavingTarget.image_url}
              alt={pendingSavingTarget.title}
              width={180}
              height={140}
              className="mx-auto h-32 w-full object-contain drop-shadow-[0_12px_16px_rgba(73,41,11,0.15)]"
            />
            <h3 className="mt-4 text-3xl font-black leading-9 text-[#f79418]">{pendingSavingTarget.title}</h3>
            <p className="mt-3 text-[1rem] font-black leading-7 text-[#5b4635]">
              Jadikan target tabungan?
            </p>
            <p className="mt-2 text-[0.95rem] font-black text-[#806006]">
              Koinmu {coins} dari target {pendingSavingTarget.price}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingSavingTarget(null)}
                disabled={isSavingTargetId === pendingSavingTarget.id}
                className="h-12 rounded-full bg-[#efe4cf] text-[0.9rem] font-black text-[#5b4635] disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSavingTarget}
                disabled={isSavingTargetId === pendingSavingTarget.id}
                aria-busy={isSavingTargetId === pendingSavingTarget.id}
                className="h-12 rounded-full bg-[#fa9818] text-[0.9rem] font-black text-white shadow-[0_10px_18px_rgba(232,113,31,0.22)] transition disabled:opacity-65"
              >
                {isSavingTargetId === pendingSavingTarget.id ? "Menyimpan..." : "Pilih Target"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {activeCelebration ? (
        <CelebrationModal celebration={activeCelebration} onClose={() => setActiveCelebration(null)} />
      ) : null}
    </main>
  );
}

type LessonItem = {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "CONTINUE" | "NEW";
  action: string;
  imageSrc: string;
  topic?: string;
};

function getStoryImageSrcFromSeed(seed: string, imageUrl?: string) {
  if (imageUrl?.trim()) return imageUrl;

  const totalImages = 10;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % totalImages;
  }

  return `/images/${hash + 1}.png`;
}

function storyHeaderToLesson(story: ChildStoryHeader, index: number): LessonItem {
  return {
    id: story.id,
    title: story.title,
    description: story.fullStory,
    progress: 0,
    status: "NEW",
    action: "Mulai Baca",
    imageSrc: getStoryImageSrcFromSeed(story.id || `${story.title}-${index}`, story.image_url),
    topic: story.topic,
  };
}

function EmptyLessonsState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mt-10 rounded-[1.2rem] border border-[#eadcc3] bg-white px-6 py-10 text-center shadow-[0_12px_24px_rgba(116,89,47,0.08)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1c2] text-[#f79316]">
        <Icon name="book" className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-2xl font-black text-[#2d2924]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[0.98rem] font-semibold leading-7 text-[#6d5b4d]">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 h-12 rounded-full bg-[#fa9818] px-7 text-[0.9rem] font-black text-white shadow-[0_10px_18px_rgba(232,113,31,0.22)]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: LessonItem }) {
  const router = useRouter();

  function openStory() {
    window.sessionStorage.setItem(
      `tomoStory:${lesson.id}`,
      JSON.stringify({
        title: lesson.title,
        description: lesson.description,
        topic: lesson.topic,
        imageSrc: lesson.imageSrc,
      })
    );
    router.push(`/child/stories/${lesson.id}`);
  }

  return (
    <article className="group overflow-hidden rounded-[1.25rem] border border-[#eadcc3] bg-white shadow-[0_16px_30px_rgba(116,89,47,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(116,89,47,0.14)]">
      <div className="relative">
        <div className="h-56 overflow-hidden bg-[#e7dfcf]">
          <img
            src={lesson.imageSrc}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_44%,rgba(0,0,0,.62))]" />
        </div>
        <span className={`absolute left-4 top-4 rounded-full px-4 py-1 text-[0.68rem] font-black tracking-[0.12em] shadow-[0_8px_16px_rgba(79,55,17,.15)] ${lesson.status === "CONTINUE" ? "bg-[#8e7100] text-white" : "bg-[#ffc400] text-[#4d3906]"}`}>{lesson.status}</span>
        {lesson.topic ? (
          <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full bg-white/90 px-4 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-[#7b5909] backdrop-blur">
            {lesson.topic}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-[18rem] flex-col px-6 py-6">
        <h3 className="line-clamp-2 text-[1.35rem] font-black leading-tight text-[#2d2924]">{lesson.title}</h3>
        <p className="mt-4 line-clamp-3 text-[0.95rem] font-medium leading-7 text-[#5e4d44]">{lesson.description}</p>
        <div className="mt-auto flex items-center justify-between pt-6 text-[0.75rem] font-black text-[#806006]">
          <span>Adventure Progress</span>
          <span>{lesson.progress}%</span>
        </div>
        <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#e3ddca]">
          <div className="h-full rounded-full bg-[#ff9417]" style={{ width: `${lesson.progress}%` }} />
        </div>
        <button
          type="button"
          onClick={openStory}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6845] to-[#ff9f1c] px-5 text-[0.9rem] font-black text-white shadow-[0_12px_20px_rgba(232,113,31,0.22)] transition hover:brightness-105"
        >
          {lesson.action}
          <Icon name={lesson.progress ? "book" : "play"} className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export function ChildLessonsPage() {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [lessonsError, setLessonsError] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [lessonFilter, setLessonFilter] = useState<"ALL" | "UNSTARTED" | "COMPLETED">("ALL");

  async function loadLessons() {
    setIsLoadingLessons(true);
    setLessonsError("");
    const response = await childrenApi.getStoryHeaders();

    if (response.success) {
      setLessons((response.data ?? []).map(storyHeaderToLesson));
    } else {
      setLessonsError(response.error ?? "Lessons belum bisa dimuat.");
      setLessons([]);
    }

    setIsLoadingLessons(false);
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialLessons() {
      const response = await childrenApi.getStoryHeaders();

      if (ignore) return;

      if (response.success) {
        setLessons((response.data ?? []).map(storyHeaderToLesson));
      } else {
        setLessonsError(response.error ?? "Lessons belum bisa dimuat.");
        setLessons([]);
      }

      setIsLoadingLessons(false);
    }

    loadInitialLessons();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredLessons = useMemo(() => {
    const query = lessonSearch.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const matchesFilter =
        lessonFilter === "ALL" ||
        (lessonFilter === "UNSTARTED" && lesson.progress < 100) ||
        (lessonFilter === "COMPLETED" && lesson.progress >= 100);
      const matchesSearch =
        !query ||
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        (lesson.topic ?? "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [lessonFilter, lessonSearch, lessons]);

  const completedCount = lessons.filter((lesson) => lesson.progress >= 100).length;
  const activeCount = lessons.length - completedCount;

  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-16">
      <ChildNavbar active="lessons" />
      <section className="mx-auto max-w-[1240px] px-5 pt-8 sm:px-8">
        <div className="overflow-hidden rounded-[1.5rem] border border-[#eadcc3] bg-[#fffaf0] shadow-[0_16px_32px_rgba(116,89,47,0.08)]">
          <div className="grid items-center gap-8 px-6 py-7 md:grid-cols-[1fr_auto] md:px-8 lg:px-10">
            <div>
              <span className="inline-flex rounded-full bg-[#fff0bd] px-4 py-1 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#806006]">
                Story Library
              </span>
              <h1 className="mt-4 max-w-[620px] text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight text-[#f79316]">
                Pilih petualangan Tomo
              </h1>
              <p className="mt-4 max-w-[620px] text-[1rem] font-semibold leading-7 text-[#4f4339]">
                Baca cerita, pilih keputusan, dengarkan audio, lalu lihat rangkuman di akhir cerita.
              </p>
            </div>
            <MascotImage src="/images/tomo4.png" alt="Tomo dengan harta karun" className="mx-auto h-52 w-60 md:h-64 md:w-72" />
          </div>

          <div className="grid border-t border-[#eadcc3] bg-white/55 sm:grid-cols-3">
            {[
              ["Cerita", lessons.length],
              ["Aktif", activeCount],
              ["Selesai", completedCount],
            ].map(([label, value]) => (
              <div key={label} className="border-[#eadcc3] px-6 py-4 text-center sm:border-r last:sm:border-r-0">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#806006]">{label}</p>
                <p className="mt-1 text-3xl font-black text-[#2d2924]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[1.2rem] border border-[#eadcc3] bg-white p-4 shadow-[0_10px_22px_rgba(116,89,47,0.07)] lg:grid-cols-[1fr_auto]">
          <label className="flex h-14 items-center gap-4 rounded-[0.9rem] bg-[#f6eedc] px-5 text-[#6c6258]">
            <Icon name="search" className="h-5 w-5 text-[#564a40]" />
            <input
              value={lessonSearch}
              onChange={(event) => setLessonSearch(event.target.value)}
              className="h-full flex-1 bg-transparent text-[1rem] font-semibold outline-none placeholder:text-[#8c8791]"
              placeholder="Cari judul, topik, atau isi cerita..."
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["ALL", "UNSTARTED", "COMPLETED"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setLessonFilter(filter)}
                className={`h-14 rounded-[0.9rem] px-5 text-[0.76rem] font-black tracking-[0.14em] transition ${
                  lessonFilter === filter
                    ? "bg-[#ffc400] text-[#4d3906] shadow-[0_10px_18px_rgba(255,196,0,0.2)]"
                    : "bg-[#f6eedc] text-[#6d5449] hover:bg-[#efe4cf]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoadingLessons ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="min-h-[28rem] animate-pulse rounded-[1.25rem] border border-[#eadcc3] bg-white pb-8 shadow-[0_16px_30px_rgba(116,89,47,0.08)]">
                <div className="h-56 bg-[#e7dfcf]" />
                <div className="px-6 pt-7">
                  <div className="h-7 w-2/3 rounded-full bg-[#e7dfcf]" />
                  <div className="mt-5 h-20 rounded-[1rem] bg-[#f1e8d9]" />
                </div>
              </article>
            ))}
          </div>
        ) : lessonsError ? (
          <EmptyLessonsState
            title="Lesson belum bisa dimuat"
            message={lessonsError}
            actionLabel="Coba Lagi"
            onAction={loadLessons}
          />
        ) : lessons.length === 0 ? (
          <EmptyLessonsState
            title="Belum ada cerita"
            message="Minta parent generate story dulu, nanti cerita akan muncul otomatis di library ini."
          />
        ) : filteredLessons.length === 0 ? (
          <EmptyLessonsState
            title="Cerita tidak ditemukan"
            message="Coba pakai kata kunci lain atau pilih filter ALL untuk melihat semua cerita."
            actionLabel="Reset Filter"
            onAction={() => {
              setLessonSearch("");
              setLessonFilter("ALL");
            }}
          />
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

type StorySnapshot = {
  title: string;
  description: string;
  topic?: string;
  imageSrc?: string;
};

function readStorySnapshot(storyId: string): StorySnapshot {
  const fallback = {
    title: "Misteri Hutan Berbisik",
    description: "",
  };

  if (typeof window === "undefined") return fallback;

  const savedStory = window.sessionStorage.getItem(`tomoStory:${storyId}`);
  if (!savedStory) return fallback;

  try {
    const parsed = JSON.parse(savedStory) as Partial<StorySnapshot>;
    return {
      title: parsed.title || fallback.title,
      description: parsed.description || fallback.description,
      topic: parsed.topic,
      imageSrc: parsed.imageSrc,
    };
  } catch {
    return fallback;
  }
}

function getRandomStoryImageSrc(nodeId?: string, imageUrl?: string) {
  return getStoryImageSrcFromSeed(nodeId || "story", imageUrl);
}

function ForestPanel({
  children,
  image,
  onSpeak,
  isAudioLoading,
}: {
  children: React.ReactNode;
  image?: string;
  onSpeak: () => void;
  isAudioLoading: boolean;
}) {
  return (
    <div className="relative min-h-[26rem] overflow-hidden rounded-[1.5rem] bg-[#1e2c25] shadow-[0_18px_34px_rgba(86,59,25,0.16)]">
      {image ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,22,20,.82),rgba(18,22,20,.28)_54%,rgba(18,22,20,.62)),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.68))]" />
      <button
        type="button"
        onClick={onSpeak}
        disabled={isAudioLoading}
        className="absolute left-7 top-7 z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#fa9818] text-white shadow-[0_14px_28px_rgba(56,37,13,0.24)]"
        aria-label="Putar suara cerita"
      >
        {isAudioLoading ? (
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/45 border-t-white" />
        ) : (
          <Icon name="speaker" className="h-10 w-10" />
        )}
      </button>
      <div className="absolute bottom-8 left-8 right-8 z-10 max-w-[880px] text-[clamp(1.6rem,3vw,3.2rem)] font-black leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,.5)]">
        {children}
      </div>
    </div>
  );
}

function StoryProgress({
  title,
  steps,
  totalSteps,
  percentage,
  isComplete,
}: {
  title: string;
  steps: number;
  totalSteps?: number;
  percentage?: number;
  isComplete: boolean;
}) {
  const page = Math.max(1, steps + 1);
  const displayTotal = totalSteps ? Math.max(page, totalSteps) : undefined;
  const progressWidth = isComplete
    ? 100
    : Math.min(
        92,
        Math.max(0, percentage ?? (displayTotal ? (page / displayTotal) * 100 : 18 + steps * 24))
      );
  const progressLabel = isComplete
    ? "Selesai"
    : displayTotal
      ? `Halaman ${page} dari ${displayTotal}`
      : steps === 0
        ? "Mulai cerita"
        : `Langkah ${page}`;

  return (
    <div className="mx-auto max-w-[560px] text-center">
      <h1 className="mx-auto w-max max-w-full rounded-full bg-[#f1ead4] px-8 py-2 text-[1rem] font-black text-[#fa9818]">
        {title}
      </h1>
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="h-4 overflow-hidden rounded-full bg-[#e8dfc7]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff6845] to-[#ff9f1c]"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <span className="text-[0.75rem] font-black text-[#2d2924]">
          {progressLabel}
        </span>
      </div>
    </div>
  );
}

function isSessionCompleteMessage(message?: string) {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("session") && normalized.includes("complete");
}

function getSummaryDisplayText(summary?: StorySummary) {
  return summary?.description || summary?.summary || summary?.title || "";
}

function getFriendlySummaryError(error?: string) {
  const normalized = (error ?? "").toLowerCase();

  if (normalized.includes("story summary reward already claimed")) {
    return "Hadiah cerita sudah pernah diklaim.";
  }

  if (
    normalized.includes("sqlstate") ||
    normalized.includes("column") ||
    normalized.includes("relation") ||
    normalized.includes("database")
  ) {
    return "Rangkuman cerita sudah tampil, tapi hadiah belum bisa diklaim. Coba lagi nanti.";
  }

  return error || "Summary belum bisa dibuat.";
}

export function ChildStoryPlayerPage() {
  const params = useParams<{ storyId: string }>();
  const router = useRouter();
  const storyId = params.storyId;
  const [snapshot] = useState<StorySnapshot>(() => readStorySnapshot(storyId));
  const [sessionId, setSessionId] = useState("");
  const [node, setNode] = useState<StoryNode | null>(null);
  const [stepsTaken, setStepsTaken] = useState(0);
  const [totalStorySteps, setTotalStorySteps] = useState<number | undefined>();
  const [progressPercentage, setProgressPercentage] = useState<number | undefined>();
  const [statusMessage, setStatusMessage] = useState("Memulai cerita...");
  const [isChoosing, setIsChoosing] = useState<"wise" | "impulsive" | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summaryImageUrl, setSummaryImageUrl] = useState("");
  const [storyReward, setStoryReward] = useState<Pick<StorySummary, "exp" | "coins" | "total_exp" | "level" | "total_coins" | "performance"> | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const decisionInFlightRef = useRef(false);
  const activeNodeIdRef = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function applyStorySummary(summary: StorySummary) {
    setSummaryText(getSummaryDisplayText(summary));
    setSummaryTitle(summary.title ?? "");
    setSummaryImageUrl(summary.image_url ?? "");
    setStoryReward({
      exp: summary.exp,
      coins: summary.coins,
      total_exp: summary.total_exp,
      level: summary.level,
      total_coins: summary.total_coins,
      performance: summary.performance,
    });

    if (typeof summary.total_coins === "number") {
      saveChildCoins(summary.total_coins);
    }
  }

  useEffect(() => {
    activeNodeIdRef.current = node?.node_id ?? "";
  }, [node?.node_id]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function startStory() {
      setStatusMessage("Memulai cerita...");
      const response = await childrenApi.startStory(storyId);

      if (ignore) return;

      if (response.success && response.data) {
        const progress = response.data.progress;

        setSessionId(response.data.session_id);
        setNode(response.data.node);
        setStepsTaken(progress?.steps_taken ?? 0);
        setTotalStorySteps(progress?.total_steps);
        setProgressPercentage(progress?.percentage);
        if (response.data.summary) {
          applyStorySummary(response.data.summary);
        }
        setStatusMessage("");
      } else {
        setStatusMessage(response.error ?? "Story belum bisa dimulai.");
      }
    }

    startStory();

    return () => {
      ignore = true;
    };
  }, [storyId]);

  function playAudioUrl(audioUrl: string) {
    audioRef.current?.pause();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.play().catch(() => {
      setStatusMessage("Audio belum bisa diputar otomatis. Tekan tombol suara sekali lagi.");
    });
  }

  function playTextFallback(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatusMessage("Audio belum tersedia dari server.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("id"));

    utterance.lang = indonesianVoice?.lang ?? "id-ID";
    utterance.voice = indonesianVoice ?? null;
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  }

  async function playNodeAudio() {
    if (!node?.node_id || isAudioLoading) return;

    if (node.audio_url) {
      playAudioUrl(node.audio_url);
      return;
    }

    const nodeId = node.node_id;
    const fallbackText = node.audio_text;

    setIsAudioLoading(true);
    setStatusMessage("Membuat audio cerita...");
    const response = await childrenApi.generateStoryNodeAudio(nodeId);
    setIsAudioLoading(false);

    if (activeNodeIdRef.current !== nodeId) return;

    if (response.success && response.data?.audio_url) {
      const audioUrl = response.data.audio_url;
      setNode((current) => (current?.node_id === nodeId ? { ...current, audio_url: audioUrl } : current));
      setStatusMessage("");
      playAudioUrl(audioUrl);
      return;
    }

    setStatusMessage(`${response.error ?? "Audio server belum tersedia."} Memakai suara perangkat.`);
    playTextFallback(fallbackText);
  }

  async function finishCompletedSession(message?: string) {
    if (!sessionId || !node) return;

    setIsSummaryLoading(true);
    const summaryResponse = await childrenApi.getStorySummary(sessionId);
    setIsSummaryLoading(false);

    setNode((current) =>
      current
        ? {
            ...current,
            is_end: true,
            choices: undefined,
          }
        : current
    );

    if (summaryResponse.success && summaryResponse.data) {
      applyStorySummary(summaryResponse.data);
      setStatusMessage("");
    } else {
      setStatusMessage(message ? getFriendlySummaryError(message) : "Sesi cerita sudah selesai.");
    }
  }

  async function generateCompletedStorySummary(nextSessionId: string) {
    setIsSummaryLoading(true);
    setStatusMessage("Menyusun rangkuman dan hadiah cerita...");
    const summaryResponse = await childrenApi.getStorySummary(nextSessionId);
    setIsSummaryLoading(false);

    if (summaryResponse.success && summaryResponse.data) {
      applyStorySummary(summaryResponse.data);
      setStatusMessage("");
      return;
    }

    setStatusMessage(getFriendlySummaryError(summaryResponse.error));
  }

  async function pickChoice(choice: "wise" | "impulsive") {
    if (!sessionId || !node || decisionInFlightRef.current) return;

    decisionInFlightRef.current = true;
    setIsChoosing(choice);
    setStatusMessage("");

    try {
      const response = await childrenApi.makeStoryDecision(sessionId, node.node_id, choice);

      if (response.success && response.data) {
        const nextStory = response.data;
        const nextChoices = Object.values(nextStory.node.choices ?? {}).filter(Boolean);
        const progress = nextStory.progress;

        setSessionId(nextStory.session_id);
        setNode(nextStory.node);
        setStepsTaken((current) => progress?.steps_taken ?? current + 1);
        setTotalStorySteps((current) => progress?.total_steps ?? current);
        setProgressPercentage(progress?.percentage);
        if (nextStory.summary) {
          applyStorySummary(nextStory.summary);
        } else {
          setSummaryText("");
          setSummaryTitle("");
          setSummaryImageUrl("");
          setStoryReward(null);
        }

        if (nextStory.node.is_end && nextChoices.length === 0) {
          await generateCompletedStorySummary(nextStory.session_id);
        }
      } else if (isSessionCompleteMessage(response.error)) {
        await finishCompletedSession(response.error);
      } else {
        setStatusMessage(response.error ?? "Pilihan belum bisa disimpan.");
      }
    } finally {
      decisionInFlightRef.current = false;
      setIsChoosing(null);
    }
  }

  const title = snapshot.title || "Misteri Hutan Berbisik";
  const choiceEntries = node?.choices
    ? (Object.entries(node.choices).filter((entry): entry is ["wise" | "impulsive", string] =>
        (entry[0] === "wise" || entry[0] === "impulsive") && Boolean(entry[1])
      ))
    : [];
  const isEnd = Boolean(node?.is_end) && choiceEntries.length === 0;
  const nodeImage = node
    ? getRandomStoryImageSrc(node.node_id, summaryImageUrl || node.image_url || snapshot.imageSrc)
    : snapshot.imageSrc || "";
  const finalText = summaryText || node?.audio_text || "";
  const finalTitle = summaryTitle || "Cerita selesai";

  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-16">
      <ChildNavbar active="lessons" />
      <section className="mx-auto max-w-[1160px] px-5 pt-8 sm:px-8">
        <StoryProgress
          title={title}
          steps={stepsTaken}
          totalSteps={totalStorySteps}
          percentage={progressPercentage}
          isComplete={isEnd}
        />
        {statusMessage ? (
          <p className="mx-auto mt-3 max-w-xl rounded-full bg-white/80 px-4 py-2 text-center text-[0.82rem] font-black text-[#806006]">
            {statusMessage}
          </p>
        ) : null}

        {!node ? (
          <div className="mt-8 min-h-[18rem] animate-pulse rounded-[1.5rem] bg-[#eee3ca]" />
        ) : isEnd ? (
          <div className="mx-auto max-w-[980px] pt-10">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#1e2c25] px-6 py-7 shadow-[0_18px_34px_rgba(86,59,25,0.16)] sm:px-8 sm:py-9 lg:min-h-[30rem]">
              {nodeImage ? (
                <img src={nodeImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,22,20,.9),rgba(18,22,20,.62)_54%,rgba(18,22,20,.42)),linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.78))]" />
              <button
                type="button"
                onClick={playNodeAudio}
                disabled={isAudioLoading}
                className="absolute right-5 top-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#fa9818] text-white shadow-[0_14px_28px_rgba(56,37,13,0.2)] sm:h-16 sm:w-16"
                aria-label="Putar suara akhir cerita"
              >
                {isAudioLoading ? <span className="h-7 w-7 animate-spin rounded-full border-4 border-white/45 border-t-white" /> : <Icon name="speaker" className="h-8 w-8" />}
              </button>
              <div className="relative z-10 flex min-h-[30rem] items-end pt-16 sm:min-h-[28rem] lg:min-h-[24rem]">
                <div className="w-full max-w-[680px] lg:max-w-[620px]">
                  <span className="inline-flex rounded-full bg-[#ffc400] px-4 py-1 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#4d3906]">Cerita selesai</span>
                  {summaryTitle ? (
                    <p className="mt-4 max-w-[min(100%,42rem)] text-[0.78rem] font-black uppercase leading-6 tracking-[0.16em] text-[#ffc400] sm:text-[0.86rem]">
                      {finalTitle}
                    </p>
                  ) : null}
                  <h1 className="mt-4 max-w-[min(100%,42rem)] text-[clamp(1.65rem,4vw,2.75rem)] font-black leading-[1.12] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,.5)]">
                    {isSummaryLoading ? "Menyusun rangkuman cerita..." : finalText}
                  </h1>
                  <div className="mt-7 grid max-w-[24rem] grid-cols-2 overflow-hidden rounded-[1rem] bg-white shadow-[0_12px_20px_rgba(103,78,38,0.1)]">
                    <div className="px-4 py-4 text-center sm:px-6 sm:py-5">
                      <Icon name="star" className="mx-auto h-8 w-8 text-[#fa9818]" />
                      <p className="mt-2 text-[1rem] font-black text-[#5b4635]">
                        {typeof storyReward?.exp === "number" ? `+${storyReward.exp} XP` : "XP"}
                      </p>
                      {typeof storyReward?.level === "number" ? (
                        <p className="mt-1 text-[0.72rem] font-black text-[#806006]">Level {storyReward.level}</p>
                      ) : null}
                    </div>
                    <div className="border-l border-[#f0e7d9] px-4 py-4 text-center sm:px-6 sm:py-5">
                      <Icon name="coin" className="mx-auto h-8 w-8 text-[#ffc400]" />
                      <p className="mt-2 text-[1rem] font-black text-[#5b4635]">
                        {typeof storyReward?.coins === "number" ? `+${storyReward.coins} Koin` : "Koin"}
                      </p>
                      {storyReward?.performance ? (
                        <p className="mt-1 text-[0.72rem] font-black uppercase text-[#806006]">{storyReward.performance}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/child/lessons")}
              className="mx-auto mt-9 block h-16 w-full max-w-[420px] rounded-full bg-gradient-to-r from-[#ff6845] to-[#ff9f1c] text-[0.95rem] font-black text-white shadow-[0_14px_24px_rgba(232,113,31,0.24)]"
            >
              Lanjutkan Petualangan
            </button>
          </div>
        ) : (
          <div className="mt-7">
            <ForestPanel image={nodeImage} onSpeak={playNodeAudio} isAudioLoading={isAudioLoading}>
              {node.audio_text}
            </ForestPanel>
            {choiceEntries.length > 0 ? (
              <div className="mx-auto -mt-1 max-w-[1060px] rounded-[1.4rem] bg-white px-6 py-7 text-center shadow-[0_14px_28px_rgba(103,78,38,0.12)]">
                <p className="text-2xl font-black leading-tight text-[#2d2924]">Apa yang harus Tomo lakukan?</p>
                <div className="mx-auto mt-7 grid max-w-[760px] gap-5 sm:grid-cols-2">
                  {choiceEntries.map(([choice, label]) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => pickChoice(choice)}
                      disabled={Boolean(isChoosing)}
                      className={`min-h-36 rounded-[1.2rem] border-t-8 bg-[#f2ecd9] px-6 py-5 shadow-[0_14px_24px_rgba(103,78,38,0.12)] transition hover:-translate-y-0.5 disabled:opacity-60 ${
                        choice === "wise" ? "border-[#fa9818] text-[#806006]" : "border-[#ff6845] text-[#ff6845]"
                      }`}
                    >
                      <Icon name={choice === "wise" ? "wallet" : "coin"} className="mx-auto h-12 w-12" />
                      <span className="mt-4 block text-xl font-black">{isChoosing === choice ? "Memilih..." : label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#bd9c58] ${color} shadow-[inset_0_4px_12px_rgba(255,255,255,.45)]`}>
        <Icon name={label === "Savvy Saver" ? "coin" : label === "The Trade-off" ? "edit" : "book"} className="h-12 w-12 text-[#7a4d13]" />
      </div>
      <p className="mx-auto -mt-2 w-max rounded-sm bg-[#f7ecd8] px-3 py-1 text-[0.82rem] font-black text-[#5b3f24] shadow"> {label}</p>
    </div>
  );
}

export function ChildProfilePage() {
  const [profileName, setProfileName] = useState("Scout Alex");
  const [profileAvatarSrc, setProfileAvatarSrc] = useState(getChildAvatarSrc(""));
  const [profileCoins, setProfileCoins] = useState(DEFAULT_CHILD_POINTS);
  const [savingTarget, setSavingTarget] = useState<MarketItem | null>(null);
  const [isLoadingSavings, setIsLoadingSavings] = useState(true);
  const [draftName, setDraftName] = useState("Scout Alex");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfileName, setIsSavingProfileName] = useState(false);
  const [profileNameMessage, setProfileNameMessage] = useState("");
  const [savingTargetMessage, setSavingTargetMessage] = useState("");
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);

  useEffect(() => {
    const storedName =
      window.localStorage.getItem("selectedChildName") ||
      window.localStorage.getItem("selectedUser") ||
      "Scout Alex";
    const storedChildId = window.localStorage.getItem("selectedChildId") || "";
    const storedSubtitle = window.localStorage.getItem("tomoSubtitleEnabled");

    queueMicrotask(() => {
      setProfileName(storedName);
      setProfileAvatarSrc(getChildAvatarSrc(storedChildId || storedName));
      setProfileCoins(readChildCoins(DEFAULT_CHILD_POINTS));
      setDraftName(storedName);
      setSubtitleEnabled(storedSubtitle !== "false");
    });

    const loadSavings = async () => {
      setIsLoadingSavings(true);
      setSavingTargetMessage("");

      const [marketsResponse, savedTargetId] = await Promise.all([
        childrenApi.getMarkets(),
        Promise.resolve(readSavingTargetId()),
      ]);

      if (marketsResponse.success && Array.isArray(marketsResponse.data)) {
        const items = marketsResponse.data;

        if (savedTargetId) {
          setSavingTarget(items.find((item) => item.id === savedTargetId) ?? null);
        } else {
          setSavingTarget(null);
        }
      } else {
        setSavingTarget(null);
        setSavingTargetMessage(marketsResponse.error ?? "Daftar target belum bisa dimuat.");
      }

      setIsLoadingSavings(false);
    };

    loadSavings();
  }, []);

  function openEditProfile() {
    setDraftName(profileName);
    setProfileNameMessage("");
    setIsEditingProfile(true);
  }

  async function saveProfileName() {
    const nextName = draftName.trim();

    if (!nextName) {
      setProfileNameMessage("Nama tidak boleh kosong.");
      return;
    }

    setIsSavingProfileName(true);
    setProfileNameMessage("");
    const response = await childrenApi.updateName(nextName);

    if (response.success) {
      const updatedName = response.data?.name ?? nextName;
      setProfileName(updatedName);
      window.localStorage.setItem("selectedChildName", updatedName);
      window.localStorage.setItem("selectedUser", updatedName);
      setIsEditingProfile(false);
    } else {
      setProfileNameMessage(response.error ?? "Nama belum bisa disimpan.");
    }

    setIsSavingProfileName(false);
  }

  function toggleSubtitle() {
    setSubtitleEnabled((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem("tomoSubtitleEnabled", String(nextValue));
      return nextValue;
    });
  }

  const targetProgress = savingTarget?.price
    ? Math.min(100, Math.round((profileCoins / savingTarget.price) * 100))
    : 0;
  const remainingCoins = savingTarget ? Math.max(0, savingTarget.price - profileCoins) : 0;

  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-12">
      <ChildNavbar active="profile" />
      <section className="mx-auto grid max-w-[1240px] gap-6 px-5 pt-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:gap-8 lg:pt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-white px-6 py-8 shadow-[0_18px_34px_rgba(116,89,47,0.08)] ring-1 ring-[#ead6b2] md:flex md:items-center md:gap-9 md:px-8 md:py-10">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#ffe071]/32 blur-3xl" />
          <div className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center md:mx-0">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#ffe071]/55 to-[#ff8128]/18 blur-xl" />
            <div className="relative h-40 w-40 overflow-hidden rounded-full bg-transparent">
              <MascotImage
                src={profileAvatarSrc}
                alt={profileName}
                className="h-full w-full"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#ff6845] px-5 py-2 text-sm font-black text-white shadow-[0_10px_18px_rgba(255,104,69,0.24)]">
              LVL 12
            </span>
          </div>
          <div className="relative mt-9 min-w-0 flex-1 text-center md:mt-0 md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <h1 className="min-w-0 break-words text-4xl font-black leading-tight text-[#f79316] sm:text-5xl">{profileName}</h1>
              <button
                type="button"
                onClick={openEditProfile}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0cc] text-[#7b5d08] shadow-[0_8px_14px_rgba(123,93,8,0.12)] transition hover:-translate-y-0.5 hover:bg-[#ffe3a1]"
                aria-label="Edit nama profil"
              >
                <Icon name="edit" className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-[1rem] font-bold leading-7 text-[#6a5545]">
              Keep collecting XP and badges on every adventure.
            </p>
            <div className="mx-auto mt-6 max-w-xl rounded-[1.2rem] bg-[#fff4d8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:mx-0">
              <div className="flex items-center justify-between gap-4 text-[0.9rem] font-black text-[#6d510b]">
                <span>Level 12</span>
                <span>750 / 1000 XP</span>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-white shadow-[inset_0_2px_4px_rgba(125,92,37,0.12)]">
                <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-[#ffc000] to-[#ff9818]" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#fa9818] px-7 py-8 text-white shadow-[0_16px_28px_rgba(94,70,41,0.16)]">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/18" />
          <div className="relative">
            <p className="text-[0.85rem] font-black uppercase tracking-[0.22em] text-white/82">Koin</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-7xl font-black leading-none">{profileCoins}</p>
              <Icon name="coin" className="mb-2 h-10 w-10 text-[#ffe071]" />
            </div>
          </div>

          <div className="relative mt-7 rounded-[1.2rem] bg-white/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <p className="text-[0.82rem] font-black uppercase tracking-[0.18em] text-white/82">Target</p>
            {isLoadingSavings ? (
              <div className="mt-4 h-24 animate-pulse rounded-[1rem] bg-white/18" />
            ) : savingTarget ? (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 rounded-[1rem] bg-white/18">
                    <Image
                      src={savingTarget.image_url}
                      alt={savingTarget.title}
                      fill
                      sizes="80px"
                      className="object-contain p-2 drop-shadow-[0_8px_12px_rgba(73,41,11,0.18)]"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black leading-tight">{savingTarget.title}</h2>
                    <p className="mt-1 text-[0.9rem] font-bold text-white/86">
                      {profileCoins}/{savingTarget.price} koin
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-full bg-[#8d5607]/38 p-1">
                  <div
                    className="h-3 rounded-full bg-[#ffe071] transition-all"
                    style={{ width: `${targetProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-[0.9rem] font-black">
                  {remainingCoins === 0 ? "Target siap dibuka!" : `Kurang ${remainingCoins} koin lagi`}
                </p>
              </>
            ) : (
              <div className="mt-4 rounded-[1rem] bg-white/18 px-4 py-5 text-center">
                <p className="text-[0.95rem] font-black leading-6">Belum ada target</p>
                <Link href="/child/dashboard" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-[0.82rem] font-black text-[#f79316]">
                  Pilih Target
                </Link>
              </div>
            )}
            {savingTargetMessage ? (
              <p className="mt-3 text-[0.82rem] font-black text-white/90">{savingTargetMessage}</p>
            ) : null}
          </div>


        </div>

        <section className="rounded-[1.8rem] border-2 border-[#ffd253] bg-[#fff0b8] px-6 py-7 text-center shadow-[0_14px_24px_rgba(116,89,47,0.07)] md:px-8">
          <h2 className="text-3xl font-black text-[#806006] sm:text-4xl">Badge Collection</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-10">
            <Badge label="Spending Spree" color="bg-[#91d47b]" />
            <Badge label="The Trade-off" color="bg-[#87c9e9]" />
            <Badge label="Savvy Saver" color="bg-[#f7a3a8]" />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[1.8rem] border-2 border-[#ffd253] bg-[#fff0b8] px-6 py-5 shadow-[0_14px_24px_rgba(116,89,47,0.07)]">
            <h2 className="text-xl font-black text-[#5a4840]">Settings</h2>
            <div className="mt-5 flex items-center justify-between gap-5 text-lg font-black text-[#5a4840]">
              <span>Subtitle</span>
              <button
                type="button"
                onClick={toggleSubtitle}
                className={`relative h-9 w-20 rounded-full transition ${
                  subtitleEnabled ? "bg-[#ff9818]" : "bg-[#d8cbb7]"
                }`}
                aria-pressed={subtitleEnabled}
                aria-label="Subtitle in game"
              >
                <span className={`absolute top-1/2 -translate-y-1/2 text-[0.62rem] font-black text-white ${
                  subtitleEnabled ? "left-3" : "right-3 text-[#7b6959]"
                }`}>
                  {subtitleEnabled ? "ON" : "OFF"}
                </span>
                <span
                  className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${
                    subtitleEnabled ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
          <MascotImage src="/images/tomo2.png" alt="Tomo raja" className="mx-auto h-56 w-56" />
        </aside>
      </section>

      {isEditingProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1f12]/45 px-5">
          <div className="w-full max-w-md overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_60px_rgba(45,31,18,0.28)]">
            <div className="flex items-center justify-between bg-[#fa9818] px-6 py-5 text-white">
              <h2 className="text-2xl font-black">Edit Profil</h2>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                disabled={isSavingProfileName}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-xl font-black"
                aria-label="Tutup edit profil"
              >
                x
              </button>
            </div>
            <div className="px-6 py-7">
              <label className="block">
                <span className="mb-2 block text-[0.9rem] font-black text-[#8a6408]">Nama</span>
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  disabled={isSavingProfileName}
                  className="h-14 w-full rounded-full bg-[#f0e6d2] px-5 text-[1.05rem] font-black text-[#3f3328] outline-none focus:ring-4 focus:ring-[#fa9818]/20"
                  maxLength={24}
                />
              </label>
              {profileNameMessage ? (
                <p className="mt-3 rounded-[1rem] bg-red-50 px-4 py-3 text-[0.85rem] font-black text-red-600">
                  {profileNameMessage}
                </p>
              ) : null}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isSavingProfileName}
                  className="h-12 rounded-full bg-[#efe4cf] text-[0.95rem] font-black text-[#5b4635] disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveProfileName}
                  disabled={isSavingProfileName}
                  aria-busy={isSavingProfileName}
                  className="h-12 rounded-full bg-[#fa9818] text-[0.95rem] font-black text-white shadow-[0_10px_18px_rgba(232,113,31,0.22)] disabled:opacity-60"
                >
                  {isSavingProfileName ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
