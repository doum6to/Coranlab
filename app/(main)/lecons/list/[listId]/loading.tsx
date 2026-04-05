import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col px-4 sm:px-6 pt-4">
      <Skeleton className="h-6 w-32 mb-3" />
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-brilliant-border bg-white p-4"
          >
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
