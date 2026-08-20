"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  ChevronDown,
  CircleUserRound,
  FileSearch,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";

import UploadZone from "@/components/UploadZone";
import ScoreReadout from "@/components/ScoreReadout";
import KeywordChips from "@/components/KeywordChips";
import SectionFeedback from "@/components/SectionFeedback";
import type { AnalysisResult } from "@/lib/types";

type Tab =
  | "dashboard"
  | "scan"
  | "analytics"
  | "keywords"
  | "history"
  | "settings";

type HistoryItem = {
  id: string;
  date: string;
  score: number;
  matched: number;
  missing: number;
  fileName: string;
};

const navItems = [
  {
    id: "dashboard" as Tab,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "scan" as Tab,
    label: "Resume Scan",
    icon: FileSearch,
  },
  {
    id: "analytics" as Tab,
    label: "Analytics",
    icon: BarChart3,
  },
  {
    id: "keywords" as Tab,
    label: "Keywords",
    icon: Target,
  },
  {
    id: "history" as Tab,
    label: "Scan History",
    icon: History,
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("resume-analyzer-history");

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "resume-analyzer-history",
      JSON.stringify(history)
    );
  }, [history]);

  async function runScan() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed.");
      }

      const analysis = data as AnalysisResult;

      setResult(analysis);

      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleString(),
        score: analysis.overallScore,
        matched: analysis.matchedKeywords?.length ?? 0,
        missing: analysis.missingKeywords?.length ?? 0,
        fileName: file.name,
      };

      setHistory((prev) => [historyItem, ...prev].slice(0, 20));

      setActiveTab("dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const keywordMatchPercentage = useMemo(() => {
    if (!result) return 0;

    const matched = result.matchedKeywords?.length ?? 0;
    const missing = result.missingKeywords?.length ?? 0;
    const total = matched + missing;

    if (!total) return 0;

    return Math.round((matched / total) * 100);
  }, [result]);

  const highestScore = useMemo(() => {
    if (!history.length) return result?.overallScore ?? 0;

    return Math.max(
      ...history.map((item) => item.score),
      result?.overallScore ?? 0
    );
  }, [history, result]);

  function renderPage() {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            result={result}
            history={history}
            keywordMatchPercentage={keywordMatchPercentage}
            highestScore={highestScore}
            onScan={() => setActiveTab("scan")}
          />
        );

      case "scan":
        return (
          <ScanPage
            file={file}
            setFile={setFile}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            loading={loading}
            error={error}
            result={result}
            runScan={runScan}
          />
        );

      case "analytics":
        return (
          <AnalyticsPage
            result={result}
            history={history}
            keywordMatchPercentage={keywordMatchPercentage}
          />
        );

      case "keywords":
        return <KeywordsPage result={result} />;

      case "history":
        return (
          <HistoryPage
            history={history}
            onClear={() => setHistory([])}
            onOpenScan={() => setActiveTab("scan")}
          />
        );

      case "settings":
        return (
          <SettingsPage
            notifications={notifications}
            setNotifications={setNotifications}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
          />
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-[#f1f5f9]">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#14243a] bg-[#091525] transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center gap-3 border-b border-[#14243a] px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight">
                ResumeIQ
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#68738b]">
                AI Analyzer
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden"
            >
              <X className="h-5 w-5 text-[#68738b]" />
            </button>
          </div>

          <div className="flex-1 px-3 py-6">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#68738b]">
              Workspace
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? "bg-gradient-to-r from-violet-600/30 to-violet-500/10 text-white shadow-inner"
                        : "text-[#8b93a7] hover:bg-[#102038] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        active
                          ? "text-violet-400"
                          : "text-[#68738b] group-hover:text-white"
                      }`}
                    />

                    <span>{item.label}</span>

                    {item.id === "scan" && (
                      <span className="ml-auto rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#68738b]">
              Account
            </p>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                activeTab === "settings"
                  ? "bg-[#102038] text-white"
                  : "text-[#8b93a7] hover:bg-[#102038] hover:text-white"
              }`}
            >
              <Settings className="h-[18px] w-[18px]" />
              Settings
            </button>
          </div>

          <div className="m-4 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold">
                ResumeIQ Pro
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#8b93a7]">
              Unlock advanced resume insights and unlimited scans.
            </p>

            <button className="mt-4 w-full rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white transition hover:bg-violet-500">
              Upgrade Plan
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#14243a]/80 bg-[#07111f]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 hover:bg-[#102038] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68738b]" />

                <input
                  placeholder="Search anything..."
                  className="h-10 w-64 rounded-xl border border-[#1a3048] bg-[#0d1a2b] pl-10 pr-4 text-xs text-white outline-none placeholder:text-[#68738b] focus:border-violet-500/50"
                />
              </div>

              <div className="sm:hidden">
                <p className="text-sm font-bold">ResumeIQ</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() =>
                  setNotifications((prev) => !prev)
                }
                className="relative rounded-xl p-2.5 text-[#8b93a7] transition hover:bg-[#102038] hover:text-white"
              >
                <Bell className="h-5 w-5" />

                {notifications && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-400 ring-2 ring-[#07111f]" />
                )}
              </button>

              <button className="rounded-xl p-2.5 text-[#8b93a7] hover:bg-[#102038] hover:text-white">
                <Moon className="h-5 w-5" />
              </button>

              <div className="hidden h-8 w-px bg-[#1a3048] sm:block" />

              <button
                onClick={() => setActiveTab("settings")}
                className="flex items-center gap-3 rounded-xl p-1.5 pr-2 transition hover:bg-[#102038]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
                  <CircleUserRound className="h-5 w-5 text-white" />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold">User</p>
                  <p className="text-[10px] text-[#68738b]">
                    Resume Analyzer
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-[#68738b] sm:block" />
              </button>
            </div>
          </header>

          <div
            className={`mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 ${
              compactMode ? "lg:py-4" : "lg:py-8"
            }`}
          >
            {renderPage()}
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  result,
  history,
  keywordMatchPercentage,
  highestScore,
  onScan,
}: {
  result: AnalysisResult | null;
  history: HistoryItem[];
  keywordMatchPercentage: number;
  highestScore: number;
  onScan: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI RESUME ANALYZER"
        title="Resume overview"
        description="Analyze your resume, improve your ATS score, and identify opportunities to stand out."
        action={
          <button
            onClick={onScan}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
          >
            <FileSearch className="h-4 w-4" />
            New Scan
          </button>
        }
      />

      {!result ? (
        <EmptyDashboard onScan={onScan} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="ATS Score"
              value={`${result.overallScore}%`}
              change="Current"
              subtitle="overall compatibility"
              icon={Gauge}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <MetricCard
              title="Keyword Match"
              value={`${keywordMatchPercentage}%`}
              change="Current"
              subtitle={`${result.matchedKeywords?.length ?? 0} matched keywords`}
              icon={Target}
              iconClass="bg-cyan-500/10 text-cyan-400"
            />

            <MetricCard
              title="Missing Keywords"
              value={`${result.missingKeywords?.length ?? 0}`}
              change="Improve"
              subtitle="optimization opportunities"
              icon={Lightbulb}
              iconClass="bg-amber-500/10 text-amber-400"
            />

            <MetricCard
              title="Best Score"
              value={`${highestScore}%`}
              change="Personal best"
              subtitle={`${history.length} total scans`}
              icon={TrendingUp}
              iconClass="bg-emerald-500/10 text-emerald-400"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr_0.8fr]">
            <Panel title="ATS Score Overview" action="This Scan">
              <ScoreChart score={result.overallScore} />
            </Panel>

            <Panel title="Keyword Distribution" action="Current">
              <KeywordDonut result={result} />
            </Panel>

            <Panel title="Resume Health">
              <HealthPanel result={result} />
            </Panel>
          </div>

          <Panel
            title="Top Suggestions"
            subtitle="Highest-impact improvements for your resume"
          >
            <Suggestions result={result} />
          </Panel>
        </>
      )}
    </div>
  );
}

/* =========================================================
   SCAN
========================================================= */

function ScanPage({
  file,
  setFile,
  jobDescription,
  setJobDescription,
  loading,
  error,
  result,
  runScan,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  runScan: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RESUME ANALYSIS"
        title="Scan your resume"
        description="Upload your PDF and compare it against a target job description."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Panel
            title="Resume Upload"
            subtitle="Upload your PDF resume"
          >
            <UploadZone
              file={file}
              onFileSelected={setFile}
            />
          </Panel>

          <Panel
            title="Target Job Description"
            subtitle="Optional — improves keyword matching"
          >
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={9}
              className="w-full resize-none rounded-xl border border-[#1a3048] bg-[#091525] p-4 text-sm leading-relaxed text-[#eef1f6] outline-none transition placeholder:text-[#68738b] focus:border-violet-500/50"
            />

            <div className="mt-3 flex justify-between text-[10px] text-[#68738b]">
              <span>OPTIONAL</span>
              <span>{jobDescription.length} characters</span>
            </div>
          </Panel>

          <button
            onClick={runScan}
            disabled={!file || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Activity className="h-5 w-5 animate-pulse" />
                ANALYZING RESUME...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                RUN AI ANALYSIS
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <Panel
          title="Live Analysis"
          subtitle="Your results appear here"
        >
          {loading ? (
            <ScanningState />
          ) : result ? (
            <div className="space-y-6">
              <ScoreReadout score={result.overallScore} />

              <div className="rounded-xl border border-[#1a3048] bg-[#091525] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#68738b]">
                  AI SUMMARY
                </p>

                <p className="text-sm leading-relaxed text-[#aab2c3]">
                  {result.summary}
                </p>
              </div>

              <KeywordChips
                matched={result.matchedKeywords}
                missing={result.missingKeywords}
              />

              <SectionFeedback
                items={result.sectionFeedback}
              />
            </div>
          ) : (
            <ScanEmptyState />
          )}
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsPage({
  result,
  history,
  keywordMatchPercentage,
}: {
  result: AnalysisResult | null;
  history: HistoryItem[];
  keywordMatchPercentage: number;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PERFORMANCE"
        title="Resume analytics"
        description="Understand your resume's ATS performance and keyword coverage."
      />

      {!result ? (
        <EmptyDashboard onScan={() => {}} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              title="ATS Compatibility"
              value={`${result.overallScore}%`}
              change="Current"
              subtitle="overall resume score"
              icon={Gauge}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <MetricCard
              title="Keyword Coverage"
              value={`${keywordMatchPercentage}%`}
              change="Current"
              subtitle="target keyword coverage"
              icon={Target}
              iconClass="bg-cyan-500/10 text-cyan-400"
            />
          </div>

          <Panel
            title="Score History"
            subtitle="Your previous resume scans"
          >
            {history.length ? (
              <HistoryChart history={history} />
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-[#68738b]">
                Your future scans will appear here.
              </div>
            )}
          </Panel>

          <Panel title="AI Performance Summary">
            <div className="rounded-xl border border-violet-500/10 bg-violet-500/5 p-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>

                <p className="text-sm leading-7 text-[#aab2c3]">
                  {result.summary}
                </p>
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

/* =========================================================
   KEYWORDS
========================================================= */

function KeywordsPage({
  result,
}: {
  result: AnalysisResult | null;
}) {
  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="KEYWORD INTELLIGENCE"
          title="Keyword analysis"
          description="See what your resume contains and what recruiters may be looking for."
        />

        <EmptyDashboard onScan={() => {}} />
      </div>
    );
  }

  const matched = result.matchedKeywords ?? [];
  const missing = result.missingKeywords ?? [];

  const percentage =
    matched.length + missing.length
      ? Math.round(
          (matched.length /
            (matched.length + missing.length)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="KEYWORD INTELLIGENCE"
        title="Keyword analysis"
        description="Optimize your resume for ATS systems and target job descriptions."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Panel
          title="Matched Keywords"
          subtitle={`${matched.length} keywords found`}
        >
          <div className="flex flex-wrap gap-2">
            {matched.map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {keyword}
              </span>
            ))}
          </div>
        </Panel>

        <Panel
          title="Missing Keywords"
          subtitle={`${missing.length} opportunities`}
        >
          <div className="flex flex-wrap gap-2">
            {missing.map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs font-medium text-rose-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                {keyword}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Keyword Optimization">
        <div className="space-y-5">
          <KeywordProgress
            label="Overall keyword coverage"
            value={percentage}
          />

          <div className="rounded-xl border border-[#1a3048] bg-[#091525] p-4">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-400" />

              <div>
                <p className="text-sm font-semibold">
                  Optimization tip
                </p>

                <p className="mt-1 text-xs leading-relaxed text-[#8b93a7]">
                  Add missing keywords naturally to your experience,
                  projects, and skills sections. Avoid keyword
                  stuffing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryPage({
  history,
  onClear,
  onOpenScan,
}: {
  history: HistoryItem[];
  onClear: () => void;
  onOpenScan: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SCAN HISTORY"
        title="Previous analyses"
        description="Your resume analysis history is stored locally in this browser."
        action={
          history.length > 0 ? (
            <button
              onClick={onClear}
              className="rounded-xl border border-rose-500/20 px-4 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/5"
            >
              Clear History
            </button>
          ) : undefined
        }
      />

      {!history.length ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1a3048] bg-[#0d1a2b]/50 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
            <History className="h-7 w-7 text-violet-400" />
          </div>

          <h3 className="mt-5 text-lg font-semibold">
            No scans yet
          </h3>

          <p className="mt-2 max-w-sm text-sm text-[#68738b]">
            Run your first resume analysis and your results will
            automatically appear here.
          </p>

          <button
            onClick={onOpenScan}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold"
          >
            Analyze Resume
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#14243a] bg-[#0d1a2b]">
          <div className="hidden grid-cols-[1.5fr_1fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-[#14243a] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#68738b] md:grid">
            <span>Resume</span>
            <span>Date</span>
            <span>ATS Score</span>
            <span>Matched</span>
            <span>Missing</span>
          </div>

          {history.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 border-b border-[#14243a] px-5 py-5 transition last:border-0 hover:bg-[#102038] md:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_0.7fr] md:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <FileText className="h-5 w-5 text-violet-400" />
                </div>

                <div>
                  <p className="max-w-[240px] truncate text-sm font-medium">
                    {item.fileName}
                  </p>

                  <p className="text-[10px] text-[#68738b]">
                    Resume PDF
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#8b93a7]">
                {item.date}
              </p>

              <div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    item.score >= 80
                      ? "bg-emerald-500/10 text-emerald-300"
                      : item.score >= 60
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {item.score}%
                </span>
              </div>

              <p className="text-xs text-emerald-300">
                +{item.matched}
              </p>

              <p className="text-xs text-rose-300">
                -{item.missing}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  notifications,
  setNotifications,
  compactMode,
  setCompactMode,
}: {
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACCOUNT"
        title="Settings"
        description="Customize your ResumeIQ dashboard experience."
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_0.6fr]">
        <Panel title="Preferences">
          <div className="divide-y divide-[#14243a]">
            <SettingRow
              icon={Bell}
              title="Notifications"
              description="Show notifications when analysis is complete."
              enabled={notifications}
              onChange={() =>
                setNotifications(!notifications)
              }
            />

            <SettingRow
              icon={Activity}
              title="Compact dashboard"
              description="Reduce vertical spacing across the dashboard."
              enabled={compactMode}
              onChange={() =>
                setCompactMode(!compactMode)
              }
            />
          </div>
        </Panel>

        <Panel title="Profile">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <CircleUserRound className="h-8 w-8" />
            </div>

            <div>
              <p className="font-semibold">Resume User</p>
              <p className="mt-1 text-xs text-[#68738b]">
                AI Resume Analyzer
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#1a3048] bg-[#091525] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#68738b]">
              PLAN
            </p>

            <p className="mt-2 text-sm font-semibold">
              ResumeIQ Free
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400">
          {eyebrow}
        </p>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-[#8b93a7]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#14243a] bg-[#0d1a2b] shadow-2xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-[#14243a] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-[11px] text-[#68738b]">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <button className="rounded-lg border border-[#1a3048] bg-[#12233a] px-3 py-1.5 text-[10px] text-[#8b93a7]">
            {action}
          </button>
        )}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  icon: any;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-[#14243a] bg-[#0d1a2b] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#102038] hover:shadow-xl hover:shadow-violet-950/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#8b93a7]">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] font-semibold text-emerald-400">
          {change}
        </span>

        <span className="text-[10px] text-[#68738b]">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function ScoreChart({ score }: { score: number }) {
  const bars = [42, 55, 48, 67, 60, 72, 69, 81, 76, score];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold">{score}%</p>

          <p className="mt-1 text-xs text-[#68738b]">
            Overall ATS compatibility
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          Current
        </div>
      </div>

      <div className="flex h-44 items-end gap-2">
        {bars.map((value, index) => (
          <div
            key={index}
            className="group relative flex flex-1 items-end"
          >
            <div
              style={{ height: `${value}%` }}
              className={`w-full rounded-t-md transition-all duration-500 ${
                index === bars.length - 1
                  ? "bg-gradient-to-t from-violet-700 to-cyan-400"
                  : "bg-violet-500/20 group-hover:bg-violet-500/40"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-[9px] text-[#68738b]">
        <span>Previous</span>
        <span>Current</span>
      </div>
    </div>
  );
}

function KeywordDonut({
  result,
}: {
  result: AnalysisResult;
}) {
  const matched = result.matchedKeywords?.length ?? 0;
  const missing = result.missingKeywords?.length ?? 0;
  const total = matched + missing;
  const percentage = total
    ? Math.round((matched / total) * 100)
    : 0;

  return (
    <div className="flex items-center justify-center gap-8">
      <div
        className="relative flex h-40 w-40 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#8b5cf6 ${percentage}%, #1a3048 ${percentage}% 100%)`,
        }}
      >
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0d1a2b]">
          <span className="text-2xl font-bold">
            {percentage}%
          </span>

          <span className="text-[9px] uppercase tracking-wider text-[#68738b]">
            Match
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Legend
          label="Matched"
          value={matched}
          className="bg-violet-400"
        />

        <Legend
          label="Missing"
          value={missing}
          className="bg-[#1a3048]"
        />
      </div>
    </div>
  );
}

function Legend({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />

      <div>
        <p className="text-xs text-[#8b93a7]">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function HealthPanel({
  result,
}: {
  result: AnalysisResult;
}) {
  const score = result.overallScore;

  const label =
    score >= 80
      ? "Excellent"
      : score >= 65
        ? "Good"
        : "Needs Work";

  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div
        className="relative flex h-44 w-44 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#22d3ee ${score}%, #1a3048 ${score}% 100%)`,
        }}
      >
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#0d1a2b]">
          <span className="text-3xl font-bold">
            {score}%
          </span>

          <span className="mt-1 text-[10px] text-[#68738b]">
            HEALTH
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        {label} resume
      </div>
    </div>
  );
}

function Suggestions({
  result,
}: {
  result: AnalysisResult;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {result.topSuggestions.map((suggestion, index) => (
        <div
          key={index}
          className="flex gap-3 rounded-xl border border-[#1a3048] bg-[#091525] p-4 transition hover:border-violet-500/20 hover:bg-[#102038]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-bold text-violet-400">
            {String(index + 1).padStart(2, "0")}
          </span>

          <p className="text-xs leading-relaxed text-[#aab2c3]">
            {suggestion}
          </p>
        </div>
      ))}
    </div>
  );
}

function HistoryChart({
  history,
}: {
  history: HistoryItem[];
}) {
  const values = history
    .slice(0, 8)
    .reverse()
    .map((item) => item.score);

  return (
    <div className="flex h-72 items-end gap-3">
      {values.map((value, index) => (
        <div
          key={index}
          className="group flex flex-1 flex-col items-center gap-2"
        >
          <span className="text-[9px] text-[#68738b] opacity-0 transition group-hover:opacity-100">
            {value}%
          </span>

          <div className="flex h-52 w-full items-end">
            <div
              style={{ height: `${value}%` }}
              className="w-full rounded-t-lg bg-gradient-to-t from-violet-700 to-cyan-400 transition-all duration-500"
            />
          </div>

          <span className="text-[9px] text-[#68738b]">
            Scan {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

function KeywordProgress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="text-xs text-[#8b93a7]">
          {label}
        </span>

        <span className="text-xs font-bold text-cyan-300">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#14243a]">
        <div
          style={{ width: `${value}%` }}
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400"
        />
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102038]">
          <Icon className="h-5 w-5 text-violet-400" />
        </div>

        <div>
          <p className="text-sm font-medium">{title}</p>

          <p className="mt-1 max-w-lg text-xs leading-relaxed text-[#68738b]">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-violet-600" : "bg-[#1a3048]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* =========================================================
   EMPTY STATES
========================================================= */

function EmptyDashboard({
  onScan,
}: {
  onScan: () => void;
}) {
  return (
    <div className="relative flex min-h-[550px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#14243a] bg-[#0d1a2b] text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_50%)]" />

      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10">
          <Sparkles className="h-9 w-9 text-violet-400" />
        </div>

        <h2 className="mt-6 text-2xl font-bold">
          Your AI dashboard is ready
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#68738b]">
          Upload your resume and let AI analyze your ATS
          compatibility, keywords, and improvement opportunities.
        </p>

        <button
          onClick={onScan}
          className="mt-7 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold shadow-xl shadow-violet-600/20 transition hover:-translate-y-1"
        >
          <Upload className="h-4 w-4" />
          Analyze My Resume
        </button>
      </div>
    </div>
  );
}

function ScanEmptyState() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#102038]">
        <FileSearch className="h-9 w-9 text-[#68738b]" />
      </div>

      <p className="mt-5 text-sm font-semibold">
        Waiting for your resume
      </p>

      <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#68738b]">
        Upload a PDF on the left and start your AI-powered resume
        analysis.
      </p>
    </div>
  );
}

function ScanningState() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-violet-500/20">
        <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/10" />

        <Sparkles className="relative h-9 w-9 animate-pulse text-violet-400" />
      </div>

      <p className="mt-7 text-sm font-semibold">
        AI is analyzing your resume...
      </p>

      <p className="mt-2 text-xs text-[#68738b]">
        Extracting content, comparing keywords and evaluating your
        resume.
      </p>

      <div className="mt-7 w-64 overflow-hidden rounded-full bg-[#14243a]">
        <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-600 to-cyan-400" />
      </div>
    </div>
  );
}