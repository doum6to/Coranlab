type Props = {
  children: React.ReactNode;
};

const LessonLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen h-screen">
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default LessonLayout;
