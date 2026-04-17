import { getResend } from "./resend";
import { CoursePurchaseEmail } from "./templates/course-purchase";
import { absoluteUrl } from "@/lib/utils";

type Params = {
  email: string;
  hasApp: boolean;
  activationToken: string;
};

export async function sendCoursePurchaseEmail({
  email,
  hasApp,
  activationToken,
}: Params) {
  const driveUrl =
    process.env.COURSE_DRIVE_URL ||
    "https://drive.google.com/drive/folders/18fn_fDFiavGd4_r4m0xA0i973aPUZe9u";

  const activationUrl = hasApp
    ? absoluteUrl(`/api/course/activate?token=${activationToken}`)
    : null;

  const from =
    process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";

  const result = await getResend().emails.send({
    from,
    to: email,
    subject: "Bienvenue ! Ton cours 85% des mots du Coran est prêt",
    react: CoursePurchaseEmail({ driveUrl, hasApp, activationUrl }),
  });

  if (result.error) {
    console.error("[Resend] send error:", result.error);
    throw new Error(result.error.message);
  }

  return result.data;
}
