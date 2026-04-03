type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  return (
    <div className="sticky top-0 bg-white pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-center border-b border-brilliant-border mb-5 lg:z-50">
      <h1 className="font-bold text-lg text-brilliant-text">
        {title}
      </h1>
    </div>
  );
};
