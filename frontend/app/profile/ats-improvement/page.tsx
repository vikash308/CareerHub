'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Sparkles, Target, TrendingUp } from 'lucide-react';

type AtsPayload = {
  result: {
    score: number;
    jobProfile?: string;
    candidateLevel?: string;
    levelReasoning?: string;
    requirements?: string[];
    coveredRequirements?: string[];
    matchedSkills?: string[];
    missingSkills?: string[];
    suggestions?: string[];
    summary?: string;
  };
  jobDescription?: string;
  profileName?: string;
  resumeName?: string;
};

export default function AtsImprovementPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<AtsPayload | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ats_improvement_payload');
      if (raw) {
        setPayload(JSON.parse(raw));
      }
    } catch {
      setPayload(null);
    }
  }, []);

  const score = payload?.result?.score ?? 0;
  const scoreLabel = score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Weak Match';
  const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="relative min-h-screen page-bg">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[8%] left-[4%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[10%] right-[6%] w-[36%] h-[36%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl theme-btn-secondary text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {!payload ? (
          <div className="theme-card rounded-2xl p-8 text-center shadow-xl">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h1 className="text-xl font-bold theme-text-primary">No ATS result found</h1>
            <p className="text-sm theme-text-secondary mt-2">
              Run an ATS scan from your profile first, then open this improvement page.
            </p>
          </div>
        ) : (
          <div className="space-y-5 fade-in-up">
            <section className="theme-card rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] theme-text-muted font-bold">ATS Improvement Report</p>
                  <h1 className="text-2xl sm:text-3xl font-black theme-text-primary">
                    {payload.profileName || 'Resume'} Review
                  </h1>
                  <p className="text-sm theme-text-secondary max-w-2xl">
                    AI-driven improvement ideas based on your scanned resume and the inferred job profile.
                  </p>
                </div>

                <div className="relative w-28 h-28 mx-auto md:mx-0 shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-[var(--border)]" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke={score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black theme-text-primary">{score}%</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${scoreColor}`}>{scoreLabel}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="theme-card rounded-2xl p-5 shadow-xl lg:col-span-2 space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold theme-text-primary">Role & Suggestions</h2>
                </div>

                {payload.result?.jobProfile && (
                  <div className="p-4 rounded-2xl bg-[var(--btn-sec-bg)] border border-[var(--border)]">
                    <p className="text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold">Inferred Job Profile</p>
                    <p className="mt-1 text-sm font-semibold theme-text-primary">{payload.result.jobProfile}</p>
                  </div>
                )}

                {payload.result?.candidateLevel && (
                  <div className="p-4 rounded-2xl bg-[var(--btn-sec-bg)] border border-[var(--border)]">
                    <p className="text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold">Candidate Level</p>
                    <p className="mt-1 text-sm font-semibold theme-text-primary">{payload.result.candidateLevel}</p>
                    {payload.result.levelReasoning && (
                      <p className="mt-2 text-xs theme-text-secondary leading-relaxed">{payload.result.levelReasoning}</p>
                    )}
                  </div>
                )}

                {(payload.result?.requirements || []).length > 0 && (
                  <div className="p-4 rounded-2xl bg-[var(--btn-sec-bg)] border border-[var(--border)] space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold">Common Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      {payload.result.requirements!.map((item, index) => (
                        <span key={index} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(payload.result?.coveredRequirements || []).length > 0 && (
                  <div className="p-4 rounded-2xl bg-[var(--btn-sec-bg)] border border-[var(--border)] space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold">Covered Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      {payload.result.coveredRequirements!.map((item, index) => (
                        <span key={index} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {payload.result?.summary && (
                  <p className="text-sm theme-text-secondary leading-relaxed border border-[var(--border)] rounded-2xl p-4 bg-[var(--btn-sec-bg)]">
                    {payload.result.summary}
                  </p>
                )}

                <div className="space-y-3">
                  {(payload.result?.suggestions || []).length > 0 ? (
                    payload.result.suggestions!.map((item, index) => (
                      <div key={index} className="flex gap-3 p-4 rounded-2xl bg-[var(--btn-sec-bg)] border border-[var(--border)]">
                        <div className="mt-0.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-sm theme-text-secondary leading-relaxed">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm theme-text-muted">No suggestions returned by the AI.</p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="theme-card rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold theme-text-primary">Missing Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(payload.result?.missingSkills || []).length > 0 ? (
                      payload.result.missingSkills!.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm theme-text-muted">No major gaps identified.</p>
                    )}
                  </div>
                </div>

                <div className="theme-card rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold theme-text-primary">Matched Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(payload.result?.matchedSkills || []).length > 0 ? (
                      payload.result.matchedSkills!.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm theme-text-muted">No matching skills returned.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
