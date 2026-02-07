import { useState } from "react";
import { Home, User, ArrowDown, ArrowUp, Info } from "lucide-react";

const MODES = {
  household: {
    label: "Household",
    icon: Home,
    avgConfidence: 87,
    tooltip: [
      "Credits entire household for conversions",
      "Higher confidence (avg 87%)",
      "Less precise attribution",
    ],
  },
  individual: {
    label: "Individual",
    icon: User,
    avgConfidence: 73,
    tooltip: [
      "Credits specific device user",
      "Lower confidence (avg 73%)",
      "More precise attribution",
    ],
  },
};

function ModeTooltip({ lines }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="More info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-lg bg-gray-800 border border-gray-600 shadow-xl z-20">
          <ul className="space-y-1">
            {lines.map((line) => (
              <li
                key={line}
                className="text-[11px] text-gray-300 leading-relaxed"
              >
                {line}
              </li>
            ))}
          </ul>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-gray-800 border-r border-b border-gray-600" />
        </div>
      )}
    </span>
  );
}

export default function AttributionToggle({ currentMode, onModeChange }) {
  const isHousehold = currentMode === "household";
  const current = MODES[currentMode];
  const other = isHousehold ? MODES.individual : MODES.household;
  const delta = current.avgConfidence - other.avgConfidence;

  function toggle() {
    onModeChange(isHousehold ? "individual" : "household");
  }

  function handleKeyDown(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle row */}
      <div className="flex items-center gap-3">
        {/* Household label */}
        <div className="flex items-center gap-1.5">
          <Home className="w-4 h-4 text-gray-400" />
          <span
            className={`text-sm transition-colors ${
              isHousehold ? "text-white font-semibold" : "text-gray-500"
            }`}
          >
            Household
          </span>
          <ModeTooltip lines={MODES.household.tooltip} />
        </div>

        {/* iOS-style toggle */}
        <button
          role="switch"
          aria-checked={!isHousehold}
          aria-label={`Switch to ${isHousehold ? "individual" : "household"} attribution`}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent
                      transition-colors duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-blue-400 cursor-pointer ${
                        isHousehold ? "bg-[#4A90E2]" : "bg-[#4A90E2]"
                      }`}
          style={{ minWidth: 48, minHeight: 28 }}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
              isHousehold ? "translate-x-0.5" : "translate-x-[22px]"
            }`}
          />
        </button>

        {/* Individual label */}
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-gray-400" />
          <span
            className={`text-sm transition-colors ${
              !isHousehold ? "text-white font-semibold" : "text-gray-500"
            }`}
          >
            Individual
          </span>
          <ModeTooltip lines={MODES.individual.tooltip} />
        </div>
      </div>

      {/* Confidence indicator */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span>
          Attribution Confidence:{" "}
          <span className="text-white font-medium">{current.avgConfidence}%</span>
        </span>
        {delta !== 0 && (
          <span
            className={`flex items-center gap-0.5 ${
              delta > 0 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {delta > 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(delta)}% vs {other.label.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  );
}
