/**
 * ErrorBoundary.jsx
 * React class-based error boundary that catches render errors in any child tree.
 *
 * Usage — wrap the whole app (main.jsx):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Usage — wrap individual sections for isolated fallbacks:
 *   <ErrorBoundary fallback={<p>Failed to load section</p>}>
 *     <HeavySection />
 *   </ErrorBoundary>
 *
 * Props:
 *   fallback   ReactNode   — custom UI to render on error (optional)
 *   onError    Function    — called with (error, info) for logging (optional)
 *   resetKeys  Array       — when any value in this array changes the boundary resets (optional)
 */

import { Component } from "react";
import { MdErrorOutline, MdRefresh } from "react-icons/md";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console (swap for Sentry / monitoring in production)
    console.error("[ErrorBoundary] Uncaught error:", error, info);
    if (typeof this.props.onError === "function") {
      this.props.onError(error, info);
    }
  }

  // Support resetKeys: reset boundary when any key changes
  componentDidUpdate(prevProps) {
    const { resetKeys } = this.props;
    if (
      this.state.hasError &&
      resetKeys &&
      resetKeys.some((key, i) => key !== (prevProps.resetKeys ?? [])[i])
    ) {
      this.handleReset();
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    // Custom fallback provided by caller
    if (this.props.fallback) return this.props.fallback;

    // Default full-page error UI
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MdErrorOutline size={32} className="text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            An unexpected error occurred. Refresh the page or try again. If the
            problem persists, please contact support.
          </p>

          {/* Show error message only in development */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 text-red-600 overflow-auto max-h-32 mb-5">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <MdRefresh size={16} /> Try Again
            </button>
            <button
              onClick={() => window.location.replace("/")}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
