"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  childrenApi,
  parentApi,
  type ChildProfile,
  type ParentChildDashboard,
  type ParentChildDashboardSummary,
} from "@/lib/api";
import { getChildAvatarSrc } from "@/lib/child-avatar";

function clampPercentage(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value ?? 0)));
}

function formatTrendLabel(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [dashboard, setDashboard] = useState<ParentChildDashboard | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<ParentChildDashboardSummary | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSummaryMissing, setIsSummaryMissing] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? null,
    [children, selectedChildId]
  );

  const wisePercentage = clampPercentage(dashboard?.decision_summary?.wise_percentage);
  const impulsivePercentage = clampPercentage(100 - wisePercentage);
  const savingProgress = clampPercentage(dashboard?.saving_goal?.progress_percentage);
  const successRate = clampPercentage(dashboard?.story_summary?.success_rate);
  const trend = useMemo(() => dashboard?.financial_trend ?? [], [dashboard?.financial_trend]);
  const lineChart = useMemo(() => {
    const chartWidth = 300;
    const chartHeight = 150;
    const paddingX = 18;
    const paddingY = 18;
    const values = trend.map((item) => item.balance);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 1);
    const range = maxValue - minValue || 1;

    const points = trend.map((item, index) => {
      const x =
        trend.length === 1
          ? chartWidth / 2
          : paddingX + (index / (trend.length - 1)) * (chartWidth - paddingX * 2);
      const y = paddingY + ((maxValue - item.balance) / range) * (chartHeight - paddingY * 2);

      return {
        ...item,
        x,
        y,
      };
    });

    return {
      width: chartWidth,
      height: chartHeight,
      points,
      path: points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" "),
      areaPath:
        points.length > 0
          ? `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} L ${
              points[points.length - 1].x
            } ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
          : "",
      minValue,
      maxValue,
    };
  }, [trend]);
  const report = dashboardSummary?.summary ?? "";

  const loadDashboard = useCallback(async (childId: string) => {
    setDashboardError("");

    const response = await parentApi.getChildDashboard(childId);

    if (response.success && response.data) {
      setDashboard(response.data);
    } else {
      setDashboard(null);
      setDashboardError(response.error ?? "Dashboard anak belum bisa dimuat.");
    }
  }, []);

  const loadDashboardSummary = useCallback(async (childId: string) => {
    setIsLoadingSummary(true);
    setSummaryError("");
    setIsSummaryMissing(false);

    const response = await parentApi.getChildDashboardSummary(childId);

    if (response.success && response.data) {
      setDashboardSummary(response.data);
    } else if (
      response.status === 404 ||
      (response.error ?? "").toLowerCase().includes("not found")
    ) {
      setDashboardSummary(null);
      setIsSummaryMissing(true);
    } else {
      setDashboardSummary(null);
      setSummaryError(response.error ?? "Report description belum bisa dimuat.");
    }

    setIsLoadingSummary(false);
  }, []);

  const generateDashboardSummary = useCallback(async () => {
    if (!selectedChildId || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    setSummaryError("");
    const response = await parentApi.generateChildDashboardSummary(selectedChildId);

    if (response.success && response.data) {
      setDashboardSummary(response.data);
      setIsSummaryMissing(false);
    } else {
      setSummaryError(response.error ?? "AI summary belum bisa dibuat.");
    }

    setIsGeneratingSummary(false);
  }, [isGeneratingSummary, selectedChildId]);

  const loadChildDashboard = useCallback(
    (childId: string) => {
      void loadDashboard(childId);
      void loadDashboardSummary(childId);
    },
    [loadDashboard, loadDashboardSummary]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadChildren() {
      const response = await childrenApi.getList();
      if (!isMounted) return;

      if (response.success && Array.isArray(response.data)) {
        const childList = response.data;
        setChildren(childList);
        setChildrenError("");

        const cachedChildId = window.localStorage.getItem("selectedChildId") ?? "";
        const initialChild = childList.find((child) => child.id === cachedChildId) ?? childList[0];

        if (initialChild) {
          setSelectedChildId(initialChild.id);
          window.localStorage.setItem("selectedChildId", initialChild.id);
          window.localStorage.setItem("selectedChildName", initialChild.name);
          loadChildDashboard(initialChild.id);
        }
      } else {
        setChildrenError(response.error ?? "Daftar anak belum bisa dimuat.");
      }

      setIsLoadingChildren(false);
    }

    loadChildren();

    return () => {
      isMounted = false;
    };
  }, [loadChildDashboard]);

  function handleSelectChild(child: ChildProfile) {
    setSelectedChildId(child.id);
    window.localStorage.setItem("selectedChildId", child.id);
    window.localStorage.setItem("selectedChildName", child.name);
    loadChildDashboard(child.id);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf0] via-[#fff5e6] to-[#ffe8cc]">
      <header className="border-b border-[#e8d4b0] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
          <h1 className="text-2xl font-black text-[#f39211]">TOMO</h1>
          <nav className="flex items-center gap-8">
            <Link href="/parent/dashboard" className="border-b-2 border-[#f39211] text-sm font-bold text-[#f39211]">
              Dashboard
            </Link>
            <Link href="/parent/generate" className="text-sm font-semibold text-[#8d7661] hover:text-[#f39211]">
              Generate
            </Link>
            <Link href="/parent/profile" className="h-10 w-10 rounded-full bg-gradient-to-br from-[#cb4f0e] via-[#d96c12] to-[#b0410b]" aria-label="Open profile" />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-14">
        <section className="mb-7 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-black text-[#6f570f]">Exploring with:</h2>
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#ebe4d1] p-1.5">
            {children.map((child) => {
              const isSelected = selectedChildId === child.id;

              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleSelectChild(child)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-black transition ${
                    isSelected
                      ? "bg-[#f49a18] text-white shadow-sm"
                      : "bg-transparent text-[#6f6252] hover:bg-white/70"
                  }`}
                  aria-pressed={isSelected}
                >
                  <img
                    src={getChildAvatarSrc(child.id || child.name)}
                    alt={`${child.name} avatar`}
                    className="h-8 w-8 rounded-full object-contain"
                  />
                  {child.name}
                </button>
              );
            })}
          </div>
        </section>

        {isLoadingChildren ? (
          <p className="mb-6 rounded-xl bg-white/60 px-4 py-3 text-sm font-bold text-[#8d7661]">Loading child profiles...</p>
        ) : childrenError ? (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{childrenError}</p>
        ) : children.length === 0 ? (
          <p className="mb-6 rounded-xl bg-white/60 px-4 py-3 text-sm font-bold text-[#8d7661]">
            Belum ada profil anak. Tambahkan profil anak dari halaman profile.
          </p>
        ) : null}

        {dashboardError ? (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{dashboardError}</p>
        ) : null}

        {summaryError && !isSummaryMissing ? (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{summaryError}</p>
        ) : null}

        <section className="mb-8 rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-black text-[#f39211]">Report Description</h3>
                {dashboardSummary?.performance_level ? (
                  <span className="rounded-full bg-[#ffe7b5] px-3 py-1 text-xs font-black uppercase text-[#8b5b14]">
                    {dashboardSummary.performance_level}
                  </span>
                ) : null}
              </div>
              {!isSummaryMissing ? (
                <p className="text-[0.95rem] leading-relaxed text-[#5f4d42]">
                  {isLoadingSummary ? "Loading report description..." : report}
                </p>
              ) : null}
              {isSummaryMissing ? (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm font-bold text-[#8d7661]">
                    AI summary belum tersedia untuk anak ini.
                  </p>
                  <button
                    type="button"
                    onClick={generateDashboardSummary}
                    disabled={isGeneratingSummary || isLoadingSummary}
                    className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-gradient-to-r from-[#f59f1b] to-[#ff8128] px-5 text-sm font-black text-white shadow-[0_10px_18px_rgba(232,113,31,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGeneratingSummary ? "Generating..." : "Generate AI Summary"}
                  </button>
                </div>
              ) : null}
              {dashboardSummary?.suggestion ? (
                <p className="mt-4 rounded-2xl bg-[#fff8e9] px-4 py-3 text-sm font-bold leading-6 text-[#7d6b57]">
                  {dashboardSummary.suggestion}
                </p>
              ) : null}
            </div>
            {selectedChild ? (
              <div className="hidden flex-shrink-0 sm:flex">
                <img
                  src={getChildAvatarSrc(selectedChild.id || selectedChild.name)}
                  alt={`${selectedChild.name} avatar`}
                  className="h-32 w-32 rounded-2xl object-contain"
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
          <div className="rounded-2xl bg-[#e8d4b0] p-6 text-center">
            <div className="text-3xl font-black text-[#3d3128]">{wisePercentage}%</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Wise Decisions</div>
          </div>
          <div className="rounded-2xl bg-[#ffe071] p-6 text-center">
            <div className="text-3xl font-black text-[#3d3128]">{savingProgress}%</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Savings Progress</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#3d3128]">{successRate}%</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Success Rate</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#f39211]">{dashboard?.story_summary?.total_completed_stories ?? 0}</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Total Stories</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#3d3128]">{dashboard?.days_active ?? 0}</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">Days Active</div>
          </div>
          <div className="rounded-2xl border border-[#e8d4b0] bg-white/60 p-6 text-center backdrop-blur-sm">
            <div className="text-3xl font-black text-[#3d3128]">{dashboard?.saving_goal?.current_coin ?? 0}</div>
            <div className="mt-1 text-sm font-semibold text-[#8d7661]">
              {dashboard?.saving_goal?.goal_name || "Current Coins"}
            </div>
          </div>
        </section>

        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3d3128]">Financial Trend</h3>
              <span className="text-xs font-black text-[#8d7661]">{trend.length} DAYS</span>
            </div>
            <div className="h-48">
              {trend.length > 0 ? (
                <svg
                  viewBox={`0 0 ${lineChart.width} ${lineChart.height}`}
                  className="h-full w-full overflow-visible"
                  role="img"
                  aria-label="Financial trend line chart"
                >
                  <defs>
                    <linearGradient id="financialTrendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f59f1b" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#f59f1b" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2].map((line) => {
                    const y = 18 + line * 57;

                    return (
                      <line
                        key={line}
                        x1="18"
                        x2="282"
                        y1={y}
                        y2={y}
                        stroke="#ead8b9"
                        strokeDasharray="4 5"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {lineChart.areaPath ? <path d={lineChart.areaPath} fill="url(#financialTrendFill)" /> : null}
                  {lineChart.path ? (
                    <path d={lineChart.path} fill="none" stroke="#f39211" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                  ) : null}
                  {lineChart.points.map((point) => (
                    <g key={`${point.date}-${point.balance}`}>
                      <circle cx={point.x} cy={point.y} r="5.5" fill="#fffaf0" stroke="#f39211" strokeWidth="3" />
                      <text
                        x={point.x}
                        y={Math.max(13, point.y - 12)}
                        textAnchor="middle"
                        className="fill-[#6f6252] text-[10px] font-black"
                      >
                        {point.balance}
                      </text>
                    </g>
                  ))}
                  <text x="18" y="12" className="fill-[#8d7661] text-[9px] font-bold">
                    {lineChart.maxValue}
                  </text>
                  <text x="18" y="144" className="fill-[#8d7661] text-[9px] font-bold">
                    {lineChart.minValue}
                  </text>
                </svg>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#fff8e9] text-sm font-bold text-[#8d7661]">
                  No trend data yet.
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-between gap-3 text-xs font-semibold text-[#8d7661]">
              {trend.map((item) => (
                <span key={item.date}>{formatTrendLabel(item.date)}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#e8d4b0] bg-white/60 p-8 backdrop-blur-sm">
            <h3 className="mb-8 w-full text-lg font-black text-[#3d3128]">Behavior Composition</h3>
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="Behavior composition donut chart">
                <circle cx="60" cy="60" r="46" fill="none" stroke="#ead8b9" strokeWidth="14" />
                {wisePercentage > 0 ? (
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    pathLength={100}
                    stroke="#b8572a"
                    strokeLinecap="butt"
                    strokeWidth="14"
                    strokeDasharray={`${wisePercentage} ${100 - wisePercentage}`}
                  />
                ) : null}
                {impulsivePercentage > 0 ? (
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    pathLength={100}
                    stroke="#f59f1b"
                    strokeLinecap="butt"
                    strokeWidth="14"
                    strokeDasharray={`${impulsivePercentage} ${100 - impulsivePercentage}`}
                    strokeDashoffset={-wisePercentage}
                  />
                ) : null}
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-black text-[#3d3128]">{wisePercentage}%</div>
                <div className="text-xs font-bold text-[#8d7661]">WISE</div>
              </div>
            </div>
            <div className="mt-6 flex gap-6 text-sm font-bold">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#b8572a]" />
                <span className="text-[#8d7661]">{dashboard?.decision_summary?.wise_count ?? 0} Wise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#f59f1b]" />
                <span className="text-[#8d7661]">{dashboard?.decision_summary?.impulsive_count ?? 0} Impulsive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
