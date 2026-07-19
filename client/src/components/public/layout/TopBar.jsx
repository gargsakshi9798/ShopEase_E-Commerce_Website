import { MdLocalShipping, MdHeadsetMic } from "react-icons/md";
import { Link } from "react-router-dom";
import { useSettings } from "../../../hooks/useSettings";

const TopBar = () => {
  const { s } = useSettings();

  const left   = s("topbar_left",   "Free Delivery on orders above ₹499");
  const center = s("topbar_center", "Summer Sale is Live! Up to 60% OFF");
  const right  = s("topbar_right",  "24/7 Customer Support");

  return (
    <>
      {/* Keyframe styles injected inline — no extra CSS file needed */}
      <style>{`
        @keyframes topbar-slide {
          0%   { transform: translateX(8px); opacity: 0; }
          10%  { transform: translateX(0);   opacity: 1; }
          85%  { transform: translateX(0);   opacity: 1; }
          100% { transform: translateX(-8px);opacity: 0; }
        }
        @keyframes fire-flicker {
          0%, 100% { transform: scaleY(1)    rotate(-3deg); }
          25%       { transform: scaleY(1.18) rotate(3deg);  }
          50%       { transform: scaleY(0.92) rotate(-2deg); }
          75%       { transform: scaleY(1.12) rotate(2deg);  }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.45); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0);  }
        }
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .sale-shimmer {
          background: linear-gradient(
            90deg,
            #f97316 0%,
            #ef4444 25%,
            #fbbf24 50%,
            #ef4444 75%,
            #f97316 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 2.4s linear infinite;
        }
        .fire-emoji {
          display: inline-block;
          animation: fire-flicker 0.6s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .sale-badge {
          animation: badge-pulse 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 h-9 flex items-center justify-between">

          {/* Left — Free Delivery (linked to /products) */}
          <Link
            to="/products"
            className="flex items-center gap-1.5 hover:text-primary-600 transition-colors group"
          >
            <MdLocalShipping
              size={14}
              className="text-gray-500 group-hover:text-primary-500 transition-colors"
            />
            <span className="group-hover:underline underline-offset-2">{left}</span>
          </Link>

          {/* Center — Animated Summer Sale */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Animated fire badge */}
            <span
              className="sale-badge flex items-center gap-1 bg-red-600 text-white font-black
                         px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase shadow-sm"
            >
              <span className="fire-emoji" aria-hidden="true">🔥</span>
              LIVE
            </span>

            {/* Shimmer text */}
            <span className="sale-shimmer font-black text-[12px] tracking-wide">
              {center}
            </span>
          </div>

          {/* Right — 24/7 Customer Support (linked to /contact-us) */}
          <Link
            to="/contact-us"
            className="flex items-center gap-1.5 hover:text-primary-600 transition-colors group"
          >
            <MdHeadsetMic
              size={14}
              className="text-gray-500 group-hover:text-primary-500 transition-colors"
            />
            <span className="group-hover:underline underline-offset-2">{right}</span>
          </Link>

        </div>
      </div>
    </>
  );
};

export default TopBar;
