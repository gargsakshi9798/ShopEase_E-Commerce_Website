/**
 * EmptyState.jsx
 * Generic empty / zero-result state component used across all pages.
 *
 * Usage:
 *   <EmptyState
 *     icon={<MdShoppingCart size={40} />}   // optional — any ReactNode
 *     emoji="🛒"                             // optional — shown if no icon
 *     title="No orders yet"
 *     description="Once you place an order it will appear here."
 *     action={{ label: "Start Shopping", onClick: () => navigate("/") }}
 *     // OR action={{ label: "Start Shopping", to: "/" }}   (uses Link)
 *     size="md"     // "sm" | "md" | "lg"
 *     className=""  // extra wrapper classes
 *   />
 *
 * All props are optional — sensible defaults are provided.
 */

import { Link } from "react-router-dom";
import { MdInbox } from "react-icons/md";

const SIZE = {
  sm: { wrap: "py-10",   icon: "w-12 h-12 text-3xl", title: "text-base", desc: "text-xs"  },
  md: { wrap: "py-16",   icon: "w-16 h-16 text-4xl", title: "text-lg",   desc: "text-sm"  },
  lg: { wrap: "py-24",   icon: "w-20 h-20 text-5xl", title: "text-xl",   desc: "text-sm"  },
};

const EmptyState = ({
  icon        = null,
  emoji       = null,
  title       = "Nothing here yet",
  description = "",
  action      = null,          // { label, onClick } or { label, to }
  secondaryAction = null,      // same shape — renders as outline button
  size        = "md",
  className   = "",
}) => {
  const s = SIZE[size] ?? SIZE.md;

  const renderAction = (act, variant = "primary") => {
    if (!act?.label) return null;

    const base = "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors";
    const styles = variant === "primary"
      ? `${base} bg-primary-600 hover:bg-primary-700 text-white shadow-sm`
      : `${base} border border-gray-300 text-gray-700 hover:bg-gray-50`;

    if (act.to) {
      return <Link to={act.to} className={styles}>{act.label}</Link>;
    }
    return (
      <button onClick={act.onClick} type="button" className={styles}>
        {act.label}
      </button>
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${s.wrap} px-4 ${className}`}>
      {/* Icon / Emoji */}
      <div className={`${s.icon} flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-4 flex-shrink-0`}>
        {icon ?? (emoji ? (
          <span>{emoji}</span>
        ) : (
          <MdInbox className="text-gray-300" />
        ))}
      </div>

      {/* Title */}
      <p className={`${s.title} font-bold text-gray-800 mb-1`}>{title}</p>

      {/* Description */}
      {description && (
        <p className={`${s.desc} text-gray-500 max-w-xs leading-relaxed mb-5`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          {renderAction(action, "primary")}
          {renderAction(secondaryAction, "secondary")}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
