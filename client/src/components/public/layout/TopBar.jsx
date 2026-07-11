import { MdLocalShipping, MdHeadsetMic } from "react-icons/md";
import { useSettings } from "../../../hooks/useSettings";

const TopBar = () => {
  const { s } = useSettings();

  const left   = s("topbar_left",   "Free Delivery on orders above ₹499");
  const center = s("topbar_center", "🔥 Summer Sale is Live! Up to 60% OFF");
  const right  = s("topbar_right",  "24/7 Customer Support");

  return (
    <div className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs">
      <div className="max-w-[1280px] mx-auto px-4 h-9 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-1.5">
          <MdLocalShipping size={14} className="text-gray-500" />
          <span>{left}</span>
        </div>

        {/* Center */}
        <div className="hidden sm:flex items-center gap-1 font-medium text-gray-700">
          <span>{center}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <MdHeadsetMic size={14} className="text-gray-500" />
          <span>{right}</span>
        </div>

      </div>
    </div>
  );
};

export default TopBar;
