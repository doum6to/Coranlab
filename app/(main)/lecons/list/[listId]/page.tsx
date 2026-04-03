import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";

import { getListLevels } from "@/db/queries";
import { FlashcardGrid } from "@/app/(main)/learn/list/[listId]/flashcard-grid";

type Props = {
  params: {
    listId: string;
  };
};

const ReviserListPage = async ({ params }: Props) => {
  const listId = parseInt(params.listId);

  if (isNaN(listId)) {
    redirect("/lecons");
  }

  const data = await getListLevels(listId);

  if (!data) {
    redirect("/lecons");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back button */}
      <Link href="/lecons" className="inline-flex items-center gap-1.5 text-sm text-brilliant-muted hover:text-brilliant-text transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl overflow-hidden">
          <Image
            src="/lesson-illustration.png"
            alt={data.listTitle}
            width={512}
            height={512}
            quality={90}
            className="w-full h-full object-cover mix-blend-darken"
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-brilliant-muted mb-1">
          {data.unitTitle}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-brilliant-text mb-2">
          {data.listTitle}
        </h1>

        <div className="flex items-center justify-center gap-6 text-sm text-brilliant-muted mt-3">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{data.vocabWords.length} Mots</span>
          </div>
        </div>
      </div>

      {/* Vocabulary Flashcards */}
      {data.vocabWords.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-brilliant-text mb-4">
            Vocabulaire ({data.vocabWords.length} mots)
          </h2>
          <FlashcardGrid words={data.vocabWords} />
        </div>
      )}
    </div>
  );
};

export default ReviserListPage;
