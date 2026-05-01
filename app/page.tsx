import Link from "next/link";
import MascotClient from "./components/MascotClient";

function MascotHero() {
  return (
    <div className="relative h-[420px] w-[420px] max-w-full sm:h-[480px] sm:w-[480px]">
      <div className="absolute inset-0 rounded-full bg-[#ffe27d]/35 blur-3xl" />
      <div className="absolute left-[8%] bottom-[6%] h-[22%] w-[68%] rounded-[999px] bg-gradient-to-r from-[#8a4a1f] via-[#bf742d] to-[#8a4a1f] opacity-35 blur-2xl" />
      <div className="absolute left-[5%] bottom-[3%] right-[5%] flex items-end justify-center gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className="h-10 w-10 rounded-full border border-[#8f582a]/25 bg-gradient-to-br from-[#ffd77a] via-[#f2b438] to-[#c97717] shadow-[0_8px_18px_rgba(141,79,15,0.24)]"
            style={{ transform: `translateY(${index % 2 === 0 ? 0 : 6}px)` }}
          />
        ))}
      </div>
      <div className="absolute left-[11%] bottom-[12%] h-16 w-28 rounded-[18px] rotate-[-14deg] bg-gradient-to-b from-[#ffd97e] to-[#d68b22] shadow-[0_10px_18px_rgba(150,90,20,0.24)]" />
      <div className="absolute right-[10%] bottom-[10%] h-16 w-28 rounded-[18px] rotate-[14deg] bg-gradient-to-b from-[#ffd97e] to-[#d68b22] shadow-[0_10px_18px_rgba(150,90,20,0.24)]" />

      <div className="absolute left-1/2 top-[20%] h-[62%] w-[56%] -translate-x-1/2 flex items-center justify-center z-10">
        <picture className="block w-full h-full">
          <source srcSet="/images/tomo2.png" type="image/png" />
          <img
            src="/images/tomo2.png"
            alt="Tomo mascot"
            className="mx-auto h-full w-full object-contain drop-shadow-[0_30px_60px_rgba(141,74,10,0.12)]"
          />
        </picture>
      </div>

      <div className="absolute left-[34%] top-[6%] w-[18rem] sm:w-[20rem] rotate-[6deg] rounded-[22px] bg-white px-6 py-5 text-left shadow-[0_18px_36px_rgba(127,91,45,0.12)] z-20">
        <p className="max-w-[18rem] text-[1.06rem] sm:text-[1.12rem] font-black leading-[1.03] text-[#2e261f]">
          Hai, I'm Tomo! Let's start our financial adventure together.
        </p>
        <div className="absolute bottom-[-11px] left-[18%] h-5 w-5 rotate-45 bg-white shadow-[-4px_4px_10px_rgba(135,90,35,0.08)]" />
      </div>
    </div>
  );
}

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
