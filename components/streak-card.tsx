import type { StreakData } from "@/db/queries";

const BoltIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
      fill={filled ? "#0F172A" : "none"}
      stroke={filled ? "#0F172A" : "#CBD5E1"}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const BatteryIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
    <rect x="3" y="1" width="8" height="2" rx="0.5" fill={filled ? "#C8E94D" : "#E5E7EB"} />
    <rect
      x="1"
      y="3"
      width="12"
      height="16"
      rx="1.5"
      fill={filled ? "#C8E94D" : "#E5E7EB"}
    />
  </svg>
);

type Props = {
  data: StreakData;
};

export const StreakCard = ({ data }: Props) => {
  const { streak, charges, days } = data;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {/* Top row: streak number + batteries */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1">
          <span className="text-3xl font-extrabold text-brilliant-text leading-none">
            {streak}
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ml-0.5">
            <path
              d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-center gap-0.5">
          <BatteryIcon filled={charges >= 1} />
          <BatteryIcon filled={charges >= 2} />
        </div>
      </div>

      {/* Days row */}
      <div className="flex items-center justify-between">
        {days.map((d) => {
          const isFuture = !d.active && !d.isToday;
          const isTodayPending = d.isToday && !d.active;
          return (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  d.active
                    ? "bg-[#C8E94D]"
                    : isTodayPending
                    ? "border border-gray-300 bg-white"
                    : "bg-gray-100"
                }`}
              >
                <BoltIcon filled={d.active} />
              </div>
              <span
                className={`text-[10px] ${
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
