import { ChevronLeft, ChevronRight } from "lucide-react";

const buildPages = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(`gap-${p}`);
    result.push(p);
  });
  return result;
};

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="page-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={18} className="flip" />
      </button>
      {buildPages(page, totalPages).map((item) =>
        typeof item === "string" ? (
          <span key={item} className="page-gap" aria-hidden="true">…</span>
        ) : (
          <button key={item} className="page-btn" onClick={() => onChange(item)} aria-current={item === page ? "page" : undefined}>
            {item}
          </button>
        )
      )}
      <button className="page-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight size={18} className="flip" />
      </button>
    </nav>
  );
}
