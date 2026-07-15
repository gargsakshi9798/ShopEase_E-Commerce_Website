import { useMemo } from "react";

// ─── Shared password rules ────────────────────────────────────────────────────
// Each rule has a regex that is tested against the current password value and a
// human-readable label shown in the checklist UI.
export const PASSWORD_RULES = [
  { id: "length",    rule: /.{8,}/,         label: "At least 8 characters"  },
  { id: "uppercase", rule: /[A-Z]/,         label: "One uppercase letter"    },
  { id: "number",    rule: /[0-9]/,         label: "One number"              },
  { id: "special",   rule: /[^A-Za-z0-9]/, label: "One special character"   },
];

// ─── Strength metadata map (index = score 0-4) ───────────────────────────────
const STRENGTH_META = [
  { label: "",        textColor: "",                 barColor: ""              },
  { label: "Weak",    textColor: "text-red-500",     barColor: "bg-red-500"    },
  { label: "Fair",    textColor: "text-orange-400",  barColor: "bg-orange-400" },
  { label: "Good",    textColor: "text-yellow-500",  barColor: "bg-yellow-400" },
  { label: "Strong",  textColor: "text-green-500",   barColor: "bg-green-500"  },
];

/**
 * usePasswordStrength
 *
 * Derives password strength score and per-rule pass/fail state from a raw
 * password string.
 *
 * @param {string} password - The current password value (empty string when blank).
 * @returns {{
 *   score:     number,   // 0-4
 *   label:     string,   // "Weak" | "Fair" | "Good" | "Strong" | ""
 *   textColor: string,   // Tailwind text colour class
 *   barColor:  string,   // Tailwind bg colour class for the strength bar segments
 *   rules:     Array<{ id: string, label: string, passed: boolean }>,
 *   allPassed: boolean,  // true when every rule is satisfied
 * }}
 */
const usePasswordStrength = (password = "") => {
  return useMemo(() => {
    const rules = PASSWORD_RULES.map(({ id, rule, label }) => ({
      id,
      label,
      passed: rule.test(password),
    }));

    const score = rules.filter((r) => r.passed).length;
    const meta  = STRENGTH_META[score];

    return {
      score,
      label:     meta.label,
      textColor: meta.textColor,
      barColor:  meta.barColor,
      rules,
      allPassed: score === PASSWORD_RULES.length,
    };
  }, [password]);
};

export default usePasswordStrength;
