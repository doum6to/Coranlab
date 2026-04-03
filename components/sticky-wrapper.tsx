type Props = {
  children: React.ReactNode;
};

export const StickyWrapper = ({ children }: Props) => {
  return (
    <div className="hidden lg:block w-[368px] shrink-0">
      <div className="sticky top-6 flex flex-col gap-y-4">
        {children}
      </div>
    </div>
  );
};