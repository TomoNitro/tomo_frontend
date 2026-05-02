import Link from "next/link";
import MascotClient from "./components/MascotClient";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Parents", href: "#parents" },
  { label: "Journey", href: "#journey" },
] as const;

const features = [
  {
    title: "Story-based finance",
    description: "Children meet money lessons through adventures, choices, and short scenes.",
  },
  {
    title: "Parent guided",
    description: "Parents choose topics and keep the learning path focused on family goals.",
  },
  {
    title: "Audio friendly",
    description: "Story nodes can be heard aloud, making each lesson easier to follow.",
  },
] as const;

const journeySteps = [
  "Create parent account",
  "Add child profile",
  "Generate story topic",
  "Read, choose, and learn",
] as const;

function SectionPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#ebe4d1] px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8d7661]">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc] text-[#3d3128]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#e8d4b0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-14">
          <h1 className="text-2xl font-black text-[#f39211]">TOMO</h1>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  index === 0
                    ? "shrink-0   text-sm font-bold text-[#f39211]"
                    : "shrink-0 text-sm font-semibold text-[#8d7661] hover:text-[#f39211]"
                }
              >
                {item.label}
              </a>
            ))}
            <span className="h-6 w-px shrink-0 bg-[#e8d4b0]" />
            <Link href="/auth/login" className="shrink-0 text-sm font-semibold text-[#8d7661] hover:text-[#f39211]">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-5 text-sm font-black text-white shadow-[0_12px_22px_rgba(243,133,28,0.24)]"
            >
              Register
            </Link>
          </nav>

          {/* Mobile: Login + Register */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/auth/login" className="text-sm font-semibold text-[#8d7661]">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgba(243,133,28,0.24)]"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Mobile nav tabs — scrollable, no scrollbar */}
        <nav className="flex gap-2 overflow-x-auto scroll-smooth border-t border-[#e8d4b0]/70 px-6 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={
                index === 0
                  ? "shrink-0 rounded-full bg-[#f39211] px-4 py-2 text-[0.78rem] font-black text-white"
                  : "shrink-0 rounded-full bg-[#ebe4d1] px-4 py-2 text-[0.78rem] font-black text-[#6f6252]"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-6 px-6 pb-14 pt-40 sm:px-10 md:pt-28 lg:grid-cols-[1.08fr_0.92fr] lg:px-14 lg:pt-24">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="relative h-[24rem] w-[24rem] max-w-full sm:h-[34rem] sm:w-[34rem] lg:h-[39rem] lg:w-[39rem]">
            <MascotClient src="/images/tomo2.png" />
          </div>
        </div>

        <div className="order-1 mx-auto max-w-xl text-center lg:order-2 lg:mx-0 lg:text-left">
          <h1 className="text-[clamp(3.7rem,8vw,6.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-[#f39211]">
            Ready to Explore?
          </h1>
          <p className="mt-7 max-w-md text-[1.28rem] font-black leading-8 text-[#665247] lg:max-w-lg">
            Your journey to becoming a money master begins here.
          </p>

          <div className="mt-9 flex justify-center lg:justify-start">
            <Link
              href="/auth/register"
              className="inline-flex h-16 min-w-[17rem] items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#ff9f1c] to-[#ff6845] px-9 text-[1.05rem] font-black text-white shadow-[0_18px_34px_rgba(243,120,39,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Start Journey
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/85 text-[0.7rem] text-[#f39211]">
                ↗
              </span>
            </Link>
          </div>

          <div className="mt-6 flex justify-center gap-2 lg:justify-start">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c85f28]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f7a91d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#efe5cf]" />
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-32 mx-auto max-w-7xl px-6 py-20 sm:px-10 md:scroll-mt-24 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionPill>About Us</SectionPill>
            <h2 className="mt-5 text-[clamp(2rem,4vw,3.6rem)] font-black leading-tight text-[#3d3128]">
              Built for small choices that become big habits.
            </h2>
          </div>
          <p className="text-[1.06rem] font-semibold leading-8 text-[#5f4d42]">
            Tomo introduces saving, spending, trade-offs, goals, and self-control through short interactive stories. Parents choose the learning direction, children make choices, and each decision becomes a gentle conversation.
          </p>
        </div>
      </section>

      <section id="features" className="scroll-mt-32 mx-auto max-w-7xl px-6 py-20 sm:px-10 md:scroll-mt-24 lg:px-14">
        <SectionPill>Features</SectionPill>
        <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,3.6rem)] font-black leading-tight text-[#3d3128]">
          Everything for a guided story session.
        </h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.title} className="rounded-3xl border border-[#e8d4b0] bg-white/60 p-7 shadow-[0_16px_30px_rgba(116,89,47,0.08)] backdrop-blur-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe071] text-[1rem] font-black text-[#6f570f]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-2xl font-black text-[#2d2924]">{feature.title}</h3>
              <p className="mt-3 text-[0.98rem] font-semibold leading-7 text-[#6d5b4d]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="parents" className="scroll-mt-32 bg-[#fffaf0] px-6 py-20 sm:px-10 md:scroll-mt-24 lg:px-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionPill>For Parents</SectionPill>
            <h2 className="mt-5 max-w-2xl text-[clamp(2rem,4vw,3.6rem)] font-black leading-tight text-[#3d3128]">
              You stay in control of the learning path.
            </h2>
            <p className="mt-5 max-w-2xl text-[1.05rem] font-semibold leading-8 text-[#665247]">
              Generate story themes, open the child dashboard, and let Tomo handle the playful part. The experience is made for repeated, bite-sized learning at home.
            </p>
          </div>
          <div className="rounded-3xl border border-[#e8d4b0] bg-white/60 p-6 shadow-[0_18px_34px_rgba(116,89,47,0.1)] backdrop-blur-sm">
            {["Saving goals", "Needs vs wants", "Smart spending", "Planning ahead"].map((item) => (
              <div key={item} className="flex items-center gap-4 border-b border-[#efe3cf] py-4 last:border-b-0">
                <span className="h-3 w-3 rounded-full bg-[#f79316]" />
                <span className="text-[1rem] font-black text-[#4f4339]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="scroll-mt-32 mx-auto max-w-7xl px-6 py-20 sm:px-10 md:scroll-mt-24 lg:px-14">
        <SectionPill>Journey</SectionPill>
        <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,3.6rem)] font-black leading-tight text-[#3d3128]">
          From account to adventure in a few simple steps.
        </h2>
        <div className="mt-9 grid gap-4 md:grid-cols-4">
          {journeySteps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-5 shadow-[0_12px_24px_rgba(116,89,47,0.06)] backdrop-blur-sm">
              <p className="text-[0.78rem] font-black uppercase tracking-[0.16em] text-[#f39211]">
                Step {index + 1}
              </p>
              <p className="mt-3 text-xl font-black leading-tight text-[#2d2924]">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}