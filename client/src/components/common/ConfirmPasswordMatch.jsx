import { MdCheckCircle, MdCancel } from "react-icons/md";

/**
 * ConfirmPasswordMatch
 *
 * Renders a single-line live match/mismatch hint beneath the confirm
 * password input. Appears only once the user has typed something in the
 * confirm field so it never shows on an untouched form.
 *
 * Props:
 *   password        {string} - The current primary password value.
 *   confirmPassword {string} - The current confirm password value.
 */
const ConfirmPasswordMatch = ({ password, confirmPassword }) => {
  // Stay hidden until the user starts typing in the confirm field
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-[11px] font-medium mt-1.5 transition-colors duration-200 ${
        matches ? "text-green-600" : "text-red-500"
      }`}
    >
      {matches ? (
        <>
          <MdCheckCircle size={13} aria-hidden="true" />
          Passwords match
        </>
      ) : (
        <>
          <MdCancel size={13} aria-hidden="true" />
          Passwords do not match
        </>
      )}
    </p>
  );
};

export default ConfirmPasswordMatch;
