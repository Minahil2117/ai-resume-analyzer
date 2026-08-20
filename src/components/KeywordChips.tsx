interface KeywordChipsProps {
  matched: string[];
  missing: string[];
}

export default function KeywordChips({ matched, missing }: KeywordChipsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 font-mono text-[11px] tracking-widest text-teal">MATCHED · {matched.length}</p>
        <div className="flex flex-wrap gap-1.5">
          {matched.length === 0 && <span className="text-sm text-text-muted">None found</span>}
          {matched.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-teal-dim bg-teal/10 px-2.5 py-1 text-xs text-teal"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-[11px] tracking-widest text-rose">MISSING · {missing.length}</p>
        <div className="flex flex-wrap gap-1.5">
          {missing.length === 0 && <span className="text-sm text-text-muted">None — nice coverage</span>}
          {missing.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-rose/40 bg-rose/10 px-2.5 py-1 text-xs text-rose"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
