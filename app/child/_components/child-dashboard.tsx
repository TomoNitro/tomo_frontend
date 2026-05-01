"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { childrenApi } from "@/lib/api";
import { ChildMarket } from "./child-market";

type ChildPage = "home" | "lessons" | "profile";

const navItems = [
  { label: "Home", href: "/child/dashboard", key: "home" },
  { label: "Lessons", href: "/child/lessons", key: "lessons" },
] as const;

const DEFAULT_CHILD_POINTS = 75;

function Icon({ name, className = "h-5 w-5" }: { name: "user" | "book" | "search" | "play" | "edit" | "coin"; className?: string }) {
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

  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" fill="currentColor" opacity=".18" />
      <path d="M12 6v12M15.5 8.5h-5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChildNavbar({ active }: { active: ChildPage }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#fffaf0]/92 shadow-[0_8px_22px_rgba(112,81,44,0.08)] backdrop-blur">
      <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-8 sm:px-10">
        <Link href="/child/dashboard" className="text-[1.32rem] font-black tracking-[0.06em] text-[#f79316]">
          TOMO
        </Link>
        <div className="flex h-full items-center gap-9 text-[0.85rem] font-black">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex h-full items-center border-b-[3px] px-2 pt-[3px] transition-colors ${
                active === item.key
                  ? "border-[#ff9417] text-[#f79316]"
                  : "border-transparent text-[#2f2821] hover:text-[#f79316]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link href="/child/profile" aria-label="Profile" className={`text-[#ff9417] transition-transform hover:scale-105 ${active === "profile" ? "scale-105" : ""}`}>
          <Icon name="user" className="h-6 w-6" />
        </Link>
      </nav>
    </header>
  );
}

function MascotImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={620}
      height={620}
      className={`${className} object-contain drop-shadow-[0_14px_20px_rgba(104,61,20,0.18)]`}
      sizes="(max-width: 768px) 60vw, 320px"
    />
  );
}

function MissionRow({ icon, title, progress, reward, done = false }: { icon: "book" | "coin"; title: string; progress: string; reward: string; done?: boolean }) {
  return (
    <div className="grid min-h-20 grid-cols-[4.5rem_1fr_auto_auto] items-center gap-4 rounded-[1.6rem] border-2 border-[#e9c4b9] bg-[#fffaf0]/80 px-5 py-4 max-md:grid-cols-[4rem_1fr] max-md:gap-y-3">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${done ? "bg-[#ffd29b] text-[#f99a18]" : "bg-[#ffc000] text-[#806006]"}`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-[1.25rem] font-black leading-7 text-[#2c2921]">{title}</h3>
      </div>
      <div className="text-center max-md:ml-[5.2rem] max-md:text-left">
        <p className={`text-[1.35rem] font-black leading-none ${done ? "text-[#f5b400]" : "text-[#ff9417]"}`}>{progress}</p>
      </div>
      <div className="rounded-full bg-[#ff9a1a] px-5 py-3 text-[1.05rem] font-black text-white max-md:justify-self-end">{reward}</div>
    </div>
  );
}

export function ChildHomePage() {
  const [coins, setCoins] = useState(DEFAULT_CHILD_POINTS);

  useEffect(() => {
    const loadCoins = async () => {
      const response = await childrenApi.getCoins();
      if (response.success) {
        setCoins(response.data ?? DEFAULT_CHILD_POINTS);
      }
    };

    loadCoins();
  }, []);

  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-12">
      <ChildNavbar active="home" />
      <section className="mx-auto max-w-[1160px] px-7 pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ff704d] via-[#ff9417] to-[#fb9714] px-6 py-7 text-white shadow-[0_18px_34px_rgba(120,80,26,0.16)] sm:px-8 md:px-10">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/14" />
          <div className="absolute -bottom-16 -left-12 h-36 w-52 rounded-full bg-[#b96d10]/12" />
          <div className="relative z-10 grid items-center gap-6 md:grid-cols-[180px_1fr]">
            <div className="relative mx-auto h-44 w-44 md:h-48 md:w-48">
              <div className="absolute inset-3 rounded-full bg-[#ffc400]/25 blur-2xl" />
              <MascotImage src="/images/tomo5.png" alt="Tomo membawa koin" className="relative h-full w-full" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <span className="inline-flex rounded-full bg-[#ffc400] px-6 py-2 text-[1rem] font-black text-[#4b3605] shadow-[0_8px_14px_rgba(104,70,0,0.16)]">Level 12</span>
                <span className="rounded-full bg-white/18 px-4 py-2 text-[0.9rem] font-black">250 XP lagi</span>
              </div>
              <h1 className="mt-4 text-4xl font-black leading-[1.1] sm:text-5xl">Naik level</h1>
              <div className="mt-6 max-w-[620px] rounded-[1.2rem] bg-[#b96d10]/58 p-3">
                <div className="mb-2 flex items-center justify-between px-1 text-[0.9rem] font-black text-white">
                  <span>XP</span>
                  <span>750 / 1000</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-[#8f5709]/50">
                  <div className="h-full w-[75%] rounded-full bg-[#ffc400] shadow-[inset_0_2px_0_rgba(255,255,255,0.38)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_390px]">
          <div>
            <h2 className="mb-3 text-3xl font-black text-[#765706]">Hari ini</h2>
            <div className="space-y-3">
              <MissionRow icon="book" title="Baca cerita" progress="0/1" reward="+10 XP" />
              <MissionRow icon="coin" title="Tabung koin" progress="✓" reward="+5 XP" done />
            </div>

            <ChildMarket points={coins} />
          </div>

          <aside className="space-y-8">
            <div className="relative pt-8">
              <Image
                src="/images/tomonongol.png"
                alt=""
                width={168}
                height={67}
                className="pointer-events-none absolute left-1/2 top-0 z-10 h-auto w-28 -translate-x-1/2 drop-shadow-[0_10px_14px_rgba(103,60,18,0.18)]"
                aria-hidden
              />
              <Link href="/child/lessons" className="flex min-h-28 items-center justify-center gap-5 rounded-[2.6rem] bg-[#fa9818] px-7 pb-7 pt-10 text-center text-[#2d2924] shadow-[0_8px_0_rgba(220,126,18,0.22)] transition-transform hover:-translate-y-0.5">
                <Icon name="book" className="h-6 w-6 text-[#2d2924]" />
                <span className="text-3xl font-black leading-[1.16]">
                  Lanjut
                </span>
              </Link>
            </div>
            <div className="rounded-[1.6rem] bg-[#fa9818] px-8 py-8 text-center text-white">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#fa9818]">
                <Icon name="coin" className="h-12 w-12" />
              </div>
              <p className="mt-5 text-3xl font-black">Koin</p>
              <p className="text-7xl font-black leading-none">{coins}</p>
            </div>
            <MascotImage src="/images/tomo5.png" alt="Tomo membawa kantong uang" className="mx-auto h-80 w-80" />
          </aside>
        </div>
      </section>
    </main>
  );
}

const lessons = [
  {
    title: "Misteri Hutan Berbisik",
    description: "Learn the value of saving as you navigate through a forest where trees whisper financial secrets.",
    progress: 85,
    status: "CONTINUE",
    action: "Lanjut Baca",
    image: "forest",
  },
  {
    title: "Harta Karun Pulau Emas",
    description: "Master the art of budgeting and smart spending on a tropical island filled with hidden coins.",
    progress: 0,
    status: "NEW",
    action: "Mulai Baca",
    image: "beach",
  },
  {
    title: "Gunung Es Investasi",
    description: "Discover how small actions today can grow into something huge over time through long-term growth.",
    progress: 0,
    status: "NEW",
    action: "Mulai Baca",
    image: "blank",
  },
];

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

function LessonCard({ lesson }: { lesson: (typeof lessons)[number] }) {
  return (
    <article className="rounded-[1.7rem] bg-white p-3 pb-8 shadow-[0_16px_30px_rgba(116,89,47,0.08)]">
      <div className="relative">
        <LessonArt type={lesson.image} />
        <span className={`absolute left-5 top-4 rounded-full px-4 py-1 text-[0.7rem] font-black text-[#2b261e] shadow-[0_8px_16px_rgba(79,55,17,.15)] ${lesson.status === "CONTINUE" ? "bg-[#8e7100] text-white" : "bg-[#ff9818]"}`}>{lesson.status}</span>
      </div>
      <div className="px-6 pt-7">
        <h3 className="text-[1.45rem] font-black leading-tight text-[#f79316]">{lesson.title}</h3>
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

        <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {[...lessons, ...lessons].map((lesson, index) => (
            <LessonCard key={`${lesson.title}-${index}`} lesson={lesson} />
          ))}
        </div>
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
  return (
    <main className="min-h-screen bg-[#fbf5e8] pb-12">
      <ChildNavbar active="profile" />
      <section className="mx-auto grid max-w-[1240px] gap-8 px-10 pt-20 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2.6rem] bg-white px-10 py-16 shadow-[0_18px_34px_rgba(116,89,47,0.08)] md:flex md:items-center md:gap-10">
          <div className="relative mx-auto h-44 w-44 shrink-0 rounded-full border-[8px] border-[#ffc000] bg-[#201a18] p-4 md:mx-0">
            <MascotImage src="/images/tomo1.png" alt="Scout Alex" className="h-full w-full" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-[3deg] rounded-[1rem] bg-[#ff6845] px-6 py-3 text-lg font-black text-white">LVL 12</span>
          </div>
          <div className="mt-10 text-center md:mt-0 md:text-left">
            <h1 className="inline-flex items-center gap-4 text-5xl font-black tracking-[-0.04em] text-[#f79316]">Scout Alex <Icon name="edit" className="h-5 w-5 text-[#7b5d08]" /></h1>
            <p className="mt-4 max-w-xl text-xl font-black leading-8 text-[#5a4840]">Mastering the Wilderness of Numbers and Letters. Keep exploring!</p>
          </div>
        </div>

        <div className="rounded-[2.6rem] bg-[#fa9818] px-10 py-12 text-center text-white shadow-[0_16px_28px_rgba(94,70,41,0.16)]">
          <p className="text-5xl font-black">LEVEL</p>
          <p className="mt-6 text-8xl font-black leading-none">12</p>
          <div className="mx-auto mt-8 h-3 max-w-72 rounded-full bg-[#ffc36b]">
            <div className="h-full w-[75%] rounded-full bg-[#ffc000]" />
          </div>
          <p className="mt-7 text-[0.9rem] font-bold">Only 5 days until Gold Tier!</p>
        </div>

        <section className="rounded-[1.8rem] border-4 border-[#ffc000] bg-[#ffeaaa] px-8 py-7 text-center">
          <h2 className="text-4xl font-black tracking-[-0.03em] text-[#806006]">Badge Collection</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-10">
            <Badge label="Spending Spree" color="bg-[#91d47b]" />
            <Badge label="The Trade-off" color="bg-[#87c9e9]" />
            <Badge label="Savvy Saver" color="bg-[#f7a3a8]" />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[1.8rem] border-4 border-[#ffc000] bg-[#ffeaaa] px-6 py-5">
            <h2 className="text-xl font-black text-[#5a4840]">Settings</h2>
            <div className="mt-5 flex items-center justify-between gap-5 text-lg font-black text-[#5a4840]">
              <span>Subtitle in game</span>
              <span className="relative h-6 w-14 rounded-full bg-[#ff9818]">
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-[#ffc65a]" />
              </span>
            </div>
          </div>
          <MascotImage src="/images/tomo2.png" alt="Tomo raja" className="mx-auto h-56 w-56" />
        </aside>
      </section>
    </main>
  );
}
