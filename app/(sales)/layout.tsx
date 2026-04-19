type Props = {
  children: React.ReactNode;
};

/**
 * Minimal layout for the sales funnel (/85motscoran and /85motscoran/merci).
 *
 * Intentionally free of the shared marketing header/footer so the hero
 * section is the very first thing the visitor sees — logo is rendered
 * inline inside the page itself for full design control.
 */
const SalesLayout = ({ children }: Props) => {
  return <div className="min-h-screen">{children}</div>;
};

export default SalesLayout;
