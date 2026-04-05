import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col px-6 pt-4">
      <div className="w-full flex flex-col items-center">
        <Skeleton className="h-8 w-48 my-6" />
        <Skeleton className="h-24 w-24 rounded-full mb-4" />
        <Skeleton className="h-5 w-40 mb-6" />
        <div className="w-full max-w-xl space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl border border-brilliant-border"
            >
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
