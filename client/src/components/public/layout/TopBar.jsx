import { MdLocalShipping, MdHeadsetMic } from "react-icons/md";

const TopBar = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs">
      <div className="max-w-[1280px] mx-auto px-4 h-9 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-1.5">
          <MdLocalShipping size={14} className="text-gray-500" />
          <span>Free Delivery on orders above ₹499</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-1.5">
          <span>🔥</span>
          <span className="font-medium text-gray-700">Summer Sale is Live! Up to 60% OFF</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <MdHeadsetMic size={14} className="text-gray-500" />
          <span>24/7 Customer Support</span>
        </div>

      </div>
    </div>
  );
};

export default TopBar;
