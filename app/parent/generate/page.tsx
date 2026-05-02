"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parentApi, themeApi, type GeneratedStoryHeader, type StoryTheme, type StoryThemes } from "@/lib/api";

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
  story: [{ title: "SNOW WHITE", fullStory: "SNOW WHITE NIKAH" }],
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
  const [selectedTheme, setSelectedTheme] = useState(FALLBACK_THEMES.story[0]?.title ?? "");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [themesError, setThemesError] = useState("");
  const [libraryError, setLibraryError] = useState("");
  const [generateMessage, setGenerateMessage] = useState("");
  const [generateStatus, setGenerateStatus] = useState<"idle" | "success" | "error">("idle");
  const [generatedStories, setGeneratedStories] = useState<GeneratedStoryHeader[]>([]);
  const [libraryHeaders, setLibraryHeaders] = useState<GeneratedStoryHeader[]>([]);

  const topics = useMemo(() => themeOptions.finance.map((item) => item.topic), [themeOptions.finance]);
  const storyOptions = themeOptions.story;
  const themes = useMemo(() => storyOptions.map((item) => item.title), [storyOptions]);
  const selectedStory = useMemo(
    () => storyOptions.find((story) => story.title === selectedTheme),
    [selectedTheme, storyOptions]
  );
  const libraryStories = useMemo(
    () => {
      const storiesByKey = new Map<string, GeneratedStoryHeader | StoryTheme>();

      [...generatedStories, ...libraryHeaders].forEach((story) => {
        const key = `${story.title}-${story.fullStory}`;
        if (!storiesByKey.has(key)) {
          storiesByKey.set(key, story);
        }
      });

      return Array.from(storiesByKey.values());
    },
    [generatedStories, libraryHeaders]
  );

  const loadStoryLibrary = useCallback(async () => {
    setIsLoadingLibrary(true);
    const response = await parentApi.getStoryHeaders();

    if (response.success && response.data) {
      setLibraryHeaders(response.data);
      setLibraryError("");
    } else {
      setLibraryError(response.error ?? "Failed to load story library.");
    }

    setIsLoadingLibrary(false);
  }, []);

  async function handleGenerateStory() {
    setGenerateMessage("");
    setGenerateStatus("idle");

    if (!selectedTopic || !selectedStory) {
      setGenerateMessage("Pilih finance topic dan story theme terlebih dahulu.");
      setGenerateStatus("error");
      return;
    }

    setIsGenerating(true);
    const response = await parentApi.generateStoryHeaders({
      topic: selectedTopic,
      story: {
        title: selectedStory.title,
        full_story: selectedStory.fullStory,
      },
      customPrompt: prompt,
    });

    if (response.success && response.data) {
      const generatedStory = {
        ...response.data,
        topic: response.data.topic || selectedTopic,
        customPrompt: response.data.customPrompt || prompt,
        createdAt: response.data.createdAt || new Date().toISOString(),
      };

      setGeneratedStories((previousStories) => {
        return [generatedStory, ...previousStories].slice(0, 12);
      });
      setGenerateMessage("Story berhasil dibuat dan masuk ke library.");
      setGenerateStatus("success");
      await loadStoryLibrary();
    } else {
      setGenerateMessage(response.error ?? "Gagal membuat story.");
      setGenerateStatus("error");
    }

    setIsGenerating(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadThemes() {
      const themesResponse = await themeApi.getAll();
      if (!isMounted) return;

      if (themesResponse.success && themesResponse.data) {
        setThemeOptions(themesResponse.data);
        setSelectedTopic(themesResponse.data.finance[0]?.topic ?? "");
        setSelectedTheme(themesResponse.data.story[0]?.title ?? "");
        setThemesError("");
      } else {
        setThemesError(themesResponse.error ?? "Failed to load topics and themes.");
      }

      setIsLoadingThemes(false);
    }

    async function loadInitialStoryLibrary() {
      const response = await parentApi.getStoryHeaders();
      if (!isMounted) return;

      if (response.success && response.data) {
        setLibraryHeaders(response.data);
        setLibraryError("");
      } else {
        setLibraryError(response.error ?? "Failed to load story library.");
      }

      setIsLoadingLibrary(false);
    }

    loadThemes();
    loadInitialStoryLibrary();

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

              <div className="mt-8 rounded-[1.4rem] border border-[#dcc6a4] bg-white/65 p-4 shadow-[0_18px_40px_rgba(98,65,19,0.08)] sm:p-5">
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
                        disabled={isLoadingThemes}
                        className="h-14 w-full appearance-none rounded-2xl border border-[#d9c6a8] bg-[#fff8e9] px-4 pr-14 text-base font-black text-[#3f2f20] shadow-inner outline-none transition hover:bg-white focus:border-[#f4b614] focus:bg-white focus:ring-4 focus:ring-[#f4b614]/20 disabled:cursor-not-allowed disabled:opacity-70"
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

                {selectedStory ? (
                  <div className="mt-5 rounded-2xl border border-[#ead8b9] bg-[#fffdf8] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a06f16]">Selected story</p>
                        <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#3f2f20]">{selectedStory.title}</h3>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-[#ffe7b5] px-3 py-1 text-xs font-black text-[#8b5b14]">
                        {selectedTopic}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm font-semibold leading-7 text-[#6d5a48]">
                      {selectedStory.fullStory}
                    </p>
                  </div>
                ) : null}

                {isLoadingThemes ? (
                  <p className="mt-4 rounded-xl bg-[#fff8e9] px-4 py-3 text-sm font-bold text-[#8d7661]">Loading topics and themes...</p>
                ) : themesError ? (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{themesError}</p>
                ) : null}

                <label className="mt-5 block">
                  <span className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#a06f16]">Custom prompt</span>
                    <span className="text-xs font-black text-[#a78657]">{prompt.length}/260</span>
                  </span>
                  <span className="grid gap-3 rounded-2xl border border-[#d9c6a8] bg-[#fff8e9] px-4 py-4 shadow-inner transition focus-within:border-[#f4b614] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f4b614]/20 sm:grid-cols-[auto_1fr]">
                    <img src="/images/tomo5.png" alt="Tomo icon" className="h-10 w-10 object-contain" />
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value.slice(0, 260))}
                      rows={4}
                      className="min-h-28 w-full resize-none bg-transparent text-base font-bold leading-7 text-[#4d3b2f] outline-none placeholder:text-[#9f8f7e]"
                      placeholder="Tulis arahan cerita untuk anak di sini..."
                    />
                  </span>
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="rounded-full bg-[#fff8e9] px-4 py-2 text-sm font-black leading-6 text-[#755f4c]">
                    {selectedTopic} + {selectedTheme}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateStory}
                    disabled={isGenerating || isLoadingThemes}
                    className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff6d4d] px-8 text-lg font-black text-white shadow-[0_12px_24px_rgba(243,130,32,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(243,130,32,0.34)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGenerating ? "Generating..." : "Generate Story"}
                  </button>
                </div>

                {generateMessage ? (
                  <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                    generateStatus === "error"
                      ? "bg-red-50 text-red-600"
                      : generateStatus === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-[#fff8e9] text-[#8d7661]"
                  }`}>
                    {generateMessage}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <img src="/images/tomo2.png" alt="Tomo mascot" className="h-72 w-72 object-contain" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-4xl font-black tracking-[-0.05em] text-[#f39211]">Story Library</h3>
          <p className="mt-2 text-[1.05rem] font-semibold text-[#7d6b57]">Continue stories generated by this parent account</p>

          {isLoadingLibrary ? (
            <p className="mt-5 rounded-xl bg-[#fff8e9] px-4 py-3 text-sm font-bold text-[#8d7661]">Loading story library...</p>
          ) : libraryError ? (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{libraryError}</p>
          ) : libraryStories.length === 0 ? (
            <p className="mt-5 rounded-xl bg-[#fff8e9] px-4 py-3 text-sm font-bold text-[#8d7661]">
              Belum ada story di library. Generate story pertama dari form di atas.
            </p>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {libraryStories.map((story, index) => (
              <article key={`${story.title}-${index}`} className="overflow-hidden rounded-[1.6rem] border border-[#e8d4b0] bg-white/70">
                <div className={`h-40 bg-gradient-to-br ${index % 2 === 0 ? "from-yellow-700 to-amber-800" : "from-blue-900 to-indigo-950"}`} />
                <div className="p-5">
                  {"topic" in story && story.topic ? (
                    <span className="mb-3 inline-flex rounded-full bg-[#ffe7b5] px-3 py-1 text-xs font-black text-[#8b5b14]">
                      Generated
                    </span>
                  ) : null}
                  <h4 className="text-3xl font-black tracking-[-0.04em] text-[#2f281f]">{story.title}</h4>
                  <p className="mt-2 line-clamp-4 text-sm leading-7 text-[#6d5a48]">{story.fullStory}</p>
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
