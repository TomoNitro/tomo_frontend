import Link from "next/link";
import MascotClient from "./components/MascotClient";

function SectionPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#e3b05a]/40 bg-white/60 px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#b06e0a] shadow-[0_10px_25px_rgba(164,112,24,0.08)] backdrop-blur-sm">
      <span className="h-2 w-2 rounded-full bg-[#f7a51d]" />
      Tomo Expedition
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <div className="mb-5 lg:mb-7">
              <SectionPill />
            </div>
            <h1 className="max-w-xl text-5xl font-black tracking-[-0.06em] text-[#f49a18] sm:text-6xl lg:text-7xl">
              Ready to Explore?
            </h1>
            <p className="mt-5 max-w-lg text-xl leading-9 text-[#665247] sm:text-[1.35rem]">
              Your journey to becoming a money master begins here.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/auth/register"
                className="inline-flex h-16 items-center justify-center rounded-full bg-gradient-to-r from-[#f7ab23] to-[#ff7a2f] px-8 text-[1.05rem] font-black text-white shadow-[0_18px_30px_rgba(243,130,32,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Start Journey
                <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/18 text-sm">
                  ↗
                </span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-16 items-center justify-center rounded-full border border-[#e2c9a2] bg-white/70 px-8 text-[1.05rem] font-black text-[#6b5647] shadow-[0_14px_26px_rgba(126,93,45,0.08)] transition-colors hover:border-[#d9b57a] hover:bg-white"
              >
                I already have an account
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-2 text-[#d79f28]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c85f28]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f7a91d]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f1dfb6]" />
            </div>
          </div>

              <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
                <div className="relative h-[420px] w-[420px] max-w-full sm:h-[480px] sm:w-[480px]">
                  <MascotClient />
                </div>
              </div>
        </div>
      </section>
    </main>
  );
}
