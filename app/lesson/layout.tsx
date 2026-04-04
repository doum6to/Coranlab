type Props = {
  children: React.ReactNode;
};

const LessonLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default LessonLayout;
