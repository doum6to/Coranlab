import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col px-0 sm:px-6">
      {[0, 1].map((unit) => (
        <div key={unit} className="mb-10">
          <div className="px-4 sm:px-0 pb-4">
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          {/* Horizontal carousel of cards */}
          <div className="flex gap-3 overflow-hidden px-4 sm:px-0 pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[180px] sm:w-[200px] rounded-2xl border-2 border-brilliant-border bg-white p-4"
              >
                <Skeleton className="aspect-square w-full rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;
