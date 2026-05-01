"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { themeApi, type StoryThemes } from "@/lib/api";

const FALLBACK_THEMES: StoryThemes = {
  finance: [
    { topic: "Menabung (Saving)" },
    { topic: "Mengelola Uang (Budgeting)" },
    { topic: "Tujuan Keuangan (Financial Goal Setting)" },
    { topic: "Pilihan Bijak vs Impulsif" },
    { topic: "Nilai Uang (Value of Money)" },
    { topic: "Cara Mendapatkan Uang (Earning)" },
    { topic: "Berbagi dan Sedekah" },
    { topic: "Kebutuhan vs Keinginan" },
    { topic: "Untung dan Rugi (Basic Risk)" },
    { topic: "Pengaruh Iklan dan Godaan Konsumsi" },
  ],
  story: [{ topic: "SNOW WHITE" }],
};

function DropdownArrow() {
  return (
    <span className="pointer-events-none absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#ead8b9] text-[#8b5b14]">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
        <path d="M5.2 7.6a1 1 0 0 1 1.4 0L10 11l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L5.2 9a1 1 0 0 1 0-1.4Z" />
      </svg>
    </span>
  );
}

export default function ParentGeneratePage() {
  const [themeOptions, setThemeOptions] = useState<StoryThemes>(FALLBACK_THEMES);
  const [selectedTopic, setSelectedTopic] = useState(FALLBACK_THEMES.finance[0]?.topic ?? "");
  const [selectedTheme, setSelectedTheme] = useState(FALLBACK_THEMES.story[0]?.topic ?? "");
  const [prompt, setPrompt] = useState("Saving for a new toy...");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [themesError, setThemesError] = useState("");

  const topics = useMemo(() => themeOptions.finance.map((item) => item.topic), [themeOptions.finance]);
  const themes = useMemo(() => themeOptions.story.map((item) => item.topic), [themeOptions.story]);

  const stories = [
    {
      id: 1,
      title: "The Golden Piggy's Secret",
      description: "Learn the art of patience as Leo discovers why some things are worth waiting for.",
      imageClass: "from-yellow-700 to-amber-800",
    },
    {
      id: 2,
      title: "Market Day Decisions",
      description: "Join Mia at the Star Market where she must choose between a fast snack or a lasting treasure.",
      imageClass: "from-blue-900 to-indigo-950",
    },
  ];

  async function handleGenerateStory() {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsGenerating(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadThemes() {
      const response = await themeApi.getAll();
      if (!isMounted) return;

      if (response.success && response.data) {
        setThemeOptions(response.data);
        setSelectedTopic(response.data.finance[0]?.topic ?? "");
        setSelectedTheme(response.data.story[0]?.topic ?? "");
        setThemesError("");
      } else {
        setThemesError(response.error ?? "Failed to load topics and themes.");
      }

      setIsLoadingThemes(false);
    }

    loadThemes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc]">
      <header className="sticky top-0 z-40 border-b border-[#e8d4b0] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
          <h1 className="text-2xl font-black text-[#f39211]">TOMO</h1>
          <nav className="flex items-center gap-8">
            <Link href="/parent/dashboard" className="text-sm font-semibold text-[#8d7661] hover:text-[#f39211]">
              Dashboard
            </Link>
            <Link href="/parent/generate" className="border-b-2 border-[#f39211] text-sm font-bold text-[#f39211]">
              Generate
            </Link>
            <Link href="/parent/profile" className="h-10 w-10 rounded-full bg-gradient-to-br from-[#cb4f0e] via-[#d96c12] to-[#b0410b]" aria-label="Open profile" />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-14">
        <section className="mb-14 rounded-[2rem] border border-[#e8d4b0] bg-[#ece6d6] p-8 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <h2 className="text-4xl font-black tracking-[-0.05em] text-[#f39211] sm:text-5xl">
                Create a New Adventure
              </h2>
              <p className="mt-3 max-w-xl text-lg text-[#5f4d42]">
                What financial quest shall we embark on today? Tomo is ready to guide the way!
              </p>

              <div className="mt-8 rounded-[1.4rem] border border-[#dcc6a4] bg-white/55 p-4 shadow-[0_18px_40px_rgba(98,65,19,0.08)] sm:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#a06f16]">Finance topic</span>
                    <span className="relative block">
                      <select
                        value={selectedTopic}
                        onChange={(event) => setSelectedTopic(event.target.value)}
                        className="h-14 w-full appearance-none rounded-2xl border border-[#d9c6a8] bg-[#fff8e9] px-4 pr-14 text-base font-black text-[#3f2f20] shadow-inner outline-none transition hover:bg-white focus:border-[#f4b614] focus:bg-white focus:ring-4 focus:ring-[#f4b614]/20"
                      >
                        {topics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                      <DropdownArrow />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#a06f16]">Story theme</span>
                    <span className="relative block">
                      <select
                        value={selectedTheme}
                        onChange={(event) => setSelectedTheme(event.target.value)}
                        className="h-14 w-full appearance-none rounded-2xl border border-[#d9c6a8] bg-[#fff8e9] px-4 pr-14 text-base font-black text-[#3f2f20] shadow-inner outline-none transition hover:bg-white focus:border-[#f4b614] focus:bg-white focus:ring-4 focus:ring-[#f4b614]/20"
                      >
                        {themes.map((theme) => (
                          <option key={theme} value={theme}>
                            {theme}
                          </option>
                        ))}
                      </select>
                      <DropdownArrow />
                    </span>
                  </label>
                </div>

                {isLoadingThemes ? (
                  <p className="mt-4 rounded-xl bg-[#fff8e9] px-4 py-3 text-sm font-bold text-[#8d7661]">Loading topics and themes...</p>
                ) : themesError ? (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{themesError}</p>
                ) : null}

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#a06f16]">Story idea</span>
                  <span className="flex items-center gap-3 rounded-2xl border border-[#d9c6a8] bg-[#fff8e9] px-4 py-3 shadow-inner transition focus-within:border-[#f4b614] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f4b614]/20">
                    <img src="/images/tomo1.svg" alt="Tomo icon" className="h-8 w-8 object-contain" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      className="w-full bg-transparent text-base font-bold text-[#4d3b2f] outline-none placeholder:text-[#9f8f7e]"
                      placeholder="Saving for a new toy..."
                    />
                  </span>
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold leading-6 text-[#755f4c]">
                    {selectedTopic} with {selectedTheme}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateStory}
                    disabled={isGenerating}
                    className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff6d4d] px-8 text-lg font-black text-white shadow-[0_12px_24px_rgba(243,130,32,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(243,130,32,0.34)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGenerating ? "Generating..." : "Generate Story"}
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <img src="/images/tomo2.png" alt="Tomo mascot" className="h-72 w-72 object-contain" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-4xl font-black tracking-[-0.05em] text-[#f39211]">Story Library</h3>
          <p className="mt-2 text-[1.05rem] font-semibold text-[#7d6b57]">Continue your previous expeditions</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {stories.map((story) => (
              <article key={story.id} className="overflow-hidden rounded-[1.6rem] border border-[#e8d4b0] bg-white/70">
                <div className={`h-40 bg-gradient-to-br ${story.imageClass}`} />
                <div className="p-5">
                  <h4 className="text-3xl font-black tracking-[-0.04em] text-[#2f281f]">{story.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-[#6d5a48]">{story.description}</p>
                  <button type="button" className="mt-5 h-12 w-full rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff7a2f] text-base font-black text-white">
                    See Story
                  </button>
                </div>
              </article>
            ))}

            <article className="flex min-h-[22rem] flex-col items-center justify-center rounded-[1.6rem] border-2 border-dashed border-[#e6d5ba] bg-[#f2ecdd] p-6 text-center">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#e9decc] text-3xl text-[#ccbc9d]">+</div>
              <h4 className="text-3xl font-black tracking-[-0.04em] text-[#6d5a48]">Generate more with AI</h4>
              <p className="mt-2 text-sm text-[#887a67]">Endless possibilities await with every new idea.</p>
              <button type="button" className="mt-6 text-base font-black text-[#f39211] hover:underline" onClick={handleGenerateStory}>
                New Quest →
              </button>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
