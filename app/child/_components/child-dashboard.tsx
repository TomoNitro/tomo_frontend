"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { childrenApi, type ChildStoryHeader, type MarketItem } from "@/lib/api";
import { getChildAvatarSrc } from "@/lib/child-avatar";
import { readChildCoins, saveChildCoins } from "@/lib/child-coins";
import { readSavingTargetId, saveSavingTargetId } from "@/lib/saving-target";

type ChildPage = "home" | "lessons" | "profile";

const navItems = [
  { label: "Home", href: "/child/dashboard", key: "home" },
  { label: "Lessons", href: "/child/lessons", key: "lessons" },
] as const;

const DEFAULT_CHILD_POINTS = 75;

function Icon({ name, className = "h-5 w-5" }: { name: "user" | "book" | "search" | "play" | "edit" | "coin" | "logout"; className?: string }) {
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

export function ChildHomePage() {
  const [coins, setCoins] = useState(DEFAULT_CHILD_POINTS);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [savingTarget, setSavingTarget] = useState<MarketItem | null>(null);
  const [pendingSavingTarget, setPendingSavingTarget] = useState<MarketItem | null>(null);
  const [isSavingTargetId, setIsSavingTargetId] = useState<string | null>(null);
  const [savingTargetMessage, setSavingTargetMessage] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const storedCoins = readChildCoins(DEFAULT_CHILD_POINTS);
      setCoins(storedCoins > 0 ? storedCoins : DEFAULT_CHILD_POINTS);
    });

    const loadDashboardData = async () => {
      setIsLoadingMarkets(true);
      setSavingTargetMessage("");

      const [marketsResponse, savedTargetId, coinsResponse] = await Promise.all([
        childrenApi.getMarkets(),
        Promise.resolve(readSavingTargetId()),
        childrenApi.getCoins(),
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

      setIsLoadingMarkets(false);
    };

    loadDashboardData();
  }, []);

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
                <span className="-rotate-2 rounded-full bg-[#ffc400] px-7 py-2 text-[1.05rem] font-black uppercase text-[#4b3605] shadow-[0_8px_14px_rgba(104,70,0,0.16)]">Level 12</span>
              </div>
              <h1 className="mt-4 text-[2.45rem] font-black leading-[1.05] sm:text-5xl">Hampir Jadi Legenda!</h1>
              <div className="mx-auto mt-6 max-w-[520px] rounded-full bg-[#b96d10]/60 p-1.5 md:mx-0">
                <div className="relative h-6 overflow-hidden rounded-full bg-[#8f5709]/45">
                  <div className="h-full w-[75%] rounded-full bg-[#ffc400] shadow-[inset_0_2px_0_rgba(255,255,255,0.38)]" />
                  <span className="absolute inset-0 flex items-center justify-center text-[0.78rem] font-black text-[#2d2309]">750 / 1000 XP</span>
                </div>
              </div>
              <p className="mt-4 text-[1rem] font-bold">250 XP lagi untuk Level 13!</p>
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
  image: string;
  topic?: string;
};

function storyHeaderToLesson(story: ChildStoryHeader, index: number): LessonItem {
  const imageTypes = ["forest", "beach", "blank"];

  return {
    id: story.id,
    title: story.title,
    description: story.fullStory,
    progress: 0,
    status: "NEW",
    action: "Mulai Baca",
    image: imageTypes[index % imageTypes.length],
    topic: story.topic,
  };
}

function LessonArt({ type }: { type: string }) {
  if (type === "forest") {
    return (
      <div className="h-64 rounded-[1.35rem] bg-[linear-gradient(90deg,rgba(21,41,20,.55),transparent_40%),linear-gradient(180deg,rgba(248,230,143,.65),transparent_55%),repeating-linear-gradient(90deg,#22351f_0_12px,#5d7a39_12px_17px,#173016_17px_34px)]">
        <div className="h-full rounded-[1.35rem] bg-[radial-gradient(circle_at_80%_12%,rgba(255,242,168,.45),transparent_18%),linear-gradient(180deg,transparent_55%,rgba(93,101,38,.55))]" />
      </div>
    );
  }

  if (type === "beach") {
    return (
      <div className="relative h-64 overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,#39bfff_0_48%,#1db9d4_48%_63%,#f9cf54_63%)]">
        <div className="absolute right-6 top-0 h-36 w-28 rounded-b-full bg-[#148f3f] [clip-path:polygon(45%_0,72%_0,61%_100%,40%_100%)]" />
        <div className="absolute right-6 top-5 h-28 w-44 rotate-[-14deg] rounded-full bg-[#25a741] [clip-path:ellipse(50%_26%_at_50%_50%)]" />
        <div className="absolute bottom-12 right-20 h-10 w-20 rounded-md bg-[#7c461c] shadow-[inset_0_8px_0_rgba(255,201,77,.45)]" />
        <div className="absolute bottom-9 right-24 h-5 w-16 rounded-b-lg bg-[#553114]" />
      </div>
    );
  }

  return <div className="h-64 rounded-[1.35rem] bg-white" />;
}

function LessonCard({ lesson }: { lesson: LessonItem }) {
  return (
    <article className="rounded-[1.7rem] bg-white p-3 pb-8 shadow-[0_16px_30px_rgba(116,89,47,0.08)]">
      <div className="relative">
        <LessonArt type={lesson.image} />
        <span className={`absolute left-5 top-4 rounded-full px-4 py-1 text-[0.7rem] font-black text-[#2b261e] shadow-[0_8px_16px_rgba(79,55,17,.15)] ${lesson.status === "CONTINUE" ? "bg-[#8e7100] text-white" : "bg-[#ff9818]"}`}>{lesson.status}</span>
      </div>
      <div className="px-6 pt-7">
        <h3 className="text-[1.45rem] font-black leading-tight text-[#f79316]">{lesson.title}</h3>
        {lesson.topic ? (
          <p className="mt-2 text-[0.78rem] font-black uppercase tracking-[0.16em] text-[#806006]">{lesson.topic}</p>
        ) : null}
        <p className="mt-4 min-h-[4.5rem] text-[0.98rem] font-medium leading-7 text-[#5e4d44]">{lesson.description}</p>
        <div className="mt-6 flex items-center justify-between text-[0.78rem] font-black text-[#806006]">
          <span>Adventure Progress</span>
          <span>{lesson.progress}%</span>
        </div>
        <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#e3ddca]">
          <div className="h-full rounded-full bg-[#ff9417]" style={{ width: `${lesson.progress}%` }} />
        </div>
        <button className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6845] to-[#ff9f1c] text-[0.95rem] font-black text-white shadow-[0_12px_20px_rgba(232,113,31,0.22)]">
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

  useEffect(() => {
    const loadLessons = async () => {
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
    };

    loadLessons();
  }, []);

  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-16">
      <ChildNavbar active="lessons" />
      <section className="mx-auto max-w-[1240px] px-8 pt-8">
        <div className="grid min-h-80 items-center gap-8 rounded-[2.6rem] bg-[#f6eedc] px-10 py-8 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="max-w-[560px] text-5xl font-black leading-[1.45] tracking-[-0.03em] text-[#f79316]">Ready for your next adventure?</h1>
            <p className="mt-4 max-w-[560px] text-xl font-medium leading-8 text-[#2f2a24]">Welcome back, Explorer! Choose a story below to continue your journey through the world of finance.</p>
          </div>
          <MascotImage src="/images/tomo4.png" alt="Tomo dengan harta karun" className="mx-auto h-72 w-80" />
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-[1fr_auto]">
          <label className="flex h-14 items-center gap-4 rounded-full bg-[#e7dfcf] px-6 text-[#6c6258]">
            <Icon name="search" className="h-5 w-5 text-[#564a40]" />
            <input className="h-full flex-1 bg-transparent text-[1rem] font-semibold outline-none placeholder:text-[#8c8791]" placeholder="Search adventures..." />
          </label>
          <div className="flex flex-wrap gap-3">
            {["ALL", "UNSTARTED", "COMPLETED"].map((filter, index) => (
              <button key={filter} className={`h-11 rounded-full px-7 text-[0.78rem] font-black tracking-[0.18em] ${index === 0 ? "bg-[#ffc000] text-[#593f00]" : "bg-[#e7dfcf] text-[#6d5449]"}`}>{filter}</button>
            ))}
          </div>
        </div>

        {isLoadingLessons ? (
          <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="min-h-[28rem] animate-pulse rounded-[1.7rem] bg-white p-3 pb-8 shadow-[0_16px_30px_rgba(116,89,47,0.08)]">
                <div className="h-64 rounded-[1.35rem] bg-[#e7dfcf]" />
                <div className="px-6 pt-7">
                  <div className="h-7 w-2/3 rounded-full bg-[#e7dfcf]" />
                  <div className="mt-5 h-20 rounded-[1rem] bg-[#f1e8d9]" />
                </div>
              </article>
            ))}
          </div>
        ) : lessonsError ? (
          <div className="mt-12 rounded-[1.7rem] bg-white px-6 py-8 text-center text-[1rem] font-black text-[#806006] shadow-[0_16px_30px_rgba(116,89,47,0.08)]">
            {lessonsError}
          </div>
        ) : lessons.length === 0 ? (
          <div className="mt-12 rounded-[1.7rem] bg-white px-6 py-8 text-center text-[1rem] font-black text-[#806006] shadow-[0_16px_30px_rgba(116,89,47,0.08)]">
            Belum ada lesson. Minta parent generate story dulu.
          </div>
        ) : (
          <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
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
