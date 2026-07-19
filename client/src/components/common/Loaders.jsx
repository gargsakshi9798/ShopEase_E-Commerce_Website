/**
 * Loaders.jsx
 * Shared loading components used across the entire app.
 *
 * Exports:
 *   PageLoader       — full-screen centered spinner (route-level lazy load fallback)
 *   SectionLoader    — centered spinner inside a container (data fetch states)
 *   InlineLoader     — small inline spinner for buttons / inline actions
 *   SkeletonCard     — generic card placeholder skeleton
 *   SkeletonRow      — table row placeholder skeleton
 *   SkeletonText     — multi-line text placeholder
 */

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 32, color = "border-primary-600" }) => (
  <div
    style={{ width: size, height: size }}
    className={`border-4 ${color} border-t-transparent rounded-full animate-spin flex-shrink-0`}
  />
);

// ─── PageLoader ───────────────────────────────────────────────────────────────
// Full-screen fallback — used as <Suspense fallback={<PageLoader />}>
export const PageLoader = ({ message = "Loading…" }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-4">
    <Spinner size={44} />
    {message && (
      <p className="text-sm text-gray-500 font-medium animate-pulse">{message}</p>
    )}
  </div>
);

// ─── SectionLoader ────────────────────────────────────────────────────────────
// Centered spinner for data-fetch states inside a page section.
// Respects the parent height — wrap the parent in a min-h class if needed.
export const SectionLoader = ({ message = "", rows = 1 }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 w-full">
    <Spinner size={36} />
    {message && <p className="text-sm text-gray-400 font-medium">{message}</p>}
  </div>
);

// ─── InlineLoader ─────────────────────────────────────────────────────────────
// Tiny spinner for use inside buttons or inline text.
export const InlineLoader = ({ size = 16, color = "border-white" }) => (
  <Spinner size={size} color={`border-4 ${color} border-t-transparent`} />
);

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
// Animated placeholder for product cards, list items, etc.
// Pass `count` to render multiple side-by-side in a grid.
export const SkeletonCard = ({ count = 1, className = "" }) =>
  Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse ${className}`}
    >
      {/* Image area */}
      <div className="bg-gray-200 h-44 w-full" />
      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  ));

// ─── SkeletonRow ──────────────────────────────────────────────────────────────
// Animated placeholder for table rows (admin data tables).
export const SkeletonRow = ({ cols = 5, rows = 5 }) =>
  Array.from({ length: rows }).map((_, ri) => (
    <tr key={ri} className="animate-pulse border-b border-gray-100">
      {Array.from({ length: cols }).map((_, ci) => (
        <td key={ci} className="px-4 py-3">
          <div className={`h-3.5 bg-gray-200 rounded ${ci === 0 ? "w-2/3" : ci === cols - 1 ? "w-1/2" : "w-full"}`} />
        </td>
      ))}
    </tr>
  ));

// ─── SkeletonText ─────────────────────────────────────────────────────────────
// Multi-line text placeholder for descriptions, paragraphs.
export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-3.5 bg-gray-200 rounded ${i === lines - 1 ? "w-2/3" : "w-full"}`}
      />
    ))}
  </div>
);

// ─── SkeletonDetailCard ───────────────────────────────────────────────────────
// For full product / order detail views.
export const SkeletonDetailCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
    <div className="flex gap-6">
      <div className="w-56 h-56 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-8 bg-gray-200 rounded w-1/3 mt-4" />
        <div className="flex gap-3 mt-2">
          <div className="h-10 bg-gray-200 rounded-xl w-32" />
          <div className="h-10 bg-gray-200 rounded-xl w-32" />
        </div>
      </div>
    </div>
  </div>
);
