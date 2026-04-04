import type { StreakData } from "@/db/queries";

const LIME = "#BEF264"; // bright lime green like Brilliant
const INK = "#0F172A";

const BoltSolid = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={INK}>
    <path d="M14 2L4 14h6l-1 8 11-13h-7l1-7z" />
  </svg>
);

const BoltOutline = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2L4 14h6l-1 8 11-13h-7l1-7z"
      fill="none"
      stroke="#CBD5E1"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const BatteryIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
    <rect x="4" y="1" width="6" height="2" rx="0.5" fill={filled ? LIME : "#E5E7EB"} />
    <rect
      x="1"
      y="3"
      width="12"
      height="16"
      rx="1.5"
      fill={filled ? LIME : "#E5E7EB"}
    />
  </svg>
);

type Props = {
  data: StreakData;
};

export const StreakCard = ({ data }: Props) => {
  const { streak, charges, days } = data;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-4 shadow-sm">
      {/* Top row: streak number + batteries */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1">
          <span className="text-3xl font-extrabold text-brilliant-text leading-none">
            {streak}
          </span>
          <span className="ml-0.5">
            <BoltOutline size={18} />
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <BatteryIcon filled={charges >= 1} />
          <BatteryIcon filled={charges >= 2} />
        </div>
      </div>

      {/* Days row */}
      <div className="flex items-center justify-between">
        {days.map((d) => {
          const isTodayPending = d.isToday && !d.active;
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  d.active
                    ? ""
                    : isTodayPending
                    ? "border-2 border-gray-200 bg-white"
                    : "bg-gray-100"
                }`}
                style={d.active ? { backgroundColor: LIME } : undefined}
              >
                {d.active ? <BoltSolid size={16} /> : <BoltOutline size={16} />}
              </div>
              <span
                className={`text-[11px] ${
                  d.isToday ? "font-bold text-brilliant-text" : "text-brilliant-muted"
                }`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
