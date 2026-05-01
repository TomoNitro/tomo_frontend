"use client";

import Link from "next/link";
import { useState } from "react";

export default function ParentGeneratePage() {
  const [selectedTopic, setSelectedTopic] = useState("Finance");
  const [selectedTheme, setSelectedTheme] = useState("Fairytale");
  const [prompt, setPrompt] = useState("Saving for a new toy...");
  const [isGenerating, setIsGenerating] = useState(false);

  const topics = ["Finance", "Health", "Education", "Social"];
  const themes = ["Fairytale", "Adventure", "Mystery", "Fantasy"];

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

              <div className="mt-7 space-y-5">
                <div>
                  <p className="mb-2 text-lg font-black text-[#6b4f1f]">Pick the topic</p>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`rounded-full px-4 py-2 text-sm font-black transition ${selectedTopic === topic ? "bg-[#f4b614] text-[#3f2f20]" : "bg-[#f8f1de] text-[#7b684d] hover:bg-[#fffaf0]"}`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-lg font-black text-[#6b4f1f]">Pick the story theme</p>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={`rounded-full px-4 py-2 text-sm font-black transition ${selectedTheme === theme ? "bg-[#f4b614] text-[#3f2f20]" : "bg-[#f8f1de] text-[#7b684d] hover:bg-[#fffaf0]"}`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-lg font-black text-[#6b4f1f]">Generate the story</p>
                  <div className="flex items-center gap-3 rounded-xl bg-[#e2dccb] px-3 py-3">
                    <img src="/images/tomo1.svg" alt="Tomo icon" className="h-8 w-8 object-contain" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      className="w-full bg-transparent text-base font-semibold text-[#6b5a4d] outline-none placeholder:text-[#9f8f7e]"
                      placeholder="Saving for a new toy..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateStory}
                  disabled={isGenerating}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff6d4d] px-8 text-lg font-black text-white shadow-[0_12px_24px_rgba(243,130,32,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? "Generating..." : "Generate Story ⚡"}
                </button>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <img src="/images/tomo2.svg" alt="Tomo mascot" className="h-72 w-72 object-contain" />
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
