import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="lg:pt-[50px] pt-[20px] px-6 lg:px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 flex-1 rounded-full" />
        <Skeleton className="h-6 w-12" />
      </div>

      {/* Question + options */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg flex flex-col items-center gap-y-6">
          <Skeleton className="h-8 w-80 max-w-full" />
          <div className="grid grid-cols-2 gap-3 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-brilliant-border p-4">
        <div className="max-w-[1140px] mx-auto flex justify-end">
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
