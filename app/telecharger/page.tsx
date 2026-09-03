import { getDownloadLinks } from "@/lib/download-links";
import { Redirector } from "./redirector";

export const revalidate = 60;

export const metadata = {
  title: "Télécharger Quranlab",
  // Don't index the redirect hop.
  robots: { index: false, follow: false },
};

export default async function TelechargerPage() {
  const links = await getDownloadLinks();
  return <Redirector links={links} />;
}
