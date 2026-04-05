import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="h-full max-w-[912px] px-3 mx-auto pt-4">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[210/240] rounded-xl border-2 border-brilliant-border p-3"
          >
            <Skeleton className="w-full h-[140px] rounded-md mb-3" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
