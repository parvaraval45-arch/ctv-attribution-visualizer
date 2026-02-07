import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export default function InfoTooltip({ text, width = 300 }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("top");
  const triggerRef = useRef(null);

  // Flip tooltip below if too close to top of viewport
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition(rect.top < 120 ? "bottom" : "top");
    }
  }, [open]);

  const tooltipClasses =
    position === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";

  const arrowClasses =
    position === "top"
      ? "top-full -mt-px border-r border-b"
      : "bottom-full -mb-px border-l border-t";

  return (
    <span className="relative inline-flex" ref={triggerRef}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-500 hover:text-blue-400 transition-colors cursor-help"
        aria-label="More info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${tooltipClasses} p-2.5 rounded-lg bg-gray-800 border border-gray-600 text-[11px] text-gray-300 leading-relaxed shadow-xl z-30 animate-tooltip-in`}
          style={{ width }}
        >
          {text}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800 border-gray-600 ${arrowClasses}`}
          />
        </div>
      )}
    </span>
  );
}
