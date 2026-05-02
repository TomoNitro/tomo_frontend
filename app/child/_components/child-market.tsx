"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { childrenApi, type MarketItem } from "@/lib/api";
import { saveChildCoins } from "@/lib/child-coins";
import { readSavingTargetId, saveSavingTargetId } from "@/lib/saving-target";

function MarketCard({
  item,
  points,
  isTarget,
  onSelect,
}: {
  item: MarketItem;
  points: number;
  isTarget: boolean;
  onSelect: (item: MarketItem) => void;
}) {
  const progress = item.price > 0 ? Math.min(100, Math.round((points / item.price) * 100)) : 100;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`relative flex min-h-[14.5rem] flex-col overflow-hidden rounded-[1.1rem] bg-[#fa9818] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:-translate-y-0.5 ${
        isTarget ? "ring-4 ring-[#ffc400] ring-offset-2 ring-offset-[#f7efd9]" : ""
      }`}
    >
      {isTarget ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[0.68rem] font-black text-[#f79418] shadow">
          Target
        </span>
      ) : null}
      <div className="relative min-h-0 flex-1">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 45vw, 180px"
          className="object-contain drop-shadow-[0_10px_14px_rgba(73,41,11,0.2)]"
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[1rem] font-black leading-6 text-white">{item.title}</p>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[0.78rem] font-black text-[#2d2921]">
          {item.price}
        </span>
      </div>
      <div className="mt-3 rounded-full bg-[#7f4b08]/55 p-1">
        <div
          className="h-3 rounded-full bg-[#ffc400] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[0.68rem] font-black text-white">
        <span>{points}/{item.price}</span>
        <span>{isTarget ? "Targetmu" : "Pilih target"}</span>
      </div>
    </button>
  );
}

function MarketSkeleton() {
  return (
    <div className="min-h-[14.5rem] animate-pulse rounded-[1.1rem] bg-[#fa9818]/70">
      <div className="m-5 h-[58%] rounded-2xl bg-white/18" />
      <div className="mx-5 mt-5 h-8 rounded-full bg-white/35" />
    </div>
  );
}

export function ChildMarket({ points }: { points: number }) {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [targetId, setTargetId] = useState("");
  const [pendingTarget, setPendingTarget] = useState<MarketItem | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setTargetId(readSavingTargetId());
    });

    const loadMarkets = async () => {
      setIsLoading(true);
      setMessage("");
      const marketResponse = await childrenApi.getMarkets();

      if (marketResponse.success) {
        setItems(marketResponse.data ?? []);
      } else {
        setMessage(marketResponse.error ?? "Daftar target belum bisa dimuat.");
      }

      setIsLoading(false);
    };

    loadMarkets();
  }, []);

  const visibleItems = useMemo(() => items.slice(0, 6), [items]);
  const activeTarget = useMemo(
    () => items.find((item) => item.id === targetId),
    [items, targetId]
  );

  async function handleConfirmTarget() {
    if (!pendingTarget) return;

    setIsSavingTarget(true);
    setMessage("");
    const response = await childrenApi.setSavingGoal(pendingTarget.id);

    if (response.success) {
      const nextTargetId = response.data?.market_id ?? pendingTarget.id;
      const nextTargetName = response.data?.goal_name ?? pendingTarget.title;
      setTargetId(nextTargetId);
      saveSavingTargetId(nextTargetId);

      const coinsResponse = await childrenApi.getCoins();
      if (coinsResponse.success && typeof coinsResponse.data === "number" && coinsResponse.data > 0) {
        saveChildCoins(coinsResponse.data);
      }

      setMessage(`Target: ${nextTargetName}`);
      setPendingTarget(null);
    } else {
      setMessage(response.error ?? "Target belum bisa disimpan.");
    }

    setIsSavingTarget(false);
  }

  return (
    <section className="mt-8 rounded-[1.6rem] border border-[#ebc8bd] bg-[#f7efd9] p-6">
      <div className="relative rounded-[1rem] bg-[#fa9818] px-5 py-5 text-center text-white shadow-[0_5px_8px_rgba(156,95,15,0.2)]">
        <Image
          src="/images/tomonongol.png"
          alt=""
          width={130}
          height={63}
          className="pointer-events-none absolute -right-1 -top-9 h-auto w-28 sm:w-32"
          aria-hidden
        />
        <h2 className="text-4xl font-black leading-none">Target Impian</h2>
        <p className="mt-2 text-[1rem] font-black">Pilih barang yang mau ditabung</p>
      </div>

      {activeTarget ? (
        <div className="relative mt-4 rounded-[1rem] bg-white/80 px-5 py-4 pr-24 text-[#5b4635]">
          <Image
            src="/images/tomonongol.png"
            alt=""
            width={104}
            height={50}
            className="pointer-events-none absolute -right-1 -top-5 h-auto w-20"
            aria-hidden
          />
          <div className="flex items-center justify-between gap-4 text-[0.9rem] font-black">
            <span className="text-[#f79418]">Target: {activeTarget.title}</span>
            <span>{points}/{activeTarget.price}</span>
          </div>
          <div className="mt-3 rounded-full bg-[#efe4cf] p-1">
            <div
              className="h-3 rounded-full bg-[#ffc400]"
              style={{
                width: `${activeTarget.price > 0 ? Math.min(100, Math.round((points / activeTarget.price) * 100)) : 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-full bg-white/70 px-4 py-2 text-center text-[0.9rem] font-black text-[#755405]">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-4 max-sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <MarketSkeleton key={index} />)
          : visibleItems.map((item) => (
              <MarketCard
                key={item.id}
                item={item}
                points={points}
                isTarget={targetId === item.id}
                onSelect={setPendingTarget}
              />
            ))}
      </div>

      {!isLoading && visibleItems.length === 0 ? (
        <div className="mt-5 rounded-[1rem] bg-white/70 px-5 py-8 text-center text-[0.95rem] font-black text-[#755405]">
          Kosong
        </div>
      ) : null}

      {pendingTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1f12]/45 px-5">
          <div className="relative w-full max-w-sm rounded-[1.4rem] bg-[#fffaf0] p-6 text-center shadow-[0_24px_60px_rgba(45,31,18,0.28)]">
            <Image
              src="/images/tomonongol.png"
              alt=""
              width={130}
              height={63}
              className="pointer-events-none absolute left-1/2 top-0 h-auto w-28 -translate-x-1/2 -translate-y-[68%]"
              aria-hidden
            />
            <div className="relative mx-auto h-32 w-full">
              <Image
                src={pendingTarget.image_url}
                alt={pendingTarget.title}
                fill
                sizes="280px"
                className="object-contain drop-shadow-[0_12px_16px_rgba(73,41,11,0.15)]"
              />
            </div>
            <h3 className="mt-4 text-3xl font-black leading-9 text-[#f79418]">{pendingTarget.title}</h3>
            <p className="mt-3 text-[1rem] font-black leading-7 text-[#5b4635]">
              Jadikan target tabungan?
            </p>
            <p className="mt-2 text-[0.95rem] font-black text-[#806006]">
              Koinmu {points} dari target {pendingTarget.price}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingTarget(null)}
                disabled={isSavingTarget}
                className="h-12 rounded-full bg-[#efe4cf] text-[0.9rem] font-black text-[#5b4635]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmTarget}
                disabled={isSavingTarget}
                aria-busy={isSavingTarget}
                className="relative h-12 overflow-hidden rounded-full bg-[#fa9818] pl-8 pr-3 text-[0.9rem] font-black text-white shadow-[0_10px_18px_rgba(232,113,31,0.22)] transition disabled:opacity-65"
              >
                <Image
                  src="/images/tomonongol.png"
                  alt=""
                  width={60}
                  height={29}
                  className="pointer-events-none absolute -left-3 bottom-0 h-auto w-12"
                  aria-hidden
                />
                {isSavingTarget ? "Menyimpan..." : "Pilih"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
