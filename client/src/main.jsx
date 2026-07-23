import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { store } from "./redux/store";
import { injectStore } from "./utils/ApiInstance";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./index.css";

// Inject Redux store into axios interceptor (avoids circular dependency)
injectStore(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
          <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{ top: 16, right: 16 }}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1e293b",
                color:       "#f1f5f9",
                fontSize:    "13.5px",
                fontWeight:  "500",
                borderRadius: "12px",
                padding:     "12px 16px",
                boxShadow:   "0 4px 16px rgba(0,0,0,0.25)",
                maxWidth:    "380px",
              },
              success: {
                duration: 3000,
                iconTheme: { primary: "#4ade80", secondary: "#052e16" },
                style: {
                  background: "#052e16",
                  color:      "#dcfce7",
                  fontSize:   "13.5px",
                  fontWeight: "500",
                  borderRadius: "12px",
                  padding:    "12px 16px",
                  boxShadow:  "0 4px 16px rgba(0,0,0,0.25)",
                  border:     "1px solid #166534",
                  maxWidth:   "380px",
                },
              },
              error: {
                duration: 4500,
                iconTheme: { primary: "#f87171", secondary: "#450a0a" },
                style: {
                  background: "#450a0a",
                  color:      "#fee2e2",
                  fontSize:   "13.5px",
                  fontWeight: "500",
                  borderRadius: "12px",
                  padding:    "12px 16px",
                  boxShadow:  "0 4px 16px rgba(0,0,0,0.25)",
                  border:     "1px solid #991b1b",
                  maxWidth:   "380px",
                },
              },
              loading: {
                iconTheme: { primary: "#60a5fa", secondary: "#1e293b" },
                style: {
                  background: "#1e293b",
                  color:      "#bfdbfe",
                  fontSize:   "13.5px",
                  fontWeight: "500",
                  borderRadius: "12px",
                  padding:    "12px 16px",
                  boxShadow:  "0 4px 16px rgba(0,0,0,0.25)",
                  border:     "1px solid #1d4ed8",
                  maxWidth:   "380px",
                },
              },
            }}
          />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
