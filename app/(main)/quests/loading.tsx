import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col px-6 pt-4">
      <div className="w-full flex flex-col items-center">
        <Skeleton className="h-[90px] w-[90px] rounded-xl" />
        <Skeleton className="h-8 w-40 my-6" />
        <Skeleton className="h-5 w-72 mb-6" />
        <ul className="w-full space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center w-full p-4 gap-x-4 border-t-2">
              <Skeleton className="h-[60px] w-[60px] rounded-lg" />
              <div className="flex flex-col gap-y-2 w-full">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Loading;
