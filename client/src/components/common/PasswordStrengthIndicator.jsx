import usePasswordStrength from "../../hooks/usePasswordStrength";

/**
 * PasswordStrengthIndicator
 *
 * Renders a 4-segment strength bar + labelled rule checklist beneath a
 * password input. Drop it directly after the input / error message.
 *
 * Props:
 *   password {string}  - The current raw password value. Pass "" when blank.
 *
 * The component renders nothing when `password` is empty so it never appears
 * on an untouched form.
 */
const PasswordStrengthIndicator = ({ password }) => {
  const { score, label, textColor, barColor, rules } = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5" role="status" aria-live="polite" aria-label="Password strength">

      {/* ── Segmented bar ── */}
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              score >= seg ? barColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* ── Strength label ── */}
      {label && (
        <p className={`text-xs font-semibold ${textColor}`}>
          Password strength:{" "}
          <span className="sr-only">is </span>
          {label}
        </p>
      )}

      {/* ── Per-rule checklist ── */}
      <ul className="space-y-1" aria-label="Password requirements">
        {rules.map(({ id, label: ruleLabel, passed }) => (
          <li key={id} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors duration-200 ${
                passed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              {passed ? "✓" : "·"}
            </span>
            <span
              className={`text-[11px] transition-colors duration-200 ${
                passed ? "text-green-600" : "text-gray-400"
              }`}
            >
              {/* Screen-reader friendly: announce pass/fail inline */}
              <span className="sr-only">{passed ? "Met: " : "Not met: "}</span>
              {ruleLabel}
            </span>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default PasswordStrengthIndicator;
